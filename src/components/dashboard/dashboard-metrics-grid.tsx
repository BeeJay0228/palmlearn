"use client";

import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/shared/motion-div";

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
}

interface DashboardMetricsGridProps {
  items: MetricCard[];
  className?: string;
  columns?: 2 | 3 | 4;
}

const colorMap: Record<string, { icon: string; bg: string }> = {
  emerald: { icon: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  blue: { icon: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  amber: { icon: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  purple: { icon: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  rose: { icon: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
  indigo: { icon: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  cyan: { icon: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  primary: { icon: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-950/30" },
};

export function DashboardMetricsGrid({ items, className, columns = 4 }: DashboardMetricsGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <MotionDiv variant="fade-in-up" delay={0.1} className={cn("grid gap-3", gridCols[columns], className)}>
      {items.map((item) => {
        const theme = colorMap[item.color || "primary"] || colorMap.primary;
        return (
          <div
            key={item.label}
            className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover"
          >
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", theme.bg)}>
              <item.icon className={cn("h-5 w-5", theme.icon)} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-content">{item.value}</p>
              <p className="text-xs text-content-tertiary truncate">{item.label}</p>
            </div>
          </div>
        );
      })}
    </MotionDiv>
  );
}
