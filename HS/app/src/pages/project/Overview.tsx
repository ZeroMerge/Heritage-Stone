import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { CHAPTER_SECTIONS, CHAPTER_LABELS } from "@/types";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface OverviewContext {
  project: Project;
}

export function Overview() {
  const { project } = useOutletContext<OverviewContext>();

  // Calculate section progress
  const totalSections = Object.values(CHAPTER_SECTIONS).flat().length;
  const approvedSections = project.approvalStates.filter(
    (s) => s.status === "approved"
  ).length;
  const progress = Math.round((approvedSections / totalSections) * 100);

  const chapters = Object.entries(CHAPTER_SECTIONS).map(([key, sections]) => ({
    key: key as keyof typeof CHAPTER_SECTIONS,
    label: CHAPTER_LABELS[key as keyof typeof CHAPTER_LABELS],
    sections: sections.length,
    approved: sections.filter((s) =>
      project.approvalStates.find(
        (a) => a.sectionType === s && a.status === "approved"
      )
    ).length,
  }));

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Document Progress
          </h2>
          <span className="text-2xl font-bold text-[var(--hs-accent)]">
            {progress}%
          </span>
        </div>

        <div className="h-2 bg-[var(--surface-subtle)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-[var(--hs-accent)]"
          />
        </div>

        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-[var(--text-secondary)]">
              {approvedSections} approved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-[var(--text-secondary)]">
              {totalSections - approvedSections} pending
            </span>
          </div>
        </div>
      </motion.div>

      {/* Chapter Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Chapter Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--surface-subtle)] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[var(--hs-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {chapter.label}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {chapter.sections} sections
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    chapter.approved === chapter.sections
                      ? "text-emerald-600"
                      : "text-amber-600"
                  )}
                >
                  {chapter.approved}/{chapter.sections}
                </span>
              </div>

              <div className="mt-3 h-1.5 bg-[var(--surface-subtle)] overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    chapter.approved === chapter.sections
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  )}
                  style={{
                    width: `${(chapter.approved / chapter.sections) * 100}%`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--hs-accent)]" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Version</p>
              <p className="font-medium text-[var(--text-primary)]">
                {project.version}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Status</p>
              <p className="font-medium text-[var(--text-primary)] capitalize">
                {project.status}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Last Updated</p>
              <p className="font-medium text-[var(--text-primary)]">
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
