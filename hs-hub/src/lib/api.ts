// hs-hub/src/lib/api.ts
// Typed API client for all hs-portal endpoints.
// All admin routes require the HUB_SECRET to be sent as x-hub-secret header.
// The secret is read from VITE_HUB_SECRET env var — never expose publicly.

const PORTAL_BASE = import.meta.env.VITE_PORTAL_URL ?? "http://localhost:3001";
const HUB_SECRET = import.meta.env.VITE_HUB_SECRET ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrandRow {
  id: string;
  slug: string;
  brand_name: string;
  brand_colour: string | null;     // hex, e.g. "#C9A96E"
  health_score: number | null;     // 0–100 computed brand completeness
  template_id: string;
  version: string;
  is_published: boolean;
  password_protected: boolean;
  show_studio_credit: boolean;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
  template?: TemplateRow | null;
}


export interface TemplateRow {
  id: string;
  name: string;
  component_name: string;
  description: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  sections_supported: string[];
  dist_path: string;
  is_active: boolean;
  uploaded_at: string;
}

export interface SectionLockRow {
  id: string;
  brand_id: string;
  section_type: string;
  locked_by: string;
  locked_at: string;
  reason: string | null;
}

export interface ChangelogEntry {
  id: string;
  section_type: string | null;
  change_summary: string;
  changed_by: string;
  changed_at: string;
}

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

export interface ValueMappingResult {
  slug: string;
  brand_name: string;
  template_id: string | null;
  required: string[];
  present: string[];
  missing: string[];
  completeness: number;
}

export interface CacheStats {
  size: number;
  slugs: string[];
  defaultTtlMs: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  isPublic = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!isPublic) {
    headers["x-hub-secret"] = HUB_SECRET;
  }

  const res = await fetch(`${PORTAL_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { error?: string };
      errMsg = body.error ?? errMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

// ─── Brands ──────────────────────────────────────────────────────────────────

export const brandsApi = {
  list: () =>
    request<{ ok: true; data: BrandRow[] }>("/hub/brands"),

  get: (slug: string) =>
    request<{ ok: true; data: BrandRow }>(`/hub/brands/${slug}`),

  assignTemplate: (slug: string, templateId: string) =>
    request<{ ok: true; data: { slug: string; template_id: string; assigned_at: string } }>(
      `/hub/brands/${slug}/assign-template`,
      { method: "POST", body: JSON.stringify({ template_id: templateId }) }
    ),

  valueMapping: (slug: string, templateId?: string) => {
    const qs = templateId ? `?template_id=${templateId}` : "";
    return request<{ ok: true; data: ValueMappingResult }>(
      `/hub/brands/${slug}/value-mapping${qs}`
    );
  },
};

// ─── Templates ───────────────────────────────────────────────────────────────

export const templatesApi = {
  list: () =>
    request<{ ok: true; data: TemplateRow[] }>("/hub/templates"),

  get: (templateId: string) =>
    request<{ ok: true; data: TemplateRow }>(`/hub/templates/${templateId}`),

  update: (templateId: string, updates: Partial<TemplateRow>) =>
    request<{ ok: true; data: TemplateRow }>(
      `/hub/templates/${templateId}`,
      { method: "PATCH", body: JSON.stringify(updates) }
    ),

  generateThumbnail: (templateId: string, slug: string) =>
    request<{ ok: true; data: { thumbnail_url: string | null } }>(
      `/hub/templates/${templateId}/thumbnail`,
      { method: "POST", body: JSON.stringify({ slug }) }
    ),

  upload: async (file: File, uploadedBy: string): Promise<{ ok: true; data: BuildResult }> => {
    const formData = new FormData();
    formData.append("template", file);
    formData.append("uploaded_by", uploadedBy);

    const res = await fetch(`${PORTAL_BASE}/upload/template`, {
      method: "POST",
      headers: { "x-hub-secret": HUB_SECRET },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json() as { error?: string; data?: BuildResult };
      throw new Error(body.error ?? `Upload failed: HTTP ${res.status}`);
    }

    return res.json() as Promise<{ ok: true; data: BuildResult }>;
  },

  delete: (templateId: string) =>
    request<{ ok: true; data: { deleted: string } }>(
      `/upload/template/${templateId}`,
      { method: "DELETE" }
    ),
};

// ─── Section Locks ────────────────────────────────────────────────────────────

export const locksApi = {
  list: (slug: string) =>
    request<{ ok: true; data: SectionLockRow[] }>(`/api/v1/brand/${slug}/locks`),

  lock: (slug: string, sectionType: string, lockedBy: string, reason?: string) =>
    request<{ ok: true; data: SectionLockRow }>(
      `/api/v1/brand/${slug}/locks`,
      { method: "POST", body: JSON.stringify({ section_type: sectionType, locked_by: lockedBy, reason }) }
    ),

  unlock: (slug: string, sectionType: string) =>
    request<{ ok: true; data: { unlocked: boolean } }>(
      `/api/v1/brand/${slug}/locks/${sectionType}`,
      { method: "DELETE" }
    ),
};

// ─── Changelog ───────────────────────────────────────────────────────────────

export const changelogApi = {
  list: (slug: string, limit = 20) =>
    request<{ ok: true; data: { entries: ChangelogEntry[] } }>(
      `/api/v1/brand/${slug}/changelog?limit=${limit}`,
      {},
      true // public endpoint — no secret needed
    ),

  colors: (slug: string) =>
    request<{ ok: true; data: { colors: unknown[] } }>(
      `/api/v1/brand/${slug}/colors`,
      {},
      true
    ),
};

// ─── Cache ────────────────────────────────────────────────────────────────────

export const cacheApi = {
  stats: () =>
    request<{ ok: true; data: CacheStats }>("/invalidate/stats"),

  invalidate: (slug: string, reason?: string) =>
    request<{ ok: true; data: { slug: string; existed: boolean } }>(
      `/invalidate/${slug}`,
      { method: "POST", body: JSON.stringify({ reason }) }
    ),

  flushAll: () =>
    request<{ ok: true; data: { flushed: number } }>(
      "/invalidate/_all",
      { method: "POST" }
    ),
};

// ─── Preview URL helper ───────────────────────────────────────────────────────

export function previewUrl(slug: string, templateId: string): string {
  return `${PORTAL_BASE}/preview/${slug}/${templateId}`;
}

export function portalUrl(slug: string): string {
  return `${PORTAL_BASE}/portal/${slug}`;
}
