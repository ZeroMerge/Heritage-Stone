import { motion } from "framer-motion";
import { useDashboardStore, useProjectsStore } from "@/store";
import { StatCard } from "./StatCard";
import { ActivityCard } from "./ActivityCard";
import { LaunchCountdownCard } from "./LaunchCountdownCard";
import { ProjectListCard } from "./ProjectListCard";
import { RequestsCard } from "./RequestsCard";
import { QuickActions } from "./QuickActions";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function BentoGrid() {
  const { stats, attentionItems, recentActivity } = useDashboardStore();
  const { projects } = useProjectsStore();

  // Get upcoming launches (projects with goLiveDate in future)
  const upcomingLaunches = projects
    .filter((p) => p.goLiveDate && new Date(p.goLiveDate) > new Date() && p.status !== "live")
    .sort((a, b) => new Date(a.goLiveDate!).getTime() - new Date(b.goLiveDate!).getTime())
    .slice(0, 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {/* Stats Row */}
      <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Projects"
            value={stats.activeProjects}
            trend={{ value: 12, direction: "up" }}
          />
          <StatCard
            label="Pending Approvals"
            value={stats.pendingApprovals}
            trend={{ value: 2, direction: "down" }}
          />
          <StatCard
            label="Open Requests"
            value={stats.openRequests}
            trend={{ value: 5, direction: "up" }}
          />
          <StatCard
            label="Unread Messages"
            value={stats.unreadMessages}
            trend={{ value: 1, direction: "neutral" }}
          />
        </div>
      </motion.div>

      {/* Activity Card */}
      <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-2">
        <ActivityCard events={recentActivity} />
      </motion.div>

      {/* Launch Countdown */}
      <motion.div variants={itemVariants}>
        <LaunchCountdownCard project={upcomingLaunches[0]} />
      </motion.div>

      {/* Project List */}
      <motion.div variants={itemVariants}>
        <ProjectListCard projects={projects.slice(0, 3)} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      {/* Requests Card */}
      <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
        <RequestsCard items={attentionItems} />
      </motion.div>
    </motion.div>
  );
}
