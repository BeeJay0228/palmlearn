"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getNotifications, markAsRead, markAllAsRead, seedNotifications } from "@/lib/mock-notifications";
import type { AppNotification } from "@/lib/mock-notifications";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Trash2, Inbox, ExternalLink } from "lucide-react";
import { deleteNotification } from "@/lib/mock-notifications";

export function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotifications(user.id);
  }, [user, refreshKey]);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const tabs = [
    { key: "all" as const, label: "All", count: notifications.length },
    { key: "unread" as const, label: "Unread", count: notifications.filter((n) => !n.read).length },
    { key: "read" as const, label: "Read", count: notifications.filter((n) => n.read).length },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const typeIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "assignment": return "text-blue-500";
      case "programme": return "text-purple-500";
      case "due_reminder": return "text-amber-500";
      case "completion": return "text-emerald-500";
      case "overdue": return "text-red-500";
      case "system": return "text-content-tertiary";
    }
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllAsRead(user.id);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    setRefreshKey((k) => k + 1);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        description="View and manage your notifications."
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-surface-secondary rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filter === tab.key
                  ? "bg-surface shadow-sm text-content"
                  : "text-content-tertiary hover:text-content hover:bg-surface-hover",
              )}
            >
              {tab.label}
              <span className={cn(
                "flex h-5 min-w-[20px] items-center justify-center rounded-full text-[11px] font-semibold px-1.5",
                filter === tab.key ? "bg-primary-600 text-white" : "bg-surface-tertiary text-content-tertiary",
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        {notifications.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={Inbox}
              title={filter === "unread" ? "No unread notifications" : "No notifications"}
              description={
                filter === "unread"
                  ? "You've read everything. Good job!"
                  : filter === "read"
                    ? "No read notifications yet."
                    : "You don't have any notifications yet. They'll appear here when you get them."
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  !n.read ? "bg-primary-50/40 dark:bg-primary-950/15" : "hover:bg-surface-hover",
                )}
              >
                <div className={cn(
                  "h-2.5 w-2.5 mt-1.5 rounded-full shrink-0",
                  !n.read ? "bg-primary-600" : "bg-transparent border border-border",
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium uppercase tracking-wider", typeIcon(n.type))}>
                      {n.type.replace("_", " ")}
                    </span>
                    {!n.read && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className={cn("text-sm mt-0.5", !n.read ? "font-semibold text-content" : "text-content")}>
                    {n.title}
                  </p>
                  <p className="text-sm text-content-secondary mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-content-tertiary">{timeAgo(n.createdAt)}</span>
                    {n.link && (
                      <button
                        onClick={() => router.push(n.link!)}
                        className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {n.read ? null : (
                    <button
                      onClick={() => { markAsRead(n.id); setRefreshKey((k) => k + 1); }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-content-tertiary hover:text-danger hover:bg-danger/5 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
