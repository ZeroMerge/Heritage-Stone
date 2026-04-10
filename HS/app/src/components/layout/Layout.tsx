import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";
import { NewProjectModal } from "@/components/ui-custom/modals/NewProjectModal";
import { SearchModal } from "@/components/ui-custom/modals/SearchModal";
import { ConfirmModal } from "@/components/ui-custom/modals/ConfirmModal";

export function Layout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <Topbar />
      <main
        className={cn(
          "transition-all duration-300 pt-16",
          sidebarCollapsed ? "pl-[72px]" : "pl-[240px]"
        )}
      >
        <div className="p-6 h-[calc(100vh-64px)] overflow-auto">
          <Outlet />
        </div>
      </main>
      <NewProjectModal />
      <SearchModal />
      <ConfirmModal />
    </div>
  );
}
