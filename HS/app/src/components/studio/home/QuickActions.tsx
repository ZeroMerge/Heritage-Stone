import { Plus, Search, FileText, Settings, Rocket } from "lucide-react";
import { useUIStore } from "@/store";
import { useNavigate } from "react-router-dom";

const actions = [
  { id: "new-project", label: "New Project", icon: Plus, color: "bg-blue-500" },
  { id: "search", label: "Find Project", icon: Search, color: "bg-amber-500" },
  { id: "docs", label: "Brand Guidelines", icon: FileText, color: "bg-purple-500" },
  { id: "launch", label: "Launch Portal", icon: Rocket, color: "bg-emerald-500" },
  { id: "settings", label: "Studio Settings", icon: Settings, color: "bg-slate-500" },
];

export function QuickActions() {
  const { setSearchModalOpen, setNewProjectModalOpen } = useUIStore();
  const navigate = useNavigate();

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
        // Link to global documentation or projects list as a fallback
        navigate("/studio/projects");
        break;
    }
  };

  return (
    <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] h-full p-4">
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
    </div>
  );
}
