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
        className="flex flex-col lg:flex-row lg:items-center gap-3"
      >
        <FilterPills
          filters={filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        <div className="flex items-center gap-3 lg:ml-auto">
          {/* Search — full width on mobile, fixed on desktop */}
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className={cn(
                "pl-9 pr-4 py-2 w-full lg:w-64 bg-[var(--surface-default)] border border-[var(--border-default)]",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                "focus:outline-none focus:border-[var(--hs-accent)]",
                "transition-colors"
              )}
            />
          </div>

          {/* View Toggle */}
          <ViewToggle />
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
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-4"
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
