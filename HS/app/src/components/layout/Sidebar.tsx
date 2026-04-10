import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  LayoutGrid,
} from "lucide-react";
import { useUIStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { path: "/studio", label: "Dashboard", icon: LayoutDashboard },
  { path: "/studio/projects", label: "Projects", icon: FolderKanban },
  { path: "/studio/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => {
    if (path === "/studio") {
      return location.pathname === "/studio" || location.pathname === "/studio/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 72 : 240,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-[var(--surface-default)] border-r border-[var(--border-subtle)] z-40 flex flex-col"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[var(--border-subtle)]">
        <Link to="/studio" className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-9 h-9 bg-[var(--hs-primary)] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">HS</span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="font-semibold text-sm text-[var(--text-primary)] whitespace-nowrap">
                  HeritageStone
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
                  Ravennorth Studio
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative",
                    active
                      ? "bg-[var(--hs-primary)] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !sidebarCollapsed && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-[var(--border-subtle)] space-y-1">
        <a
          href="http://localhost:5174" // Dynamic URL or environment variable preferred
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          <LayoutGrid className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Switch to Hub
              </motion.span>
            )}
          </AnimatePresence>
        </a>

        <Link
          to="/studio/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 transition-all duration-200",
            isActive("/studio/settings")
              ? "bg-[var(--surface-subtle)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 px-3 py-2 bg-[var(--surface-subtle)]">
          <Avatar className="w-8 h-8 flex-shrink-0 bg-[var(--hs-accent)] border border-transparent">
            <AvatarFallback className="text-white text-xs font-medium bg-transparent">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-[var(--text-tertiary)] truncate capitalize">
                  {user?.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6",
          "bg-[var(--surface-default)] border border-[var(--border-default)]",
          "flex items-center justify-center shadow-sm",
          "hover:bg-[var(--surface-hover)] transition-colors"
        )}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3 text-[var(--text-secondary)]" />
        ) : (
          <Menu className="w-3 h-3 text-[var(--text-secondary)]" />
        )}
      </button>
    </motion.aside>
  );
}
