import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  FolderOpen,
  Share,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Menu,
  Activity,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { useUIStore, useProjectsStore, usePortalStore } from "@/store";
import { cn, getContrastText } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastContainer } from "@/components/ui/Toast";
import { injectPortalTheme } from "@/lib/portalTheme";
import { InviteMemberModal } from "@/components/ui-custom/modals/InviteMemberModal";
import { SearchModal } from "@/components/ui-custom/modals/SearchModal";
import { ConfirmModal } from "@/components/ui-custom/modals/ConfirmModal";
import { NewProjectModal } from "@/components/ui-custom/modals/NewProjectModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, path: "" },
  { id: "brand-document", label: "Document", icon: FileText, path: "brand-document" },
  { id: "assets", label: "Assets", icon: FolderOpen, path: "assets" },
  { id: "team", label: "Team", icon: Users, path: "team" },
  { id: "chat", label: "Chat", icon: MessageSquare, path: "chat" },
  { id: "activity", label: "Activity", icon: Activity, path: "activity" },
  { id: "campaigns", label: "Campaigns", icon: Share, path: "campaigns" },
  { id: "settings", label: "Settings", icon: Settings, path: "settings" },
  { id: "launch", label: "Launch", icon: Rocket, path: "launch" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: "bg-emerald-100 text-emerald-700",
    active: "bg-blue-100 text-blue-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
        styles[status] || styles.draft
      )}
    >
      {status}
    </span>
  );
}

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { sidebarCollapsed } = useUIStore();
  const { projects, fetchProjectById, isLoading } = useProjectsStore();
  const { setPreviewMode } = usePortalStore();
  const [showMobileNav, setShowMobileNav] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId && !project) {
      fetchProjectById(projectId);
    }
  }, [projectId, project, fetchProjectById]);

  if (isLoading && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-[var(--hs-accent)]/20 border-t-[var(--hs-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
        <div className="w-20 h-20 bg-[var(--surface-subtle)] flex items-center justify-center rounded-full mb-4">
          <FolderOpen className="w-10 h-10 text-[var(--text-tertiary)]" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Project not found
        </h1>
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
          The project you are looking for doesn't exist or you don't have access to it.
        </p>
        <Link 
          to="/studio/projects" 
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  // Determine active tab based on current path
  const currentPath = location.pathname;
  const activeTab = tabs.find(tab => {
    if (tab.path === "") return currentPath === `/project/${projectId}`;
    return currentPath.includes(`/project/${projectId}/${tab.path}`);
  })?.id || "overview";

  const handlePreviewPortal = () => {
    setPreviewMode(true);
    injectPortalTheme({
      brandColor: project.brandColour,
      secondaryColor: project.secondaryColour,
      headingFont: "Playfair Display, serif",
      bodyFont: "Inter, sans-serif",
    });
    
    // Safely construct the URL, fallback to local dev url if empty
    const portalUrl = (project.portalSettings?.url && project.portalSettings.url.trim())
      ? `https://${project.portalSettings.url.trim()}` 
      : (import.meta.env.VITE_PORTAL_URL || 'http://localhost:5174');
      
    window.open(portalUrl, "_blank");
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 pt-16",
          sidebarCollapsed ? "ml-[72px]" : "ml-[240px]"
        )}
      >
        {/* Topbar */}
        <Topbar />

        {/* Project Sub-header */}
        <div className="sticky top-16 z-20 bg-[var(--surface-default)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)]">
          {/* Project Info */}
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left: Back + Info */}
              <div className="flex items-start gap-4">
                <Link
                  to="/studio/projects"
                  className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Link>

                <div className="flex items-center gap-3">
                  {/* Client Avatar */}
                  <Avatar className="w-12 h-12 flex-shrink-0" style={{ backgroundColor: project.brandColour }}>
                    <AvatarFallback 
                      className="font-semibold text-lg bg-transparent"
                      style={{ color: getContrastText(project.brandColour) }}
                    >
                      {getInitials(project.clientName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                        {project.name}
                      </h1>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {project.clientName} • {project.industry} • {project.version} •{" "}
                      {project.memberCount} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Link to="/studio" className="btn btn-secondary text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Hub</span>
                </Link>
                <button className="btn btn-secondary text-sm">
                  <Share className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={handlePreviewPortal}
                  className="btn btn-primary text-sm"
                  style={{ backgroundColor: project.brandColour }}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview Portal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 border-t border-[var(--border-subtle)]">
            {/* Desktop Tabs */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <Link
                    key={tab.id}
                    to={tab.path === "" ? `/project/${projectId}` : `/project/${projectId}/${tab.path}`}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                      isActive
                        ? "border-[var(--hs-accent)] text-[var(--hs-accent)]"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Tab Toggle */}
            <div className="lg:hidden py-2">
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-subtle)] text-[var(--text-primary)] text-sm font-medium"
              >
                <Menu className="w-4 h-4" />
                {tabs.find((t) => t.id === activeTab)?.label || "Menu"}
                {showMobileNav ? (
                  <ChevronLeft className="w-4 h-4 ml-auto" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>

              {showMobileNav && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 border border-[var(--border-default)] bg-[var(--surface-default)]"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <Link
                        key={tab.id}
                        to={tab.path === "" ? `/project/${projectId}` : `/project/${projectId}/${tab.path}`}
                        onClick={() => setShowMobileNav(false)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 text-sm font-medium",
                          isActive
                            ? "bg-[var(--hs-accent)]/10 text-[var(--hs-accent)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="p-6"
          >
            <Outlet context={{ project }} />
          </motion.div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer />
      
      {/* Modals */}
      <InviteMemberModal projectId={projectId} />
      <NewProjectModal />
      <SearchModal />
      <ConfirmModal />
    </div>
  );
}
