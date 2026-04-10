// hs-portal/src/lib/hydrator.ts
// Fetches a full HydratedBrandData for a given slug via parallel Supabase queries.
// NEVER writes to the database. Read-only.

import { createClient } from "@supabase/supabase-js";
import type {
  HydratedBrandData,
  BrandRow,
  TemplateRow,
  BrandSectionRow,
  BrandIntroductionRow,
  BrandStrategyRow,
  BrandLogoRow,
  BrandTypographyRow,
  BrandColorRow,
  BrandImagesRow,
  BrandIconsRow,
  BrandResourceRow,
  BrandSectionLockRow,
} from "../types/index.js";
import { logger } from "./logger.js";

// ─── Supabase client (service role — read access to all rows) ─────────────────

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Hydrator ─────────────────────────────────────────────────────────────────

export class HydrationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "HydrationError";
  }
}

/**
 * Hydrate a brand by its slug.
 * Runs 10 parallel Supabase queries and assembles HydratedBrandData.
 * Throws HydrationError on slug-not-found or Supabase errors.
 */
export async function hydrateBrand(slug: string): Promise<HydratedBrandData> {
  // Step 1: Resolve slug → brand row + template join
  const { data: brandData, error: brandError } = await supabase
    .from("brands")
    .select("*, template:templates(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (brandError) {
    logger.error(`[hydrator] Supabase error fetching brand "${slug}": ${brandError.message}`);
    throw new HydrationError(`Database error: ${brandError.message}`, "DB_ERROR");
  }

  if (!brandData) {
    throw new HydrationError(`Brand slug not found: ${slug}`, "SLUG_NOT_FOUND");
  }

  const brand = brandData as BrandRow & { template: TemplateRow | null };
  const brandId = brand.id;

  logger.info(`[hydrator] Hydrating brand "${slug}" (id=${brandId})`);

  // Step 2: Parallel fetch of all child tables
  const [
    sectionsResult,
    introductionResult,
    strategyResult,
    logosResult,
    typographyResult,
    colorsResult,
    imagesResult,
    iconsResult,
    resourcesResult,
    locksResult,
  ] = await Promise.all([
    supabase.from("brand_sections").select("*").eq("brand_id", brandId).eq("is_enabled", true).order("sort_order"),
    supabase.from("brand_introductions").select("*").eq("brand_id", brandId).maybeSingle(),
    supabase.from("brand_strategies").select("*").eq("brand_id", brandId).maybeSingle(),
    supabase.from("brand_logos").select("*").eq("brand_id", brandId).order("sort_order"),
    supabase.from("brand_typography").select("*").eq("brand_id", brandId).order("sort_order"),
    supabase.from("brand_colors").select("*").eq("brand_id", brandId).order("sort_order"),
    supabase.from("brand_images").select("*").eq("brand_id", brandId).maybeSingle(),
    supabase.from("brand_icons").select("*").eq("brand_id", brandId).maybeSingle(),
    supabase.from("brand_resources").select("*").eq("brand_id", brandId).order("sort_order"),
    supabase.from("brand_section_locks").select("*").eq("brand_id", brandId),
  ]);

  // Surface any parallel query errors
  const results = [
    sectionsResult, introductionResult, strategyResult, logosResult,
    typographyResult, colorsResult, imagesResult, iconsResult,
    resourcesResult, locksResult,
  ];

  for (const result of results) {
    if (result.error) {
      logger.error(`[hydrator] Child table error for brand "${slug}": ${result.error.message}`);
      throw new HydrationError(`Database error: ${result.error.message}`, "DB_ERROR");
    }
  }

  const payload: HydratedBrandData = {
    brand,
    sections: (sectionsResult.data ?? []) as BrandSectionRow[],
    introduction: introductionResult.data as BrandIntroductionRow | null,
    strategy: strategyResult.data as BrandStrategyRow | null,
    logos: (logosResult.data ?? []) as BrandLogoRow[],
    typography: (typographyResult.data ?? []) as BrandTypographyRow[],
    colors: (colorsResult.data ?? []) as BrandColorRow[],
    images: imagesResult.data as BrandImagesRow | null,
    icons: iconsResult.data as BrandIconsRow | null,
    resources: (resourcesResult.data ?? []) as BrandResourceRow[],
    locks: (locksResult.data ?? []) as BrandSectionLockRow[],
  };

  logger.info(
    `[hydrator] Done: "${slug}" — sections=${payload.sections.length}, logos=${payload.logos.length}, colors=${payload.colors.length}`
  );

  return payload;
}

/**
 * Fetch only the brand row (no child tables). Used for auth checks.
 */
export async function getBrandMeta(slug: string): Promise<BrandRow | null> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new HydrationError(error.message, "DB_ERROR");
  return data as BrandRow | null;
}

/**
 * Fetch all brands for the Hub admin dashboard.
 */
export async function getAllBrands(): Promise<BrandRow[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new HydrationError(error.message, "DB_ERROR");
  return (data ?? []) as BrandRow[];
}
