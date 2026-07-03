"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
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
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-all duration-300 lg:hidden",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
        onClick={onToggle}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-out",
          "bg-surface/70 backdrop-blur-2xl border-r border-border/50",
          "shadow-[4px_0_24px_rgba(0,0,0,0.03)]",
          collapsed
            ? "-translate-x-full lg:translate-x-0 lg:w-[72px]"
            : "translate-x-0 w-[260px]",
          className,
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center transition-all duration-300 border-b border-border/40",
          collapsed ? "lg:justify-center lg:px-0 px-4" : "justify-between px-4",
        )}>
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm shadow-primary-600/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col lg:flex">
                <span className="text-[15px] font-bold tracking-tight text-content leading-tight">
                  {APP_NAME}
                </span>
                <span className="text-[10px] font-medium text-primary-600 dark:text-primary-400 leading-tight">
                  Enterprise Learning
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggle}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-content-tertiary hover:text-content hover:bg-surface-hover transition-all",
              collapsed && "lg:hidden",
            )}
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-hide" role="navigation">
          <ul className="flex flex-col gap-0.5" role="list">
            {items.map((item, idx) => {
              if (item.isSection) {
                return (
                  <li key={`section-${idx}`} role="none">
                    <div className={cn("flex-col gap-1", collapsed ? "hidden lg:hidden" : "flex")}>
                      {idx > 0 && <div className="border-t border-border/40 mb-2.5" />}
                      <span className="px-3 text-[10px] font-semibold text-content-tertiary uppercase tracking-[0.12em]">
                        {item.label}
                      </span>
                    </div>
                  </li>
                );
              }
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative group",
                      collapsed ? "lg:justify-center lg:h-10 lg:w-10 lg:mx-auto justify-start px-3 py-2.5" : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-gradient-to-r from-primary-50 to-primary-50/50 dark:from-primary-950/40 dark:to-primary-950/20 text-primary-700 dark:text-primary-300 shadow-sm"
                        : "text-content-secondary hover:text-content hover:bg-surface-hover",
                      item.disabled && "pointer-events-none opacity-40",
                    )}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary-600" aria-hidden="true" />
                    )}
                    {item.icon && (
                      <item.icon className={cn(
                        "shrink-0 transition-transform duration-200",
                        collapsed ? "h-5 w-5" : "h-4 w-4",
                        isActive && "scale-110",
                        "group-hover:scale-110",
                      )} aria-hidden="true" />
                    )}
                    <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Expand/Collapse */}
        {collapsed && (
          <div className="border-t border-border/40 p-2.5 hidden lg:block">
            <button
              onClick={onToggle}
              className="flex w-full items-center justify-center h-10 rounded-xl text-content-tertiary hover:text-content hover:bg-surface-hover transition-all"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-border/40 p-4 hidden lg:block">
            <p className="text-[11px] text-content-tertiary/60">
              &copy; 2026 {APP_NAME}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
