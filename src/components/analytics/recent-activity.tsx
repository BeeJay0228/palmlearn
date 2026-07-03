"use client";

import { useMemo } from "react";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { getRecentActivity, type AnalyticsFilter } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import type { LucideIcon } from "lucide-react";
import {
  PlayCircle, CheckCircle, FileText, Award, UserPlus, CalendarCheck,
} from "lucide-react";

const ACTIVITY_ICONS: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  programme_started: { icon: PlayCircle, bg: "bg-blue-50 dark:bg-blue-950/30", color: "text-blue-600 dark:text-blue-400" },
  course_completed: { icon: CheckCircle, bg: "bg-emerald-50 dark:bg-emerald-950/30", color: "text-emerald-600 dark:text-emerald-400" },
  assignment_submitted: { icon: FileText, bg: "bg-amber-50 dark:bg-amber-950/30", color: "text-amber-600 dark:text-amber-400" },
  programme_completed: { icon: Award, bg: "bg-purple-50 dark:bg-purple-950/30", color: "text-purple-600 dark:text-purple-400" },
  programme_assigned: { icon: UserPlus, bg: "bg-indigo-50 dark:bg-indigo-950/30", color: "text-indigo-600 dark:text-indigo-400" },
  event_attended: { icon: CalendarCheck, bg: "bg-rose-50 dark:bg-rose-950/30", color: "text-rose-600 dark:text-rose-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function RecentActivity({ filter }: { filter: AnalyticsFilter }) {
  const { user } = useAuth();
  const activities = useMemo(() => getRecentActivity(user, filter), [user, filter]);

  const timelineItems = activities.map((a) => {
    const cfg = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.programme_started;
    return {
      id: a.id,
      icon: cfg.icon,
      iconBg: cfg.bg,
      iconColor: cfg.color,
      title: a.title,
      description: a.description,
      time: timeAgo(a.time),
    };
  });

  return <ActivityTimeline activities={timelineItems} title="Recent Learning Activity" />;
}
