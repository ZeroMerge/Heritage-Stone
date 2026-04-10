import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
}

export function StatCard({ label, value, trend }: StatCardProps) {
  const TrendIcon = trend?.direction === "up" 
    ? TrendingUp 
    : trend?.direction === "down" 
    ? TrendingDown 
    : Minus;

  const trendColor = trend?.direction === "up" 
    ? "text-emerald-600" 
    : trend?.direction === "down" 
    ? "text-red-600" 
    : "text-gray-500";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-4"
    >
      <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-[var(--text-primary)]">
          {value}
        </span>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
