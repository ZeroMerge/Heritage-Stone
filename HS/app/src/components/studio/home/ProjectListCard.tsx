import { motion } from "framer-motion";
import { FolderKanban, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import { StatusBadge } from "@/components/ui-custom/StatusBadge";
import type { Project } from "@/types";

interface ProjectListCardProps {
  projects: Project[];
}

export function ProjectListCard({ projects }: ProjectListCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full"
    >
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-[var(--hs-accent)]" />
          <h3 className="font-medium text-[var(--text-primary)]">Projects</h3>
        </div>
        <Link
          to="/studio/projects"
          className="text-xs text-[var(--hs-accent)] hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-4">
        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="flex items-center gap-3 p-3 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-colors group"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.brandColour }}
                >
                  <span className="text-white text-xs font-medium">
                    {project.clientName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] text-sm truncate group-hover:text-[var(--hs-accent)] transition-colors">
                    {project.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {project.clientName}
                  </p>
                </div>
                <StatusBadge status={project.status} size="sm" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started"
          />
        )}
      </div>
    </motion.div>
  );
}
