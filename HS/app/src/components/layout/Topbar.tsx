import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, Menu, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, useAuthStore, useDocumentEditorStore } from "@/store";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  const location = useLocation();
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const { unsavedChanges } = useDocumentEditorStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/studio" || path === "/studio/") return "Dashboard";
    if (path.startsWith("/studio/projects")) return "Projects";
    if (path.startsWith("/studio/settings")) return "Settings";
    return "HeritageStone";
  };

  return (
    <header
      className="h-16 w-full bg-[var(--surface-default)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)] flex items-center justify-between px-6 transition-colors"
    >
      {/* Left: Breadcrumb / Mobile Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Link to="/studio" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Studio
          </Link>
          <span className="text-[var(--text-tertiary)]">/</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{getBreadcrumb()}</span>
        </div>

        {/* Unsaved Changes Indicator */}
        {unsavedChanges && (
          <div className="flex items-center gap-2 ml-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-amber-600">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        {/* Search */}
        <button className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--status-pending)] rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface-default)] border border-[var(--border-default)] shadow-lg z-50"
              >
                <div className="p-3 border-b border-[var(--border-subtle)]">
                  <h3 className="font-medium text-[var(--text-primary)]">Notifications</h3>
                </div>
                <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-[var(--surface-subtle)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--hs-accent)] flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface-default)] border border-[var(--border-default)] shadow-lg z-50"
              >
                <div className="p-3 border-b border-[var(--border-subtle)]">
                  <p className="font-medium text-[var(--text-primary)]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/studio/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/studio/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
