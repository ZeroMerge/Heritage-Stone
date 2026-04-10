// hs-portal/src/types/index.ts
// Canonical type definitions — mirrors hs-studio types exactly.
// DO NOT modify the HydratedBrandData shape; it is the template contract.

// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type SupabaseSectionType =
  | "introduction"
  | "strategy"
  | "logo"
  | "color_palette"
  | "typography"
  | "photography"
  | "voice_tone"
  | "messaging"
  | "icons"
  | "resources";

export type ColorUsageRole =
  | "background"
  | "text"
  | "cta"
  | "accent"
  | "border"
  | "surface"
  | "general";

export type AccessibilityLevel = "AA" | "AAA" | "decorative";

export type LogoVariantType = "full_color" | "reversed" | "monochrome" | "outline";

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type IconStyle = "outline" | "filled" | "duotone" | "flat" | "custom";

export type BrandArchetype =
  | "Hero" | "Creator" | "Sage" | "Explorer" | "Ruler"
  | "Caregiver" | "Innocent" | "Jester" | "Lover"
  | "Rebel" | "Everyman" | "Magician";

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface BrandRow {
  id: string;
  slug: string;
  brand_name: string;
  template_id: string;
  version: string;
  updated_date: string;
  is_published: boolean;
  source_project_id: string | null;
  password_protected: boolean;
  password_hash: string | null;
  show_studio_credit: boolean;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  component_name: string;
  description: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  sections_supported: SupabaseSectionType[];
  dist_path: string;
  is_active: boolean;
  uploaded_at: string;
}

export interface BrandSectionRow {
  id: string;
  brand_id: string;
  section_type: SupabaseSectionType;
  is_enabled: boolean;
  sort_order: number;
  custom_label: string | null;
}

export interface BrandIntroductionRow {
  brand_id: string;
  tagline: string | null;
  tagline_size: "small" | "medium" | "large" | "editorial" | null;
  brand_description: string | null;
  cover_image_url: string | null;
  cover_video_url: string | null;
  brand_mark_url: string | null;
  founded_year: number | null;
  industry: string | null;
  contact_email: string | null;
  website_url: string | null;
  social_links: { platform: string; url: string }[] | null;
}

export interface ToneOfVoiceRow {
  descriptors: string[];
  dos: string[];
  donts: string[];
}

export interface BrandPersonalityRow {
  archetype: BrandArchetype | null;
  adjectives: string[];
  anti_adjectives: string[];
}

export interface TargetAudienceRow {
  primary: { description: string; age_range: string; behaviors: string };
  secondary: { description: string } | null;
}

export interface BrandStrategyRow {
  brand_id: string;
  mission: string | null;
  vision: string | null;
  positioning_statement: string | null;
  story_headline: string | null;
  story_body: string | null;
  story_images: string[] | null;
  values: { name: string; description: string; image_url: string | null }[] | null;
  tone_of_voice: ToneOfVoiceRow | null;
  brand_personality: BrandPersonalityRow | null;
  target_audience: TargetAudienceRow | null;
  messaging: {
    headline: string | null;
    taglines: string[];
    key_messages: string[];
    cta_guidelines: string | null;
  } | null;
}

export interface LogoVariantRow {
  variant_type: LogoVariantType;
  file_url: string | null;
  download_url: string | null;
  preview_bg_color: string;
}

export interface BrandLogoRow {
  id: string;
  brand_id: string;
  label: string;
  description: string | null;
  usage_notes: string | null;
  usage_notes_donts: string | null;
  file_url: string | null;
  download_url: string | null;
  preview_bg_color: string | null;
  min_size_px: number | null;
  safe_formats: string[] | null;
  variants: LogoVariantRow[] | null;
  clear_space: {
    unit: "x-height" | "fixed_px";
    value: number;
    description: string;
    diagram_url: string | null;
  } | null;
  misuse_examples: { image_url: string; label: string }[] | null;
  sort_order: number;
}

export interface TypeScaleEntryRow {
  size: string;
  weight: number;
  line_height: string;
  letter_spacing?: string;
  case?: "sentence" | "uppercase" | "lowercase" | "capitalize";
}

