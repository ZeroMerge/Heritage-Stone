// hs-portal/src/routes/upload.ts
// Template upload endpoint.
// Accepts a multipart/form-data POST with a zip file field called "template".
// Triggers builder.ts pipeline and returns structured build logs.

import { Router, Request, Response } from "express";
import multer from "multer";
import { buildTemplate } from "../lib/builder.js";
import { logger } from "../lib/logger.js";

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.originalname.endsWith(".zip")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .zip files are accepted"));
    }
  },
});

/**
 * POST /upload/template
 * Body: multipart/form-data
 *   - template: File (.zip)
 *   - uploaded_by: string (user email or name for audit trail)
 *
 * Returns: BuildResult — includes success, templateId, and full build log
 */
uploadRouter.post(
  "/template",
  upload.single("template"),
  async (req: Request, res: Response) => {
    const secret = req.headers["x-hub-secret"];
    if (!secret || secret !== process.env.HUB_SECRET) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file uploaded. Field name must be 'template'." });
    }

    const uploadedBy = (req.body as { uploaded_by?: string }).uploaded_by ?? "unknown";

    logger.info(`[upload] Received zip: ${req.file.originalname} (${req.file.size} bytes) from ${uploadedBy}`);

    try {
      const result = await buildTemplate(req.file.buffer, uploadedBy);

      if (result.success) {
        logger.info(`[upload] Build success: templateId=${result.templateId}`);
        return res.status(201).json({ ok: true, data: result });
      } else {
        logger.warn(`[upload] Build failed: ${result.error}`);
        return res.status(422).json({ ok: false, error: result.error, data: result });
      }
    } catch (err) {
      logger.error(`[upload] Unexpected error: ${String(err)}`);
      return res.status(500).json({ ok: false, error: "Unexpected server error during build" });
    }
  }
);

/**
 * DELETE /upload/template/:templateId
 * Remove a template by ID. Deregisters from Supabase and removes dist folder.
 * Requires HUB_SECRET.
 */
uploadRouter.delete("/template/:templateId", async (req: Request, res: Response) => {
  const secret = req.headers["x-hub-secret"];
  if (!secret || secret !== process.env.HUB_SECRET) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { templateId } = req.params;
  const { createClient } = await import("@supabase/supabase-js");
  const fs = await import("fs");
  const path = await import("path");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: template, error } = await supabase
    .from("templates")
    .select("dist_path")
    .eq("id", templateId)
    .maybeSingle();

  if (error) return res.status(502).json({ ok: false, error: error.message });
  if (!template) return res.status(404).json({ ok: false, error: "Template not found" });

  // Remove from disk
  const templateDir = path.dirname(template.dist_path as string);
  fs.rmSync(templateDir, { recursive: true, force: true });

  // Remove from Supabase
  await supabase.from("templates").delete().eq("id", templateId);

  logger.info(`[upload] Deleted template: ${templateId}`);
  return res.json({ ok: true, data: { deleted: templateId } });
});
