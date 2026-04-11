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
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle.tsx";

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

        {/* System Health — collapsible */}
        <button
          onClick={() => setHealthOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-3 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          title="System Health"
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span className="sidebar-label text-xs font-medium flex-1 text-left">System Health</span>
          <span className="sidebar-label">
            {healthOpen
              ? <ChevronDown className="w-3 h-3" />
              : <ChevronRight className="w-3 h-3" />}
          </span>
        </button>

        {healthOpen && (
          <div className="sidebar-label mx-2 mb-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] p-3 animate-fade-in space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">API</span>
              <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">Database</span>
              <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">Hosting</span>
              <span className="flex items-center gap-1 text-[11px] text-green-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Render / Live
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border-faint)] flex items-center justify-between">
              <span className="text-[10px] text-[var(--text-tertiary)]">v2.4.0-stable</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
