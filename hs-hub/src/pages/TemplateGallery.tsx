// hs-hub/src/pages/TemplateGallery.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { templatesApi, brandsApi, type TemplateRow, type BrandRow } from "../lib/api.ts";
import {
  ImageIcon,
  RefreshCw,
  Layers,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Camera,
} from "lucide-react";
import { clsx } from "clsx";

export function TemplateGallery() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, bRes] = await Promise.all([templatesApi.list(), brandsApi.list()]);
      setTemplates(tRes.data);
      setBrands(bRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const toggleActive = async (template: TemplateRow) => {
    try {
      const res = await templatesApi.update(template.id, { is_active: !template.is_active });
      setTemplates((prev) => prev.map((t) => (t.id === template.id ? res.data : t)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const generateThumb = async (templateId: string) => {
    const brand = brands[0];
    if (!brand) return alert("No brands available for thumbnail generation");
    setThumbLoading(templateId);
    try {
      const res = await templatesApi.generateThumbnail(templateId, brand.slug);
      if (res.data.thumbnail_url) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? { ...t, thumbnail_url: res.data.thumbnail_url } : t))
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Thumbnail generation failed");
    } finally {
      setThumbLoading(null);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await templatesApi.delete(templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--hs-text)]">Templates</h1>
          <p className="text-sm text-[var(--hs-text-muted)] mt-1">
            {templates.length} template{templates.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void load()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--hs-surface-2)] border border-[var(--hs-border)] text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] rounded transition-colors"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--hs-accent)] text-black font-medium rounded hover:bg-[var(--hs-accent-dim)] transition-colors"
          >
            <Layers className="w-4 h-4" />
            Upload New
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-900 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-[var(--hs-surface)] border border-[var(--hs-border)] animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-72 text-[var(--hs-text-muted)]">
          <Layers className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">No templates yet</p>
          <p className="text-sm">Upload a Vite template zip to get started</p>
          <Link
            to="/upload"
            className="mt-6 px-5 py-2.5 bg-[var(--hs-accent)] text-black text-sm font-medium rounded hover:bg-[var(--hs-accent-dim)] transition-colors"
          >
            Upload Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={clsx(
                "hs-card flex flex-col overflow-hidden group",
                !template.is_active && "opacity-60"
              )}
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-[var(--hs-surface-2)] flex items-center justify-center overflow-hidden border-b border-[var(--hs-border)]">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-[var(--hs-border)]" />
                )}
                
                <div className="absolute top-3 left-3">
                   <span className={clsx(
                     "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border",
                     template.is_active 
                      ? "bg-black/80 text-[var(--hs-accent)] border-[var(--hs-accent)]/30" 
                      : "bg-black/80 text-[var(--hs-text-muted)] border-[var(--hs-border)]"
                   )}>
                     {template.is_active ? "Active" : "Disabled"}
                   </span>
                </div>

                <button
                  onClick={() => void generateThumb(template.id)}
                  disabled={thumbLoading === template.id}
                  className="absolute bottom-3 right-3 p-2 bg-black/80 border border-[var(--hs-border)] text-white hover:border-[var(--hs-accent)] transition-all disabled:opacity-50"
                >
                  <Camera className={clsx("w-4 h-4", thumbLoading === template.id && "animate-pulse")} />
                </button>
              </div>

              {/* Info */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="heading-md text-[var(--hs-text)]">{template.name}</h3>
                  <button
                    onClick={() => void toggleActive(template)}
                    className="text-[var(--hs-text-muted)] hover:text-[var(--hs-accent)] transition-colors"
                  >
                    {template.is_active
                      ? <ToggleRight className="w-6 h-6 text-[var(--hs-accent)]" />
                      : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                <p className="text-xs text-[var(--hs-text-muted)] mb-4 line-clamp-2 leading-relaxed">
                  {template.description ?? "Premium minimalist template for luxury stones."}
                </p>
                
                <div className="text-[10px] font-mono text-[var(--hs-text-muted)]/50 mb-4 truncate">
                  {template.id}
                </div>

                {template.sections_supported.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {template.sections_supported.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono uppercase border border-[var(--hs-border)] px-1.5 py-0.5 text-[var(--hs-text-muted)] bg-[var(--hs-bg)]"
                      >
                        {s}
                      </span>
                    ))}
                    {template.sections_supported.length > 4 && (
                      <span className="text-[10px] text-[var(--hs-text-muted)] font-mono">+{template.sections_supported.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-[var(--hs-border)] bg-[var(--hs-bg)]/30 flex items-center gap-3">
                <Link
                  to={`/preview?template=${template.id}`}
                  className="hs-btn hs-btn-secondary !text-[11px] !px-4 !py-1.5 flex-1"
                >
                  Live Preview
                </Link>
                
                {deleteConfirm === template.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void deleteTemplate(template.id)}
                      className="hs-btn !bg-red-500/10 !text-red-500 !border-red-500/20 !text-[11px] !px-3 !py-1.5"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-[11px] text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(template.id)}
                    className="p-2 text-[var(--hs-border)] hover:text-[var(--hs-red)] transition-colors border border-transparent hover:border-[var(--hs-red)]/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
