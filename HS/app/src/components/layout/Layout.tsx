// HS/app/src/components/layout/Layout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TopbarMobile } from "./TopbarMobile";
import { BottomNav } from "./BottomNav";
import { useEffect } from "react";
import { useUIStore, useProjectsStore } from "@/store";
import { NewProjectModal } from "@/components/ui-custom/modals/NewProjectModal";
import { SearchModal } from "@/components/ui-custom/modals/SearchModal";
import { ConfirmModal } from "@/components/ui-custom/modals/ConfirmModal";

export function Layout() {
  const { fetchProjects, hasFetched } = useProjectsStore();
  
  useEffect(() => {
    if (!hasFetched) fetchProjects();
  }, [hasFetched, fetchProjects]);

  return (
    <div className="app-shell bg-[var(--bg-primary)]">
      {/* Mobile-only header */}
      <TopbarMobile />

      <div className="shell-body">
        {/* Responsive Sidebar (Hidden on Love, Icon on Cherished, Full on Goldmine) */}
        <Sidebar className="sidebar" />
        
        {/* Desktop Topbar (absolute/fixed as per current Studio design, but wrapped in main) */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <header className="topbar-desktop">
            <Topbar />
          </header>

          <main className="main-content">
            <div className="p-4 sm:p-6 pb-24 sm:pb-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile-only footer navigation */}
      <BottomNav />

      {/* Overlays */}
      <NewProjectModal />
      <SearchModal />
      <ConfirmModal />
    </div>
  );
}
