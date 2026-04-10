// hs-portal/src/routes/locks.ts
// Section locking endpoints. All routes require HUB_SECRET.
// Templates read lock state from the HydratedBrandData.locks array.
// Locking/unlocking via these endpoints automatically invalidates the cache.

import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { getBrandMeta } from "../lib/hydrator.js";
import { cacheInvalidate } from "../lib/cache.js";
import { logger } from "../lib/logger.js";
import type { SupabaseSectionType } from "../types/index.js";

export const locksRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireSecret(req: Request, res: Response, next: () => void): void {
  const secret = req.headers["x-hub-secret"];
  if (!secret || secret !== process.env.HUB_SECRET) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  next();
}

/**
 * GET /api/v1/brand/:slug/locks
 * Returns all section locks for a brand.
 */
locksRouter.get("/:slug/locks", requireSecret, async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const brand = await getBrandMeta(slug);
    if (!brand) return res.status(404).json({ ok: false, error: "Brand not found" });

    const { data, error } = await supabase
      .from("brand_section_locks")
      .select("*")
      .eq("brand_id", brand.id)
      .order("locked_at");

    if (error) return res.status(502).json({ ok: false, error: error.message });

    return res.json({ ok: true, data: data ?? [] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * POST /api/v1/brand/:slug/locks
 * Lock a section.
 * Body: { section_type, locked_by, reason? }
 */
locksRouter.post("/:slug/locks", requireSecret, async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { section_type, locked_by, reason } = req.body as {
    section_type: SupabaseSectionType;
    locked_by: string;
    reason?: string;
  };

  if (!section_type || !locked_by) {
    return res.status(400).json({ ok: false, error: "section_type and locked_by are required" });
  }

  try {
    const brand = await getBrandMeta(slug);
    if (!brand) return res.status(404).json({ ok: false, error: "Brand not found" });

    // Upsert — if already locked, update the lock row
    const { data, error } = await supabase
      .from("brand_section_locks")
      .upsert(
        {
          brand_id: brand.id,
          section_type,
          locked_by,
          locked_at: new Date().toISOString(),
          reason: reason ?? null,
        },
        { onConflict: "brand_id,section_type" }
      )
      .select()
      .single();

    if (error) return res.status(502).json({ ok: false, error: error.message });

    // Invalidate cache so next load reflects the new lock state
    cacheInvalidate(slug);
    logger.info(`[locks] Locked section "${section_type}" for "${slug}"`);

    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * DELETE /api/v1/brand/:slug/locks/:sectionType
 * Unlock a section.
 */
locksRouter.delete("/:slug/locks/:sectionType", requireSecret, async (req: Request, res: Response) => {
  const { slug, sectionType } = req.params;

  try {
    const brand = await getBrandMeta(slug);
    if (!brand) return res.status(404).json({ ok: false, error: "Brand not found" });

    const { error } = await supabase
      .from("brand_section_locks")
      .delete()
      .eq("brand_id", brand.id)
      .eq("section_type", sectionType);

    if (error) return res.status(502).json({ ok: false, error: error.message });

    cacheInvalidate(slug);
    logger.info(`[locks] Unlocked section "${sectionType}" for "${slug}"`);

    return res.json({ ok: true, data: { slug, section_type: sectionType, unlocked: true } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});
