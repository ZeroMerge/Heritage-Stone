import { useState, useMemo } from "react";
import { Search, FolderKanban, ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useUIStore, useProjectsStore } from "@/store";

export function SearchModal() {
  const navigate = useNavigate();
  const { isSearchModalOpen, setSearchModalOpen } = useUIStore();
  const { projects } = useProjectsStore();
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().split(" ");
    
    return projects.filter((project) => {
      const fieldToSearch = [
        project.name,
        project.clientName,
        project.clientSlug,
        project.industry,
        project.description,
      ].join(" ").toLowerCase();
      
      return searchTerms.every((term) => fieldToSearch.includes(term));
    });
  }, [query, projects]);

  const handleSelect = (projectId: string) => {
    setSearchModalOpen(false);
    setQuery("");
    navigate(`/project/${projectId}`);
  };

  return (
    <Dialog open={isSearchModalOpen} onOpenChange={setSearchModalOpen}>
      <DialogContent 
        showCloseButton={false}
        className="w-[calc(100%-2rem)] sm:w-full sm:max-w-2xl p-0 overflow-hidden border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl"
      >
        <div className="relative flex items-center p-4 border-b border-[var(--border-subtle)]">
          <Search className="w-5 h-5 text-[var(--text-tertiary)] mr-3" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
            placeholder="Search projects by name, client, or industry..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="button"
            onClick={() => setSearchModalOpen(false)}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Search HeritageStone Studio</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Start typing to find projects instantly</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Projects</p>
              </div>
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-[var(--surface-subtle)] transition-colors group rounded-md"
                >
                  <div 
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--surface-subtle)] border border-[var(--border-subtle)]"
                    style={{ borderLeftColor: project.brandColour, borderLeftWidth: '3px' }}
                  >
                    <FolderKanban className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--hs-primary)] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)] truncate">{project.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--text-tertiary)] border border-[var(--border-subtle)] uppercase">
                        {project.status}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {project.clientName} • {project.industry}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mb-3 text-amber-500">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">No projects found for "{query}"</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-[var(--surface-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-default)] border border-[var(--border-subtle)] text-[9px]">ENTER</kbd> to select</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-default)] border border-[var(--border-subtle)] text-[9px]">ESC</kbd> to close</span>
          </div>
          <div className="font-medium flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[var(--hs-accent)]" />
            Vibrant Project Search
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
