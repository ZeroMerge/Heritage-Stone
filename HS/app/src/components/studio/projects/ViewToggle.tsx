import { Grid3X3, List } from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

export function ViewToggle() {
  const { projectView, setProjectView } = useUIStore();

  return (
    <div className="flex items-center bg-[var(--surface-subtle)] p-1">
      <button
        onClick={() => setProjectView("grid")}
        className={cn(
          "p-2 transition-colors",
          projectView === "grid"
            ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="Grid view"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => setProjectView("list")}
        className={cn(
          "p-2 transition-colors",
          projectView === "list"
            ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
