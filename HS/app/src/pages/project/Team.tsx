import { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Plus,
  Crown,
  Shield,
  User,
  Clock,
  X,
} from "lucide-react";
import { useProjectsStore, useUIStore } from "@/store";
import { EmptyState } from "@/components/ui-custom/EmptyState";
import type { Project, ClientMember } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface OverviewContext {
  project: Project;
}

const permissionLabels: Record<string, string> = {
  full: "Full Access",
  designer: "Designer",
  copywriter: "Copywriter",
  marketing: "Marketing",
  executive: "Executive",
};

const permissionIcons: Record<string, React.ElementType> = {
  full: Crown,
  designer: Shield,
  copywriter: User,
  marketing: User,
  executive: Crown,
};

export function Team() {
  const { project } = useOutletContext<OverviewContext>();
  const { clientMembers, studioMembers, deleteClientMember } = useProjectsStore();
  const { setInviteModalOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<"studio" | "client">("studio");
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; memberId: string | null; name: string }>({
    isOpen: false,
    memberId: null,
    name: "",
  });

  const members =
    activeTab === "studio"
      ? studioMembers
      : clientMembers[project.id] || [];

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
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Team
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage who has access to this project
          </p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex border-b border-[var(--border-subtle)]"
      >
        <button
          onClick={() => setActiveTab("studio")}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "studio"
              ? "border-[var(--hs-accent)] text-[var(--hs-accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Studio Team
        </button>
        <button
          onClick={() => setActiveTab("client")}
          className={cn(
            "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "client"
              ? "border-[var(--hs-accent)] text-[var(--hs-accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Client Team
        </button>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)]"
      >
        {members.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {members.map((member, index) => {
              const isClient = activeTab === "client";
              const clientMember = isClient ? (member as ClientMember) : null;
              const PermissionIcon = isClient
                ? permissionIcons[clientMember?.permissionLevel || "full"]
                : User;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 bg-[var(--hs-accent)] flex items-center justify-center flex-shrink-0">
                      <AvatarFallback className="text-white text-sm font-medium bg-transparent">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {member.name}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <PermissionIcon className="w-4 h-4" />
                      <span>
                        {isClient
                          ? permissionLabels[clientMember?.permissionLevel || "full"]
                          : (member as { role: string }).role}
                      </span>
                    </div>

                    {isClient && clientMember?.lastLogin && (
                      <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                        <Clock className="w-3 h-3" />
                        {new Date(clientMember.lastLogin).toLocaleDateString()}
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (isClient) {
                          setDeleteConfirm({ isOpen: true, memberId: member.id, name: member.name });
                        }
                      }}
                      className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite team members to collaborate on this project"
            action={
              <button
                onClick={() => setInviteModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </button>
            }
          />
        )}
      </motion.div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={() => {
          if (deleteConfirm.memberId) {
            deleteClientMember(project.id, deleteConfirm.memberId);
          }
        }}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${deleteConfirm.name} from the project? They will lose all access immediately.`}
        confirmText="Remove Member"
        variant="danger"
      />
    </div>
  );
}
