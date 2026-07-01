import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}

interface NotificationsWidgetProps {
  notifications: Notification[];
  title?: string;
  className?: string;
}

export function NotificationsWidget({ notifications, title = "Notifications", className }: NotificationsWidgetProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
        <span className="text-xs text-content-tertiary">{notifications.filter((n) => n.unread).length} unread</span>
      </div>
      <div className="p-5 flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Bell className="h-8 w-8 text-content-tertiary mb-2" />
            <p className="text-sm text-content-secondary">No notifications</p>
            <p className="text-xs text-content-tertiary mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-3 p-3 rounded-lg", n.unread ? "bg-primary-50/50 dark:bg-primary-950/20" : "bg-surface-secondary")}>
              <div className={cn("h-2 w-2 mt-1.5 rounded-full shrink-0", n.unread ? "bg-primary-600" : "bg-transparent")} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", n.unread ? "font-semibold text-content" : "text-content")}>{n.title}</p>
                <p className="text-xs text-content-tertiary mt-0.5">{n.description}</p>
              </div>
              <span className="text-xs text-content-tertiary shrink-0">{n.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
