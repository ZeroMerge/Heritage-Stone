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
    <header className="topbar" style={{ height: "68px" }}>
      {/* Logo only on mobile — conserve space */}
      <div className="flex items-center gap-2.5">
        <img
          src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"}
          alt="Heritage Stone"
          className="w-9 h-9 object-contain"
        />
      </div>

      {/* Theme toggle */}
      <ThemeToggle />
    </header>
  );
}
