import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { useUIStore, useAuthStore } from "@/store";
import { cn } from "@/lib/utils";

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
        "fixed left-0 top-0 h-screen bg-[var(--hs-bg)] border-r border-[var(--hs-border)] z-40 flex flex-col"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-20 px-4 border-b border-[var(--hs-border)]/50">
        <Link to="/studio" className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 bg-[var(--hs-primary)] flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tighter">HS</span>
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
                <span className="text-sm font-semibold tracking-tight text-[var(--hs-text)] whitespace-nowrap">
                  Heritage <span className="text-[var(--hs-accent)]">Stone</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--hs-text-muted)] whitespace-nowrap">
                  Studio Portal
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-3">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 transition-all duration-300 group relative",
                    active
                      ? "bg-[var(--hs-surface)] border border-[var(--hs-border)] text-[var(--hs-accent)]"
                      : "text-[var(--hs-text-muted)] border border-transparent hover:border-[var(--hs-border)]/50 hover:text-[var(--hs-text)]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", active ? "text-[var(--hs-accent)]" : "")} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm tracking-tight whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !sidebarCollapsed && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-[var(--hs-accent)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[var(--hs-border)]/50 space-y-1.5">
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-3 text-[var(--hs-text-muted)] border border-transparent hover:border-[var(--hs-border)]/50 hover:text-[var(--hs-text)] transition-all duration-300"
        >
          <LayoutGrid className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm tracking-tight whitespace-nowrap"
              >
                Switch to Hub
              </motion.span>
            )}
          </AnimatePresence>
        </a>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-[var(--hs-text-muted)] border border-transparent hover:border-[var(--hs-border)]/50 hover:text-[var(--hs-text)] transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-500 transition-colors" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm tracking-tight whitespace-nowrap group-hover:text-red-500"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--hs-border)]/50">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--hs-surface)] border border-[var(--hs-border)]">
          <div className="w-8 h-8 flex-shrink-0 bg-[var(--hs-accent)] flex items-center justify-center border border-white/10">
            <span className="text-white text-[10px] font-bold">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-[11px] font-bold text-[var(--hs-text)] truncate tracking-tight uppercase">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[9px] font-mono text-[var(--hs-text-muted)] tracking-widest uppercase truncate">
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
          "absolute -right-3 top-24 w-6 h-6",
          "bg-[var(--hs-bg)] border border-[var(--hs-border)]",
          "flex items-center justify-center shadow-md z-50",
          "hover:bg-[var(--hs-surface)] transition-colors"
        )}
      >
        <ChevronRight className={cn("w-3 h-3 text-[var(--hs-text-muted)] transition-transform duration-300", sidebarCollapsed ? "" : "rotate-180")} />
      </button>
    </motion.aside>
  );
}
