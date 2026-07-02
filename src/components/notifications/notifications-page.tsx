"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getNotifications, markAsRead, markAsUnread, markAllAsRead,
  deleteAllRead, deleteNotification, seedNotifications, getNotificationCategory,
} from "@/lib/mock-notifications";
import type { NotificationCategory, NotificationType } from "@/lib/mock-notifications";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bell, CheckCheck, Trash2, Inbox, ExternalLink, Search as SearchIcon,
  BookOpen, CalendarDays, Globe, Settings, Undo2,
  GraduationCap, ClipboardList, Filter, X,
} from "lucide-react";

type TabKey = "all" | "unread" | "read" | NotificationCategory;

const TABS: { key: TabKey; label: string; icon: typeof Bell }[] = [
  { key: "all", label: "All", icon: Bell },
  { key: "unread", label: "Unread", icon: Bell },
  { key: "read", label: "Read", icon: CheckCheck },
  { key: "training", label: "Training", icon: GraduationCap },
  { key: "assignment", label: "Assignments", icon: ClipboardList },
  { key: "course", label: "Courses", icon: BookOpen },
  { key: "event", label: "Events", icon: CalendarDays },
  { key: "resource", label: "Resources", icon: Globe },
  { key: "system", label: "System", icon: Settings },
];

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  training: "text-purple-500",
  assignment: "text-blue-500",
  course: "text-emerald-500",
  event: "text-amber-500",
  resource: "text-cyan-500",
  system: "text-content-tertiary",
};

const TYPE_LABELS: Record<NotificationType, string> = {
  training_programme_assigned: "Programme Assigned",
  training_programme_updated: "Programme Updated",
  course_assigned: "Course Available",
  course_completed: "Course Completed",
  assignment_unlocked: "Assignment Unlocked",
  assignment_submitted: "Assignment Submitted",
  event_created: "Event Created",
  event_reminder: "Event Reminder",
  event_today: "Event Today",
  event_updated: "Event Updated",
  resource_added: "Resource Added",
  welcome: "Welcome",
  password_changed: "Password Changed",
  profile_updated: "Profile Updated",
  announcement: "Announcement",
};

export function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { seedNotifications(); }, []);

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotifications(user.id);
  }, [user, refreshKey]);

  const filtered = useMemo(() => {
    let result = notifications;

    if (activeTab === "unread") result = result.filter((n) => !n.read);
    else if (activeTab === "read") result = result.filter((n) => n.read);
    else if (activeTab !== "all") result = result.filter((n) => getNotificationCategory(n.type) === activeTab);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
      );
    }

    if (categoryFilter) {
      result = result.filter((n) => getNotificationCategory(n.type) === categoryFilter);
    }

    if (dateFilter) {
      const now = Date.now();
      result = result.filter((n) => {
        const d = new Date(n.createdAt).getTime();
        switch (dateFilter) {
          case "today": return d >= new Date(now).setHours(0, 0, 0, 0);
          case "week": return d >= now - 7 * 86400000;
          case "month": return d >= now - 30 * 86400000;
          default: return true;
        }
      });
    }

    return result;
  }, [notifications, activeTab, searchQuery, categoryFilter, dateFilter]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

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

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllAsRead(user.id);
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteAllRead = () => {
    if (!user) return;
    deleteAllRead(user.id);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    setRefreshKey((k) => k + 1);
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    setRefreshKey((k) => k + 1);
  };

  const handleMarkUnread = (id: string) => {
    markAsUnread(id);
    setRefreshKey((k) => k + 1);
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("");
    setDateFilter("");
  }, []);

  const hasActiveFilters = searchQuery || categoryFilter || dateFilter;
  const hasReadNotifications = notifications.some((n) => n.read);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Notification Center"
        description="Stay informed about your learning activities and updates."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-wrap">
        <div className="flex items-center gap-1 bg-surface-secondary rounded-xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.key
                  ? "bg-surface shadow-sm text-content"
                  : "text-content-tertiary hover:text-content hover:bg-surface-hover",
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white px-1.5">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 flex-col sm:flex-row">
        <div className="relative flex-1 w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={showFilters ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white" />
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDeleteAllRead} disabled={!hasReadNotifications}>
            <Trash2 className="h-4 w-4" />
            Delete All Read
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border/50 bg-surface-secondary p-4 flex items-start gap-4 flex-col sm:flex-row animate-slide-down">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-content-tertiary shrink-0" />
            <span className="text-sm font-medium text-content">Filters</span>
          </div>
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="w-full sm:w-44">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: "", label: "All Categories" },
                  { value: "training", label: "Training" },
                  { value: "assignment", label: "Assignments" },
                  { value: "course", label: "Courses" },
                  { value: "event", label: "Events" },
                  { value: "resource", label: "Resources" },
                  { value: "system", label: "System" },
                ]}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={[
                  { value: "", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Notification List */}
      <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={Inbox}
              title={
                hasActiveFilters
                  ? "No matching notifications"
                  : activeTab === "unread"
                    ? "No unread notifications"
                    : activeTab === "read"
                      ? "No read notifications"
                      : "No notifications"
              }
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters."
                  : activeTab === "unread"
                    ? "You've read everything. Good job!"
                    : activeTab === "read"
                      ? "No read notifications yet."
                      : "You don't have any notifications yet. They'll appear here when you get them."
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((n) => {
              const category = getNotificationCategory(n.type);
              return (
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-xs font-medium uppercase tracking-wider", CATEGORY_COLORS[category])}>
                        {TYPE_LABELS[n.type] || n.type.replace(/_/g, " ")}
                      </span>
                      {!n.read && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-primary-600" />
                      )}
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                        category === "training" && "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
                        category === "assignment" && "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                        category === "course" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                        category === "event" && "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                        category === "resource" && "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
                        category === "system" && "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                      )}>
                        {category}
                      </span>
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
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {n.read ? (
                      <button
                        onClick={() => handleMarkUnread(n.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
                        title="Mark as unread"
                      >
                        <Undo2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkRead(n.id)}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
