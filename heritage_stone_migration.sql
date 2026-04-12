-- ═══════════════════════════════════════════════════════════════════════════════
-- Heritage Stone — Complete Database Migration
-- Run this in: Supabase SQL Editor → Run once on a fresh project
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. BRANDS (Projects)
-- Core table — every other table references brand_id → brands.id
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brands (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  brand_name          text not null,
  client_name         text,
  industry            text,
  description         text,
  status              text not null default 'active'
                        check (status in ('draft','active','live','archived')),
  is_published        boolean not null default false,
  portal_template     text not null default 'meridian',
  brand_colour        text not null default '#C9A96E',
  secondary_colour    text not null default '#0F0F0F',
  version             text not null default '1.0',
  member_count        integer not null default 0,
  health_score        integer not null default 100,
  brand_health        integer not null default 100,
  go_live_date        date,
  launched_at         timestamptz,
  brand_json          jsonb,
  portal_settings     jsonb default '{
    "url":"","passwordProtected":false,"password":null,
    "customDomain":null,"showStudioCredit":true,"theme":"auto"
  }'::jsonb,
  section_visibility  jsonb default '[]'::jsonb,
  approval_states     jsonb default '[]'::jsonb,
  launch_tasks        jsonb default '[]'::jsonb,
  version_history     jsonb default '[]'::jsonb,
  chat_threads        jsonb default '[]'::jsonb,
  sub_brands          jsonb default '[]'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists brands_status_idx on brands(status);
