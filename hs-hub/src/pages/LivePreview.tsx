// hs-hub/src/pages/LivePreview.tsx
// Standalone preview page with slug + template selectors and full-width iframe.
// Also reachable directly at /preview/:slug/:templateId

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { brandsApi, templatesApi, previewUrl, type BrandRow, type TemplateRow } from "../lib/api.ts";
import { 
  Monitor, 
  Smartphone, 
  ExternalLink, 
  Loader2, 
  Layout, 
  RefreshCw 
} from "lucide-react";
import { clsx } from "clsx";

export function LivePreview() {
  const { slug: paramSlug, templateId: paramTemplateId } = useParams<{
    slug?: string;
    templateId?: string;
  }>();
  const [searchParams] = useSearchParams();

  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(paramSlug ?? "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    paramTemplateId ?? searchParams.get("template") ?? ""
  );
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, tRes] = await Promise.all([brandsApi.list(), templatesApi.list()]);
        setBrands(bRes.data);
        setTemplates(tRes.data.filter((t) => t.is_active));
        
        if (!selectedSlug && bRes.data.length > 0) {
          setSelectedSlug(bRes.data[0].slug);
        }
        if (!selectedTemplateId && tRes.data.length > 0) {
          setSelectedTemplateId(tRes.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const currentUrl =
    selectedSlug && selectedTemplateId
      ? previewUrl(selectedSlug, selectedTemplateId)
      : "";

  const refresh = () => {
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--hs-text-muted)]">
         <Loader2 className="w-8 h-8 animate-spin text-[var(--hs-accent)]" />
         <span className="text-xs-mono">Initializing view-engine…</span>
       </div>
     );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in bg-[var(--hs-bg)]">
      {/* Dynamic Header */}
      <header className="h-20 shrink-0 border-b border-[var(--hs-border)] px-12 flex items-center justify-between gap-8 z-10 bg-[var(--hs-bg)]">
        <div className="flex items-center gap-12 flex-1">
          <div className="w-64">
            <label className="text-xs-mono mb-2 block">Active Entity</label>
            <select
              value={selectedSlug}
              onChange={(e) => { setSelectedSlug(e.target.value); setIframeLoading(true); }}
              className="hs-input w-full !bg-[var(--hs-surface)] font-mono"
            >
              <option value="">— Choose Brand —</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.brand_name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="w-64">
             <label className="text-xs-mono mb-2 block">Render Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => { setSelectedTemplateId(e.target.value); setIframeLoading(true); }}
              className="hs-input w-full !bg-[var(--hs-surface)]"
            >
              <option value="">— Production Default —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={refresh}
            className="hs-btn hs-btn-secondary !px-3"
            title="Force Hydration"
          >
            <RefreshCw className={clsx("w-4 h-4", iframeLoading && "animate-spin")} />
          </button>
          
          {selectedSlug && (
            <button
              onClick={() => window.open(currentUrl, "_blank")}
              className="hs-btn hs-btn-secondary !px-4"
              title="Open External"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex bg-[var(--hs-surface)] border border-[var(--hs-border)] p-1">
             <button className="p-2 border border-transparent text-[var(--hs-accent)] bg-[var(--hs-border)]/50 transition-all">
                <Monitor className="w-4 h-4" />
             </button>
             <button className="p-2 border border-transparent text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] transition-all grayscale cursor-not-allowed">
                <Smartphone className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      {/* Preview Canvas */}
      <main className="flex-1 overflow-hidden relative p-8">
        {!selectedSlug || !selectedTemplateId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--hs-text-muted)]">
            <Layout className="w-12 h-12 mb-6 opacity-10" />
            <p className="text-sm font-mono tracking-widest uppercase">Select an entity to initialize viewport</p>
          </div>
        ) : (
          <div className="w-full h-full border border-[var(--hs-border)] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-white overflow-hidden relative">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[var(--hs-bg)]/80 backdrop-blur-sm z-20 animate-fade-in">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--hs-accent)]" />
                <span className="text-xs-mono tracking-widest">Hydrating data nodes…</span>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={currentUrl}
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full border-0"
              title="Portal Preview"
            />
            {/* Resolution Indicator */}
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur text-white text-[10px] font-mono border border-white/10 uppercase tracking-widest pointer-events-none z-30">
              Canvas: Native 1:1 · {templates.find(t => t.id === selectedTemplateId)?.name || "SYSTEM"}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
