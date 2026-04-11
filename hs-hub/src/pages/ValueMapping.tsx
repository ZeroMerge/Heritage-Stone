// hs-hub/src/pages/ValueMapping.tsx
// Shows which sections a brand is missing relative to a target template.
// Accessible from /mapping/:slug?template_id=xxx or standalone.

import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { brandsApi, templatesApi, type ValueMappingResult, type TemplateRow } from "../lib/api.ts";
import { CheckCircle, XCircle, Loader2, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { HubSelect } from "../components/HubSelect.tsx";

export function ValueMapping() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(searchParams.get("template_id") ?? "");
  const [mapping, setMapping] = useState<ValueMappingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    templatesApi.list().then((r) => setTemplates(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!paramSlug) return;
    setLoading(true);
    setError(null);
    brandsApi
      .valueMapping(paramSlug, selectedTemplateId || undefined)
      .then((r) => setMapping(r.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, [paramSlug, selectedTemplateId]);

  const slug = paramSlug ?? "";

  return (
    <div className="p-12 max-w-4xl animate-fade-in">
      <Link
        to={`/assign/${slug}`}
        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] mb-8 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Return to Assignment
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[var(--hs-border)] pb-8 gap-6">
        <div>
          <h1 className="heading-xl text-[var(--hs-text)] mb-2">Value Mapping</h1>
          <p className="text-sm text-[var(--hs-text-muted)]">
            Analyzing data completeness for <span className="text-[var(--hs-accent)] font-mono">/{slug}</span>
          </p>
        </div>
        
        <div className="w-full md:w-64 relative z-20">
          <label className="text-xs-mono mb-2 block">Comparison Target</label>
          <HubSelect
            value={selectedTemplateId}
            onChange={(val) => setSelectedTemplateId(val)}
            options={[
              { value: "", label: "— Generic Baseline —" },
              ...templates.map(t => ({ value: t.id, label: t.name }))
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--hs-text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--hs-accent)]" />
          <span className="text-xs-mono">Running cross-reference…</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : mapping ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Stats Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="hs-card p-6 bg-[var(--hs-bg)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs-mono">Completeness</span>
                <span className={clsx(
                  "text-xl font-light",
                  mapping.completeness === 100 ? "text-[var(--hs-green)]" : "text-[var(--hs-accent)]"
                )}>
                  {mapping.completeness}%
                </span>
              </div>
              <div className="h-1 bg-[var(--hs-border)] overflow-hidden">
                <div
                  className={clsx(
                    "h-full transition-all duration-1000",
                    mapping.completeness === 100 ? "bg-[var(--hs-green)]" : "bg-[var(--hs-accent)]"
                  )}
                  style={{ width: `${mapping.completeness}%` }}
                />
              </div>
              <p className="mt-4 text-[11px] text-[var(--hs-text-muted)] leading-relaxed">
                {mapping.completeness === 100 
                  ? "Brand satisfies all template requirements. Safe for production deployment."
                  : `Brand is missing ${mapping.missing.length} critical data points required for this template.`}
              </p>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs-mono">Infrastructure Nodes</h3>
               <div className="p-4 border border-[var(--hs-border)] text-xs font-mono text-[var(--hs-text-muted)] space-y-2">
                 <div className="flex justify-between"><span>Node ID</span><span>HS-E-01</span></div>
                 <div className="flex justify-between"><span>Region</span><span>Global-Edge</span></div>
                 <div className="flex justify-between"><span>Hydration</span><span>Server-Side</span></div>
               </div>
            </div>
          </div>

          {/* Slots Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Missing sections */}
            {mapping.missing.length > 0 && (
              <div>
                <h3 className="text-xs-mono mb-4 text-[var(--hs-red)]">Unpopulated Data Slots ({mapping.missing.length})</h3>
                <div className="space-y-2">
                  {mapping.missing.map((s) => (
                    <div
                      key={s}
                      className="flex items-center justify-between px-6 py-4 bg-red-500/5 border border-red-500/10 group hover:border-red-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <XCircle className="w-4 h-4 text-red-500/50" />
                        <span className="text-sm font-mono text-red-200">{s}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity">Missing</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Present sections */}
            <div>
              <h3 className="text-xs-mono mb-4">Hydrated Data Slots ({mapping.present.length})</h3>
              <div className="space-y-2">
                {mapping.present.map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between px-6 py-4 hs-card bg-transparent border-[var(--hs-border)]/50"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-4 h-4 text-[var(--hs-green)] opacity-50" />
                      <span className="text-sm font-mono text-[var(--hs-text-muted)]">{s}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--hs-border)]">STABLE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
