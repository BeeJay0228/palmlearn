"use client";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { GraduationCap } from "lucide-react";
import type { NavItem } from "@/types";

interface SidebarProps {
  items: NavItem[];
  className?: string;
}

export function Sidebar({ items, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-content">
          {APP_NAME}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  item.active
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                    : "text-content-secondary hover:text-content hover:bg-sidebar-hover",
                  item.disabled && "pointer-events-none opacity-50",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-content-tertiary">
          &copy; 2026 {APP_NAME}
        </p>
      </div>
    </aside>
  );
}
