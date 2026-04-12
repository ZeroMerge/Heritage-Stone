/**
 * ProjectCard.tsx
 * Studio → src/components/studio/projects/ProjectCard.tsx
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, MoreHorizontal, Archive, Trash2, Calendar } from "lucide-react";
import { useProjectsStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LiquidScore } from "@/components/ui-custom/LiquidScore";
import type { Project } from "@/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getShortRef(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

const STATUS_LABEL: Record<string, string> = {
  live: "LIVE",
  active: "ACTIVE",
  draft: "DRAFT",
  archived: "ARCHIVED",
  pending: "PENDING",
};

// ── actions menu ─────────────────────────────────────────────────────────────

function ActionsMenu({
  onArchive,
  onDelete,
}: {
  onArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="p-1 text-white/30 hover:text-white hover:bg-white/10 transition-colors rounded"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-[300]">
        <DropdownMenuItem onClick={onArchive} className="cursor-pointer gap-2">
          <Archive className="w-4 h-4" /> Archive Project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer text-red-600 focus:text-red-600 gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  view?: "grid" | "list";
}

export function ProjectCard({ project, view = "grid" }: ProjectCardProps) {
  const isGrid = view === "grid";
  const { deleteProject, archiveProject } = useProjectsStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const ref         = getShortRef(project.id);
  const initials    = getInitials(project.name);
  const statusLabel = STATUS_LABEL[project.status] ?? project.status.toUpperCase();
  const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const handleDelete  = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsDeleteModalOpen(true); };
  const handleArchive = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); archiveProject(project.id); };

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  if (!isGrid) {
    return (
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="group relative flex items-stretch overflow-hidden"
        style={{ backgroundColor: project.brandColour, minHeight: 72 }}
      >
        {/* Dashed seam */}
        <div
          className="absolute pointer-events-none z-10"
          style={{ inset: 5, border: "1px dashed rgba(255,255,255,0.2)" }}
        />

        {/* Left accent strip */}
        <div
          className="w-1 flex-shrink-0 z-20"
          style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
        />

        {/* Initials avatar */}
        <div
          className="hidden sm:flex w-12 flex-shrink-0 items-center justify-center border-r z-20"
          style={{ borderColor: "rgba(255,255,255,0.15)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <span
              className="text-xs font-black text-white/70 select-none leading-none"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              {initials}
            </span>
          </div>
        </div>

        {/* Main body */}
        <Link
          to={`/project/${project.id}`}
          className="flex-1 flex items-center gap-4 px-4 py-3 min-w-0 cursor-pointer z-20"
        >
          {/* Name + client */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-sm font-black text-white truncate leading-none"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {project.name}
              </h3>
              <span
                className="text-[8px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 border border-white/25 text-white/60 leading-none"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {statusLabel}
              </span>
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.1em] text-white/40 truncate mt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {project.clientName}{project.industry ? ` · ${project.industry}` : ""}
            </p>
          </div>

          {/* Stats columns */}
          <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
            {[
              { val: String(project.memberCount), key: "Members" },
              { val: `v${project.version}`,       key: "Version" },
              { val: formattedDate,                key: "Updated" },
            ].map(({ val, key }) => (
              <div key={key} className="flex flex-col items-center gap-0.5">
                <span
                  className="text-sm font-black text-white/75 leading-none"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
                >
                  {val}
                </span>
                <span
                  className="text-[8px] uppercase tracking-[0.14em] text-white/35"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {key}
                </span>
              </div>
            ))}

            {/* Liquid health score */}
            <div
              className="pl-4"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.18)" }}
            >
              <LiquidScore
                score={project.healthScore}
                brandColour={project.brandColour}
                fontSize={28}
              />
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center pr-3 z-20">
          <ActionsMenu onArchive={handleArchive} onDelete={handleDelete} />
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

  // ── GRID VIEW ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative overflow-hidden"
      style={{ backgroundColor: project.brandColour }}
    >
      {/* Dashed seam */}
      <div
        className="absolute pointer-events-none z-10"
        style={{ inset: 7, border: "1px dashed rgba(255,255,255,0.2)" }}
      />

      <Link to={`/project/${project.id}`} className="block cursor-pointer">
        {/* ── HEADER: meta left · liquid score right ── */}
        <div className="relative z-20 flex items-start justify-between px-4 pt-4 gap-2">
          <div className="space-y-[3px]">
            <p
              className="text-[9px] uppercase text-white/45 leading-none"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
            >
              Category // {project.industry ?? "Brand"}
            </p>
            <p
              className="text-[9px] uppercase text-white/35 leading-none"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
            >
              Ref. Doc: {ref}
            </p>
            <p
              className="text-[9px] uppercase text-white/35 leading-none"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
            >
              Status // {statusLabel}
            </p>
          </div>

          <div className="flex items-start gap-1 flex-shrink-0">
            <LiquidScore
              score={project.healthScore}
              brandColour={project.brandColour}
              fontSize={40}
            />
            <ActionsMenu onArchive={handleArchive} onDelete={handleDelete} />
          </div>
        </div>

        {/* Rule */}
        <div
          className="mx-4 mt-3"
          style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.2)" }}
        />

        {/* ── BODY: title + client ── */}
        <div className="px-4 pt-3 pb-2">
          <h3
            className="font-black text-white leading-[1.0]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(18px, 3.5vw, 26px)",
              letterSpacing: "-0.04em",
            }}
          >
            {project.name}
          </h3>
          <p
            className="mt-2 text-[11px] text-white/55 leading-relaxed"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {project.clientName}
            {project.industry ? `. ${project.industry}.` : ""}
          </p>
        </div>

        {/* ── FOOTER: members · version · date ── */}
        <div
          className="flex items-center justify-between px-4 pb-4 pt-2.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-white/45"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Users className="w-3 h-3" />
              {project.memberCount}
            </span>
            <span style={{ width: 1, height: 10, backgroundColor: "rgba(255,255,255,0.2)", display: "inline-block" }} />
            <span
              className="text-[9px] uppercase tracking-[0.14em] text-white/45"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              v{project.version}
            </span>
          </div>
          <span
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-white/45"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
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
