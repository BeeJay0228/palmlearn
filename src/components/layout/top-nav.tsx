"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMounted } from "@/hooks/use-mounted";
import { ROLE_LABELS } from "@/constants";
import { getNotifications, getUnreadCount, markAsRead, seedNotifications } from "@/lib/mock-notifications";
import {
  Sun,
  Moon,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  KeyRound,
  Search,
  Command,
  Sparkles,
} from "lucide-react";

interface TopNavProps {
  className?: string;
  onMenuToggle: () => void;
  title?: string;
}

export function TopNav({ className, onMenuToggle, title }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRefreshKey, setNotifRefreshKey] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seedNotifications();
  }, []);

  const notifications = useMemo(() => {
    if (!user) return [];
    return getNotifications(user.id).slice(0, 5);
  }, [user, notifRefreshKey]);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return getUnreadCount(user.id);
  }, [user, notifRefreshKey]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-surface/70 backdrop-blur-2xl px-4 lg:px-6 shadow-sm",
        className,
      )}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title */}
      {title && (
        <h1 className="text-[15px] font-semibold text-content flex-1 truncate lg:block">{title}</h1>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1 lg:gap-2">
        {/* Command Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-xl border border-border/60 bg-surface-secondary/50 hover:bg-surface-hover text-content-tertiary text-xs transition-all w-48"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="flex items-center gap-0.5 text-[10px] text-content-tertiary/60 bg-surface-tertiary/50 px-1.5 py-0.5 rounded-md font-mono">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border/50 bg-surface shadow-xl shadow-black/5 animate-scale-in-sm origin-top-right overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold text-content">Notifications</h3>
                <span className="text-[11px] text-content-tertiary">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-content-secondary">No notifications</p>
                    <p className="text-xs text-content-tertiary mt-1">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.read) { markAsRead(n.id); setNotifRefreshKey((k) => k + 1); }
                        if (n.link) { setNotifOpen(false); router.push(n.link); }
                      }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                        !n.read ? "bg-primary-50/60 dark:bg-primary-950/20" : "hover:bg-surface-hover",
                      )}
                    >
                      <div className={cn("h-2 w-2 mt-1.5 rounded-full shrink-0", !n.read ? "bg-primary-600" : "bg-transparent")} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !n.read ? "font-semibold text-content" : "text-content")}>{n.title}</p>
                        <p className="text-xs text-content-tertiary mt-0.5 line-clamp-1">{n.message}</p>
                      </div>
                      <span className="text-[11px] text-content-tertiary shrink-0 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
              {user && (
                <div className="border-t border-border/50 p-2">
                  <button
                    onClick={() => { setNotifOpen(false); router.push(`/${user.role}/notifications`); }}
                    className="w-full rounded-xl py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 ml-1 rounded-xl p-1.5 hover:bg-surface-hover transition-colors"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-bold shadow-sm shadow-primary-600/20">
              {initials}
            </div>
            {user && (
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-sm font-medium text-content leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[11px] text-content-tertiary">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border/50 bg-surface shadow-xl shadow-black/5 animate-scale-in-sm origin-top-right overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-content truncate">{user?.name}</p>
                    <p className="text-xs text-content-tertiary truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setDropdownOpen(false); router.push(`/${user?.role || "admin"}/profile`); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push(`/${user?.role || "admin"}/settings`); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push(`/${user?.role || "admin"}/profile?changePassword=true`); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </button>
              </div>

              <div className="border-t border-border/50 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Command Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 w-full max-w-xl animate-scale-in-sm">
            <div className="rounded-2xl border border-border/50 bg-surface shadow-2xl shadow-black/10 overflow-hidden">
              <div className="flex items-center gap-3 px-4 h-14 border-b border-border/50">
                <Search className="h-4 w-4 text-content-tertiary" />
                <input
                  type="text"
                  placeholder="Search courses, users, settings..."
                  className="flex-1 bg-transparent text-sm text-content placeholder:text-content-tertiary/60 outline-none"
                  autoFocus
                />
                <kbd className="text-[11px] text-content-tertiary/60 bg-surface-tertiary/50 px-1.5 py-0.5 rounded-md font-mono">ESC</kbd>
              </div>
              <div className="p-2 flex flex-col gap-0.5">
                <p className="px-3 py-2 text-[11px] font-medium text-content-tertiary uppercase tracking-wider">Quick Actions</p>
                {[
                  { label: "Continue Learning", icon: Sparkles },
                  { label: "Browse Courses", icon: Search },
                  { label: "View Profile", icon: User },
                  { label: "Open Settings", icon: Settings },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
                  >
                    <action.icon className="h-4 w-4 text-content-tertiary" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
