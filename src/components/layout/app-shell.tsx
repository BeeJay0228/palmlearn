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
    <div className="flex h-screen overflow-hidden bg-surface-secondary/50">
      <Sidebar
        items={sidebarItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
        )}
      >
        <TopNav title={title} onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className={cn("flex-1 overflow-y-auto p-4 lg:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
