// hs-hub/src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Layers,
  Upload,
  List,
  GitBranch,
  Database,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { to: "/", label: "Brands", icon: List, exact: true },
  { to: "/templates", label: "Templates", icon: Layers },
  { to: "/upload", label: "Upload Template", icon: Upload },
  { to: "/preview", label: "Live Preview", icon: LayoutGrid },
  { to: "/locks", label: "Section Locks", icon: GitBranch },
  { to: "/cache", label: "Cache", icon: Database },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-[var(--hs-border)] bg-[var(--hs-bg)]">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--hs-border)]/50">
        <div className="flex flex-col">
          <span className="text-xl font-light tracking-tight text-[var(--hs-text)]">
            Heritage <span className="text-[var(--hs-accent)]">Stone</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--hs-text-muted)] mt-1">
            Technical Hub
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 py-8 space-y-1 px-4">
        {nav.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                "hs-btn !justify-start !px-4 !py-3 !bg-transparent border border-transparent transition-all duration-300",
                isActive
                  ? "text-[var(--hs-accent)] border-[var(--hs-border)] !bg-[var(--hs-surface)]"
                  : "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] hover:border-[var(--hs-border)]/50"
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-sm tracking-tight">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Administrative Footer */}
      <div className="p-6 border-t border-[var(--hs-border)]/50">
        <div className="bg-[var(--hs-surface)] border border-[var(--hs-border)] p-4">
          <p className="text-[10px] font-mono uppercase text-[var(--hs-text-muted)] mb-3">System Health</p>
          <a
            href="http://localhost:3001/health"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-[11px] text-[var(--hs-text)] hover:text-[var(--hs-accent)] transition-colors group"
          >
            <span>Engine Status</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <div className="mt-4 pt-4 border-t border-[var(--hs-border)]/50 flex items-center justify-between">
            <span className="text-[10px] text-[var(--hs-text-muted)]">v2.4.0-stable</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
