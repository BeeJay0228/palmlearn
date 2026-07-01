"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { GraduationCap, ChevronLeft } from "lucide-react";
import type { NavItem } from "@/types";

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function Sidebar({ items, collapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border transition-all duration-300",
        collapsed ? "justify-center px-0" : "justify-between px-4",
      )}>
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-content truncate">
              {APP_NAME}
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-content-tertiary hover:text-content hover:bg-sidebar-hover transition-all",
            collapsed && "hidden",
          )}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <ul className="flex flex-col gap-1">
          {items.map((item, idx) => {
            if (item.isSection) {
              return (
                <li key={item.label}>
                  {!collapsed && (
                    <div className="flex flex-col gap-1 pt-4 pb-1">
                      {idx > 0 && <div className="border-t border-sidebar-border mb-2" />}
                      <span className="px-3 text-[11px] font-semibold text-content-tertiary uppercase tracking-widest">
                        {item.label}
                      </span>
                    </div>
                  )}
                </li>
              );
            }
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors duration-200",
                    collapsed ? "justify-center h-10 w-12 mx-auto" : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                      : "text-content-secondary hover:text-content hover:bg-sidebar-hover",
                    item.disabled && "pointer-events-none opacity-50",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon && <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />}
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-content-tertiary">
            &copy; 2026 {APP_NAME}
          </p>
        </div>
      )}
    </aside>
  );
}
