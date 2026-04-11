import { motion } from "framer-motion";

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  compact?: boolean;
}

export function HealthScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  color,
  compact = false,
}: HealthScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (color) return color;
    if (score >= 80) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  const ringColor = getColor();
  // Scale font: compact or small ring → smaller text
  const fontSize = compact || size <= 48
    ? `${Math.max(size * 0.18, 8)}px`
    : `${Math.max(size * 0.22, 10)}px`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
          opacity={0.5}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      {/* Score text — theme-aware */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-semibold text-[var(--text-primary)]"
          style={{ fontSize, lineHeight: 1 }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}
