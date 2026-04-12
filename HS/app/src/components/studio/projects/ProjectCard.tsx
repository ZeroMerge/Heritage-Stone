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

// ── luminance helpers ────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function hexToHsl(hex: string): [number, number, number] {
  const [rr, gg, bb] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hh = 0;
  if (max === rr) hh = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) hh = ((bb - rr) / d + 2) / 6;
  else hh = ((rr - gg) / d + 4) / 6;
  return [hh * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(hue2rgb(h / 360 + 1 / 3))}${toHex(hue2rgb(h / 360))}${toHex(hue2rgb(h / 360 - 1 / 3))}`;
}

/**
 * Darkens a brand colour just enough so white text hits WCAG 4.5:1 contrast.
 * Deep/dark colours (navy, charcoal, forest green) are returned unchanged.
 * Neon colours (hot pink, lime, lemon) are darkened in HSL space — same hue,
 * just lower lightness — so the brand identity is preserved.
 */
function toCardSafeColour(hex: string): string {
  if (hexLuminance(hex) <= 0.18) return hex; // already safe for white text
  const [h, s, l] = hexToHsl(hex);
  let lo = 0, hi = l;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (hexLuminance(hslToHex(h, s, mid)) <= 0.18) lo = mid;
    else hi = mid;
  }
  return hslToHex(h, s, lo);
}

// ── card theme (always white — card bg is guaranteed dark enough) ─────────────

interface CardTheme {
  text:      string;
  textMid:   string;
  textSub:   string;
  textFaint: string;
  border:    string;
  seam:      string;
  strip:     string;
  avatar:    string;
}

function getCardTheme(): CardTheme {
  return {
    text:      "rgba(255,255,255,0.88)",
    textMid:   "rgba(255,255,255,1.00)",
    textSub:   "rgba(255,255,255,0.62)",
    textFaint: "rgba(255,255,255,0.42)",
    border:    "rgba(255,255,255,0.20)",
    seam:      "rgba(255,255,255,0.22)",
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

  const theme        = getCardTheme();
  const rawColour    = project.brandColour || "#C9A96E";
  const displayColour = toCardSafeColour(rawColour); // darkened if too bright
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
        style={{ backgroundColor: displayColour, minHeight: 72 }}
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
      style={{ backgroundColor: displayColour }}
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
