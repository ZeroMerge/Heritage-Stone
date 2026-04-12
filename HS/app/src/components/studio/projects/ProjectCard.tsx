/**
 * ProjectCard.tsx
 * Studio → src/components/studio/projects/ProjectCard.tsx
 *
 * All text, borders, and decorations adapt to the brand colour's luminance.
 * Bright cards (hot pink, lemon, lime) → dark ink text.
 * Dark cards (navy, charcoal, forest) → white text.
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

// ── luminance-aware card theme ───────────────────────────────────────────────

function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

interface CardTheme {
  isLight: boolean;       // true = light/bright background → use dark ink
  text:    string;        // primary text
  textMid: string;        // project name / headings
  textSub: string;        // secondary / muted
  textFaint: string;      // very faint labels
  border:  string;        // thin decorative borders
  seam:    string;        // dashed inner seam
  strip:   string;        // left accent strip
  avatar:  string;        // avatar bg
}

function getCardTheme(brandColour: string): CardTheme {
  const lum = hexLuminance(brandColour);
  const isLight = lum > 0.18;   // WCAG optimal: dark text wins above 0.18

  if (isLight) {
    // Bright card → dark ink
    return {
      isLight,
      text:      "rgba(0,0,0,0.80)",
      textMid:   "rgba(0,0,0,0.90)",
      textSub:   "rgba(0,0,0,0.55)",
      textFaint: "rgba(0,0,0,0.38)",
      border:    "rgba(0,0,0,0.18)",
      seam:      "rgba(0,0,0,0.18)",
      strip:     "rgba(0,0,0,0.20)",
      avatar:    "rgba(0,0,0,0.12)",
    };
  }
  // Dark card → white
  return {
    isLight,
    text:      "rgba(255,255,255,0.85)",
    textMid:   "rgba(255,255,255,1.00)",
    textSub:   "rgba(255,255,255,0.55)",
    textFaint: "rgba(255,255,255,0.38)",
    border:    "rgba(255,255,255,0.18)",
    seam:      "rgba(255,255,255,0.20)",
    strip:     "rgba(255,255,255,0.25)",
    avatar:    "rgba(255,255,255,0.15)",
  };
}

// ── actions menu ─────────────────────────────────────────────────────────────

function ActionsMenu({
  onArchive,
  onDelete,
  theme,
}: {
  onArchive: (e: React.MouseEvent) => void;
  onDelete:  (e: React.MouseEvent) => void;
  theme:     CardTheme;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="p-1 transition-colors rounded"
          style={{ color: theme.textFaint }}
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

  const theme       = getCardTheme(project.brandColour || "#C9A96E");
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
          style={{ inset: 5, border: `1px dashed ${theme.seam}` }}
        />

        {/* Left accent strip */}
        <div
          className="w-1 flex-shrink-0 z-20"
          style={{ backgroundColor: theme.strip }}
        />

        {/* Initials avatar */}
        <div
          className="hidden sm:flex w-12 flex-shrink-0 items-center justify-center border-r z-20"
          style={{ borderColor: theme.border }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.avatar }}
          >
            <span
              className="text-xs font-black select-none leading-none"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em", color: theme.textSub }}
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
                className="text-sm font-black truncate leading-none"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em", color: theme.textMid }}
              >
                {project.name}
              </h3>
              <span
                className="text-[8px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 border leading-none"
                style={{ fontFamily: "var(--font-mono)", borderColor: theme.border, color: theme.textSub }}
              >
                {statusLabel}
              </span>
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.1em] truncate mt-1"
              style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
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
                  className="text-sm font-black leading-none"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em", color: theme.text }}
                >
                  {val}
                </span>
                <span
                  className="text-[8px] uppercase tracking-[0.14em]"
                  style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
                >
                  {key}
                </span>
              </div>
            ))}

            {/* Liquid health score */}
            <div
              className="pl-4"
              style={{ borderLeft: `1px solid ${theme.border}` }}
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
          <ActionsMenu onArchive={handleArchive} onDelete={handleDelete} theme={theme} />
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
        style={{ inset: 7, border: `1px dashed ${theme.seam}` }}
      />

      <Link to={`/project/${project.id}`} className="block cursor-pointer">
        {/* ── HEADER: meta left · liquid score right ── */}
        <div className="relative z-20 flex items-start justify-between px-4 pt-4 gap-2">
          <div className="space-y-[3px]">
            <p
              className="text-[9px] uppercase leading-none"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: theme.textFaint }}
            >
              Category // {project.industry ?? "Brand"}
            </p>
            <p
              className="text-[9px] uppercase leading-none"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: theme.textFaint }}
            >
              Ref. Doc: {ref}
            </p>
            <p
              className="text-[9px] uppercase leading-none"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em", color: theme.textFaint }}
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
            <ActionsMenu onArchive={handleArchive} onDelete={handleDelete} theme={theme} />
          </div>
        </div>

        {/* Rule */}
        <div
          className="mx-4 mt-3"
          style={{ height: "1px", backgroundColor: theme.border }}
        />

        {/* ── BODY: title + client ── */}
        <div className="px-4 pt-3 pb-2">
          <h3
            className="font-black leading-[1.0]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(18px, 3.5vw, 26px)",
              letterSpacing: "-0.04em",
              color: theme.textMid,
            }}
          >
            {project.name}
          </h3>
          <p
            className="mt-2 text-[11px] leading-relaxed"
            style={{ fontFamily: "var(--font-mono)", color: theme.textSub }}
          >
            {project.clientName}
            {project.industry ? `. ${project.industry}.` : ""}
          </p>
        </div>

        {/* ── FOOTER: members · version · date ── */}
        <div
          className="flex items-center justify-between px-4 pb-4 pt-2.5"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em]"
              style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
            >
              <Users className="w-3 h-3" />
              {project.memberCount}
            </span>
            <span style={{ width: 1, height: 10, backgroundColor: theme.border, display: "inline-block" }} />
            <span
              className="text-[9px] uppercase tracking-[0.14em]"
              style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
            >
              v{project.version}
            </span>
          </div>
          <span
            className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em]"
            style={{ fontFamily: "var(--font-mono)", color: theme.textFaint }}
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
