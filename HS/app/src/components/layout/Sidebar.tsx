// HS/app/src/components/layout/Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useEffect, useState } from "react";

const navItems = [
  { path: "/studio",          label: "Dashboard", icon: LayoutDashboard },
  { path: "/studio/projects", label: "Projects",  icon: FolderKanban   },
  { path: "/studio/settings", label: "Settings",  icon: Settings        },
];

// Sidebar widths per breakpoint
const getTargetWidth = (collapsed: boolean, isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return 0;       // Love  — hidden
  if (isTablet) return 72;      // Cherished — icon only
  return collapsed ? 72 : 240;  // Goldmine — toggle
};

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1280
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path: string) => {
    if (path === "/studio") return location.pathname === "/studio" || location.pathname === "/studio/";
    return location.pathname.startsWith(path);
  };

  const targetWidth = getTargetWidth(sidebarCollapsed, isMobile, isTablet);
  // Labels hidden when icon-only or mobile
  const labelsHidden = isMobile || isTablet || sidebarCollapsed;

  return (
    <motion.aside
      className={cn("sidebar", className)}
      initial={false}
      animate={{ width: targetWidth }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Logo ────────────────────────────────────────────── */}
      <div className="flex items-center h-16 px-4 border-b border-[var(--border-subtle)] shrink-0 overflow-hidden">
        <Link to="/studio" className="flex items-center gap-3">
          <img
            src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"}
            alt="Heritage Stone"
            className="w-9 h-9 object-contain flex-shrink-0"
          />
          <div className={cn("s-label flex flex-col", labelsHidden && "s-label-hidden")}>
            <span className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
              HeritageStone
            </span>
            <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
              Ravennorth Studio
            </span>
          </div>
        </Link>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={labelsHidden ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 group overflow-hidden",
                    active
                      ? "bg-[var(--hs-accent)]/10 text-[var(--hs-accent)] border-l-2 border-[var(--hs-accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    active ? "text-[var(--hs-accent)]" : "text-[var(--text-tertiary)]"
                  )} />
                  <span className={cn("s-label text-sm font-medium", labelsHidden && "s-label-hidden")}>
                    {item.label}
                  </span>
                  {active && !labelsHidden && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60 flex-shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="shrink-0 p-2 border-t border-[var(--border-subtle)] space-y-1 overflow-hidden">
        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          title={labelsHidden ? "Switch to Hub" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors duration-150"
        >
          <LayoutGrid className="w-5 h-5 flex-shrink-0" />
          <span className={cn("s-label text-sm font-medium", labelsHidden && "s-label-hidden")}>
            Switch to Hub
          </span>
        </a>

        <button
          onClick={handleLogout}
          title={labelsHidden ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors duration-150"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={cn("s-label text-sm font-medium", labelsHidden && "s-label-hidden")}>
            Logout
          </span>
        </button>
      </div>

      {/* ── User Profile ─────────────────────────────────────── */}
      <div className="shrink-0 p-3 border-t border-[var(--border-subtle)] overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2 bg-[var(--surface-subtle)]">
          <UserAvatar
            seed={user?.email}
            avatarUrl={user?.avatarUrl}
            initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`}
            size={32}
          />
          <div className={cn("s-label flex flex-col overflow-hidden", labelsHidden && "s-label-hidden")}>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] truncate capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* ── Collapse Toggle (desktop only) ───────────────────── */}
      {!isMobile && !isTablet && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-center shadow-sm hover:bg-[var(--surface-hover)] transition-colors z-50"
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-3 h-3 text-[var(--text-secondary)]" />
            : <Menu className="w-3 h-3 text-[var(--text-secondary)]" />}
        </button>
      )}
    </motion.aside>
  );
}
