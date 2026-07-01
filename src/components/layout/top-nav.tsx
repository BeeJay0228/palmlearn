"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMounted } from "@/hooks/use-mounted";
import { ROLE_LABELS } from "@/constants";
import {
  Sun,
  Moon,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  KeyRound,
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-xl px-4 lg:px-6",
        className,
      )}
    >
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {title && (
        <h1 className="text-lg font-semibold text-content flex-1 truncate">{title}</h1>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1 lg:gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 ml-2 rounded-lg p-1.5 hover:bg-surface-hover transition-colors"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-semibold">
              {initials}
            </div>
            {user && (
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-sm font-medium text-content leading-tight truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-xs text-content-tertiary">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border bg-surface shadow-xl py-1.5 animate-scale-in origin-top-right">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-content truncate">{user?.name}</p>
                <p className="text-xs text-content-tertiary truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
              >
                <User className="h-4 w-4" />
                My Profile
              </button>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/dashboard/settings"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile?changePassword=true"); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </button>

              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
