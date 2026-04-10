-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Client Members / Project Members (Team Tab)
CREATE TABLE IF NOT EXISTS public.client_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    permission_level TEXT NOT NULL DEFAULT 'viewer',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Events (Activity Tab)
CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    action TEXT,
    event_type TEXT,
    actor_type TEXT,
    actor_name TEXT,
    user_name TEXT,
    description TEXT,
    section_key TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages (Chat Tab)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    thread_id TEXT,
    sender_name TEXT NOT NULL,
    sender_type TEXT NOT NULL, -- 'studio' or 'client'
    content TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Assets (Assets Tab)
CREATE TABLE IF NOT EXISTS public.project_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    category TEXT NOT NULL, -- 'logo', 'typography', 'imagery', etc.
    visible_to_client BOOLEAN DEFAULT true,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for authenticated users (can be hardened later)
DROP POLICY IF EXISTS "Allow all access to authenticated users for client_members" ON public.client_members;
CREATE POLICY "Allow all access to authenticated users for client_members" ON public.client_members FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users for activity_events" ON public.activity_events;
CREATE POLICY "Allow all access to authenticated users for activity_events" ON public.activity_events FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users for messages" ON public.messages;
CREATE POLICY "Allow all access to authenticated users for messages" ON public.messages FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all access to authenticated users for project_assets" ON public.project_assets;
CREATE POLICY "Allow all access to authenticated users for project_assets" ON public.project_assets FOR ALL TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_members_brand_id ON public.client_members(brand_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_brand_id ON public.activity_events(brand_id);
CREATE INDEX IF NOT EXISTS idx_messages_brand_id ON public.messages(brand_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_brand_id ON public.project_assets(brand_id);

-- Section Locks (Studio Tab Locking)
CREATE TABLE IF NOT EXISTS public.brand_section_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    section_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_name TEXT,
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Hub Templates (Hydration Engine)
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT, -- 'standard', 'premium', 'custom'
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_at TIMESTAMPTZ DEFAULT NOW() -- Explicitly added for Hub compatibility
);

-- RLS for new tables
ALTER TABLE public.brand_section_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access for brand_section_locks" ON public.brand_section_locks;
CREATE POLICY "Allow all access for brand_section_locks" ON public.brand_section_locks FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all access for templates" ON public.templates;
CREATE POLICY "Allow all access for templates" ON public.templates FOR ALL TO authenticated USING (true);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_brand_section_locks_brand_id ON public.brand_section_locks(brand_id);

-- Ensure category column exists before creating index (in case table was created previously without it)
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
