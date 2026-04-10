// hs-hub/src/pages/TemplateToggle.tsx
// Split-screen: template list on the left, live iframe preview on the right.
// Clicking a template updates the iframe src to /preview/:slug/:templateId.
// The "Assign" button writes the new template assignment and invalidates cache.

import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  templatesApi,
  brandsApi,
  cacheApi,
  previewUrl,
  type TemplateRow,
  type BrandRow,
} from "../lib/api.ts";
import {
  ChevronLeft,
  CheckCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { clsx } from "clsx";

export function TemplateToggle() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const [bRes, tRes] = await Promise.all([
          brandsApi.get(slug),
          templatesApi.list(),
        ]);
        setBrand(bRes.data);
        const activeTpls = tRes.data.filter((t) => t.is_active);
        setTemplates(activeTpls);
        const currentId = bRes.data.template_id;
        setActiveTemplateId(currentId ?? null);
        
        const defaultPreview = currentId ?? activeTpls[0]?.id ?? null;
        setPreviewTemplateId(defaultPreview);
        if (defaultPreview) setIframeLoading(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug]);

  const selectPreview = (templateId: string) => {
    if (templateId === previewTemplateId) return;
    setPreviewTemplateId(templateId);
    setIframeLoading(true);
  };

  const assign = async () => {
    if (!slug || !previewTemplateId) return;
    setAssigning(true);
    try {
      await brandsApi.assignTemplate(slug, previewTemplateId);
      await cacheApi.invalidate(slug, "Template reassigned via Hub");
      setActiveTemplateId(previewTemplateId);
      setAssignSuccess(true);
      setTimeout(() => setAssignSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--hs-text-muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--hs-accent)]" />
        <span className="text-xs-mono">Synchronizing workspace…</span>
      </div>
    );
  }

  if (!brand || !slug) {
    return (
      <div className="p-12 text-[var(--hs-text-muted)]">
        Brand not found. <Link to="/" className="text-[var(--hs-accent)] underline">Return to Directory</Link>
      </div>
    );
  }

  const currentPreviewUrl = previewTemplateId ? previewUrl(slug, previewTemplateId) : null;
  const isPreviewingActive = previewTemplateId === activeTemplateId;

  return (
    <div className="flex h-full animate-fade-in bg-[var(--hs-bg)]">
      {/* Selection Panel */}
      <div className="w-80 shrink-0 border-r border-[var(--hs-border)] flex flex-col bg-[var(--hs-bg)]">
        {/* Panel Header */}
        <div className="p-8 border-b border-[var(--hs-border)]/50">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] mb-6 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Directory
          </Link>
          <h2 className="text-xl font-light text-[var(--hs-text)] leading-tight mb-1">
            {brand.brand_name}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--hs-accent)] font-mono uppercase tracking-widest">Active:</span>
            <span className="text-[10px] text-[var(--hs-text-muted)] font-mono truncate">
              {templates.find(t => t.id === activeTemplateId)?.name || 'NONE'}
            </span>
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-none">
          {templates.length === 0 ? (
            <div className="p-4 text-xs text-[var(--hs-text-muted)] text-center italic opacity-30">
              No active templates detected.
            </div>
          ) : (
            templates.map((template) => {
              const isActive = template.id === activeTemplateId;
              const isSelected = template.id === previewTemplateId;
              return (
                <button
                  key={template.id}
                  onClick={() => selectPreview(template.id)}
                  className={clsx(
                    "hs-btn w-full !justify-start !px-4 !py-4 border transition-all duration-300 group",
                    isSelected
                      ? "border-[var(--hs-accent)]/50 bg-[var(--hs-accent)]/[0.03] text-[var(--hs-text)]"
                      : "border-transparent text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] hover:bg-[var(--hs-surface)]"
                  )}
                >
                  <div className="w-10 h-7 bg-[var(--hs-surface)] border border-[var(--hs-border)] shrink-0 overflow-hidden flex items-center justify-center">
                    {template.thumbnail_url ? (
                      <img src={template.thumbnail_url} className={clsx("w-full h-full object-cover", !isSelected && "grayscale opacity-50")} />
                    ) : (
                      <ImageIcon className="w-3 h-3 opacity-20" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{template.name}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--hs-accent)]" />}
                    </div>
                    {isActive && <span className="text-[9px] uppercase tracking-tighter opacity-50 block mt-0.5">Hydrating Production</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--hs-border)]/50 space-y-4">
          <Link
            to={`/map/${slug}`}
            className="hs-btn hs-btn-secondary w-full text-[10px] uppercase font-bold tracking-widest"
          >
            Audit Value Mapping
          </Link>
          
          <button
            onClick={() => void assign()}
            disabled={assigning || isPreviewingActive || !previewTemplateId}
            className={clsx(
              "hs-btn w-full !py-3.5 text-[11px] uppercase font-bold tracking-[0.2em]",
              isPreviewingActive || !previewTemplateId
                ? "text-[var(--hs-text-muted)] border-[var(--hs-border)] opacity-30 cursor-not-allowed"
                : "hs-btn-primary"
            )}
          >
            {assigning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : assignSuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              "Apply Architecture"
            )}
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview Toolbar */}
        <div className="h-12 flex items-center gap-4 px-8 border-b border-[var(--hs-border)]/50 bg-[var(--hs-bg)]">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[var(--hs-accent)] animate-pulse" />
             <span className="text-[10px] font-mono text-[var(--hs-text-muted)] uppercase tracking-widest">Viewport Active</span>
          </div>
          <div className="flex-1 h-px bg-[var(--hs-border)]/30" />
          <div className="flex items-center gap-4">
               {iframeLoading && <RefreshCw className="w-3.5 h-3.5 text-[var(--hs-accent)] animate-spin" />}
               {currentPreviewUrl && (
                  <a
                    href={currentPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--hs-text-muted)] hover:text-[var(--hs-accent)] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
               )}
          </div>
        </div>

        {/* Viewport content */}
        <div className="flex-1 relative bg-[var(--hs-bg)]">
          {currentPreviewUrl ? (
            <iframe
              ref={iframeRef}
              key={previewTemplateId}
              src={currentPreviewUrl}
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
              title="Template Preview"
            />
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--hs-text-muted)] opacity-20">
                <ImageIcon className="w-12 h-12 mb-4" />
                <span className="text-xs-mono">Waiting for preview node selection</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
