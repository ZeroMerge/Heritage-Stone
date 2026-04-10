import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--hs-bg)] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--hs-accent)]/5 blur-[160px] rounded-full -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--hs-accent)]/5 blur-[140px] rounded-full -ml-64 -mb-64" />

      <div className="w-full max-w-sm p-8 relative z-10 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-[var(--hs-border)] bg-[var(--hs-surface)] mb-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
            <ShieldCheck className="w-10 h-10 text-[var(--hs-accent)]" />
          </div>
          <h1 className="text-3xl font-light text-[var(--hs-text)] tracking-tight mb-3">Technical Hub</h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--hs-text-muted)]">Federated Authentication System</p>
        </div>

        <div className="hs-card p-10 bg-[var(--hs-bg)] shadow-[0_64px_64px_-32px_rgba(0,0,0,0.8)]">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs-mono text-[var(--hs-text-muted)] uppercase block">Credential ID</label>
              <input
                type="email"
                required
                className="hs-input w-full !bg-[var(--hs-bg)] !border-[var(--hs-border)] !py-3 font-mono text-xs"
                placeholder="OPERATOR@HERITAGE.STONE"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs-mono text-[var(--hs-text-muted)] uppercase block">Security Key</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="hs-input w-full !bg-[var(--hs-bg)] !border-[var(--hs-border)] !py-3 font-mono text-xs"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-4 top-3.5 w-4 h-4 text-[var(--hs-border)]" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[11px] font-mono flex items-center gap-3 animate-shake">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                {error.toUpperCase()}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="hs-btn hs-btn-primary w-full !py-4 text-[11px] uppercase tracking-[0.3em] font-bold"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>AUTHORIZING...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>INITIATE SESSION</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>
        </div>

        <div className="mt-16 text-center opacity-10">
           <p className="text-[10px] uppercase tracking-[0.5em] text-white">Encrypted Environment v4.0.1</p>
        </div>
      </div>
    </div>
  );
}
