import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { ActivityTimeline } from "@/components/ui-custom/ActivityTimeline";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import type { ActivityEvent } from "@/types";

interface ActivityCardProps {
  events: ActivityEvent[];
}

export function ActivityCard({ events }: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full"
    >
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <Activity className="w-5 h-5 text-[var(--hs-accent)]" />
        <h3 className="font-medium text-[var(--text-primary)]">Recent Activity</h3>
      </div>

      <div className="p-4">
        {events.length > 0 ? (
          <ActivityTimeline events={events.slice(0, 5)} />
        ) : (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Activity from your projects will appear here"
          />
        )}
      </div>
    </motion.div>
  );
}
