/**
 * BrandList.tsx
 * HS-Hub → src/pages/BrandList.tsx
 *
 * All card text, borders, and decorations adapt to the brand colour's luminance.
 * Bright cards (hot pink, lemon) → dark ink. Dark cards (navy, charcoal) → white.
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

// ── luminance helpers ────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function hexToHsl(hex: string): [number, number, number] {
  const [rr, gg, bb] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hh = 0;
  if (max === rr) hh = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) hh = ((bb - rr) / d + 2) / 6;
  else hh = ((rr - gg) / d + 4) / 6;
  return [hh * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(hue2rgb(h / 360 + 1 / 3))}${toHex(hue2rgb(h / 360))}${toHex(hue2rgb(h / 360 - 1 / 3))}`;
}

/** Darkens hex until white text has WCAG 4.5:1 contrast. Same hue, just darker. */
function toCardSafeColour(hex: string): string {
  if (hexLuminance(hex) <= 0.18) return hex;
  const [h, s, l] = hexToHsl(hex);
  let lo = 0, hi = l;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (hexLuminance(hslToHex(h, s, mid)) <= 0.18) lo = mid;
    else hi = mid;
  }
  return hslToHex(h, s, lo);
}

// ── card theme (always white — safe colour guarantees it) ───────────────

interface CardTheme {
  text:      string;
  textMid:   string;
  textSub:   string;
  textFaint: string;
  border:    string;
  seam:      string;
}

function getCardTheme(): CardTheme {
  return {
    text:      "rgba(255,255,255,0.88)",
    textMid:   "rgba(255,255,255,1.00)",
    textSub:   "rgba(255,255,255,0.62)",
    textFaint: "rgba(255,255,255,0.42)",
    border:    "rgba(255,255,255,0.20)",
    seam:      "rgba(255,255,255,0.22)",
  };
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
  const rawAccent    = brand.brand_colour ?? accentFromSlug(brand.slug);
  const displayColour = toCardSafeColour(rawAccent);
  const theme        = getCardTheme();
  const ref          = getShortRef(brand.slug);
  const isPublished  = brand.is_published;

  const updatedDate = new Date(brand.updated_at).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

  // Use real health_score if stored, else derive proxy from version
  const healthScore = typeof brand.health_score === "number"
    ? brand.health_score
    : Math.min(100, Math.round((brand.version ?? 1) * 20));

  return (
    <div
      className="group relative overflow-hidden"
      style={{ backgroundColor: displayColour }}
    >
      {/* Dashed seam */}
      <div
        className="absolute pointer-events-none z-10"
        style={{ inset: 7, border: `1px dashed ${theme.seam}` }}
      />

      {/* ── HEADER: meta left · status + lock right ── */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-4 gap-2">
        <div className="space-y-[3px]">
          <p
            className="text-[9px] uppercase leading-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: theme.textFaint }}
          >
            Category // Brand
          </p>
          <p
            className="text-[9px] uppercase leading-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: theme.textFaint }}
          >
            Ref. Doc: {ref}
          </p>
          <p
            className="text-[9px] uppercase leading-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: theme.textFaint }}
          >
            Template // {brand.template?.name ?? brand.template_id ?? "None"}
          </p>
        </div>

        <div className="flex items-start gap-1.5 flex-shrink-0">
          {brand.password_protected && (
            <span
              className="flex items-center justify-center w-5 h-5 mt-1"
              style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
              title="Password protected"
            >
              <Lock className="w-3 h-3" style={{ color: theme.textSub }} />
            </span>
          )}
          <span
            className="text-[9px] font-black uppercase tracking-[0.15em] mt-1"
            style={{ fontFamily: "var(--font-mono)", color: theme.textSub }}
          >
            {isPublished ? "LIVE" : "DRAFT"}
          </span>
        </div>
      </div>

      {/* Rule */}
      <div
        className="mx-4 mt-3"
        style={{ height: "1px", backgroundColor: theme.border }}
      />

      {/* ── BODY: brand name · slug ── */}
      <div className="px-4 pt-3 pb-2">
        <h2
          className="font-black leading-[1.0]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(18px, 3.5vw, 26px)",
            letterSpacing: "-0.04em",
            color: theme.textMid,
          }}
        >
          {brand.brand_name}
        </h2>
        <p
          className="mt-2 text-[11px] leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em", color: theme.textSub }}
        >
          /{brand.slug}
        </p>
      </div>

      {/* ── FOOTER: version · date · liquid score · actions ── */}
      <div
        className="flex items-center justify-between flex-wrap gap-2 px-4 pb-4 pt-2.5"
        style={{ borderTop: `1px solid ${theme.border}` }}
      >
        {/* Left: version + date */}
        <div className="flex items-center gap-3">
          <span
            className="text-[9px] uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
          >
            v{brand.version}
          </span>
          <span style={{ width: 1, height: 10, backgroundColor: theme.border, display: "inline-block" }} />
          <span
            className="text-[9px] uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
          >
            {updatedDate}
          </span>
        </div>

        {/* Right: liquid score + action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <LiquidScore
            score={healthScore}
            brandColour={rawAccent}
            fontSize={22}
            className="mr-1"
          />

          <Link
            to={`/assign/${brand.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-1 border transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              borderColor: theme.border,
              color: theme.textSub,
            }}
          >
            <LayoutGrid className="w-2.5 h-2.5" />
            Assign
          </Link>
          <Link
            to={`/locks?slug=${brand.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold px-2 py-1 border transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              borderColor: theme.border,
              color: theme.textSub,
            }}
          >
            <GitBranch className="w-2.5 h-2.5" />
            Locks
          </Link>
          <a
            href={portalUrl(brand.slug)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-black px-2 py-1 transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              backgroundColor: "rgba(255,255,255,1)",
              color:           "rgba(0,0,0,1)",
            }}
          >
            <ExternalLink className="w-2.5 h-2.5" />
            Preview
          </a>
        </div>
      </div>
    </div>
  );
}
