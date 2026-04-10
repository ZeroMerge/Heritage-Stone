// hs-portal/src/lib/injector.ts
// Takes a pre-built Vite template's index.html and injects:
//   1. window.__BRAND_DATA__ as a JSON script tag
//   2. CSS variables for primary/secondary brand colors
// Templates NEVER fetch data — they read window.__BRAND_DATA__ only.

import fs from "fs";
import path from "path";
import type { HydratedBrandData } from "../types/index.js";
import { logger } from "./logger.js";

/**
 * Read index.html from a template's dist folder,
 * inject brand data, and return the modified HTML string.
 */
export function injectBrandData(distPath: string, data: HydratedBrandData): string {
  const indexPath = path.join(distPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Template dist not found: ${indexPath}`);
  }

  let html = fs.readFileSync(indexPath, "utf-8");

  // Derive primary color from the first is_primary color, fallback to #000
  const primaryColor =
    data.colors.find((c) => c.is_primary)?.hex ??
    data.colors.find((c) => c.palette_type === "primary")?.hex ??
    "#000000";

  const secondaryColor =
    data.colors.find((c) => c.palette_type === "secondary")?.hex ??
    "#888888";

  const safeJson = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  const injection = `
<script>
  window.__BRAND_DATA__ = ${safeJson};
</script>
<style>
  :root {
    --cp: ${primaryColor};
    --cs: ${secondaryColor};
    --cp-contrast: ${getContrastColor(primaryColor)};
    --cs-contrast: ${getContrastColor(secondaryColor)};
  }
</style>`;

  // Inject just before </head>
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${injection}\n</head>`);
  } else {
    // Fallback: prepend
    html = injection + html;
  }

  logger.debug(`[injector] Injected brand data for slug="${data.brand.slug}"`);
  return html;
}

/**
 * Returns #FFFFFF or #0A0A0A depending on background luminance.
 */
function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#0A0A0A";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0A0A0A" : "#FFFFFF";
}
