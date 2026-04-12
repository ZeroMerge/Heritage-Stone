import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth";
import { Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

function DecodingText({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    
    // Slight delay before start
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayedText(() =>
          text
            .split("")
            .map((_, index) => {
              if (index < iteration) {
                return text[index];
              }
              return LETTERS[Math.floor(Math.random() * 42)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          if (interval) clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 50);
    }, 400);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return <span className={className}>{displayedText}</span>;
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("hs-hub-theme") : null;
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("hs-hub-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors rounded-none border border-transparent hover:border-[var(--border-subtle)]"
      title="Toggle Theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        setUser(data.user);
        navigate("/");
      }
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-base)] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Continuous Flowing Gradient River */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            x: ["-20%", "20%", "-20%"],
            y: ["0%", "20%", "0%"],
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-30%] left-[-20%] w-[90vw] h-[90vw] rounded-full mix-blend-normal"
          style={{
             background: 'conic-gradient(from 180deg at 50% 50%, var(--hs-accent) 0deg, var(--hs-primary) 180deg, transparent 360deg)',
             opacity: isDark ? 0.15 : 0.08,
             filter: 'blur(120px)'
          }}
        />
        <motion.div 
          animate={{
            x: ["20%", "-20%", "20%"],
            y: ["20%", "0%", "20%"],
            scale: [1, 1.4, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-30%] right-[-20%] w-[80vw] h-[80vw] rounded-full mix-blend-normal"
          style={{
             background: 'radial-gradient(circle, var(--hs-secondary) 0%, transparent 70%)',
             opacity: isDark ? 0.12 : 0.06,
             filter: 'blur(100px)'
          }}
        />
        <motion.div 
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["-10%", "10%", "-10%"],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-normal"
          style={{
             background: 'radial-gradient(circle, var(--text-tertiary) 0%, transparent 60%)',
             opacity: isDark ? 0.08 : 0.04,
             filter: 'blur(90px)'
          }}
        />
      </div>

      {/* Architectonic Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          backgroundImage: "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: isDark ? 0.05 : 0.03
        }}
      />

      {/* Theme Switcher Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10 px-6"
      >
        <div className="mb-10 flex flex-col items-center">
          <motion.img 
            initial={{ opacity: 0, y: 10, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"} 
            alt="Heritage Stone" 
            className="w-16 h-16 object-contain mb-6 drop-shadow-xl"
          />
          <h1 className="text-5xl font-['Bebas_Neue'] tracking-[0.08em] text-[var(--text-primary)] mb-2 drop-shadow-sm">
            <DecodingText text="TECHNICAL HUB" />
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-sm font-sans tracking-[0.2em] text-[var(--text-tertiary)] uppercase"
          >
            Federated Authentication System
          </motion.p>
        </div>

        <div className="bg-[var(--surface-default)]/80 backdrop-blur-md border border-[var(--border-default)] p-8 shadow-2xl relative overflow-hidden rounded-none">
          {/* subtle inner top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent opacity-50" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block font-medium font-sans">
                Credential ID
              </label>
              <input
                type="email"
                required
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-strong)] rounded-none px-4 py-3.5 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-primary)] focus:ring-1 focus:ring-[var(--hs-primary)] transition-all font-mono"
                placeholder="OPERATOR@HERITAGE.STONE"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block font-medium font-sans">
                  Security Key
                </label>
              </div>
              <input
                type="password"
                required
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-strong)] rounded-none px-4 py-3.5 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-primary)] focus:ring-1 focus:ring-[var(--hs-primary)] transition-all font-mono"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-none text-red-500 text-xs text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-none mt-4 border border-[var(--hs-primary)] bg-[var(--hs-primary)] text-[var(--text-inverse)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-[var(--text-inverse)] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-inverse)]/70" />
                    <span className="text-[var(--text-inverse)]/70">AUTHORIZING...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-widest font-sans text-xs font-bold text-[var(--text-inverse)]">Initiate Session</span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-inverse)]/70 group-hover:text-[var(--text-inverse)] group-hover:translate-x-1 transition-all" />
                  </div>
                )}
              </div>
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-[var(--text-tertiary)]">
           <p className="text-[10px] uppercase tracking-[0.3em] font-mono">Encrypted Environment v4.0.1</p>
        </div>
      </motion.div>
    </div>
  );
}
