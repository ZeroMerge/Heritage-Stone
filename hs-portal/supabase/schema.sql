-- hs-portal/supabase/schema.sql
-- Heritage Stone — Complete database schema.
-- Run this in Supabase Dashboard → SQL Editor → New Query → Paste → Run.
-- Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── 1. templates ─────────────────────────────────────────────────────────────
create table if not exists templates (
  id                 text        primary key,
  name               text        not null,
  component_name     text        not null,
  description        text,
  preview_url        text,
  thumbnail_url      text,
  sections_supported text[]      not null default '{}',
  dist_path          text        not null,
  is_active          boolean     not null default true,
  uploaded_at        timestamptz not null default now()
);

-- ─── 2. brands ────────────────────────────────────────────────────────────────
create table if not exists brands (
  id                 uuid        primary key default gen_random_uuid(),
  slug               text        not null unique,
  brand_name         text        not null,
  template_id        text        references templates(id) on delete set null,
  version            text        not null default '1.0',
  updated_date       text,
  is_published       boolean     not null default false,
  source_project_id  text,
  password_protected boolean     not null default false,
  -- NOTE: Store a bcrypt hash here, NOT plaintext. The auth route does plaintext
  -- comparison by default for simplicity — upgrade to bcrypt before going live.
  password_hash      text,
  show_studio_credit boolean     not null default true,
  custom_domain      text        unique,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_brands_slug on brands(slug);
create index if not exists idx_brands_custom_domain on brands(custom_domain) where custom_domain is not null;

-- ─── 3. brand_sections ────────────────────────────────────────────────────────
create table if not exists brand_sections (
  id           uuid        primary key default gen_random_uuid(),
  brand_id     uuid        not null references brands(id) on delete cascade,
  section_type text        not null,
  is_enabled   boolean     not null default true,
  sort_order   integer     not null default 0,
  custom_label text,
  unique(brand_id, section_type)
);

create index if not exists idx_brand_sections_brand on brand_sections(brand_id);

-- ─── 4. brand_introductions ───────────────────────────────────────────────────
create table if not exists brand_introductions (
  brand_id        uuid    primary key references brands(id) on delete cascade,
  tagline         text,
  tagline_size    text    check (tagline_size in ('small','medium','large','editorial')),
  brand_description text,
  cover_image_url text,
  cover_video_url text,
  brand_mark_url  text,
  founded_year    integer,
  industry        text,
  contact_email   text,
  website_url     text,
  social_links    jsonb   default '[]'
);

-- ─── 5. brand_strategies ──────────────────────────────────────────────────────
create table if not exists brand_strategies (
  brand_id              uuid  primary key references brands(id) on delete cascade,
  mission               text,
  vision                text,
  positioning_statement text,
  story_headline        text,
  story_body            text,
  story_images          text[],
  values                jsonb,
  tone_of_voice         jsonb,
  brand_personality     jsonb,
  target_audience       jsonb,
  messaging             jsonb
);

-- ─── 6. brand_logos ───────────────────────────────────────────────────────────
create table if not exists brand_logos (
  id                  uuid    primary key default gen_random_uuid(),
  brand_id            uuid    not null references brands(id) on delete cascade,
  label               text    not null,
  description         text,
  usage_notes         text,
  usage_notes_donts   text,
  file_url            text,
  download_url        text,
  preview_bg_color    text,
  min_size_px         integer,
  safe_formats        text[],
  variants            jsonb   default '[]',
  clear_space         jsonb,
  misuse_examples     jsonb   default '[]',
  sort_order          integer not null default 0
);

create index if not exists idx_brand_logos_brand on brand_logos(brand_id);

-- ─── 7. brand_typography ──────────────────────────────────────────────────────
create table if not exists brand_typography (
  id               uuid  primary key default gen_random_uuid(),
  brand_id         uuid  not null references brands(id) on delete cascade,
  font_name        text  not null,
  font_role        text  not null check (font_role in ('display','body','accent','mono')),
  font_source_url  text,
  font_file_url    text,
  weights          integer[],
  specimen_text    text,
  preview_sentence text,
  description      text,
  usage_context    text,
  fallback_stack   text,
  pairing_note     text,
  type_scale       jsonb,
  sort_order       integer not null default 0
);

create index if not exists idx_brand_typography_brand on brand_typography(brand_id);

-- ─── 8. brand_colors ──────────────────────────────────────────────────────────
create table if not exists brand_colors (
  id                  uuid    primary key default gen_random_uuid(),
  brand_id            uuid    not null references brands(id) on delete cascade,
  palette_type        text    not null check (palette_type in ('primary','secondary','neutral')),
  color_name          text    not null,
  hex                 text    not null,
  rgb                 text,
  cmyk                text,
  pantone             text,
  description         text,
  usage_role          text    check (usage_role in ('background','text','cta','accent','border','surface','general')),
  on_color            text,
  accessibility_level text    check (accessibility_level in ('AA','AAA','decorative')),
  is_primary          boolean not null default false,
  sort_order          integer not null default 0
);

create index if not exists idx_brand_colors_brand on brand_colors(brand_id);

-- ─── 9. brand_images ──────────────────────────────────────────────────────────
create table if not exists brand_images (
  brand_id            uuid  primary key references brands(id) on delete cascade,
  hero_images         text[],
  gallery_images      text[],
  mood_descriptors    text[],
  photography_style   text,
  do_examples         text[],
  dont_examples       text[]
);

-- ─── 10. brand_icons ──────────────────────────────────────────────────────────
create table if not exists brand_icons (
  brand_id                   uuid  primary key references brands(id) on delete cascade,
  section_description        text,
  icon_style                 text  check (icon_style in ('outline','filled','duotone','flat','custom')),
  stroke_weight              numeric,
  corner_radius              text,
  size_guidelines            jsonb,
  product_symbols            jsonb  default '[]',
  icon_library_name          text,
  icon_library_description   text,
  icon_library_url           text,
  icon_library_preview_url   text,
  download_all_url           text
);

-- ─── 11. brand_resources ──────────────────────────────────────────────────────
create table if not exists brand_resources (
  id               uuid    primary key default gen_random_uuid(),
  brand_id         uuid    not null references brands(id) on delete cascade,
  label            text    not null,
  description      text,
  file_url         text    not null,
  file_type        text    not null check (file_type in ('logo_suite','typeface','image_set','icon_library','template','guide','other')),
  thumbnail_url    text,
  file_size_bytes  bigint,
  sort_order       integer not null default 0
);

create index if not exists idx_brand_resources_brand on brand_resources(brand_id);

-- ─── 12. brand_section_locks ─────────────────────────────────────────────────
create table if not exists brand_section_locks (
  id           uuid        primary key default gen_random_uuid(),
  brand_id     uuid        not null references brands(id) on delete cascade,
  section_type text        not null,
  locked_by    text        not null,
  locked_at    timestamptz not null default now(),
  reason       text,
  unique(brand_id, section_type)
);

create index if not exists idx_section_locks_brand on brand_section_locks(brand_id);

-- ─── 13. brand_changelog ─────────────────────────────────────────────────────
create table if not exists brand_changelog (
  id               uuid        primary key default gen_random_uuid(),
  brand_id         uuid        not null references brands(id) on delete cascade,
  section_type     text,
  change_summary   text        not null,
  changed_by       text        not null,
  changed_at       timestamptz not null default now(),
  is_public        boolean     not null default false
);

create index if not exists idx_changelog_brand on brand_changelog(brand_id, changed_at desc);

-- ─── 14. template_assignments ────────────────────────────────────────────────
create table if not exists template_assignments (
  brand_id     uuid        primary key references brands(id) on delete cascade,
  template_id  text        not null references templates(id) on delete cascade,
  assigned_at  timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- The portal backend uses the SERVICE ROLE KEY which bypasses RLS.
-- These policies protect direct client access if you ever use the anon key.

alter table brands             enable row level security;
alter table templates          enable row level security;
alter table brand_sections     enable row level security;
alter table brand_introductions enable row level security;
alter table brand_strategies   enable row level security;
alter table brand_logos        enable row level security;
alter table brand_typography   enable row level security;
alter table brand_colors       enable row level security;
alter table brand_images       enable row level security;
alter table brand_icons        enable row level security;
alter table brand_resources    enable row level security;
alter table brand_section_locks enable row level security;
alter table brand_changelog    enable row level security;
alter table template_assignments enable row level security;

-- Public read on published brands and their child tables
-- (the portal backend uses service role so these don't apply to it)
create policy if not exists "Public read published brands"
  on brands for select using (is_published = true);

create policy if not exists "Public read templates"
  on templates for select using (is_active = true);

-- ─── Supabase Storage bucket reminder ────────────────────────────────────────
-- After running this schema, create one storage bucket manually:
--   Supabase Dashboard → Storage → New Bucket
--   Name: portal-assets
--   Public: ON  (thumbnails must be publicly accessible)
