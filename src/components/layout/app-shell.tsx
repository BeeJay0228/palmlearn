"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import type { NavItem } from "@/types";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  sidebarItems: NavItem[];
  title?: string;
  className?: string;
}

export function AppShell({
  children,
  sidebarItems,
  title,
  className,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary/40">
      <Sidebar
        items={sidebarItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 min-w-0",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]",
        )}
      >
        <TopNav title={title} onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={cn("flex-1 overflow-y-auto", className)}>
          <div className="animate-fade-in px-5 py-5 lg:px-7 lg:py-6 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
