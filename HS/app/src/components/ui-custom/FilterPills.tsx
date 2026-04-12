import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  filters: FilterOption[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterPills({ filters, active, onChange, className }: FilterPillsProps) {
  return (
    <div className={cn(
      "flex gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0",
      "p-1 bg-[var(--surface-subtle)] rounded-full w-fit max-w-full",
      className
    )}>
      {filters.map((filter) => {
        const isActive = active === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={cn(
              "relative px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-300 whitespace-nowrap flex-shrink-0",
              isActive
                ? "text-[#0f0f0f]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="filter-pill-bg"
                className="absolute inset-0 bg-[var(--hs-accent)] rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {filter.label}
              {filter.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] rounded-full transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--border-strong)] text-[var(--text-primary)]"
                  )}
                >
                  {filter.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
