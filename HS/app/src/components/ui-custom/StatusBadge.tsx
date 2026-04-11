import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

// Using inline styles tied to CSS vars so the badge responds to any theme switch
const statusVars: Record<ProjectStatus, { bg: string; color: string }> = {
  live:     { bg: "rgba(16,185,129,0.15)",  color: "var(--status-live)"     },
  active:   { bg: "rgba(59,130,246,0.15)",  color: "var(--status-active)"   },
  draft:    { bg: "rgba(245,158,11,0.15)",  color: "var(--status-draft)"    },
  archived: { bg: "rgba(107,114,128,0.15)", color: "var(--status-archived)" },
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { bg, color } = statusVars[status] ?? statusVars.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full capitalize",
        sizeStyles[size]
      )}
      style={{ background: bg, color }}
    >
      {status}
    </span>
  );
}
