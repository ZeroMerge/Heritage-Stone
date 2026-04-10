// hs-hub/src/pages/SectionLocks.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { brandsApi, locksApi, type BrandRow, type SectionLockRow } from "../lib/api.ts";
import { Lock, Unlock, Loader2, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

const ALL_SECTIONS = [
  "introduction","strategy","logo","color_palette",
  "typography","photography","voice_tone","messaging","icons","resources",
];

export function SectionLocks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(searchParams.get("slug") ?? "");
  const [locks, setLocks] = useState<SectionLockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [lockedBy, setLockedBy] = useState("agency");

  useEffect(() => {
    brandsApi.list().then((r) => {
      setBrands(r.data);
      if (!selectedSlug && r.data.length > 0) setSelectedSlug(r.data[0].slug);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    setSearchParams({ slug: selectedSlug }, { replace: true });
    setLoading(true);
    locksApi.list(selectedSlug)
      .then((r) => setLocks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSlug]);

  const isLocked = (section: string) => locks.some((l) => l.section_type === section);
  const getLock = (section: string) => locks.find((l) => l.section_type === section);

  const toggle = async (section: string) => {
    setToggling(section);
    try {
      if (isLocked(section)) {
        await locksApi.unlock(selectedSlug, section);
        setLocks((prev) => prev.filter((l) => l.section_type !== section));
      } else {
        const res = await locksApi.lock(selectedSlug, section, lockedBy);
        setLocks((prev) => [...prev, res.data]);
      }
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setToggling(null); }
  };

  return (
    <div className="p-12 max-w-4xl animate-fade-in">
      <div className="mb-12 border-b border-[var(--hs-border)] pb-8">
        <h1 className="heading-xl text-[var(--hs-text)] mb-2">Section Locks</h1>
        <p className="text-sm text-[var(--hs-text-muted)]">
          Prohibit feedback or modifications on specific portal segments.
        </p>
      </div>

      <div className="flex gap-8 mb-12">
        <div className="flex-1">
          <label className="text-xs-mono mb-2 block">Target Entity</label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="hs-input w-full !bg-[var(--hs-surface)] font-mono"
          >
            <option value="">— Choose brand —</option>
            {brands.map((b) => <option key={b.slug} value={b.slug}>{b.brand_name.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="w-64">
          <label className="text-xs-mono mb-2 block">Authorized Registrar</label>
          <input
            value={lockedBy}
            onChange={(e) => setLockedBy(e.target.value)}
            placeholder="HS-SYSTEM"
            className="hs-input w-full !bg-[var(--hs-surface)]"
          />
        </div>
      </div>

      {!selectedSlug ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-[var(--hs-border)] text-[var(--hs-text-muted)]">
           <Lock className="w-8 h-8 mb-4 opacity-20" />
           <p className="text-xs-mono">Waiting for entity selection…</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--hs-text-muted)]">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--hs-accent)]" />
          <span className="text-xs-mono">Synchronizing state…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_SECTIONS.map((section) => {
            const locked = isLocked(section);
            const lock = getLock(section);
            const busy = toggling === section;
            return (
              <div
                key={section}
                className={clsx(
                  "hs-card p-6 flex items-center justify-between transition-all",
                  locked
                    ? "border-[var(--hs-accent)]/30 bg-[var(--hs-accent)]/[0.02]"
                    : "border-[var(--hs-border)]"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    "mt-1 p-1 border",
                    locked ? "border-[var(--hs-accent)]/30 text-[var(--hs-accent)]" : "border-[var(--hs-border)] text-[var(--hs-text-muted)]"
                  )}>
                    {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </div>
                  <div>
                    <span className={clsx(
                      "text-xs font-mono uppercase tracking-wider",
                      locked ? "text-[var(--hs-text)]" : "text-[var(--hs-text-muted)]"
                    )}>
                      {section.replace("_", " ")}
                    </span>
                    {locked && lock && (
                      <p className="text-[10px] text-[var(--hs-text-muted)] mt-1 opacity-70">
                        BY {lock.locked_by.toUpperCase()} · {new Date(lock.locked_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => void toggle(section)}
                  disabled={busy}
                  className={clsx(
                    "hs-btn !py-1.5 !px-3 !text-[10px] uppercase font-bold tracking-widest transition-all",
                    locked
                      ? "hs-btn-secondary hover:!text-red-500 hover:!border-red-500/30"
                      : "hs-btn-primary",
                    busy && "opacity-50"
                  )}
                >
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : locked ? "Unlock" : "Lock"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
