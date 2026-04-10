// hs-portal/src/middleware/subdomainRouter.ts
// Detects brand slugs from the request hostname in production.
//
// How subdomain routing works:
//   DNS:  *.brand.ravennorth.com  →  your server IP (wildcard A/CNAME record)
//   This: meridian.brand.ravennorth.com arrives at this server at path "/"
//         We extract "meridian" and rewrite the URL to /portal/meridian
//         The brandRouter then handles it normally.
//
// PORTAL_BASE_DOMAIN env var controls this:
//   Set to "brand.ravennorth.com" — anything.brand.ravennorth.com is a portal slug
//   Leave unset — subdomain routing is disabled (development mode, use /portal/:slug directly)
//
// Custom domains:
//   If the hostname doesn't match the base domain pattern, we check if it's a
//   registered custom domain in Supabase. If yes, we resolve it to the correct slug.

import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The base domain for brand portals, e.g. "brand.ravennorth.com"
// Portals are served at <slug>.brand.ravennorth.com
const PORTAL_BASE_DOMAIN = process.env.PORTAL_BASE_DOMAIN ?? "";

// ─── Custom Domain Cache ──────────────────────────────────────────────────
// Cache custom domain → slug mappings to avoid database hits on every request.
const domainCache = new Map<string, { slug: string; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Paths that should NEVER be treated as portal slugs
const RESERVED_PATHS = ["/health", "/auth", "/hub", "/upload", "/invalidate", "/api", "/preview", "/portal"];

export async function subdomainRouter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Only intercept root-level requests (not /hub/brands, /api/v1/..., etc.)
  const firstSegment = "/" + req.path.split("/")[1];
  if (RESERVED_PATHS.some((p) => req.path.startsWith(p))) {
    return next();
  }

  const hostname = req.hostname; // strips port, uses trust proxy

  // ── Case 1: PORTAL_BASE_DOMAIN is set — check for subdomain ──────────────
  if (PORTAL_BASE_DOMAIN) {
    // e.g. hostname = "meridian.brand.ravennorth.com"
    //      base     = "brand.ravennorth.com"
    // slug = "meridian"
    if (hostname.endsWith(`.${PORTAL_BASE_DOMAIN}`)) {
      const slug = hostname.slice(0, -(PORTAL_BASE_DOMAIN.length + 1));

      if (slug && slug !== "www") {
        logger.info(`[subdomainRouter] Subdomain slug resolved: "${slug}" from ${hostname}`);
        // Rewrite URL so brandRouter picks it up
        req.url = `/portal/${slug}${req.url === "/" ? "" : req.url}`;
        // Also rewrite path for Express routing
        (req as Request & { path: string }).path = `/portal/${slug}`;
        return next();
      }
    }
  }

  // ── Case 2: Custom domain — look up in Supabase ───────────────────────────
  if (hostname && hostname !== "localhost" && !hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    try {
      // 1. Check cache first
      const cached = domainCache.get(hostname);
      if (cached && cached.expires > Date.now()) {
        const slug = cached.slug;
        req.url = `/portal/${slug}${req.url === "/" ? "" : req.url}`;
        (req as Request & { path: string }).path = `/portal/${slug}`;
        return next();
      }

      // 2. Database lookup
      const { data: brand, error } = await supabase
        .from("brands")
        .select("slug")
        .eq("custom_domain", hostname)
        .maybeSingle();

      if (!error && brand?.slug) {
        logger.info(`[subdomainRouter] Custom domain resolved: "${hostname}" → "${brand.slug}"`);
        
        // Update cache
        domainCache.set(hostname, { slug: brand.slug, expires: Date.now() + CACHE_TTL });

        req.url = `/portal/${brand.slug}${req.url === "/" ? "" : req.url}`;
        (req as Request & { path: string }).path = `/portal/${brand.slug}`;
        return next();
      }
    } catch (err) {
      logger.warn(`[subdomainRouter] Custom domain lookup failed for ${hostname}: ${String(err)}`);
    }
  }

  // ── Case 3: No match — continue to regular routing ───────────────────────
  return next();
}
