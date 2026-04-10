// hs-portal/src/routes/changelog.ts
// Public read-only endpoints:
//   GET /api/v1/brand/:slug/changelog   — returns public changelog entries
//   GET /api/v1/brand/:slug/colors      — returns live color palette as flat JSON

import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { getBrandMeta, HydrationError } from "../lib/hydrator.js";
import { cacheGet } from "../lib/cache.js";
import { logger } from "../lib/logger.js";

export const changelogRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/brand/:slug/changelog?limit=20
 * Returns public changelog entries for a brand, newest first.
 * Accessible by anyone — Figma plugins, Notion integrations, etc.
 */
changelogRouter.get("/:slug/changelog", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const limit = Math.min(parseInt((req.query.limit as string) ?? "20", 10), 100);

  try {
    const brand = await getBrandMeta(slug);
    if (!brand) {
      return res.status(404).json({ ok: false, error: `Brand "${slug}" not found` });
    }

    const { data, error } = await supabase
      .from("brand_changelog")
      .select("id, section_type, change_summary, changed_by, changed_at")
      .eq("brand_id", brand.id)
      .eq("is_public", true)
      .order("changed_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(`[changelog] Supabase error: ${error.message}`);
      return res.status(502).json({ ok: false, error: "Database error" });
    }

    return res.json({
      ok: true,
      data: {
        slug,
        brand_name: brand.brand_name,
        entries: data ?? [],
        retrieved_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof HydrationError) {
      return res.status(502).json({ ok: false, error: err.message });
    }
    logger.error(`[changelog] Unexpected: ${String(err)}`);
    return res.status(500).json({ ok: false, error: "Unexpected error" });
  }
});

/**
 * GET /api/v1/brand/:slug/colors
 * Returns the current color palette as a flat JSON array.
 * Each entry includes hex, rgb, cmyk, pantone, usage_role, accessibility_level.
 * Intended for external integrations (Figma plugins, Notion databases, CI color checks).
 */
changelogRouter.get("/:slug/colors", async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const brand = await getBrandMeta(slug);
    if (!brand) {
      return res.status(404).json({ ok: false, error: `Brand "${slug}" not found` });
    }

    // Try cache first for color data
    const cached = cacheGet(slug);
    let colors = cached?.colors;

    if (!colors) {
      const { data, error } = await supabase
        .from("brand_colors")
        .select("*")
        .eq("brand_id", brand.id)
        .order("sort_order");

      if (error) {
        return res.status(502).json({ ok: false, error: "Database error" });
      }
      colors = data ?? [];
    }

    const palette = colors.map((c) => ({
      name: c.color_name,
      hex: c.hex,
      rgb: c.rgb,
      cmyk: c.cmyk,
      pantone: c.pantone,
      palette_type: c.palette_type,
      usage_role: c.usage_role,
      accessibility_level: c.accessibility_level,
      is_primary: c.is_primary,
    }));

    return res.json({
      ok: true,
      data: {
        slug,
        brand_name: brand.brand_name,
        colors: palette,
        retrieved_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error(`[changelog] Colors error: ${String(err)}`);
    return res.status(500).json({ ok: false, error: "Unexpected error" });
  }
});

/**
 * POST /api/v1/brand/:slug/changelog (internal — called by Studio on save)
 * Requires HUB_SECRET.
 */
changelogRouter.post("/:slug/changelog", async (req: Request, res: Response) => {
  const secret = req.headers["x-hub-secret"];
  if (!secret || secret !== process.env.HUB_SECRET) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { slug } = req.params;
  const { section_type, change_summary, changed_by, is_public } = req.body as {
    section_type?: string;
    change_summary: string;
    changed_by: string;
    is_public?: boolean;
  };

  if (!change_summary || !changed_by) {
    return res.status(400).json({ ok: false, error: "change_summary and changed_by are required" });
  }

  try {
    const brand = await getBrandMeta(slug);
    if (!brand) {
      return res.status(404).json({ ok: false, error: `Brand "${slug}" not found` });
    }

    const { error } = await supabase.from("brand_changelog").insert({
      brand_id: brand.id,
      section_type: section_type ?? null,
      change_summary,
      changed_by,
      changed_at: new Date().toISOString(),
      is_public: is_public ?? false,
    });

    if (error) {
      return res.status(502).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, data: { recorded: true } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});
