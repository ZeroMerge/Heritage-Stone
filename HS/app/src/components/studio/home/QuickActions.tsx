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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4 z-10 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[var(--hs-accent)]" />
                Select Project to Launch
              </h4>
              <button
                onClick={() => setShowLaunchPicker(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {projects.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-6">No projects yet</p>
              ) : (
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowLaunchPicker(false);
                      navigate(`/p/${p.clientSlug}`);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[var(--surface-subtle)] transition-colors group"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.brandColour ?? "var(--hs-accent)" }}
                    />
                    <span className="flex-1 text-[var(--text-primary)] truncate">{p.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
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
