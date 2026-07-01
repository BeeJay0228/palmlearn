"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { ROLE_LABELS } from "@/constants";
import { getCategoryName, getRegionName } from "@/lib/organization";

interface RoleGreetingProps {
  user: User;
  className?: string;
}

export function RoleGreeting({ user, className }: RoleGreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user.name.split(" ")[0];
  const categoryName = user.categoryId ? getCategoryName(user.categoryId) : null;
  const regionName = user.regionId ? getRegionName(user.regionId) : null;

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Welcome to your {ROLE_LABELS[user.role]} workspace
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white text-lg font-bold shrink-0">
          {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-content">{user.name}</p>
          <p className="text-xs text-content-tertiary">{ROLE_LABELS[user.role]}</p>
          {(categoryName || regionName) && (
            <p className="text-[11px] text-content-tertiary/70">
              {[categoryName, regionName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
