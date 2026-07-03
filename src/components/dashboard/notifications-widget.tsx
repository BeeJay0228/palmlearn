"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getNotifications, getUnreadCount, seedNotifications } from "@/lib/mock-notifications";
import { runReminderEngine } from "@/lib/reminder-engine";
import { Bell } from "lucide-react";

export function NotificationsWidget({ className }: { className?: string }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => { seedNotifications(); }, []);

  useEffect(() => {
    if (user) {
      runReminderEngine(user.id, user.role);
    }
  }, [user]);

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotifications(user.id).slice(0, 5);
  }, [user]);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return getUnreadCount(user.id);
  }, [user]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-surface overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-content">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white px-1.5">
              {unreadCount}
            </span>
          )}
        </div>
        {user && (
          <button
            onClick={() => router.push(`/${user.role}/notifications`)}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all
          </button>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Bell className="h-8 w-8 text-content-tertiary mb-2" />
            <p className="text-sm text-content-secondary">No notifications</p>
            <p className="text-xs text-content-tertiary mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (n.link) router.push(n.link); }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                !n.read ? "bg-primary-50/60 dark:bg-primary-950/20" : "hover:bg-surface-hover",
              )}
            >
              <div className={cn(
                "h-2.5 w-2.5 mt-1 rounded-full shrink-0",
                !n.read ? "bg-primary-600" : "bg-transparent border border-border",
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !n.read ? "font-semibold text-content" : "text-content")}>{n.title}</p>
                <p className="text-xs text-content-tertiary mt-0.5 leading-relaxed line-clamp-1">{n.message}</p>
              </div>
              <span className="text-[11px] text-content-tertiary/70 shrink-0 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
