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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar items={sidebarItems} />

      <div
        className={cn(
          "flex flex-1 flex-col lg:ml-64",
          className,
        )}
      >
        <TopNav title={title} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
