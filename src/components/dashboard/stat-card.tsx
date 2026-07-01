"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconColor?: string;
  bgColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
  iconColor = "text-primary-600 dark:text-primary-400",
  bgColor = "bg-primary-50 dark:bg-primary-950/30",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 transition-all duration-300 card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-content-secondary/80 uppercase tracking-wider">{title}</p>
          <p className="stat-value">{value}</p>
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold mt-0.5",
              trendUp ? "text-success" : "text-danger",
            )}>
              <span className={cn(
                "inline-block w-0 h-0",
                trendUp ? "border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent border-b-current" : "border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-current",
              )} />
              {trend}
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110",
          bgColor,
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
    </div>
  );
}
