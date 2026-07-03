"use client";

import { useState, useEffect } from "react";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary/40">
      <Sidebar
        items={sidebarItems}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 min-w-0",
          "lg:ml-[260px]",
          sidebarCollapsed && "lg:ml-[72px]",
        )}
      >
        <TopNav title={title} onMenuToggle={toggleSidebar} />
        <main className={cn("flex-1 overflow-y-auto scrollbar-thin", className)}>
          <div className="animate-fade-in px-4 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
