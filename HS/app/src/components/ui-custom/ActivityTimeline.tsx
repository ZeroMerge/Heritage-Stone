import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  AlertCircle,
  Upload,
  UserPlus,
  Globe,
  MessageSquare,
  Edit,
  FileText,
  X,
  PlusCircle,
  Settings,
} from "lucide-react";
import type { ActivityEvent } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

const eventIcons: Record<string, React.ElementType> = {
  section_approved: CheckCircle,
  section_revised: Edit,
  section_updated: Edit,
  asset_uploaded: Upload,
  member_invited: UserPlus,
  member_removed: X,
  portal_published: Globe,
  chat_message: MessageSquare,
  brand_request_submitted: FileText,
  project_created: PlusCircle,
  brand_updated: Settings,
};

const eventColors: Record<string, string> = {
  section_approved: "text-emerald-600 bg-emerald-50 border-emerald-200",
  section_revised: "text-amber-600 bg-amber-50 border-amber-200",
  section_updated: "text-blue-600 bg-blue-50 border-blue-200",
  asset_uploaded: "text-purple-600 bg-purple-50 border-purple-200",
  member_invited: "text-indigo-600 bg-indigo-50 border-indigo-200",
  member_removed: "text-red-600 bg-red-50 border-red-200",
  portal_published: "text-cyan-600 bg-cyan-50 border-cyan-200",
  chat_message: "text-pink-600 bg-pink-50 border-pink-200",
  brand_request_submitted: "text-orange-600 bg-orange-50 border-orange-200",
  project_created: "text-emerald-600 bg-emerald-50 border-emerald-200",
  brand_updated: "text-gray-600 bg-gray-50 border-gray-200",
};

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const Icon = eventIcons[event.eventType] || AlertCircle;
        const colorClass = eventColors[event.eventType] || "text-gray-600 bg-gray-100";

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex gap-3"
          >
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-xl border transition-all shadow-sm",
              colorClass || "text-[var(--text-secondary)] bg-[var(--surface-subtle)] border-[var(--border-subtle)]"
            )}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-medium">{event.actorName}</span>{" "}
                {event.description}
              </p>
              {event.sectionKey && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Section: {event.sectionKey}
                </p>
              )}
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
