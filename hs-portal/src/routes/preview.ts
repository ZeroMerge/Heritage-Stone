// hs-portal/src/routes/preview.ts
// Live preview endpoint: /preview/:slug/:templateId
// Fetches the brand's real data from Supabase, injects it into the requested
// template's dist, and serves it. Never affects the live portal URL.

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { hydrateBrand, HydrationError } from "../lib/hydrator.js";
import { cacheGet, cacheSet } from "../lib/cache.js";
import { injectBrandData } from "../lib/injector.js";
import { logger } from "../lib/logger.js";

export const previewRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /preview/:slug/:templateId
 * Renders a brand with a specific template, read-only preview.
 * Used in the Hub split-screen iframe.
 */
previewRouter.get("/:slug/:templateId", async (req: Request, res: Response) => {
  const { slug, templateId } = req.params;

  try {
    // 1. Hydrate brand data (use cache when available)
    let data = cacheGet(slug);
    if (!data) {
      data = await hydrateBrand(slug);
      cacheSet(slug, data);
    }

    // 2. Fetch the requested template — not the one assigned to the brand
    const { data: templateRow, error: templateError } = await supabase
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .maybeSingle();

    if (templateError) {
      logger.error(`[preview] Supabase error fetching template "${templateId}": ${templateError.message}`);
      return res.status(502).send("Database error while loading template");
    }

    if (!templateRow) {
      return res.status(404).send(`Template "${templateId}" not found`);
    }

    // 3. Verify dist exists
    const distPath = templateRow.dist_path as string;
    if (!distPath || !fs.existsSync(path.join(distPath, "index.html"))) {
      logger.error(`[preview] Template dist not found at: ${distPath}`);
      return res.status(503).send("Template build not found. Please rebuild the template.");
    }

    // 4. Inject data from real brand into the preview template
    //    Override the brand.template field so templates know what they're in
    const previewData = {
      ...data,
      brand: { ...data.brand, template: templateRow },
    };

    const html = injectBrandData(distPath, previewData);

    // 5. Serve with a no-index header so search engines ignore preview URLs
    return res
      .status(200)
      .setHeader("Content-Type", "text/html")
      .setHeader("X-Robots-Tag", "noindex, nofollow")
      .setHeader("Cache-Control", "no-store")
      .send(html);
  } catch (err) {
    if (err instanceof HydrationError) {
      if (err.code === "SLUG_NOT_FOUND") {
        return res.status(404).send(`Brand slug "${slug}" not found`);
      }
      return res.status(502).send(`Brand data error: ${err.message}`);
    }
    logger.error(`[preview] Unexpected error: ${String(err)}`);
    return res.status(500).send("Unexpected error generating preview");
  }
});

/**
 * GET /preview/:slug/:templateId/assets/*
 * Static asset proxy for preview templates.
 */
previewRouter.get("/:slug/:templateId/assets/*", async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const assetPath = (req.params as Record<string, string>)[0];

  const { data: templateRow } = await supabase
    .from("templates")
    .select("dist_path")
    .eq("id", templateId)
    .maybeSingle();

  if (!templateRow?.dist_path) return res.status(404).end();

  const fullPath = path.join(templateRow.dist_path as string, "assets", assetPath);
  if (!fs.existsSync(fullPath)) return res.status(404).end();

  return res.sendFile(fullPath);
});
