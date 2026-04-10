// hs-portal/src/routes/invalidate.ts
// Cache invalidation endpoint.
// The hs-studio app calls POST /invalidate/:slug after every save.
// Requires the HUB_SECRET header to prevent public abuse.

import { Router, Request, Response } from "express";
import { cacheInvalidate, cacheFlushAll, cacheStats } from "../lib/cache.js";
import { logger } from "../lib/logger.js";

export const invalidateRouter = Router();

/**
 * Middleware: validate HUB_SECRET header for all invalidation routes.
 */
function requireSecret(req: Request, res: Response, next: () => void): void {
  const secret = req.headers["x-hub-secret"];
  if (!secret || secret !== process.env.HUB_SECRET) {
    logger.warn(`[invalidate] Unauthorized attempt from ${req.ip}`);
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  next();
}

/**
 * POST /invalidate/:slug
 * Evicts a single slug from the cache.
 * Body (optional): { reason: string }
 */
invalidateRouter.post("/:slug", requireSecret, (req: Request, res: Response) => {
  const { slug } = req.params;
  const { reason } = req.body as { reason?: string };

  const existed = cacheInvalidate(slug);
  logger.info(`[invalidate] Slug "${slug}" invalidated. reason=${reason ?? "none"} existed=${existed}`);

  res.json({
    ok: true,
    data: { slug, existed, reason: reason ?? null, invalidatedAt: new Date().toISOString() },
  });
});

/**
 * POST /invalidate/_all
 * Flush the entire cache.
 */
invalidateRouter.post("/_all", requireSecret, (_req: Request, res: Response) => {
  const count = cacheFlushAll();
  res.json({
    ok: true,
    data: { flushed: count, invalidatedAt: new Date().toISOString() },
  });
});

/**
 * GET /invalidate/stats
 * Returns cache statistics. Hub uses this to display cache state.
 */
invalidateRouter.get("/stats", requireSecret, (_req: Request, res: Response) => {
  res.json({ ok: true, data: cacheStats() });
});
