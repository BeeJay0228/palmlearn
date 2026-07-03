import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardData {
  label: string;
  value: string | number;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: { value: string; up?: boolean };
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

interface StatCardProps {
  stat: StatCardData;
  className?: string;
}

export function StatCard({ stat, className }: StatCardProps) {
  const theme = colorMap[stat.color || "primary"] || colorMap.primary;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 transition-all duration-300 card-hover",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-content-secondary/80 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-content tracking-tight">
            {stat.value}
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
        {stat.icon && (
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            theme.bg,
          )}>
            <stat.icon className={cn("h-5 w-5", theme.icon)} />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
