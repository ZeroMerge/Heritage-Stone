import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FolderKanban } from "lucide-react";
import { useUIStore, useProjectsStore } from "@/store";
import { FilterPills } from "@/components/ui-custom/FilterPills";
import { ViewToggle } from "@/components/studio/projects/ViewToggle";
import { ProjectCard } from "@/components/studio/projects/ProjectCard";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import { cn } from "@/lib/utils";

const filters = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function Projects() {
  const { projectView, setNewProjectModalOpen, searchQuery, setSearchQuery } = useUIStore();
  const { filteredProjects, fetchProjects, hasFetched } = useProjectsStore();
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!hasFetched) {
      fetchProjects();
    }
  }, [fetchProjects, hasFetched]);

  const projects = filteredProjects().filter((p) =>
    activeFilter === "all" ? true : p.status === activeFilter
  );

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
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Projects
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage your brand projects
          </p>
        </div>
        <button
          onClick={() => setNewProjectModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        {/* Row 1: pills (scrollable) + view toggle pinned right */}
        <div className="flex items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/*
            FIX: The inner wrapper gets `pr-10` so the last pill ("Archived")
            is never hidden under the ViewToggle when the row overflows on mobile.
            The `sm:pr-0` removes that padding on larger screens where overflow
            doesn't occur.
          */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
            <div className="pr-10 sm:pr-0">
              <FilterPills
                filters={filters}
                active={activeFilter}
                onChange={setActiveFilter}
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <ViewToggle />
          </div>
        </div>

        <div className="relative group/search">
          <label htmlFor="project-search" className="absolute left-3 top-1/2 -translate-y-1/2 cursor-text">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] group-focus-within/search:text-[var(--hs-accent)] transition-colors" />
          </label>
          <input
            id="project-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className={cn(
              "pl-9 pr-4 py-2 w-full rounded-full bg-[var(--surface-default)] border border-[var(--border-default)]",
              "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
              "focus:outline-none focus:border-[var(--hs-accent)]",
              "transition-colors"
            )}
          />
        </div>
      </motion.div>

      {/* Projects Grid/List */}
      {projects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={cn(
            projectView === "grid"
              ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
              : "space-y-2 sm:space-y-3"
          )}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProjectCard project={project} view={projectView} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            searchQuery
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
          }
          action={
            !searchQuery && (
              <button
                onClick={() => setNewProjectModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </button>
            )
          }
        />
      )}
    </div>
  );
}