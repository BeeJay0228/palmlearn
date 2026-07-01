"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export function QuickActions({ actions, title = "Quick Actions", className }: QuickActionsProps) {
  const router = useRouter();

  return (
    <div className={cn("rounded-2xl border border-border/50 bg-surface overflow-hidden", className)}>
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2.5">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/50 bg-surface-secondary/50 hover:bg-surface-hover hover:border-border transition-all text-sm font-medium text-content-secondary hover:text-content"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110",
              action.bgColor || "bg-primary-50 dark:bg-primary-950/30",
            )}>
              <action.icon className={cn("h-4 w-4", action.color || "text-primary-600 dark:text-primary-400")} />
            </div>
            <span className="text-xs text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
