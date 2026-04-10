import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore, useDashboardStore, useProjectsStore } from "@/store";
import { BentoGrid } from "@/components/studio/home/BentoGrid";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { user } = useAuthStore();
  const { fetchDashboardStats, fetchRecentActivity } = useDashboardStore();
  const { fetchProjects, hasFetched } = useProjectsStore();
  const greeting = getGreeting();
  const firstName = user?.firstName || "there";

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    if (!hasFetched) {
      fetchProjects();
    }
  }, [fetchDashboardStats, fetchRecentActivity, fetchProjects, hasFetched]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-[var(--hs-text)]">
          {greeting}, {firstName}
        </h1>
        <p className="text-[var(--hs-text-muted)] mt-1 font-mono text-[10px] uppercase tracking-widest">
          Systems Overview & Project Intelligence
        </p>
      </motion.div>

      {/* Bento Grid */}
      <BentoGrid />
    </div>
  );
}
