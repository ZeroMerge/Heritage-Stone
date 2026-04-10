// HS/app/src/components/layout/TopbarMobile.tsx
// Mobile-only (Love tier): branding + theme toggle + hamburger reveal.
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useUIStore } from "@/store";
import { Menu } from "lucide-react";

export function TopbarMobile() {
  const { toggleSidebar } = useUIStore();
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
    <div className="s-topbar-mobile">
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
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <button
          onClick={toggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
