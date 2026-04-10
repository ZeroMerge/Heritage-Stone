import { Sun, Moon } from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center w-9 h-9 transition-all duration-300 group",
        "border border-[var(--border-default)] bg-[var(--bg-tertiary)] hover:bg-[var(--surface-hover)]",
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      )}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun 
          className={cn(
            "w-4 h-4 absolute transition-all duration-500",
            theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          )} 
        />
        <Moon 
          className={cn(
            "w-4 h-4 absolute transition-all duration-500",
            theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          )} 
        />
      </div>
    </button>
  );
}
