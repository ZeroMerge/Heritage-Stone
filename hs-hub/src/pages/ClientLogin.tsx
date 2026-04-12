import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

/**
 * CLIENT EDITORIAL LOGIN TEMPLATE
 *
 * Massive typography, 0px radius, Liquid Blobs + Glassmorphism.
 * Light Theme / White Mode Only.
 */

export default function ClientLoginTemplate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // States to simulate fetching client brand configuration
  const [brandName, setBrandName] = useState("Identifying...");
  const [brandDescription, setBrandDescription] = useState("Connecting to secure environment.");
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [isBrandLoaded, setIsBrandLoaded] = useState(false);

  // Inclusion & Artistic Font Simulation
  const loadingFonts = [
    "'Bebas Neue', sans-serif",
    "'Amarante', cursive",
    "'Aubrey', cursive",
    "'Boldonse', sans-serif",
    "'Instrument Serif', serif",
    "'Londrina Solid', sans-serif",
    "'Pirata One', cursive",
    "'Impact', sans-serif",
    "'Baskerville', serif",
    "var(--font-display)"
  ];
  const [fontIndex, setFontIndex] = useState(0);

  // Font cycling interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isBrandLoaded) {
      interval = setInterval(() => {
        setFontIndex((prev) => (prev + 1) % loadingFonts.length);
      }, 150); // Faster, punchier font swap
    }
    return () => clearInterval(interval);
  }, [isBrandLoaded]);

  useEffect(() => {
    async function fetchClientBrand() {
      try {
        // Deliberate aesthetic delay so the user experiences the inclusion animation
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const hostname = window.location.hostname;
        
        // Get slug from subdomain or default to ravennorth in dev
        let slug = hostname.split('.')[0];
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          slug = 'ravennorth'; 
        }

        // Fetch brand details live
        const { data, error } = await supabase
          .from('brands')
          .select('id, name, description, primary_color, secondary_color, logo_url')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        if (data) {
          setBrandName(data.name || "CLIENT WORKSPACE");
          setBrandDescription(data.description || "A premier secure portal and project environment.");
          if (data.logo_url) setBrandLogo(data.logo_url);
          
          if (containerRef.current) {
            containerRef.current.style.setProperty("--hs-primary", data.primary_color || "#43cea2"); 
            containerRef.current.style.setProperty("--hs-accent", data.secondary_color || "#185a9d");
          }
        }
      } catch (err) {
        console.warn("Failed to fetch brand, using fallback styling.", err);
        setBrandName("WORKSPACE");
        setBrandDescription("Connecting to secure environment.");
      } finally {
        setIsBrandLoaded(true);
      }
    }

    fetchClientBrand();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Real login logic using supabase.auth.signInWithPassword can be hooked here:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-[var(--hs-primary)] selection:text-white transition-colors duration-1000"
    >
      
      {/* ─── 1. LIQUID BLOBS (Framer Motion) ──────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 opacity-90">
        <motion.div
          animate={{
            x: [0, 100, 0, -50, 0],
            y: [0, -80, 50, 0, 0],
            scale: [1, 1.15, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply transition-colors duration-1000 delay-150"
          style={{
            background: "var(--hs-primary)",
            opacity: 0.12,
            filter: "blur(90px)",
          }}
        />

        <motion.div
          animate={{
            x: [0, -100, 50, 0, 0],
            y: [0, 100, -50, 0, 0],
            scale: [1, 1.25, 1],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] rounded-full mix-blend-multiply transition-colors duration-1000 delay-300"
          style={{
            background: "var(--hs-accent)",
            opacity: 0.15,
            filter: "blur(110px)",
          }}
        />
      </div>

      {/* ─── 2. TEXTURE OVERLAY (Architectonic Grid) ──────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply transition-opacity duration-1000 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ─── LEFT PANE: MASSIVE TYPOGRAPHY ────────────────────────────────────── */}
      <div className="relative z-10 w-full lg:w-[55%] flex flex-col justify-center px-8 lg:px-20 pt-20 lg:pt-0">
        <AnimatePresence mode="wait">
          {!isBrandLoaded ? (
            <motion.div
              key="loading-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30, filter: "blur(20px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col space-y-6"
            >
              <Loader2 className="w-12 h-12 text-black/20 animate-spin mb-2" />
              
              <motion.h1 
                key={fontIndex}
                initial={{ opacity: 0.5, filter: "blur(8px)", scale: 0.98 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                transition={{ duration: 0.15 }}
                className="text-5xl lg:text-8xl tracking-tight text-black/30 uppercase"
                style={{ 
                  fontFamily: loadingFonts[fontIndex],
                  WebkitFontSmoothing: "antialiased"
                }}
              >
                {brandName}
              </motion.h1>
            </motion.div>
          ) : (
            <motion.div
              key="brand-content"
              initial={{ opacity: 0, x: 30, filter: "blur(20px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              {/* Client Logo Mark */}
              {brandLogo ? (
                <img src={brandLogo} alt="Brand Logo" className="w-16 h-16 object-contain mb-8 shrink-0 saturate-0 opacity-80" />
              ) : (
                <div className="w-16 h-16 mb-8 bg-black flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
              )}

              {/* Massive Name - Ultra-tall condensed typographic approach */}
              <h1 
                className="text-[18vw] lg:text-[10vw] leading-[0.85] uppercase mb-6 text-black tracking-tighter break-words"
                style={{ 
                  fontFamily: "'Bebas Neue', sans-serif",
                  textWrap: "balance", 
                  WebkitFontSmoothing: "antialiased" 
                }}
              >
                {brandName}
              </h1>
              
              {/* Dynamic Description */}
              <p className="text-lg lg:text-2xl text-black/60 font-sans max-w-xl font-light">
                {brandDescription}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── RIGHT PANE: BRUTALIST LOGIN CARD ─────────────────────────────────── */}
      <div className="relative z-10 w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16">
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="w-full max-w-[480px]"
        >
          <div className="bg-white/40 backdrop-blur-[32px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-none p-10 relative">
            
            {/* Header */}
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tighter text-black mb-2 font-display uppercase">
                Portal Access
              </h2>
              <p className="text-xs text-black/50 font-sans uppercase tracking-[0.2em]">
                Enter your credentials to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-bold font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/50 border border-black/10 rounded-none px-4 py-3.5 text-black text-sm placeholder:text-black/30 focus:outline-none focus:border-[var(--hs-primary)] focus:ring-1 focus:ring-[var(--hs-primary)] focus:bg-white transition-all backdrop-blur-md"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-black/50 font-bold font-mono">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[10px] uppercase tracking-wider text-black/40 hover:text-[var(--hs-primary)] font-mono transition-colors"
                  >
                    Reset
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-white/50 border border-black/10 rounded-none px-4 py-3.5 pr-12 text-black text-sm placeholder:text-black/30 focus:outline-none focus:border-[var(--hs-primary)] focus:ring-1 focus:ring-[var(--hs-primary)] focus:bg-white transition-all backdrop-blur-md font-mono"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/80 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading || !isBrandLoaded}
                className="w-full relative group overflow-hidden rounded-none mt-8 bg-[var(--hs-primary)] border border-transparent transition-all duration-700"
              >
                {/* Shimmer Effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shimmer_1.5s_infinite]" />
                
                <div className="relative z-10 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="text-white font-bold tracking-widest uppercase text-xs">Authenticating...</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="uppercase tracking-[0.2em] font-mono text-[11px] font-bold text-white transition-colors duration-700">
                        Sign In To Workspace
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  )}
                </div>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(350%) skewX(-12deg);
          }
        }
      `}</style>
    </div>
  );
}
