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
    <div className="page-pad animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="heading-lg text-[var(--text-primary)]">Brands</h1>
          <p className="text-small text-[var(--text-tertiary)] mt-0.5">
            {brands.length} brand{brands.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => void fetchBrands()}
          className="hs-btn hs-btn-secondary"
        >
          <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
          <span className="sidebar-label">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && !brands.length ? (
        <div className="hs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 bg-[var(--bg-surface)] border border-[var(--border-default)] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="hs-grid">
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
      {/* Accent line */}
      <div className="h-0.5 bg-[var(--hs-accent)]" />

      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="heading-sm text-[var(--text-primary)] leading-tight mb-1 truncate">
              {brand.brand_name}
            </h2>
            <span className="text-xs-mono">/{brand.slug}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {brand.password_protected && (
              <span title="Password protected">
                <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              </span>
            )}
            <span
              className={clsx(
                "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border",
                isPublished
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border-[var(--border-default)]"
              )}
            >
              {isPublished
                ? <><CheckCircle className="w-3 h-3" />Live</>
                : <><XCircle className="w-3 h-3" />Draft</>}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-baseline border-b border-[var(--border-faint)] pb-1.5">
            <span className="text-[var(--text-tertiary)]">Template</span>
            <span className="font-mono text-[var(--hs-accent)] truncate ml-4">
              {brand.template?.name ?? brand.template_id ?? "—"}
            </span>
          </div>
          <div className="flex justify-between items-baseline border-b border-[var(--border-faint)] pb-1.5">
            <span className="text-[var(--text-tertiary)]">Version</span>
            <span className="font-mono text-[var(--text-primary)]">{brand.version}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[var(--text-tertiary)]">Updated</span>
            <span className="text-[var(--text-primary)]">
              {new Date(brand.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-[var(--border-faint)] bg-[var(--bg-subtle)] flex items-center gap-2 flex-wrap">
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