create index if not exists brands_slug_idx on brands(slug);
create index if not exists brands_updated_at_idx on brands(updated_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. BRAND_SECTIONS — section on/off config per brand
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_sections (
  id           uuid primary key default uuid_generate_v4(),
  brand_id     uuid not null references brands(id) on delete cascade,
  section_type text not null
                 check (section_type in (
                   'introduction','strategy','logo','color_palette',
                   'typography','photography','voice_tone','messaging',
                   'icons','resources'
                 )),
  is_enabled   boolean not null default true,
  sort_order   integer not null default 0,
  custom_label text,
  created_at   timestamptz not null default now(),
  unique (brand_id, section_type)
);

create index if not exists brand_sections_brand_id_idx on brand_sections(brand_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. BRAND_INTRODUCTIONS — single row per brand
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_introductions (
  brand_id          uuid primary key references brands(id) on delete cascade,
  tagline           text,
  tagline_size      text check (tagline_size in ('small','medium','large','editorial')),
  brand_description text,
  cover_image_url   text,
  cover_video_url   text,
  brand_mark_url    text,
  founded_year      integer,
  industry          text,
  contact_email     text,
  website_url       text,
  social_links      jsonb default '[]'::jsonb,
  updated_at        timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. BRAND_STRATEGIES — single row per brand (covers strategy + voice + messaging)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_strategies (
  brand_id               uuid primary key references brands(id) on delete cascade,
  mission                text,
  vision                 text,
  positioning_statement  text,
  story_headline         text,
  story_body             text,
  story_images           jsonb default '[]'::jsonb,
  values                 jsonb default '[]'::jsonb,   -- [{name, description, imageUrl}]
  tone_of_voice          jsonb,                       -- {descriptors, dos, donts}
  brand_personality      jsonb,                       -- {archetype, adjectives, antiAdjectives}
  target_audience        jsonb,                       -- {primary:{description,ageRange,behaviors}, secondary:...}
  messaging              jsonb,                       -- {headline, taglines, keyMessages, ctaGuidelines}
  updated_at             timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. BRAND_LOGOS — multiple rows per brand (one per logo suite)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_logos (
  id                 uuid primary key default uuid_generate_v4(),
  brand_id           uuid not null references brands(id) on delete cascade,
  label              text not null default 'Primary Logo',
  description        text,
  usage_notes        text,
  usage_notes_donts  text,
  file_url           text,
  download_url       text,
  preview_bg_color   text default '#FFFFFF',
  min_size_px        integer,
  safe_formats       jsonb default '["SVG","PNG","PDF"]'::jsonb,
  variants           jsonb default '[]'::jsonb,  -- [LogoVariant]
  clear_space        jsonb,                      -- LogoClearSpace
  misuse_examples    jsonb default '[]'::jsonb,  -- [LogoMisuseExample]
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists brand_logos_brand_id_idx on brand_logos(brand_id, sort_order);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. BRAND_COLORS — multiple rows per brand
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_colors (
  id                  uuid primary key default uuid_generate_v4(),
  brand_id            uuid not null references brands(id) on delete cascade,
  palette_type        text not null default 'primary'
                        check (palette_type in ('primary','secondary','neutral')),
  color_name          text not null,
  hex                 text not null,
  rgb                 text,
  cmyk                text,
  pantone             text,
  description         text,
  usage_role          text check (usage_role in (
                        'background','text','cta','accent','border','surface','general'
                      )),
  on_color            text,                     -- contrast color for text on this bg
  accessibility_level text check (accessibility_level in ('AA','AAA','decorative')),
  is_primary          boolean not null default false,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now()
);

create index if not exists brand_colors_brand_id_idx on brand_colors(brand_id, sort_order);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. BRAND_TYPOGRAPHY — multiple rows per brand (one per typeface)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_typography (
  id               uuid primary key default uuid_generate_v4(),
  brand_id         uuid not null references brands(id) on delete cascade,
  font_name        text not null,
  font_role        text not null default 'body'
                     check (font_role in ('display','body','accent','mono')),
  font_source_url  text,
  font_file_url    text,
  weights          jsonb default '[400,700]'::jsonb,
  specimen_text    text,
  preview_sentence text,
  description      text,
  usage_context    text,
  fallback_stack   text,
  pairing_note     text,
  type_scale       jsonb,  -- {display, h1..h6, body1, body2, caption, overline, button}
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists brand_typography_brand_id_idx on brand_typography(brand_id, sort_order);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. BRAND_IMAGES — single row per brand (photography section)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_images (
  brand_id              uuid primary key references brands(id) on delete cascade,
  direction_headline    text,
  direction_body        text,
  photography_style     jsonb default '[]'::jsonb,
  mood_descriptors      jsonb default '[]'::jsonb,
  color_grading_note    text,
  subject_focus         text,
  hero_images           jsonb default '[]'::jsonb,    -- [{url,filename,caption,tiltDeg,focalLabel}]
  gallery_images        jsonb default '[]'::jsonb,    -- [{url,alt,colSpan}]
  do_donts              jsonb default '[]'::jsonb,    -- [{type,label,imageUrl}]
  updated_at            timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. BRAND_ICONS — single row per brand
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_icons (
  brand_id                  uuid primary key references brands(id) on delete cascade,
  section_description       text,
  icon_style                text check (icon_style in ('outline','filled','duotone','flat','custom')),
  stroke_weight             numeric(4,1),
  corner_radius             text,
  size_guidelines           jsonb,               -- {minimumPx, gridUnit, preferredSizes}
  product_symbols           jsonb default '[]'::jsonb,
  icon_library_name         text,
  icon_library_description  text,
  icon_library_url          text,
  icon_library_preview_url  text,
  download_all_url          text,
  updated_at                timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. BRAND_RESOURCES — multiple rows per brand (downloadable files)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_resources (
  id              uuid primary key default uuid_generate_v4(),
  brand_id        uuid not null references brands(id) on delete cascade,
  label           text not null,
  description     text,
  file_url        text not null,
  file_type       text not null default 'other'
                    check (file_type in (
                      'logo_suite','typeface','image_set',
                      'icon_library','template','guide','other'
                    )),
  thumbnail_url   text,
  file_size_bytes bigint,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists brand_resources_brand_id_idx on brand_resources(brand_id, sort_order);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. PROJECT_ASSETS — uploaded files attached to a project
-- Uses CREATE + ALTER pattern so it is safe to run on EXISTING databases too
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists project_assets (
  id                uuid primary key default uuid_generate_v4(),
  brand_id          uuid not null references brands(id) on delete cascade,
  name              text not null,
  file_url          text not null,
  file_type         text not null,
  file_size_bytes   bigint not null default 0,
  category          text not null default 'other',
  visible_to_client boolean not null default true,
  uploaded_by       text not null default 'Studio',
  created_at        timestamptz not null default now()
);

-- Safely add columns that may not exist in older installs
alter table project_assets add column if not exists owner_id      uuid references auth.users(id) on delete set null;
alter table project_assets add column if not exists thumbnail_url text;

-- Drop & re-add the category check constraint to keep it current
alter table project_assets drop constraint if exists project_assets_category_check;
alter table project_assets add constraint project_assets_category_check
  check (category in (
    'logo','brand_logos','color','typography','photography',
    'document','guidelines','icons','brand_icons','brand_resources','other'
  ));

create index if not exists project_assets_brand_id_idx on project_assets(brand_id, created_at desc);
create index if not exists project_assets_owner_idx    on project_assets(owner_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. CLIENT_MEMBERS — portal access invitations
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists client_members (
  id               uuid primary key default uuid_generate_v4(),
  brand_id         uuid not null references brands(id) on delete cascade,
  name             text,
  email            text not null,
  permission_level text not null default 'viewer'
                     check (permission_level in (
                       'full','designer','copywriter','marketing','executive','viewer'
                     )),
  is_active        boolean not null default true,
  invited_by       text default 'Studio',
  last_login_at    timestamptz,
  created_at       timestamptz not null default now(),
  unique (brand_id, email)
);

create index if not exists client_members_brand_id_idx on client_members(brand_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. STUDIO_MEMBERS — internal team
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists studio_members (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text unique not null,
  avatar_url text,
  role       text not null default 'designer'
               check (role in ('owner','admin','designer','strategist','copywriter','viewer')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 14. MESSAGES — studio ↔ client chat
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists messages (
  id           uuid primary key default uuid_generate_v4(),
  brand_id     uuid not null references brands(id) on delete cascade,
  thread_id    text not null default 'general',
  sender_name  text not null,
  sender_type  text not null check (sender_type in ('studio','client')),
  content      text not null,
  attachments  jsonb default '[]'::jsonb,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists messages_brand_id_idx on messages(brand_id, created_at asc);
create index if not exists messages_unread_idx on messages(brand_id, sender_type, read_at)
  where read_at is null;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 15. ACTIVITY_EVENTS — audit trail across all actions
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists activity_events (
  id           uuid primary key default uuid_generate_v4(),
  brand_id     uuid not null references brands(id) on delete cascade,
  event_type   text not null,              -- e.g. 'section_updated', 'asset_uploaded'
  actor_type   text not null default 'studio'
                 check (actor_type in ('studio','client')),
  actor_name   text not null,
  description  text not null,
  section_key  text,
  metadata     jsonb,
  -- Legacy columns (kept for backward compat)
  action       text,
  user_name    text,
  created_at   timestamptz not null default now()
);

create index if not exists activity_events_brand_id_idx on activity_events(brand_id, created_at desc);
create index if not exists activity_events_global_idx on activity_events(created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 16. BRAND_REQUESTS — client change requests
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists brand_requests (
  id               uuid primary key default uuid_generate_v4(),
  brand_id         uuid not null references brands(id) on delete cascade,
  client_member_id uuid references client_members(id) on delete set null,
  client_name      text not null,
  request_type     text not null,
  description      text not null,
  status           text not null default 'pending'
                     check (status in ('pending','approved','declined')),
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists brand_requests_brand_id_idx on brand_requests(brand_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 17. STUDIO_SETTINGS — single row for the whole studio workspace
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists studio_settings (
  id                  uuid primary key default uuid_generate_v4(),
  studio_name         text not null default 'Heritage Stone',
  primary_domain      text,
  default_template_id text default 'codex',
  logo_url            text,
  accent_color        text default '#C9A96E',
  updated_at          timestamptz not null default now()
);

-- Seed a default row so Settings page never errors
insert into studio_settings (studio_name, primary_domain)
  values ('Heritage Stone', 'ravennorth.com')
  on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 18. AUTO-UPDATE updated_at TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════════
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply trigger to every table with updated_at
do $$
declare
  t text;
begin
  foreach t in array array[
    'brands','brand_introductions','brand_strategies','brand_images',
    'brand_icons','studio_settings'
  ] loop
    execute format($f$
      drop trigger if exists set_updated_at on %I;
      create trigger set_updated_at
        before update on %I
        for each row execute function update_updated_at_column();
    $f$, t, t);
  end loop;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 19. STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
  values ('brand-assets', 'brand-assets', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('brand-logos', 'brand-logos', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('brand-images', 'brand-images', true)
  on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 20. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables, then add permissive policies for now.
-- Tighten post-launch with per-user policies.
-- ═══════════════════════════════════════════════════════════════════════════════
alter table brands              enable row level security;
alter table brand_sections      enable row level security;
alter table brand_introductions enable row level security;
alter table brand_strategies    enable row level security;
alter table brand_logos         enable row level security;
alter table brand_colors        enable row level security;
alter table brand_typography    enable row level security;
alter table brand_images        enable row level security;
alter table brand_icons         enable row level security;
alter table brand_resources     enable row level security;
alter table project_assets      enable row level security;
alter table client_members      enable row level security;
alter table studio_members      enable row level security;
alter table messages            enable row level security;
alter table activity_events     enable row level security;
alter table brand_requests      enable row level security;
alter table studio_settings     enable row level security;

-- Studio users (authenticated) — full access to all tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'brands','brand_sections','brand_introductions','brand_strategies',
    'brand_logos','brand_colors','brand_typography','brand_images',
    'brand_icons','brand_resources','project_assets','client_members',
    'studio_members','messages','activity_events','brand_requests','studio_settings'
  ] loop
    execute format($f$
      drop policy if exists "authenticated_all" on %I;
      create policy "authenticated_all" on %I
        for all to authenticated using (true) with check (true);
    $f$, t, t);
  end loop;
end;
$$;

-- Public read for published portals (brands + content tables)
create policy "public_read_published_brands" on brands
  for select to anon using (is_published = true);

create policy "public_read_brand_introductions" on brand_introductions
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_strategies" on brand_strategies
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_logos" on brand_logos
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_colors" on brand_colors
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_typography" on brand_typography
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_images" on brand_images
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_icons" on brand_icons
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

create policy "public_read_brand_resources" on brand_resources
  for select to anon
  using (exists (select 1 from brands b where b.id = brand_id and b.is_published));

-- Storage policies
create policy "authenticated_upload" on storage.objects
  for insert to authenticated with check (bucket_id in ('brand-assets','brand-logos','brand-images'));

create policy "public_read_assets" on storage.objects
  for select to anon using (bucket_id in ('brand-assets','brand-logos','brand-images'));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 21. HELPER VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Dashboard stats view
create or replace view dashboard_stats as
select
  count(*) filter (where status not in ('archived','live')) as active_projects,
  count(*) filter (where is_published = true)                as published_portals,
  count(*) filter (where status = 'archived')                as archived_projects
from brands;

-- Recent activity with brand name
create or replace view recent_activity as
select
  ae.*,
  b.brand_name,
  b.slug as brand_slug
from activity_events ae
join brands b on b.id = ae.brand_id
order by ae.created_at desc;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — All 17 tables + triggers + storage + RLS + views
-- ═══════════════════════════════════════════════════════════════════════════════
