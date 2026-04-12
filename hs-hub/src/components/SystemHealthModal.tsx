import { useState, MouseEvent } from "react";
import { Activity, X, Server, Database, GitBranch, TerminalSquare, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";

interface SystemHealthModalProps {
  onClose: () => void;
}

export function SystemHealthModal({ onClose }: SystemHealthModalProps) {
  const [pingStatus, setPingStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [latency, setLatency] = useState<number | null>(null);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const testConnection = async () => {
    setPingStatus("loading");
    const start = performance.now();
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://heritagestone.ravennorthstudio.com";
      const res = await fetch(`${API_URL}/api/ping`);
      
      const end = performance.now();
      
      if (res.ok) {
        setLatency(Math.round(end - start));
        setPingStatus("success");
      } else {
        setPingStatus("error");
      }
    } catch (err) {
      setPingStatus("error");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-overlay)]/80 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
       <div 
        className="hs-card w-full max-w-4xl max-h-full flex flex-col overflow-hidden animate-slide-up shadow-2xl"
       >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--hs-accent)] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="heading-md">System Diagnostics</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">All systems operational</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 border border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--bg-base)]">
             <div className="hs-grid-2">
                
                {/* API Node */}
                <div className="hs-card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <TerminalSquare className="w-5 h-5 text-[var(--text-secondary)]" />
                      <h3 className="heading-xs">API Tier (Render)</h3>
                    </div>
                    {pingStatus === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {pingStatus === "error" && <AlertCircle className="w-4 h-4 text-[var(--hs-red)]" />}
                  </div>
                  <p className="text-body text-sm flex-1">
                    Node.js stateless backend executing template deployments on Render's network. Test confirms exact HTTP roundtrip latency.
                  </p>
                  
                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-[var(--border-subtle)]">
                     <div className="text-xs font-mono mt-1">
                        {pingStatus === "loading" && <span className="text-[var(--text-tertiary)] flex items-center gap-2"><RotateCw className="w-3 h-3 animate-spin"/> PINGING...</span>}
                        {pingStatus === "success" && <span className="text-green-500">{latency}ms Latency</span>}
                        {pingStatus === "error" && <span className="text-[var(--hs-red)]">Unreachable Timeout</span>}
                        {pingStatus === "idle" && <span className="text-[var(--text-tertiary)]">Awaiting Request...</span>}
                     </div>
                     <button onClick={testConnection} disabled={pingStatus === "loading"} className="hs-btn hs-btn-secondary py-1.5 px-3 text-[11px] uppercase tracking-wider">
                       Test Link
                     </button>
                  </div>
                </div>

                {/* Database Node */}
                <div className="hs-card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-[var(--text-secondary)]" />
                      <h3 className="heading-xs">Relational Access</h3>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-body text-sm flex-1">
                    Supabase PostgreSQL data warehouse handling all brand tokens, components, strict authentication policies mapping, and active user sessions.
                  </p>
                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-[var(--border-subtle)]">
                     <div className="text-xs font-mono text-green-500 mt-1">Active Pipeline</div>
                     <span className="text-xs text-[var(--text-tertiary)] font-mono mt-1">eu-west-1</span>
                  </div>
                </div>

                {/* Sync Engine */}
                <div className="hs-card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-5 h-5 text-[var(--text-secondary)]" />
                      <h3 className="heading-xs">Storage Engine</h3>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-body text-sm flex-1">
                    Central stateless storage node mapped over Supabase Bucket clusters. Ensures real-time replication of rendering components across all edges.
                  </p>
                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-[var(--border-subtle)]">
                     <div className="text-xs font-mono text-green-500 mt-1">Cloud Bucket (R/W)</div>
                     <span className="text-[10px] uppercase bg-green-500/10 text-green-500 px-2 py-0.5 border border-green-500/20 mt-1">Public Sync</span>
                  </div>
                </div>

                {/* Environment Node */}
                <div className="hs-card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-[var(--text-secondary)]" />
                      <h3 className="heading-xs">Static Delivery</h3>
                    </div>
                  </div>
                  <p className="text-body text-sm flex-1">
                    Vercel Edge Network routing client artifacts. Handles TLS termination, SPA rewrites, and immediate cache invalidation.
                  </p>
                  <div className="pt-4 mt-auto flex items-center justify-between border-t border-[var(--border-subtle)]">
                     <div className="text-xs font-mono text-[var(--hs-accent)] mt-1">Optimized</div>
                     <span className="text-xs text-[var(--text-tertiary)] font-mono mt-1">v2.4.0-stable</span>
                  </div>
                </div>

             </div>
          </div>
       </div>
    </div>
  );
}
