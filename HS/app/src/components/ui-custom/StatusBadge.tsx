import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

const statusStyles: Record<ProjectStatus, string> = {
  live: "bg-emerald-100 text-emerald-700",
  active: "bg-blue-100 text-blue-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-700",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full capitalize",
        statusStyles[status],
        sizeStyles[size]
      )}
    >
      {status}
    </span>
  );
}
