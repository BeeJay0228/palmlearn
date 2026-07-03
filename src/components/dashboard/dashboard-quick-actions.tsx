"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/shared/motion-div";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
}

interface DashboardQuickActionsProps {
  actions: QuickAction[];
  title?: string;
  description?: string;
  className?: string;
  columns?: 2 | 3 | 4;
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

export function DashboardQuickActions({ actions, title = "Quick Actions", description, className, columns = 4 }: DashboardQuickActionsProps) {
  const router = useRouter();

  const gridCols = {
    2: "grid-cols-2",
    3: "sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  return (
    <MotionDiv variant="fade-in-up" delay={0.15} className={cn("rounded-2xl border border-border/50 bg-surface overflow-hidden", className)}>
      {(title || description) && (
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-content">{title}</h3>
          {description && <p className="text-xs text-content-tertiary mt-0.5">{description}</p>}
        </div>
      )}
      <div className={cn("p-4 gap-3 grid", gridCols[columns])}>
        {actions.map((action) => {
          const theme = colorMap[action.color || "primary"] || colorMap.primary;
          return (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/50 bg-surface-secondary/50 hover:bg-surface-hover hover:border-border hover:shadow-sm transition-all duration-200"
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110 group-hover:rotate-3",
                theme.bg,
              )}>
                <action.icon className={cn("h-4 w-4", theme.icon)} />
              </div>
              <span className="text-xs text-center font-medium text-content-secondary group-hover:text-content leading-tight transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </MotionDiv>
  );
}
