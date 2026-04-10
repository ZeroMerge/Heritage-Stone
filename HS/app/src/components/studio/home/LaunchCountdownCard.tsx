import { motion } from "framer-motion";
import { Rocket, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import type { Project } from "@/types";

interface LaunchCountdownCardProps {
  project?: Project;
}

export function LaunchCountdownCard({ project }: LaunchCountdownCardProps) {
  if (!project || !project.goLiveDate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full"
      >
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[var(--hs-accent)]" />
          <h3 className="font-medium text-[var(--text-primary)]">Next Launch</h3>
        </div>
        <div className="p-4">
          <EmptyState
            icon={Calendar}
            title="No upcoming launches"
            description="Projects with go-live dates will appear here"
          />
        </div>
      </motion.div>
    );
  }

  const daysLeft = differenceInDays(new Date(project.goLiveDate), new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full"
    >
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <Rocket className="w-5 h-5 text-[var(--hs-accent)]" />
        <h3 className="font-medium text-[var(--text-primary)]">Next Launch</h3>
      </div>

      <div className="p-4">
        <Link
          to={`/studio/projects/${project.id}`}
          className="block group"
        >
          <div className="text-center py-4">
            <div className="text-5xl font-bold text-[var(--hs-accent)] mb-2">
              {daysLeft}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {daysLeft === 1 ? "day" : "days"} until launch
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--hs-accent)] transition-colors">
              {project.name}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {project.clientName}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {format(new Date(project.goLiveDate), "MMMM d, yyyy")}
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
