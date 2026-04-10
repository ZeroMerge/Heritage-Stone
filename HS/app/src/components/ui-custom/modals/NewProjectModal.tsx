import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useUIStore, useProjectsStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NewProjectModal() {
  const { isNewProjectModalOpen, setNewProjectModalOpen } = useUIStore();
  const { createProject } = useProjectsStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [brandColour, setBrandColour] = useState("#C9A96E");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewProjectModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    const id = await createProject({ name, industry, description, brandColour });
    setIsSubmitting(false);
    
    if (id) {
      setNewProjectModalOpen(false);
      setName("");
      setIndustry("");
      setDescription("");
      setBrandColour("#C9A96E");
      navigate(`/project/${id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-panel w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">New Project</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Create a new brand guidelines portal</p>
          </div>
          <button
            onClick={() => setNewProjectModalOpen(false)}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className={cn(
                "w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                "focus:outline-none focus:border-[var(--hs-accent)]"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology"
              className={cn(
                "w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                "focus:outline-none focus:border-[var(--hs-accent)]"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief overview of the project..."
              className={cn(
                "w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                "focus:outline-none focus:border-[var(--hs-accent)] resize-none"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Primary Brand Color
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={brandColour}
                onChange={(e) => setBrandColour(e.target.value)}
                className="w-12 h-12 p-1 bg-[var(--bg-primary)] border border-[var(--border-default)] cursor-pointer"
              />
              <span className="text-sm text-[var(--text-secondary)] uppercase">{brandColour}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setNewProjectModalOpen(false)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="btn btn-primary min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
