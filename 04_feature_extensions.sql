-- Heritage Stone Studio - Feature Extensions
-- Run this in Supabase SQL Editor.

-- 1. Update brands table for detailed status tracking
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'live', 'archived')) DEFAULT 'draft';

-- 2. Extend profiles for settings and preferences
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_preset TEXT DEFAULT 'av-1',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
    "email_approvals": true,
    "email_messages": true,
    "email_deadlines": false,
    "email_activity": true
}'::jsonb;

-- 3. Studio-wide settings table (Workspace Prefs)
CREATE TABLE IF NOT EXISTS public.studio_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_name TEXT DEFAULT 'Heritage Stone',
    primary_domain TEXT,
    default_template_id UUID REFERENCES public.templates(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial settings if empty
INSERT INTO public.studio_settings (studio_name)
SELECT 'Heritage Stone'
WHERE NOT EXISTS (SELECT 1 FROM public.studio_settings);

-- 4. Sub-Brands (Campaigns) Table
CREATE TABLE IF NOT EXISTS public.brand_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    relationship TEXT DEFAULT 'subsidiary',
    brand_colour TEXT,
    secondary_colour TEXT,
    health_score INTEGER DEFAULT 100,
    assets JSONB DEFAULT '[]'::jsonb,
    overrides JSONB DEFAULT '{}'::jsonb,
    inherited_fields TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, slug)
);

-- Enable RLS for new tables
ALTER TABLE public.studio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to authenticated users for studio_settings" 
ON public.studio_settings FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow all access to authenticated users for brand_campaigns" 
ON public.brand_campaigns FOR ALL TO authenticated USING (true);
