// hs-hub/src/components/BottomNav.tsx
// Mobile navigation — "Love" tier. Thumb-friendly, max 5 items.
import { NavLink } from "react-router-dom";
import { List, Layers, LayoutGrid, GitBranch, Database } from "lucide-react";
import { clsx } from "clsx";

const items = [
  { to: "/",          label: "Brands",    icon: List,        exact: true },
  { to: "/templates", label: "Templates", icon: Layers               },
  { to: "/preview",   label: "Preview",   icon: LayoutGrid           },
  { to: "/locks",     label: "Locks",     icon: GitBranch            },
  { to: "/cache",     label: "Cache",     icon: Database             },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
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
    </nav>
  );
}
