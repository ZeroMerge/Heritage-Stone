// hs-hub/src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Layers,
  Upload,
  List,
  GitBranch,
  Database,
  Activity,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle.tsx";
import { SystemHealthModal } from "./SystemHealthModal.tsx";

const nav = [
  { to: "/",          label: "Brands",          icon: List,        exact: true },
  { to: "/templates", label: "Templates",        icon: Layers               },
  { to: "/upload",    label: "Upload Template",  icon: Upload               },
  { to: "/preview",   label: "Live Preview",     icon: LayoutGrid           },
  { to: "/locks",     label: "Section Locks",    icon: GitBranch            },
  { to: "/cache",     label: "Cache",            icon: Database             },
];

export function Sidebar() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [healthOpen, setHealthOpen] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="sidebar">
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center px-4 border-b border-[var(--border-default)] shrink-0" style={{ height: "68px" }}>
        <img
          src={isDark ? "/logo/logo-dark.svg" : "/logo/logo-light.svg"}
          alt="Heritage Stone"
          className="w-9 h-9 object-contain flex-shrink-0"
        />
        {/* Name hidden on mobile via sidebar-label — visible on Cherished/Goldmine */}
        <div className="sidebar-label ml-3 flex flex-col">
          <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight whitespace-nowrap">
            Heritage <span className="text-[var(--hs-accent)]">Stone</span>
          </span>
          <span className="section-key mt-0.5 whitespace-nowrap">Technical Hub</span>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            title={label}
            className={({ isActive }) =>
              clsx("nav-item", isActive && "active")
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Footer (Settings at bottom, then theme + health) ── */}
      <div className="shrink-0 border-t border-[var(--border-default)] px-2 py-2 space-y-0.5">
        {/* Settings nav item */}
        <NavLink
          to="/settings"
          title="Settings"
          className={({ isActive }) =>
            clsx("nav-item", isActive && "active")
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="sidebar-label">Settings</span>
        </NavLink>

        {/* Theme toggle row */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="sidebar-label section-key">Theme</span>
          <ThemeToggle />
        </div>

        {/* System Health — triggers modal */}
        <button
          onClick={() => setHealthOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          title="System Health"
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span className="sidebar-label text-xs font-medium flex-1 text-left">System Health</span>
        </button>

        {healthOpen && (
          <SystemHealthModal onClose={() => setHealthOpen(false)} />
        )}
      </div>
    </aside>
  );
}
