"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/shared/motion-div";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: { value: string; up?: boolean };
  color?: string;
  bgColor?: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

function AnimatedValue({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

const colorMap: Record<string, { icon: string; bg: string }> = {
  emerald: { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  blue: { icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  amber: { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  purple: { icon: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
  rose: { icon: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
  indigo: { icon: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  cyan: { icon: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  primary: { icon: "text-primary-600 dark:text-primary-400", bg: "bg-primary-50 dark:bg-primary-950/30" },
};

export function DashboardStats({ stats, columns = 4, className }: DashboardStatsProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <MotionDiv variant="fade-in-up" delay={0.1} className={cn("grid grid-cols-1 gap-4", gridCols[columns], className)}>
      {stats.map((stat, idx) => {
        const theme = colorMap[stat.color || "primary"] || colorMap.primary;
        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 transition-all duration-300 card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-content-secondary/80 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-content tracking-tight">
                  <AnimatedValue value={stat.value} />
                </p>
                {stat.trend && (
                  <div className={cn(
                    "inline-flex items-center gap-1 text-xs font-semibold mt-0.5",
                    stat.trend.up !== false ? "text-success" : "text-danger",
                  )}>
                    <span className={cn(
                      "inline-block",
                      stat.trend.up !== false
                        ? "border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent border-b-current"
                        : "border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-current",
                    )} />
                    {stat.trend.value}
                  </div>
                )}
              </div>
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                theme.bg,
              )}>
                <stat.icon className={cn("h-5 w-5", theme.icon)} />
              </div>
            </div>
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        );
      })}
    </MotionDiv>
  );
}
