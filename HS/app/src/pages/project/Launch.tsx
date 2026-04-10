import { useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Rocket,
  CheckCircle,
  Circle,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useProjectsStore, useUIStore } from "@/store";

import type { Project, LaunchTask } from "@/types";
import { cn } from "@/lib/utils";

interface OverviewContext {
  project: Project;
}

const defaultTasks: LaunchTask[] = [
  { id: "1", label: "All brand sections approved", completed: false, required: true },
  { id: "2", label: "Logo files uploaded", completed: false, required: true },
  { id: "3", label: "Color palette defined", completed: false, required: true },
  { id: "4", label: "Typography configured", completed: false, required: true },
  { id: "5", label: "Portal settings configured", completed: false, required: true },
  { id: "6", label: "Team members invited", completed: false, required: false },
  { id: "7", label: "Custom domain configured", completed: false, required: false },
];

export function Launch() {
  const { project } = useOutletContext<OverviewContext>();
  const { updateProject, publishProject } = useProjectsStore();
  const { showToast } = useUIStore();
  const [isLaunching, setIsLaunching] = useState(false);

  const tasks = project.launchTasks && project.launchTasks.length > 0 ? project.launchTasks : defaultTasks;
  const completedCount = tasks.filter((t) => t.completed).length;
  const requiredCount = tasks.filter((t) => t.required).length;
  const requiredCompleted = tasks.filter((t) => t.required && t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const canLaunch = requiredCompleted === requiredCount;

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    try {
      await updateProject(project.id, { launchTasks: updatedTasks });
      const task = tasks.find(t => t.id === taskId);
      showToast(`${task?.label} ${!task?.completed ? 'completed' : 'unmarked'}`, "info");
    } catch {
      showToast("Failed to update task", "error");
    }
  };

  const handleLaunch = async () => {
    if (!canLaunch || isLaunching) return;
    setIsLaunching(true);
    try {
      await publishProject(project.id);
      // publishProject already shows a toast and updates status
    } catch {
      // Error handled in store
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Launch Checklist
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Complete these tasks before launching your brand portal
          </p>
        </div>
        {project.status !== "live" && (
          <button
            onClick={handleLaunch}
            disabled={!canLaunch || isLaunching}
            className={cn(
              "btn btn-primary flex items-center gap-2 self-start",
              (!canLaunch || isLaunching) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLaunching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Launch Portal
          </button>
        )}
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              Launch Progress
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
          <span className="text-3xl font-bold text-[var(--hs-accent)]">
            {progress}%
          </span>
        </div>

        <div className="h-3 bg-[var(--surface-subtle)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full",
              canLaunch ? "bg-emerald-500" : "bg-[var(--hs-accent)]"
            )}
          />
        </div>

        {!canLaunch && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Complete all required tasks before launching
            </p>
          </div>
        )}
      </motion.div>

      {/* Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)]"
      >
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <h3 className="font-medium text-[var(--text-primary)]">Tasks</h3>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer",
                task.completed && "bg-emerald-50/50"
              )}
              onClick={() => toggleTask(task.id)}
            >
              {task.completed ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-[var(--border-strong)] flex-shrink-0" />
              )}

              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    task.completed
                      ? "text-emerald-700 line-through"
                      : "text-[var(--text-primary)]"
                  )}
                >
                  {task.label}
                </p>
              </div>

              {task.required && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                  Required
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Go Live Date */}
      {project.goLiveDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-6"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[var(--hs-accent)]" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Target Launch Date</p>
              <p className="font-medium text-[var(--text-primary)]">
                {new Date(project.goLiveDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Status */}
      {project.status === "live" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-emerald-50 border border-emerald-200 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">
                Portal is Live!
              </h3>
              <p className="text-sm text-emerald-700 mt-1">
                Launched on{" "}
                {project.launchedAt
                   ? new Date(project.launchedAt).toLocaleDateString()
                   : "N/A"}
              </p>
            </div>
            <a
              href={`https://${project.portalSettings.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Portal
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
