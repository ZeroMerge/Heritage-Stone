import { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, useAuthStore, useDocumentEditorStore } from "@/store";
import { ThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "@/components/ui/UserAvatar";

// ─── Portal Dropdown ─────────────────────────────────────────────────────────
// Renders into document.body to escape any overflow:hidden parent
function PortalDropdown({
  anchorRef,
  open,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
    >
      {children}
    </div>,
    document.body
  );
}

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSearchModalOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { unsavedChanges } = useDocumentEditorStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const bellRef = useRef<HTMLButtonElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!showUserMenu && !showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (
        bellRef.current?.contains(e.target as Node) ||
        avatarRef.current?.contains(e.target as Node)
      )
        return;
      setShowUserMenu(false);
      setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu, showNotifications]);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/studio" || path === "/studio/") return "Dashboard";
    if (path.startsWith("/studio/projects")) return "Projects";
    if (path.startsWith("/studio/settings")) return "Settings";
    return "Studio";
  };

  const dropdownBase =
    "bg-[var(--surface-default)] border border-[var(--border-default)] shadow-2xl min-w-[14rem] overflow-hidden";

  return (
    <header className="h-16 w-full bg-[var(--surface-default)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)] flex items-center justify-between px-6 transition-colors">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Link
            to="/studio"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Studio
          </Link>
          <span className="text-[var(--text-tertiary)]">/</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {getBreadcrumb()}
          </span>
        </div>
        {unsavedChanges && (
          <div className="flex items-center gap-2 ml-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-amber-600">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Search */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--status-pending)] rounded-full" />
          </button>

          <PortalDropdown anchorRef={bellRef as React.RefObject<HTMLElement>} open={showNotifications}>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className={`w-80 ${dropdownBase}`}
                >
                  <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
                    <span className="text-xs text-[var(--text-tertiary)]">Mark all read</span>
                  </div>
                  <div className="py-8 text-center text-sm text-[var(--text-secondary)]">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No new notifications
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </PortalDropdown>
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => {
              setShowUserMenu((v) => !v);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 hover:bg-[var(--surface-subtle)] transition-colors rounded-lg"
          >
            <UserAvatar
              seed={user?.email}
              avatarUrl={user?.avatarUrl}
              initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
              size={32}
            />
            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          <PortalDropdown anchorRef={avatarRef as React.RefObject<HTMLElement>} open={showUserMenu}>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className={dropdownBase}
                >
                  {/* User info */}
                  <div className="p-3 border-b border-[var(--border-subtle)] flex items-center gap-3">
                    <UserAvatar
                      seed={user?.email}
                      avatarUrl={user?.avatarUrl}
                      initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
                      size={36}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="p-1">
                    {/* Profile → takes user to profile tab in settings */}
                    <Link
                      to="/studio/settings"
                      state={{ tab: "profile" }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>

                    {/* Settings → workspace/notifications */}
                    <Link
                      to="/studio/settings"
                      state={{ tab: "workspace" }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>

                    <div className="my-1 border-t border-[var(--border-subtle)]" />

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate("/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </PortalDropdown>
        </div>
      </div>
    </header>
  );
}
