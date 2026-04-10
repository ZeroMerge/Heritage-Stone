import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const statusStyles: Record<ProjectStatus, string> = {
  live: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  active: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  draft: "bg-[var(--hs-surface-2)] text-[var(--hs-text-muted)] border-[var(--hs-border)]",
  archived: "bg-red-500/10 text-red-500 border-red-500/20",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[9px] tracking-widest uppercase",
  md: "px-3 py-1 text-[11px] tracking-widest uppercase",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold border",
        statusStyles[status],
        sizeStyles[size]
      )}
    >
      {status}
    </span>
  );
}
