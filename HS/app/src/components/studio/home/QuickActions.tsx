import { useState } from "react";
import { Plus, Search, FileText, Settings, Rocket, X, ChevronRight } from "lucide-react";
import { useUIStore, useProjectsStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const actions = [
  { id: "new-project",  label: "New Project",      icon: Plus,     color: "bg-blue-500" },
  { id: "search",       label: "Find Project",     icon: Search,   color: "bg-amber-500" },
  { id: "docs",         label: "Brand Guidelines", icon: FileText, color: "bg-purple-500" },
  { id: "launch",       label: "Launch Portal",    icon: Rocket,   color: "bg-emerald-500" },
  { id: "settings",     label: "Studio Settings",  icon: Settings, color: "bg-slate-500" },
];

export function QuickActions() {
  const { setSearchModalOpen, setNewProjectModalOpen } = useUIStore();
  const { projects } = useProjectsStore();
  const navigate = useNavigate();
  const [showLaunchPicker, setShowLaunchPicker] = useState(false);

  const handleAction = (id: string) => {
    switch (id) {
      case "new-project":
        setNewProjectModalOpen?.(true);
        break;
      case "search":
        setSearchModalOpen(true);
        break;
      case "settings":
        navigate("/studio/settings");
        break;
      case "docs":
        navigate("/studio/projects");
        break;
      case "launch":
        setShowLaunchPicker(true);
        break;
    }
  };

  return (
    <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full p-4 relative">
      <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-[var(--hs-accent)]" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="flex flex-col items-center justify-center p-4 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all group"
          >
            <div className={`w-10 h-10 ${action.color} text-white flex items-center justify-center mb-2 shadow-lg`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Launch Portal: project picker overlay */}
      <AnimatePresence>
        {showLaunchPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 inset-y-0 bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4 z-20 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2 bg-[var(--hs-accent)] text-[#0f0f0f] text-[10px] uppercase font-bold tracking-tighter">Portal</div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">Select Project</h4>
              </div>
              <button
                onClick={() => setShowLaunchPicker(false)}
                className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/5 transition-all"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {projects.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[10px] text-[var(--text-tertiary)] italic">No projects found</p>
                </div>
              ) : (
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowLaunchPicker(false);
                      // Navigate to project launch screen
                      navigate(`/project/${p.id}/launch`);
                    }}
                    className="w-full flex items-center gap-3 p-2 bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all group"
                  >
                    <div 
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[var(--surface-default)] border border-[var(--border-subtle)]"
                      style={{ borderLeft: `3px solid ${p.brandColour || 'var(--hs-accent)'}` }}
                    >
                      <Rocket className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--hs-accent)] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] truncate">{p.clientName}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
