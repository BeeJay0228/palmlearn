"use client";

import { cn } from "@/lib/utils";
import { Clock, Activity } from "lucide-react";
import { MotionDiv } from "@/components/shared/motion-div";

interface ActivityItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description: string;
  time: string;
  href?: string;
}

interface DashboardActivityProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
}

export function DashboardActivity({ activities, title = "Recent Activity", className }: DashboardActivityProps) {
  return (
    <MotionDiv variant="fade-in-up" delay={0.2} className={cn("rounded-2xl border border-border/50 bg-surface overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-content-secondary" />
          <h3 className="text-sm font-semibold text-content">{title}</h3>
        </div>
        <span className="text-xs text-content-tertiary">{activities.length} events</span>
      </div>
      <div className="p-5">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-secondary mb-3">
              <Clock className="h-6 w-6 text-content-tertiary" />
            </div>
            <p className="text-sm font-medium text-content-secondary">No recent activity</p>
            <p className="text-xs text-content-tertiary mt-1">Activity will appear here as you use the platform.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border/60" />
            <div className="flex flex-col gap-5">
              {activities.map((a) => (
                <div key={a.id} className="relative flex items-start gap-4 group">
                  <div className={cn(
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110",
                    a.iconBg || "bg-primary-50 dark:bg-primary-950/30",
                  )}>
                    <a.icon className={cn("h-4 w-4", a.iconColor || "text-primary-600 dark:text-primary-400")} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-content">{a.title}</p>
                        <p className="text-xs text-content-tertiary mt-0.5 leading-relaxed">{a.description}</p>
                      </div>
                      <span className="text-[11px] text-content-tertiary/70 shrink-0 whitespace-nowrap">{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MotionDiv>
  );
}
