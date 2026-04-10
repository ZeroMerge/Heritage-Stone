import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useUIStore, useProjectsStore } from "@/store";
import { cn } from "@/lib/utils";

export function InviteMemberModal({ projectId }: { projectId?: string }) {
  const { isInviteModalOpen, setInviteModalOpen } = useUIStore();
  const { addClientMember } = useProjectsStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<"full" | "designer" | "copywriter" | "marketing" | "executive">("full");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isInviteModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !projectId) return;
    
    setIsSubmitting(true);
    try {
      await addClientMember(projectId, {
        name,
        email,
        permissionLevel,
      });
      setInviteModalOpen(false);
      setName("");
      setEmail("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[var(--surface-default)] border border-[var(--border-subtle)] shadow-xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Invite Member</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Add a new client to this project</p>
          </div>
          <button
            onClick={() => setInviteModalOpen(false)}
            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Permission Level
            </label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as "full" | "designer" | "copywriter" | "marketing" | "executive")}
              className={cn(
                "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                "text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
              )}
            >
              <option value="full">Full Access</option>
              <option value="designer">Designer</option>
              <option value="copywriter">Copywriter</option>
              <option value="marketing">Marketing</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className="btn btn-primary min-w-[140px]"
            >
              {isSubmitting ? "Inviting..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
