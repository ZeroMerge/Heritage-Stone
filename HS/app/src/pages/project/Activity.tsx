import { useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { Activity as ActivityIcon, Filter, Calendar } from "lucide-react";
import { useProjectsStore } from "@/store";
import { ActivityTimeline } from "@/components/ui-custom/ActivityTimeline";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import type { Project } from "@/types";

interface OverviewContext {
  project: Project;
}

export function Activity() {
  const { project } = useOutletContext<OverviewContext>();
  const { activityEvents, fetchActivityEvents } = useProjectsStore();

  useEffect(() => {
    if (project.id) {
      fetchActivityEvents(project.id);
    }
  }, [project.id, fetchActivityEvents]);

  const events = activityEvents[project.id] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Activity
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track all activity for this project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </motion.div>

      {/* Activity List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)]"
      >
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-[var(--hs-accent)]" />
          <h3 className="font-medium text-[var(--text-primary)]">
            Recent Activity
          </h3>
        </div>

        <div className="p-6">
          {events.length > 0 ? (
            <ActivityTimeline events={events} />
          ) : (
            <EmptyState
              icon={ActivityIcon}
              title="No activity yet"
              description="Activity from this project will appear here"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
