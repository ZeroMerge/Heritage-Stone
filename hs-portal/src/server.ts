// hs-portal/src/server.ts
// Heritage Stone Portal Backend — Express entry point.
// Mount order matters: subdomain router first, specific paths before wildcards.

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { brandRouter } from "./routes/brand.js";
import { previewRouter } from "./routes/preview.js";
import { invalidateRouter } from "./routes/invalidate.js";
import { changelogRouter } from "./routes/changelog.js";
import { locksRouter } from "./routes/locks.js";
import { uploadRouter } from "./routes/upload.js";
import { authRouter } from "./routes/auth.js";
import { hubRouter } from "./routes/hub.js";
import { subdomainRouter } from "./middleware/subdomainRouter.js";
import { requireSupabaseAuth } from "./middleware/supabaseAuth.js";
import { logger } from "./lib/logger.js";
import cookieParser from "cookie-parser";

// ─── Validate required env vars ───────────────────────────────────────────────

const REQUIRED_ENV = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "HUB_SECRET", "SESSION_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

const allowedOrigins = [
  process.env.HUB_ORIGIN ?? "http://localhost:5174",
  process.env.STUDIO_ORIGIN ?? "http://localhost:5173",
].filter(Boolean);

// Security headers — relax CSP for portals that load external fonts/images
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Trust proxy — required when running behind Render/nginx/Cloudflare
app.set("trust proxy", 1);

// Parse cookies
app.use(cookieParser());

// CORS — Hub and Studio origins only
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-hub-secret", "Authorization"],
    credentials: true,
  })
);

// Session — required for password-protected brand portals
// SESSION_SECRET must be a long random string (32+ chars). Never use the default.
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  })
);

// Parse bodies
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — global
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests. Please try again." },
});
app.use(globalLimiter);

// Stricter limiter for upload
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { ok: false, error: "Upload rate limit exceeded." },
});

// ─── Health check & Keep-Alive ────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "hs-portal",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "development",
  });
});

app.get("/api/ping", async (_req, res) => {
  try {
    // Ping Supabase to keep connections active
    await supabase.from('templates').select('id').limit(1);
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("DB Error");
  }
});

// ─── Subdomain router (MUST be first) ─────────────────────────────────────────
// In production, meridian.brand.ravennorth.com arrives at path "/".
// This middleware detects the slug from the hostname and rewrites the path
// to /portal/:slug so the brand router handles it normally.
app.use(subdomainRouter);

// ─── Route mounts ─────────────────────────────────────────────────────────────
// Routes
app.use("/auth", authRouter);
app.use("/hub", hubRouter);

// Protected routes (require Supabase login)
app.use("/portal", requireSupabaseAuth, brandRouter);
app.use("/preview", requireSupabaseAuth, previewRouter);
app.use("/upload", uploadLimiter, uploadRouter);
app.use("/invalidate", invalidateRouter);
app.use("/api/v1/brand", changelogRouter);
app.use("/api/v1/brand", locksRouter);

// ─── Root redirect ────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  const hubOrigin = process.env.HUB_ORIGIN ?? "http://localhost:5174";
  res.redirect(hubOrigin);
});

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Route not found" });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`[server] Unhandled error: ${err.message}`);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`hs-portal running on http://localhost:${PORT}`);
  logger.info(`Allowed origins: ${allowedOrigins.join(", ")}`);
  logger.info(`Cache TTL: ${process.env.CACHE_TTL_SECONDS ?? 300}s`);
  logger.info(`Portal base domain: ${process.env.PORTAL_BASE_DOMAIN ?? "(not set — subdomain routing disabled)"}`);
});

export default app;
