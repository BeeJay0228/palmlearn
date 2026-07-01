"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export function QuickActions({ actions, title = "Quick Actions", className }: QuickActionsProps) {
  const router = useRouter();

  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface-secondary hover:bg-surface-hover hover:border-border-strong transition-all text-sm font-medium text-content-secondary hover:text-content"
          >
            <action.icon className={cn("h-5 w-5", action.color || "text-primary-600")} />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
