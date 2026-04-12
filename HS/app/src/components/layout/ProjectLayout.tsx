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
  Menu,
  Activity,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { useProjectsStore, usePortalStore } from "@/store";
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
  const { projects, fetchProjectById, isLoading } = useProjectsStore();
  const { setPreviewMode } = usePortalStore();
  const [showMobileNav, setShowMobileNav] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProject = async () => {
      if (projectId && !project) {
        await fetchProjectById(projectId);
      }
      setIsChecking(false);
    };
    checkProject();
  }, [projectId, project, fetchProjectById]);

  if ((isLoading || isChecking) && !project) {
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

    // Hub URL: use env var (production) or fall back to localhost for dev
    const hubBase =
      import.meta.env.VITE_HUB_URL ||
      (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
        ? "https://heritagehub.ravennorthstudio.com"
        : "http://localhost:5173");

    // Optionally deep-link to the specific brand slug
    const slug = project.clientSlug || "";
    const portalUrl = slug ? `${hubBase}/brand/${slug}` : hubBase;

    window.open(portalUrl, "_blank");
  };

  return (
    <div className="app-shell bg-[var(--bg-primary)]">
      {/* Mobile topbar */}
      <div className="s-topbar-mobile">
        <Link to="/studio/projects" className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-[var(--text-primary)] truncate max-w-[160px]">{project.name}</span>
        </Link>
        <div className="flex items-center gap-1">
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="shell-body">
        {/* Sidebar */}
        <Sidebar />

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Desktop Topbar */}
          <div className="topbar-desktop">
            <Topbar />
          </div>

          {/* Project Sub-header */}
          <div className="sticky top-0 z-20 bg-[var(--surface-default)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)]">
            {/* Project Info — hidden on mobile (topbar shows it) */}
            <div className="hidden sm:block px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Left: Back + Info */}
                <div className="flex items-start gap-3">
                  <Link
                    to="/studio/projects"
                    className="hidden sm:flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Link>

                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 flex-shrink-0" style={{ backgroundColor: project.brandColour }}>
                      <AvatarFallback
                        className="font-semibold bg-transparent"
                        style={{ color: getContrastText(project.brandColour) }}
                      >
                        {getInitials(project.clientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-base font-semibold text-[var(--text-primary)] truncate">
                          {project.name}
                        </h1>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {project.clientName} • {project.industry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="btn btn-secondary text-sm py-1.5">
                    <Share className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={handlePreviewPortal}
                    className="btn btn-primary text-sm py-1.5"
                    style={{ backgroundColor: project.brandColour, color: getContrastText(project.brandColour) }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation — horizontal scroll on mobile */}
            <div className="px-2 sm:px-6 border-t border-[var(--border-subtle)] overflow-x-auto">
              <div className="flex items-center gap-0 min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <Link
                      key={tab.id}
                      to={tab.path === "" ? `/project/${projectId}` : `/project/${projectId}/${tab.path}`}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                        isActive
                          ? "border-[var(--hs-accent)] text-[var(--hs-accent)]"
                          : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="main-content">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={currentPath.includes("/brand-document") ? "h-full" : "p-4 sm:p-6 pb-24 sm:pb-6"}
            >
              <Outlet context={{ project }} />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile bottom nav for project pages */}
      <nav className="s-bottom-nav">
        <Link to="/studio/projects" className="flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        {tabs.slice(0, 3).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path === "" ? `/project/${projectId}` : `/project/${projectId}/${tab.path}`}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors",
                isActive ? "text-[var(--hs-accent)]" : "text-[var(--text-tertiary)]"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium text-[var(--text-tertiary)]"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* More tabs sheet on mobile */}
      {showMobileNav && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-16 left-0 right-0 z-50 bg-[var(--surface-default)] border-t border-[var(--border-default)] shadow-xl sm:hidden"
        >
          {tabs.slice(3).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path === "" ? `/project/${projectId}` : `/project/${projectId}/${tab.path}`}
                onClick={() => setShowMobileNav(false)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 text-sm font-medium border-b border-[var(--border-faint)]",
                  isActive
                    ? "text-[var(--hs-accent)] bg-[var(--hs-accent-soft)]"
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

      {/* Toast & Modals */}
      <ToastContainer />
      <InviteMemberModal projectId={projectId} />
      <NewProjectModal />
      <SearchModal />
      <ConfirmModal />
    </div>
  );
}
