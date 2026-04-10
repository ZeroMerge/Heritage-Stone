import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ArrowUpRight, MoreHorizontal, Archive, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui-custom/StatusBadge";
import { HealthScoreRing } from "@/components/ui-custom/HealthScoreRing";
import { useProjectsStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  view?: "grid" | "list";
}

export function ProjectCard({ project, view = "grid" }: ProjectCardProps) {
  const isGrid = view === "grid";
  const { deleteProject, archiveProject } = useProjectsStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    archiveProject(project.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative bg-[var(--surface-default)] border border-[var(--border-subtle)] overflow-hidden shadow-sm hover:shadow-xl transition-shadow",
        isGrid ? "" : "flex flex-col sm:flex-row"
      )}
    >
      {/* Actions Menu */}
      <div className="absolute top-3 right-3 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={`/project/${project.id}`} className="block w-full h-full cursor-pointer">
        {/* Color Header */}
        <div
          className={cn(
            "relative",
            isGrid ? "h-28" : "w-full sm:w-48 h-32 sm:h-auto"
          )}
          style={{ backgroundColor: project.brandColour }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3 z-10 backdrop-blur-md bg-white/20 rounded-full">
            <StatusBadge status={project.status} size="sm" />
          </div>
          <div className="absolute bottom-3 right-3 z-10 bg-white/95 rounded-full p-0.5 shadow-sm">
            <HealthScoreRing score={project.healthScore} size={44} strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <div className={cn("flex-1 p-5", !isGrid && "flex flex-col justify-between")}>
          <div>
            <div className="group/link inline-flex items-center gap-2">
              <h3 className="font-bold text-lg tracking-tight text-[var(--text-primary)] group-hover:text-[var(--hs-accent)] transition-colors">
                {project.name}
              </h3>
              <ArrowUpRight className="w-5 h-5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
              {project.clientName}
            </p>
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mt-1.5">
              {project.industry}
            </p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5 bg-[var(--surface-subtle)] px-2 py-1 rounded-md">
                <Users className="w-3.5 h-3.5" />
                {project.memberCount}
              </span>
              <span className="bg-[var(--surface-subtle)] px-2 py-1 rounded-md">{project.version}</span>
            </div>
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </Link>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteProject(project.id)}
        title="Delete Project"
        message={`Are you sure you want to delete ${project.name}? This action cannot be undone and will remove all associated brand data.`}
        confirmText="Delete Project"
        variant="danger"
      />
    </motion.div>
  );
}