export interface BrandTypographyRow {
  id: string;
  brand_id: string;
  font_name: string;
  font_role: "display" | "body" | "accent" | "mono";
  font_source_url: string | null;
  font_file_url: string | null;
  weights: FontWeight[] | null;
  specimen_text: string | null;
  preview_sentence: string | null;
  description: string | null;
  usage_context: string | null;
  fallback_stack: string | null;
  pairing_note: string | null;
  type_scale: Record<string, TypeScaleEntryRow> | null;
  sort_order: number;
}

export interface BrandColorRow {
  id: string;
  brand_id: string;
  palette_type: "primary" | "secondary" | "neutral";
  color_name: string;
  hex: string;
  rgb: string | null;
  cmyk: string | null;
  pantone: string | null;
  description: string | null;
  usage_role: ColorUsageRole | null;
  on_color: string | null;
  accessibility_level: AccessibilityLevel | null;
  is_primary: boolean;
  sort_order: number;
}

export interface BrandImagesRow {
  brand_id: string;
  hero_images: string[] | null;
  gallery_images: string[] | null;
  mood_descriptors: string[] | null;
  photography_style: string | null;
  do_examples: string[] | null;
  dont_examples: string[] | null;
}

export interface BrandIconsRow {
  brand_id: string;
  section_description: string | null;
  icon_style: IconStyle | null;
  stroke_weight: number | null;
  corner_radius: string | null;
  size_guidelines: {
    minimum_px: number;
    grid_unit: number;
    preferred_sizes: number[];
  } | null;
  product_symbols: {
    name: string;
    original_url: string;
    black_url: string;
    white_url: string;
    svg_inline: string | null;
  }[] | null;
  icon_library_name: string | null;
  icon_library_description: string | null;
  icon_library_url: string | null;
  icon_library_preview_url: string | null;
  download_all_url: string | null;
}

export interface BrandResourceRow {
  id: string;
  brand_id: string;
  label: string;
  description: string | null;
  file_url: string;
  file_type: "logo_suite" | "typeface" | "image_set" | "icon_library" | "template" | "guide" | "other";
  thumbnail_url: string | null;
  file_size_bytes: number | null;
  sort_order: number;
}

// ─── Section Lock ─────────────────────────────────────────────────────────────

export interface BrandSectionLockRow {
  id: string;
  brand_id: string;
  section_type: SupabaseSectionType;
  locked_by: string;
  locked_at: string;
  reason: string | null;
}

// ─── Changelog ────────────────────────────────────────────────────────────────

export interface BrandChangelogRow {
  id: string;
  brand_id: string;
  section_type: SupabaseSectionType | null;
  change_summary: string;
  changed_by: string;
  changed_at: string;
  is_public: boolean;
}

// ─── THE HYDRATED PAYLOAD — Template Contract ─────────────────────────────────

export interface HydratedBrandData {
  brand: BrandRow & { template: TemplateRow | null };
  sections: BrandSectionRow[];
  introduction: BrandIntroductionRow | null;
  strategy: BrandStrategyRow | null;
  logos: BrandLogoRow[];
  typography: BrandTypographyRow[];
  colors: BrandColorRow[];
  images: BrandImagesRow | null;
  icons: BrandIconsRow | null;
  resources: BrandResourceRow[];
  locks: BrandSectionLockRow[];
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Cache Entry ──────────────────────────────────────────────────────────────

export interface CacheEntry {
  data: HydratedBrandData;
  cachedAt: number;
  ttl: number;
}

// ─── Template Registry Entry ──────────────────────────────────────────────────

export interface TemplateRegistryEntry {
  id: string;
  name: string;
  distPath: string;
  thumbnailUrl: string | null;
  sectionsSupported: SupabaseSectionType[];
  uploadedAt: string;
}

// ─── Build Log ────────────────────────────────────────────────────────────────

export interface BuildLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface BuildResult {
  success: boolean;
  templateId: string | null;
  logs: BuildLogEntry[];
  error?: string;
}
