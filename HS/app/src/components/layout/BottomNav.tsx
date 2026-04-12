// HS/app/src/components/layout/BottomNav.tsx
// Mobile bottom navigation (Love tier) for Heritage Stone Studio.
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Settings, LayoutGrid } from "lucide-react";
import { clsx } from "clsx";

const items = [
  { to: "/studio",          label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/studio/projects", label: "Projects",  icon: FolderKanban              },
  { to: "/studio/settings", label: "Settings",  icon: Settings                  },
];

export function BottomNav() {
  return (
    <nav className="s-bottom-nav">
      {items.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium tracking-tight transition-colors",
              isActive
                ? "text-[var(--hs-accent)]"
                : "text-[var(--text-tertiary)]"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={clsx("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
      {/* Hub shortcut */}
      <a
        href={
          import.meta.env.VITE_HUB_URL ||
          (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
            ? window.location.origin.replace("studio", "hub")
            : "http://localhost:5174")
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium tracking-tight text-[var(--text-tertiary)] transition-colors hover:text-[var(--hs-accent)]"
      >
        <LayoutGrid className="w-5 h-5" />
        <span>Hub</span>
      </a>
    </nav>
  );
}
