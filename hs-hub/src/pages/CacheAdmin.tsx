// hs-hub/src/pages/CacheAdmin.tsx
import { useEffect, useState } from "react";
import { cacheApi, type CacheStats } from "../lib/api.ts";
import { Database, RefreshCw, Loader2, XCircle } from "lucide-react";
import { clsx } from "clsx";

export function CacheAdmin() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [flushing, setFlushing] = useState(false);
  const [invalidating, setInvalidating] = useState<string | null>(null);
  const [flushConfirm, setFlushConfirm] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setStats((await cacheApi.stats()).data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const invalidate = async (slug: string) => {
    setInvalidating(slug);
    try { await cacheApi.invalidate(slug, "manual via Hub"); await load(); }
    catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setInvalidating(null); }
  };

  const flushAll = async () => {
    setFlushing(true);
    try { await cacheApi.flushAll(); await load(); setFlushConfirm(false); }
    catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setFlushing(false); }
  };

  return (
    <div className="p-12 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-12 border-b border-[var(--hs-border)] pb-8">
        <div>
          <h1 className="heading-xl text-[var(--hs-text)] mb-2">Memory Cache</h1>
          <p className="text-sm text-[var(--hs-text-muted)]">
            Active in-memory hydration nodes for production endpoints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={load} 
            className="hs-btn hs-btn-secondary !p-2 transition-all group"
            title="Refresh In-Memory Stats"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin text-[var(--hs-accent)]")} />
          </button>
          
          {flushConfirm ? (
            <div className="flex items-center gap-2 animate-fade-in">
               <button 
                onClick={() => void flushAll()} 
                disabled={flushing}
                className="hs-btn !bg-red-500 !text-white border-red-500 !px-4 !py-2 text-[10px] font-bold uppercase tracking-widest"
              >
                {flushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Flush"}
              </button>
              <button 
                onClick={() => setFlushConfirm(false)} 
                className="hs-btn hs-btn-secondary !px-4 !py-2 text-[10px] font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setFlushConfirm(true)} 
              className="hs-btn hs-btn-secondary !px-4 !py-2 !text-red-500 !border-red-500/20 hover:!border-red-500/50 text-[10px] font-bold uppercase tracking-widest"
            >
              Flush All
            </button>
          )}
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--hs-text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--hs-accent)]" />
          <span className="text-xs-mono">Visualizing heap…</span>
        </div>
      ) : stats ? (
        <div className="space-y-12">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "COLLECTED NODES", value: stats.size, unit: "SLUGS" },
              { label: "EXPIRATION WINDOW", value: stats.defaultTtlMs / 1000, unit: "SECONDS" },
              { label: "CLUSTER STATUS", value: stats.size > 0 ? "SATURATED" : "PURGED", unit: "HEALTHY" },
            ].map(({ label, value, unit }) => (
              <div key={label} className="hs-card p-6 bg-[var(--hs-surface)]">
                <p className="text-xs-mono mb-4 text-[var(--hs-text-muted)]">{label}</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-light text-[var(--hs-text)]">{value}</p>
                   <span className="text-[10px] font-bold text-[var(--hs-accent)] opacity-50 uppercase tracking-tighter">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Entries list */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
               <h3 className="text-xs-mono">Active Cache Keys</h3>
               <span className="text-[10px] font-mono text-[var(--hs-text-muted)] opacity-50">{stats.slugs.length} RECORDS FOUND</span>
            </div>

            {stats.slugs.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center border border-dashed border-[var(--hs-border)] text-[var(--hs-text-muted)]">
                <Database className="w-8 h-8 mb-4 opacity-10" />
                <p className="text-xs-mono uppercase tracking-[0.2em]">Heap Clear</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.slugs.map((slug) => (
                  <div 
                    key={slug} 
                    className="hs-card p-6 flex items-center justify-between bg-transparent border-[var(--hs-border)] group hover:border-[var(--hs-accent)]/30 transition-all duration-500"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-[var(--hs-green)] opacity-50" />
                       <span className="text-sm font-mono text-[var(--hs-text-muted)] group-hover:text-[var(--hs-text)] transition-colors">{slug}</span>
                    </div>
                    <button
                      onClick={() => void invalidate(slug)}
                      disabled={invalidating === slug}
                      className="hs-btn hs-btn-secondary !py-1 !px-3 !text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {invalidating === slug
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : "Purge"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 hs-card border-red-500/20 bg-red-500/5 text-center">
            <XCircle className="w-12 h-12 text-red-500/30 mx-auto mb-4" />
            <p className="text-sm text-red-400">Unable to establish connection with PORTAL-CLUSTER.</p>
        </div>
      )}
    </div>
  );
}
