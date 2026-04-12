import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
      navigate("/studio");
    } catch {
      setError("Invalid credentials. Please try again.");
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
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-normal"
          style={{
             background: 'radial-gradient(circle, var(--hs-primary) 0%, transparent 70%)',
             opacity: isDark ? 0.12 : 0.05,
             filter: 'blur(100px)'
          }}
        />
        <motion.div 
          animate={{
            x: ["20%", "-20%", "20%"],
            y: ["20%", "0%", "20%"],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-normal"
          style={{
             background: 'radial-gradient(circle, var(--hs-accent) 0%, transparent 70%)',
             opacity: isDark ? 0.08 : 0.04,
             filter: 'blur(100px)'
          }}
        />
        <motion.div 
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["-10%", "10%", "-10%"],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-normal"
          style={{
             background: 'radial-gradient(circle, var(--text-tertiary) 0%, transparent 70%)',
             opacity: isDark ? 0.05 : 0.03,
             filter: 'blur(80px)'
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
          <img 
            src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"} 
            alt="Heritage Stone" 
            className="w-16 h-16 object-contain mb-6"
          />
          <h1 className="text-3xl font-display font-medium tracking-tight text-[var(--text-primary)] mb-2">
            Heritage Stone
          </h1>
          <p className="text-sm font-sans tracking-wide text-[var(--text-tertiary)] uppercase">
            Studio Operating System
          </p>
        </div>

        <div className="bg-[var(--surface-default)]/80 backdrop-blur-md border border-[var(--border-default)] p-8 shadow-2xl relative overflow-hidden rounded-none">
          {/* subtle inner top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block font-medium font-sans">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-strong)] rounded-none px-4 py-3.5 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-primary)] focus:ring-1 focus:ring-[var(--hs-primary)] transition-all"
                placeholder="architect@heritage.stone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)] block font-medium font-sans">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-strong)] rounded-none px-4 py-3.5 pr-12 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-primary)] focus:ring-1 focus:ring-[var(--hs-primary)] transition-all font-mono"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
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
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-none mt-4 border border-[var(--hs-primary)] bg-[var(--hs-primary)] text-[var(--text-inverse)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-[var(--text-inverse)] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-inverse)]/70" />
                    <span className="text-[var(--text-inverse)]/70">Authenticating...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="uppercase tracking-widest font-sans text-xs font-bold text-[var(--text-inverse)]">Enter Studio</span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-inverse)]/70 group-hover:text-[var(--text-inverse)] group-hover:translate-x-1 transition-all" />
                  </div>
                )}
              </div>
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
           <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-tertiary)] font-mono">Secure Connection Established</p>
        </div>
      </motion.div>
    </div>
  );
}
