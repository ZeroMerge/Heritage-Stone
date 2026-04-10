// hs-hub/src/pages/BrandList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { brandsApi, type BrandRow, portalUrl } from "../lib/api.ts";
import {
  ExternalLink,
  LayoutGrid,
  GitBranch,
  RefreshCw,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

export function BrandList() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await brandsApi.list();
      setBrands(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchBrands(); }, []);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--hs-text)]">Brands</h1>
          <p className="text-sm text-[var(--hs-text-muted)] mt-1">
            {brands.length} brand{brands.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => void fetchBrands()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--hs-surface-2)] border border-[var(--hs-border)] text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] rounded transition-colors"
        >
          <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-900 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && !brands.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-lg bg-[var(--hs-surface)] border border-[var(--hs-border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrandCard({ brand }: { brand: BrandRow }) {
  const isPublished = brand.is_published;

  return (
    <div className="hs-card flex flex-col overflow-hidden">
      {/* Color band */}
      <div className="h-1 bg-[var(--hs-accent)]" />

      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="heading-md text-[var(--hs-text)] leading-tight mb-1">
              {brand.brand_name}
            </h2>
            <span className="text-xs-mono">
              /{brand.slug}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {brand.password_protected && (
              <span title="Password protected">
                <Lock className="w-3.5 h-3.5 text-[var(--hs-text-muted)]" />
              </span>
            )}
            <span
              className={clsx(
                "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                isPublished
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-[var(--hs-surface-2)] text-[var(--hs-text-muted)] border border-[var(--hs-border)]"
              )}
            >
              {isPublished
                ? <><CheckCircle className="w-3 h-3" /> Live</>
                : <><XCircle className="w-3 h-3" /> Draft</>}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-baseline border-b border-[var(--hs-border)]/50 pb-2">
            <span className="text-[var(--hs-text-muted)]">Template</span>
            <span className="font-mono text-[var(--hs-accent)]">
              {brand.template?.name ?? brand.template_id ?? "—"}
            </span>
          </div>
          <div className="flex justify-between items-baseline border-b border-[var(--hs-border)]/50 pb-2">
            <span className="text-[var(--hs-text-muted)]">Version</span>
            <span className="font-mono text-[var(--hs-text)]">{brand.version}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[var(--hs-text-muted)]">Updated</span>
            <span className="text-[var(--hs-text)]">
              {new Date(brand.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-[var(--hs-border)] bg-[var(--hs-bg)]/50 flex items-center gap-3">
        <Link
          to={`/assign/${brand.slug}`}
          className="hs-btn hs-btn-secondary !px-3 !py-1.5 !text-[11px]"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Assign
        </Link>
        <Link
          to={`/locks?slug=${brand.slug}`}
          className="hs-btn hs-btn-secondary !px-3 !py-1.5 !text-[11px]"
        >
          <GitBranch className="w-3.5 h-3.5" />
          Locks
        </Link>
        <a
          href={portalUrl(brand.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hs-btn hs-btn-primary !px-3 !py-1.5 !text-[11px]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Preview
        </a>
      </div>
    </div>
  );
}
