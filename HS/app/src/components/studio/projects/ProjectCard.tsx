import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, ArrowUpRight, MoreHorizontal, Archive, Trash2, Calendar,
} from "lucide-react";
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

  // ── LIST view ─────────────────────────────────────────────────────────────
  if (!isGrid) {
    return (
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="group relative flex items-stretch bg-[var(--surface-default)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
        style={{ minHeight: 72 }}
      >
        {/* Brand colour strip */}
        <div
          className="w-1.5 sm:w-2 flex-shrink-0"
          style={{ backgroundColor: project.brandColour }}
        />

        {/* Colour avatar */}
        <div
          className="hidden sm:flex w-12 flex-shrink-0 items-center justify-center"
          style={{ backgroundColor: project.brandColour + "22" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: project.brandColour }}
          >
            {project.clientName?.[0] ?? "?"}
          </div>
        </div>

        {/* Main info — takes all available space */}
        <Link
          to={`/project/${project.id}`}
          className="flex-1 flex items-center gap-3 px-3 py-3 min-w-0 cursor-pointer"
        >
          {/* Name + client */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--hs-accent)] transition-colors truncate">
                {project.name}
              </h3>
              <StatusBadge status={project.status} size="sm" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
              {project.clientName}
              {project.industry ? ` · ${project.industry}` : ""}
            </p>
          </div>

          {/* Meta */}
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 bg-[var(--surface-subtle)] px-2 py-1">
              <Users className="w-3.5 h-3.5" />
              {project.memberCount}
            </span>
            <span className="flex items-center gap-1.5 bg-[var(--surface-subtle)] px-2 py-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(project.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Health ring */}
          <div className="flex-shrink-0">
            <HealthScoreRing score={project.healthScore} size={36} strokeWidth={3} />
          </div>

          <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </Link>

        {/* Actions menu */}
        <div className="flex-shrink-0 flex items-center pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[300]">
              <DropdownMenuItem onClick={handleArchive} className="cursor-pointer gap-2">
                <Archive className="w-4 h-4" />
                Archive Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-red-600 focus:text-red-600 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => deleteProject(project.id)}
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
          confirmText="Delete Project"
          variant="danger"
        />
      </motion.div>
    );
  }

  // ── GRID view ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative bg-[var(--surface-default)] border border-[var(--border-subtle)] shadow-sm hover:shadow-md hover:border-[var(--border-default)] transition-all overflow-hidden"
    >
      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-[300]">
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer gap-2">
              <Archive className="w-4 h-4" />
              Archive Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={`/project/${project.id}`} className="block cursor-pointer">
        {/* Color Header */}
        <div
          className="h-16 sm:h-24 relative"
          style={{ backgroundColor: project.brandColour }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute top-2 left-2 z-10 backdrop-blur-md bg-black/20 rounded-full">
            <StatusBadge status={project.status} size="sm" />
          </div>
          <div className="absolute bottom-2 right-2 z-10 bg-white/95 rounded-full p-0.5 shadow-sm">
            <HealthScoreRing score={project.healthScore} size={36} strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          <div className="inline-flex items-center gap-1.5 max-w-full">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--hs-accent)] transition-colors truncate">
              {project.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] mt-0.5 truncate">
            {project.clientName}
          </p>
          <p className="hidden sm:block text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mt-1">
            {project.industry}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
              <span className="flex items-center gap-1 bg-[var(--surface-subtle)] px-1.5 sm:px-2 py-1">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {project.memberCount}
              </span>
              <span className="hidden sm:block bg-[var(--surface-subtle)] px-2 py-1">
                {project.version}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-[var(--text-tertiary)] font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 hidden sm:block" />
              {new Date(project.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </Link>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteProject(project.id)}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        variant="danger"
      />
    </motion.div>
  );
}
