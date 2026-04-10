// hs-hub/src/components/Topbar.tsx
// Mobile-only topbar — "Love" tier. Logo + theme toggle.
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle.tsx";

export function Topbar() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className="topbar">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img
          src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"}
          alt="Heritage Stone"
          className="w-7 h-7 object-contain"
        />
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Heritage <span className="text-[var(--hs-accent)]">Stone</span>
        </span>
      </div>

      {/* Theme toggle */}
      <ThemeToggle />
    </header>
  );
}
