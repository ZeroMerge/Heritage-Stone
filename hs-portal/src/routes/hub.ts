// hs-portal/src/routes/hub.ts
// Hub admin API routes. All routes require HUB_SECRET header.
// These are NOT public — only the hs-hub frontend calls them.

import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { getAllBrands } from "../lib/hydrator.js";
import { cacheInvalidate, cacheStats } from "../lib/cache.js";
import { generateThumbnail, uploadThumbnailToSupabase } from "../lib/thumbnailer.js";
import { logger } from "../lib/logger.js";

export const hubRouter = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireSecret(req: Request, res: Response, next: () => void): void {
  const secret = req.headers["x-hub-secret"];
  if (!secret || secret !== process.env.HUB_SECRET) {
    logger.warn(`[hub] Unauthorized from ${req.ip}`);
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  next();
}

hubRouter.use(requireSecret);

// ─── Brands ───────────────────────────────────────────────────────────────────

hubRouter.get("/brands", async (_req: Request, res: Response) => {
  try {
    const brands = await getAllBrands();
    return res.json({ ok: true, data: brands });
  } catch (err) {
    logger.error(`[hub] /brands error: ${String(err)}`);
    return res.status(502).json({ ok: false, error: "Database error" });
  }
});

hubRouter.get("/brands/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { data, error } = await supabase
    .from("brands")
    .select("*, template:templates(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return res.status(502).json({ ok: false, error: error.message });
  if (!data) return res.status(404).json({ ok: false, error: "Brand not found" });
  return res.json({ ok: true, data });
});

// ─── Templates ────────────────────────────────────────────────────────────────

hubRouter.get("/templates", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) return res.status(502).json({ ok: false, error: error.message });
  return res.json({ ok: true, data: data ?? [] });
});

hubRouter.get("/templates/:templateId", async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  if (error) return res.status(502).json({ ok: false, error: error.message });
  if (!data) return res.status(404).json({ ok: false, error: "Template not found" });
  return res.json({ ok: true, data });
});

hubRouter.patch("/templates/:templateId", async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const allowed = ["name", "description", "sections_supported", "is_active"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in (req.body as Record<string, unknown>)) {
      updates[key] = (req.body as Record<string, unknown>)[key];
    }
  }

  const { data, error } = await supabase
    .from("templates")
    .update(updates)
    .eq("id", templateId)
    .select()
    .single();

  if (error) return res.status(502).json({ ok: false, error: error.message });
  return res.json({ ok: true, data });
});

// ─── Template Assignment ──────────────────────────────────────────────────────

hubRouter.post("/brands/:slug/assign-template", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { template_id } = req.body as { template_id: string };

  if (!template_id) {
    return res.status(400).json({ ok: false, error: "template_id is required" });
  }

  const { data: templateRow, error: templateError } = await supabase
    .from("templates")
    .select("id, name")
    .eq("id", template_id)
    .maybeSingle();

  if (templateError) return res.status(502).json({ ok: false, error: templateError.message });
  if (!templateRow) return res.status(404).json({ ok: false, error: "Template not found" });

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, brand_name")
    .eq("slug", slug)
    .maybeSingle();

  if (brandError) return res.status(502).json({ ok: false, error: brandError.message });
  if (!brand) return res.status(404).json({ ok: false, error: "Brand not found" });

  const { error: updateError } = await supabase
    .from("brands")
    .update({ template_id, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (updateError) return res.status(502).json({ ok: false, error: updateError.message });

  await supabase.from("template_assignments").upsert({
    brand_id: brand.id,
    template_id,
    assigned_at: new Date().toISOString(),
  }, { onConflict: "brand_id" });

  cacheInvalidate(slug);

  logger.info(`[hub] Assigned template "${template_id}" to brand "${slug}"`);
  return res.json({
    ok: true,
    data: {
      slug,
      brand_name: brand.brand_name,
      template_id,
      template_name: (templateRow as { id: string; name: string }).name,
      assigned_at: new Date().toISOString(),
    },
  });
});

// ─── Value Mapping ────────────────────────────────────────────────────────────

hubRouter.get("/brands/:slug/value-mapping", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { template_id } = req.query as { template_id?: string };

  const { data: brand, error: brandErr } = await supabase
    .from("brands")
    .select("id, brand_name")
    .eq("slug", slug)
    .maybeSingle();

  if (brandErr || !brand) {
    return res.status(404).json({ ok: false, error: "Brand not found" });
  }

  const { data: sections } = await supabase
    .from("brand_sections")
    .select("section_type, is_enabled")
    .eq("brand_id", brand.id);

  const enabledSections = new Set(
    (sections ?? []).filter((s) => s.is_enabled).map((s) => s.section_type)
  );

  let required: string[] = [];
  if (template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("sections_supported")
      .eq("id", template_id)
      .maybeSingle();
    required = (template?.sections_supported as string[]) ?? [];
  }

  const missing = required.filter((r) => !enabledSections.has(r));
  const present = required.filter((r) => enabledSections.has(r));

  return res.json({
    ok: true,
    data: {
      slug,
      brand_name: brand.brand_name,
      template_id: template_id ?? null,
      required,
      present,
      missing,
      completeness: required.length > 0 ? Math.round((present.length / required.length) * 100) : 100,
    },
  });
});

// ─── Thumbnail generation ─────────────────────────────────────────────────────

/**
 * POST /hub/templates/:templateId/thumbnail
 * Body: { slug: string }
 *
 * FIX: Previously used req.hostname + PORT to construct the preview URL.
 * This broke behind proxies (wrong hostname, wrong protocol, wrong port).
 * Now uses PORTAL_INTERNAL_URL env var which you set to http://localhost:3001.
 * The thumbnailer itself reads this variable directly.
 */
hubRouter.post("/templates/:templateId/thumbnail", async (req: Request, res: Response) => {
  const { templateId } = req.params;
  const { slug } = req.body as { slug: string };

  if (!slug) {
    return res.status(400).json({ ok: false, error: "slug is required in body" });
  }

  try {
    // Pass an empty string — thumbnailer now uses PORTAL_INTERNAL_URL directly
    const localPath = await generateThumbnail(slug, templateId, "");
    const publicUrl = await uploadThumbnailToSupabase(localPath, slug, templateId);

    if (publicUrl) {
      await supabase
        .from("templates")
        .update({ thumbnail_url: publicUrl })
        .eq("id", templateId);
    }

    return res.json({ ok: true, data: { thumbnail_url: publicUrl } });
  } catch (err) {
    logger.error(`[hub] Thumbnail generation failed: ${String(err)}`);
    return res.status(500).json({ ok: false, error: "Thumbnail generation failed" });
  }
});

// ─── Cache Stats ──────────────────────────────────────────────────────────────

hubRouter.get("/cache/stats", (_req: Request, res: Response) => {
  return res.json({ ok: true, data: cacheStats() });
});
