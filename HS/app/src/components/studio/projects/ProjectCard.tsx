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
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "hs-card group relative overflow-hidden shadow-sm hover:shadow-md transition-shadow",
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
              className="p-1.5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-none border-[var(--hs-border)]">
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer focus:bg-[var(--hs-surface-2)] rounded-none">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--hs-border)]" />
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50/10 rounded-none"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 z-10 backdrop-blur-sm bg-black/10">
            <StatusBadge status={project.status} size="sm" />
          </div>
          <div className="absolute bottom-3 right-3 z-10 bg-white/10 backdrop-blur-md border border-white/20 p-0.5">
            <HealthScoreRing score={project.healthScore} size={44} strokeWidth={2} />
          </div>
        </div>

        {/* Content */}
        <div className={cn("flex-1 p-5", !isGrid && "flex flex-col justify-between")}>
          <div className="space-y-1">
            <div className="group/link inline-flex items-center gap-2">
              <h3 className="font-bold text-lg tracking-tight text-[var(--hs-text)] group-hover:text-[var(--hs-accent)] transition-colors">
                {project.name}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-[var(--hs-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-semibold text-[var(--hs-text-muted)] uppercase tracking-[0.15em]">
              {project.clientName}
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--hs-border)]">
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-[var(--hs-text-muted)]">
              <span className="flex items-center gap-1.5 border border-[var(--hs-border)] px-1.5 py-0.5">
                <Users className="w-3 h-3" />
                {project.memberCount}
              </span>
              <span className="border border-[var(--hs-border)] px-1.5 py-0.5">{project.version}</span>
            </div>
            <span className="text-[10px] font-mono text-[var(--hs-text-muted)]">
              {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
