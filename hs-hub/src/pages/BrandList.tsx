/**
 * BrandList.tsx
 * HS-Hub → src/pages/BrandList.tsx
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { brandsApi, type BrandRow, portalUrl } from "../lib/api.ts";
import { ExternalLink, LayoutGrid, GitBranch, RefreshCw, Lock } from "lucide-react";
import { clsx } from "clsx";
import { LiquidScore } from "../components/ui/LiquidScore";

// ── helpers ───────────────────────────────────────────────────────────────────

function getShortRef(slug: string): string {
  return slug.replace(/-/g, "").slice(0, 8).toUpperCase();
}

const ACCENT_PALETTE = [
  "#B52A1C", "#173A6A", "#0E4A28", "#6B3800",
  "#5B1A6B", "#0A4A5A", "#4A1A0A", "#1A3A1A",
];

function accentFromSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

// ── page ──────────────────────────────────────────────────────────────────────

export function BrandList() {
  const [brands, setBrands]   = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

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
      <div className="page-header">
        <div>
          <h1 className="heading-lg text-[var(--text-primary)]">Brands</h1>
          <p className="text-small text-[var(--text-tertiary)] mt-0.5">
            {brands.length} brand{brands.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button onClick={() => void fetchBrands()} className="hs-btn hs-btn-secondary">
          <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
          <span className="sidebar-label">Refresh</span>
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && !brands.length ? (
        <div className="hs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 bg-[var(--bg-surface)] border border-[var(--border-default)] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="hs-grid">
          {brands.map((brand) => <BrandCard key={brand.id} brand={brand} />)}
        </div>
      )}
    </div>
  );
}

// ── brand card ────────────────────────────────────────────────────────────────

function BrandCard({ brand }: { brand: BrandRow }) {
  const accent      = accentFromSlug(brand.slug);
  const ref         = getShortRef(brand.slug);
  const isPublished = brand.is_published;

  const updatedDate = new Date(brand.updated_at).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

  // BrandRow doesn't have a health score, so we derive a proxy from
  // version number as a placeholder — swap for real field when available.
  const healthProxy = Math.min(100, Math.round((brand.version ?? 1) * 20));

  return (
    <div
      className="group relative overflow-hidden"
      style={{ backgroundColor: accent }}
    >
      {/* Dashed seam */}
      <div
        className="absolute pointer-events-none z-10"
        style={{ inset: 7, border: "1px dashed rgba(255,255,255,0.22)" }}
      />

      {/* ── HEADER: meta left · score + lock right ── */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-4 gap-2">
        <div className="space-y-[3px]">
          <p
            className="text-[9px] uppercase text-white/45 leading-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
          >
            Category // Brand
          </p>
          <p
            className="text-[9px] uppercase text-white/35 leading-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
          >
            Ref. Doc: {ref}
          </p>
          <p
            className="text-[9px] uppercase text-white/35 leading-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
          >
            Template // {brand.template?.name ?? brand.template_id ?? "None"}
          </p>
        </div>

        <div className="flex items-start gap-1.5 flex-shrink-0">
          {brand.password_protected && (
            <span
              className="flex items-center justify-center w-5 h-5 mt-1 bg-black/20"
              title="Password protected"
            >
              <Lock className="w-3 h-3 text-white/50" />
            </span>
          )}
          {/* Published status pill */}
          <span
            className="text-[9px] font-black uppercase tracking-[0.15em] text-white/65 mt-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {isPublished ? "LIVE" : "DRAFT"}
          </span>
        </div>
      </div>

      {/* Rule */}
      <div
        className="mx-4 mt-3"
        style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.2)" }}
      />

      {/* ── BODY: brand name · slug ── */}
      <div className="px-4 pt-3 pb-2">
        <h2
          className="font-black text-white leading-[1.0]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(18px, 3.5vw, 26px)",
            letterSpacing: "-0.04em",
          }}
        >
          {brand.brand_name}
        </h2>
        <p
          className="mt-2 text-[11px] text-white/55 leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
        >
          /{brand.slug}
        </p>
      </div>

      {/* ── FOOTER: version · date · liquid score · actions ── */}
      <div
        className="flex items-center justify-between flex-wrap gap-2 px-4 pb-4 pt-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
      >
        {/* Left: version + date */}
        <div className="flex items-center gap-3">
          <span
            className="text-[9px] uppercase tracking-[0.15em] text-white/45"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            v{brand.version}
          </span>
          <span style={{ width: 1, height: 10, backgroundColor: "rgba(255,255,255,0.2)", display: "inline-block" }} />
          <span
            className="text-[9px] uppercase tracking-[0.15em] text-white/45"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {updatedDate}
          </span>
        </div>

        {/* Right: liquid score + action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Liquid score — hover to trouble the water */}
          <LiquidScore
            score={healthProxy}
            brandColour={accent}
            fontSize={22}
            className="mr-1"
          />

          <Link
            to={`/assign/${brand.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-1 border border-white/25 text-white/65 hover:bg-white/10 transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <LayoutGrid className="w-2.5 h-2.5" />
            Assign
          </Link>
          <Link
            to={`/locks?slug=${brand.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-1 border border-white/25 text-white/65 hover:bg-white/10 transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <GitBranch className="w-2.5 h-2.5" />
            Locks
          </Link>
          <a
            href={portalUrl(brand.slug)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-black px-2 py-1 bg-white text-black hover:bg-white/90 transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ExternalLink className="w-2.5 h-2.5" />
            Preview
          </a>
        </div>
      </div>
    </div>
  );
}
