// HS/app/src/components/layout/TopbarMobile.tsx
// Mobile-only (Love tier): logo icon only + theme toggle (no text on mobile)
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function TopbarMobile() {
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
      {/* Logo icon only — no text on mobile */}
      <div className="flex items-center gap-2">
        <img
          src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"}
          alt="Heritage Stone"
          className="w-7 h-7 object-contain"
        />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </div>
  );
}
