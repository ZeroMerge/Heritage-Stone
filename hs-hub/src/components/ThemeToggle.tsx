import { Sun, Moon } from "lucide-react";
import { useUIStore } from "../store/ui";
import { clsx } from "clsx";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "flex items-center justify-center w-8 h-8 transition-all duration-300 group",
        "border border-[var(--hs-border)] bg-[var(--hs-surface-2)]/50 hover:bg-[var(--hs-surface-2)]",
        "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]"
      )}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun 
          className={clsx(
            "w-3.5 h-3.5 absolute transition-all duration-500",
            theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          )} 
        />
        <Moon 
          className={clsx(
            "w-3.5 h-3.5 absolute transition-all duration-500",
            theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          )} 
        />
      </div>
    </button>
  );
}
