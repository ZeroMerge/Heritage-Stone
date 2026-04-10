import { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Eye,
  Lock,
  Globe,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { usePortalStore } from "@/store";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface OverviewContext {
  project: Project;
}

const tabs = [
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "access", label: "Access Control", icon: Lock },
  { id: "approvals", label: "Approvals", icon: CheckCircle },
];

export function Portal() {
  const { project } = useOutletContext<OverviewContext>();
  const { previewMode, setPreviewMode } = usePortalStore();
  const [activeTab, setActiveTab] = useState("visibility");
  const [copied, setCopied] = useState(false);

  const portalUrl = `https://${project.portalSettings.url}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            Portal Settings
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure how clients access and interact with your brand portal
          </p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-subtle)] cursor-pointer">
          <input
            type="checkbox"
            checked={previewMode}
            onChange={(e) => setPreviewMode(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--text-primary)]">
            Preview as Client
          </span>
        </label>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex border-b border-[var(--border-subtle)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-[var(--hs-accent)] text-[var(--hs-accent)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)]"
      >
        {/* Visibility Tab */}
        {activeTab === "visibility" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Portal URL
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)]">
                  <Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-primary)]">{portalUrl}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)]">
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Section Visibility
              </h3>
              <div className="space-y-3">
                {project.sectionVisibility?.map((section) => (
                  <label
                    key={section.sectionType}
                    className="flex items-center justify-between p-3 bg-[var(--surface-subtle)] cursor-pointer"
                  >
                    <span className="text-[var(--text-primary)] capitalize">
                      {section.sectionType}
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={section.isEnabled}
                      className="w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Access Control Tab */}
        {activeTab === "access" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Password Protection
              </h3>
              <label className="flex items-center gap-3 p-3 bg-[var(--surface-subtle)] cursor-pointer">
                <Lock className="w-5 h-5 text-[var(--text-secondary)]" />
                <div className="flex-1">
                  <p className="text-[var(--text-primary)]">
                    Require password to access portal
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Clients will need a password to view the brand portal
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={project.portalSettings.passwordProtected}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)]">
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Custom Domain
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="brand.yourcompany.com"
                  defaultValue={project.portalSettings.customDomain || ""}
                  className="flex-1 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
                />
                <button className="btn btn-secondary">Configure</button>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)]">
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Studio Credit
              </h3>
              <label className="flex items-center gap-3 p-3 bg-[var(--surface-subtle)] cursor-pointer">
                <div className="flex-1">
                  <p className="text-[var(--text-primary)]">
                    Show HeritageStone credit
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Display "Powered by HeritageStone" in the portal footer
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={project.portalSettings.showStudioCredit}
                  className="w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Pending Approvals
              </h3>
              <div className="space-y-3">
                {project.approvalStates
                  .filter((a) => a.status === "pending")
                  .map((approval) => (
                    <div
                      key={approval.sectionType}
                      className="flex items-center justify-between p-3 bg-[var(--surface-subtle)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[var(--text-primary)] capitalize">
                          {approval.sectionType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                {project.approvalStates.filter((a) => a.status === "pending")
                  .length === 0 && (
                  <p className="text-center text-[var(--text-secondary)] py-8">
                    No pending approvals
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)]">
              <h3 className="font-medium text-[var(--text-primary)] mb-4">
                Approval History
              </h3>
              <div className="space-y-3">
                {project.approvalStates
                  .filter((a) => a.status !== "pending")
                  .map((approval) => (
                    <div
                      key={approval.sectionType}
                      className="flex items-center justify-between p-3 bg-[var(--surface-subtle)]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            approval.status === "approved"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          )}
                        />
                        <span className="text-[var(--text-primary)] capitalize">
                          {approval.sectionType}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-sm capitalize",
                          approval.status === "approved"
                            ? "text-emerald-600"
                            : "text-red-600"
                        )}
                      >
                        {approval.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
