// hs-portal/src/lib/thumbnailer.ts
// Generates a PNG screenshot of a rendered brand portal page using Puppeteer.
// Called after template upload or on-demand from the Hub.

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const THUMB_WIDTH = parseInt(process.env.THUMB_WIDTH ?? "1280", 10);
const THUMB_HEIGHT = parseInt(process.env.THUMB_HEIGHT ?? "800", 10);
const THUMBS_DIR = path.resolve(process.cwd(), "thumbs");

/**
 * Generate a screenshot thumbnail for a slug+templateId combination.
 * Returns the local file path of the saved PNG.
 *
 * FIX: page.waitForTimeout() was removed in Puppeteer v22.
 *      Replaced with a plain setTimeout Promise.
 *
 * IMPORTANT: PORTAL_INTERNAL_URL must be set to the URL Puppeteer can
 * reach the portal at — e.g. http://localhost:3001 in production (internal),
 * NOT the public-facing URL. This avoids external network calls from the server.
 */
export async function generateThumbnail(
  slug: string,
  templateId: string,
  _baseUrl: string // kept for API compatibility but ignored — use PORTAL_INTERNAL_URL
): Promise<string> {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });

  // Use PORTAL_INTERNAL_URL so Puppeteer always hits localhost, not the public URL
  const internalBase = process.env.PORTAL_INTERNAL_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
  const previewUrl = `${internalBase}/preview/${slug}/${templateId}`;
  const outputPath = path.join(THUMBS_DIR, `${slug}_${templateId}.png`);

  logger.info(`[thumbnailer] Capturing: ${previewUrl}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Required on Render/Linux containers
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: THUMB_WIDTH, height: THUMB_HEIGHT });
    await page.goto(previewUrl, { waitUntil: "networkidle0", timeout: 30_000 });

    // FIX: page.waitForTimeout() was removed in Puppeteer v22.
    // Use a plain Promise-wrapped setTimeout instead.
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));

    await page.screenshot({ path: outputPath as `${string}.png`, type: "png" });
    logger.info(`[thumbnailer] Saved: ${outputPath}`);
  } finally {
    await browser.close();
  }

  return outputPath;
}

/**
 * Upload a thumbnail PNG to Supabase Storage and return the public URL.
 * Bucket "portal-assets" must exist and be set to public in Supabase Storage.
 * Create it in: Supabase Dashboard → Storage → New Bucket → Name: portal-assets → Public: ON
 */
export async function uploadThumbnailToSupabase(
  localPath: string,
  slug: string,
  templateId: string
): Promise<string | null> {
  const fileName = `thumbnails/${slug}_${templateId}.png`;
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage
    .from("portal-assets")
    .upload(fileName, fileBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    logger.error(`[thumbnailer] Upload failed: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("portal-assets")
    .getPublicUrl(fileName);

  logger.info(`[thumbnailer] Public URL: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}
