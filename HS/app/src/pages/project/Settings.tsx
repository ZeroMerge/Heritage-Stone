import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Settings,
  Palette,
  Globe,
  AlertTriangle,
  Archive,
  Trash2,
  Save,
} from "lucide-react";
import { useProjectsStore, useUIStore } from "@/store";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface OverviewContext {
  project: Project;
}

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "portal", label: "Portal", icon: Globe },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export function ProjectSettings() {
  const { project } = useOutletContext<OverviewContext>();
  const navigate = useNavigate();
  const { archiveProject, deleteProject, updateProject } = useProjectsStore();
  const { showToast } = useUIStore();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    industry: "",
    description: "",
    goLiveDate: "",
    brandColour: "",
    secondaryColour: "",
    portalUrl: "",
    customDomain: "",
    showStudioCredit: true,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        clientName: project.clientName || "",
        industry: project.industry || "",
        description: project.description || "",
        goLiveDate: project.goLiveDate ? project.goLiveDate.split("T")[0] : "",
        brandColour: project.brandColour || "#0F0F0F",
        secondaryColour: project.secondaryColour || "#F5F5F5",
        portalUrl: project.portalSettings?.url || "",
        customDomain: project.portalSettings?.customDomain || "",
        showStudioCredit: project.portalSettings?.showStudioCredit ?? true,
      });
    }
  }, [project]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProject(project.id, {
        name: formData.name,
        clientName: formData.clientName,
        industry: formData.industry,
        description: formData.description,
        goLiveDate: formData.goLiveDate ? new Date(formData.goLiveDate).toISOString() : undefined,
        brandColour: formData.brandColour,
        secondaryColour: formData.secondaryColour,
        portalSettings: {
          ...project.portalSettings,
          url: formData.portalUrl,
          customDomain: formData.customDomain,
          showStudioCredit: formData.showStudioCredit,
        },
      });
      showToast("Settings updated successfully", "success");
    } catch {
      showToast("Failed to update settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProject(project.id);
      showToast("Project archived", "success");
      navigate("/studio/projects");
    } catch {
      showToast("Failed to archive project", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      showToast("Project deleted", "success");
      navigate("/studio/projects");
    } catch {
      showToast("Failed to delete project", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Project Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage project configuration
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:w-64 flex-shrink-0 relative"
        >
          {/* Scroll fade hints on mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--surface-default)] to-transparent pointer-events-none lg:hidden" />
          
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible hide-scrollbar bg-[var(--surface-default)] border border-[var(--border-subtle)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-shrink-0 lg:flex-shrink w-auto lg:w-full flex items-center gap-2 lg:gap-3 px-4 py-3 text-left transition-colors",
                    activeTab === tab.id
                      ? "bg-[var(--surface-subtle)] text-[var(--text-primary)] border-b-2 lg:border-b-0 lg:border-l-2 border-[var(--hs-accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] border-b-2 lg:border-b-0 lg:border-l-2 border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-medium text-sm lg:text-base whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 min-w-0"
        >
          <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)]">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  General Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                      "text-[var(--text-primary)]",
                      "focus:outline-none focus:border-[var(--hs-accent)]"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                      "text-[var(--text-primary)]",
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
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                      "text-[var(--text-primary)]",
                      "focus:outline-none focus:border-[var(--hs-accent)]"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={cn(
                      "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                      "text-[var(--text-primary)]",
                      "focus:outline-none focus:border-[var(--hs-accent)] resize-none"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Go-Live Date
                  </label>
                  <input
                    type="date"
                    value={formData.goLiveDate}
                    onChange={(e) => setFormData({ ...formData, goLiveDate: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                      "text-[var(--text-primary)]",
                      "focus:outline-none focus:border-[var(--hs-accent)]"
                    )}
                  />
                </div>
              </div>
            )}

            {/* Brand Tab */}
            {activeTab === "brand" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Brand Colors
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.brandColour}
                        onChange={(e) => setFormData({ ...formData, brandColour: e.target.value })}
                        className="w-12 h-10 p-0 border-0 cursor-pointer rounded-none"
                      />
                      <input
                        type="text"
                        value={formData.brandColour}
                        onChange={(e) => setFormData({ ...formData, brandColour: e.target.value })}
                        className={cn(
                          "flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-mono text-sm",
                          "text-[var(--text-primary)]",
                          "focus:outline-none focus:border-[var(--hs-accent)]"
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.secondaryColour}
                        onChange={(e) => setFormData({ ...formData, secondaryColour: e.target.value })}
                        className="w-12 h-10 p-0 border-0 cursor-pointer rounded-none"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColour}
                        onChange={(e) => setFormData({ ...formData, secondaryColour: e.target.value })}
                        className={cn(
                          "flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-mono text-sm",
                          "text-[var(--text-primary)]",
                          "focus:outline-none focus:border-[var(--hs-accent)]"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Portal Tab */}
            {activeTab === "portal" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Portal Configuration
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Portal URL
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-secondary)] font-sans">https://</span>
                    <input
                      type="text"
                      value={formData.portalUrl}
                      onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                      className={cn(
                        "flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                        "text-[var(--text-primary)]",
                        "focus:outline-none focus:border-[var(--hs-accent)]"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Custom Domain
                  </label>
                  <input
                    type="text"
                    placeholder="brand.yourcompany.com"
                    value={formData.customDomain}
                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                    className={cn(
                      "w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] font-sans",
                      "text-[var(--text-primary)]",
                      "focus:outline-none focus:border-[var(--hs-accent)]"
                    )}
                  />
                </div>

                <label className="flex items-center gap-3 p-4 bg-[var(--surface-subtle)] cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.showStudioCredit}
                    onChange={(e) => setFormData({ ...formData, showStudioCredit: e.target.checked })}
                    className="w-4 h-4 accent-[var(--hs-accent)]"
                  />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">
                      Show HeritageStone credit
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Display "Powered by HeritageStone" in the portal footer
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>

                <div className="p-4 border border-red-200 bg-red-50/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Archive className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">Archive Project</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Archive this project to hide it from the main dashboard.
                        You can restore it later from organization settings.
                      </p>
                      <button
                        onClick={handleArchive}
                        className="mt-4 px-4 py-2 border border-red-300 text-red-700 hover:bg-red-100/50 transition-colors text-sm font-medium"
                      >
                        Archive Project
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-red-200 bg-red-50/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">Delete Project</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete this project and all associated data.
                        This action cannot be undone and will immediately unpublish the portal.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mt-4 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {activeTab !== "danger" && (
              <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "btn btn-primary flex items-center gap-2",
                    isSaving && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface-default)] border border-[var(--border-subtle)] w-full max-w-md p-8 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Delete Project?
              </h3>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                This will permanently delete <strong>{project.name}</strong> and all
                associated data. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 font-medium">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
