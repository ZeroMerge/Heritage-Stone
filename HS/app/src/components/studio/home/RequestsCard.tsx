import { motion } from "framer-motion";
import { Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import type { AttentionItem } from "@/types";
import { cn } from "@/lib/utils";

interface RequestsCardProps {
  items: AttentionItem[];
}

const typeIcons: Record<string, string> = {
  approval: "📝",
  message: "💬",
  deadline: "⏰",
};

const typeColors: Record<string, string> = {
  approval: "text-amber-600",
  message: "text-blue-600",
  deadline: "text-red-600",
};

export function RequestsCard({ items }: RequestsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full"
    >
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[var(--hs-accent)]" />
          <h3 className="font-medium text-[var(--text-primary)]">Needs Attention</h3>
        </div>
        {items.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--status-pending)] text-white rounded-full">
            {items.length}
          </span>
        )}
      </div>

      <div className="p-4">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/studio/projects/${item.projectId}`}
                className="flex items-start gap-3 p-3 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <span className="text-lg">{typeIcons[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", typeColors[item.type])}>
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {item.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="No items need your attention right now"
          />
        )}
      </div>
    </motion.div>
  );
}
