import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  title: string;
  description: string;
  time: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  title?: string;
  className?: string;
}

export function ActivityTimeline({ activities, title = "Recent Activity", className }: ActivityTimelineProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
      </div>
      <div className="p-5 flex flex-col gap-4">
        {activities.length === 0 ? (
          <p className="text-sm text-content-tertiary text-center py-6">No recent activity.</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", a.iconBg || "bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400")}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content">{a.title}</p>
                <p className="text-xs text-content-tertiary">{a.description}</p>
              </div>
              <span className="text-xs text-content-tertiary shrink-0">{a.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
