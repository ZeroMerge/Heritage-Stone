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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--hs-text)]">
            Projects
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--hs-text-muted)] mt-1">
            Heritage Stone Repository
          </p>
        </div>
        <button
          onClick={() => setNewProjectModalOpen(true)}
          className="hs-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col lg:flex-row lg:items-center gap-4 bg-[var(--hs-surface)] border border-[var(--hs-border)] p-4"
      >
        <FilterPills
          filters={filters}
          active={activeFilter}
          onChange={setActiveFilter}
        />

        <div className="flex items-center gap-3 ml-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hs-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="hs-input pl-9 w-48 lg:w-64"
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
