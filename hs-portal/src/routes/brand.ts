// hs-portal/src/routes/brand.ts
// Resolves a brand slug, hydrates data, injects it into the template's dist,
// and serves the result. This is the primary portal-serving route.

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { hydrateBrand, HydrationError } from "../lib/hydrator.js";
import { cacheGet, cacheSet } from "../lib/cache.js";
import { injectBrandData } from "../lib/injector.js";
import { logger } from "../lib/logger.js";
import type { HydratedBrandData } from "../types/index.js";

export const brandRouter = Router();

/**
 * GET /portal/:slug
 * Serves the brand portal for the given slug.
 * Handles:
 *   - Cache hit: inject from cache, serve immediately
 *   - Cache miss: hydrate from Supabase, cache, then serve
 *   - Password-protected brands: redirect to /auth/login/:slug
 *   - Unknown slugs: 404
 */
brandRouter.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    // 1. Try cache first
    let data: HydratedBrandData | null = cacheGet(slug);

    if (!data) {
      // 2. Hydrate from Supabase
      data = await hydrateBrand(slug);
      cacheSet(slug, data);
    }

    // 3. Check password protection
    if (data.brand.password_protected) {
      const sessionCookie = (req.session as any)?.authenticatedSlug;
      if (sessionCookie !== slug) {
        logger.info(`[brand] Password-protected redirect: ${slug}`);
        return res.redirect(`/auth/login/${slug}`);
      }
    }

    // 4. Resolve template dist path
    const template = data.brand.template;
    if (!template) {
      logger.warn(`[brand] No template assigned for slug: ${slug}`);
      return res.status(503).send(noTemplatePage(data.brand.brand_name));
    }

    const distPath = template.dist_path;
    if (!distPath || !fs.existsSync(path.join(distPath, "index.html"))) {
      logger.error(`[brand] Template dist not found at: ${distPath}`);
      return res.status(503).send(noTemplatePage(data.brand.brand_name));
    }

    // 5. Inject brand data and serve
    const html = injectBrandData(distPath, data);
    return res.status(200).setHeader("Content-Type", "text/html").send(html);
  } catch (err) {
    if (err instanceof HydrationError) {
      if (err.code === "SLUG_NOT_FOUND") {
        return res.status(404).send(notFoundPage(slug));
      }
      logger.error(`[brand] HydrationError for "${slug}": ${err.message}`);
      return res.status(502).send(errorPage("Unable to load brand data. Please try again."));
    }

    logger.error(`[brand] Unexpected error for "${slug}": ${String(err)}`);
    return res.status(500).send(errorPage("An unexpected error occurred."));
  }
});

/**
 * GET /portal/:slug/assets/*
 * Proxy static assets (JS, CSS, images) from the template dist folder.
 */
brandRouter.get("/:slug/assets/*", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const assetPath = (req.params as Record<string, string>)[0];

  let data = cacheGet(slug);
  if (!data) {
    try {
      data = await hydrateBrand(slug);
      cacheSet(slug, data);
    } catch {
      return res.status(404).end();
    }
  }

  const template = data.brand.template;
  if (!template?.dist_path) return res.status(404).end();

  const assetsDir = path.join(template.dist_path, "assets");
  const fullPath = path.join(assetsDir, assetPath);
  
  // Security: Prevent path traversal
  const resolvedPath = path.resolve(fullPath);
  if (!resolvedPath.startsWith(path.resolve(assetsDir))) {
    logger.warn(`[brand] Blocked potential path traversal: ${assetPath}`);
    return res.status(403).end();
  }

  if (!fs.existsSync(fullPath)) return res.status(404).end();

  return res.sendFile(fullPath);
});

// ─── Inline HTML Helpers ──────────────────────────────────────────────────────

function noTemplatePage(brandName: string): string {
  return `<!DOCTYPE html><html><head><title>${brandName}</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;">
<div style="text-align:center"><h1 style="font-size:2rem;margin-bottom:1rem">${brandName}</h1>
<p style="opacity:.6">This brand portal is being set up. Check back soon.</p></div>
</body></html>`;
}

function notFoundPage(slug: string): string {
  return `<!DOCTYPE html><html><head><title>Not Found</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;">
<div style="text-align:center"><h1 style="font-size:5rem;margin:0">404</h1>
<p>No brand found for <code>${slug}</code></p></div>
</body></html>`;
}

function errorPage(message: string): string {
  return `<!DOCTYPE html><html><head><title>Error</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;">
<div style="text-align:center"><h1 style="font-size:2rem">Something went wrong</h1>
<p style="opacity:.6">${message}</p></div>
</body></html>`;
}
