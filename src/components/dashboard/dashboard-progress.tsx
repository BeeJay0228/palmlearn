"use client";

import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/shared/motion-div";
import { Progress } from "@/components/ui/progress";

interface ProgressMetric {
  label: string;
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
}

interface DashboardProgressProps {
  items: ProgressMetric[];
  title?: string;
  className?: string;
}

export function DashboardProgress({ items, title = "Progress Overview", className }: DashboardProgressProps) {
  return (
    <MotionDiv variant="fade-in-up" delay={0.2} className={cn("rounded-2xl border border-border/50 bg-surface overflow-hidden", className)}>
      {title && (
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-content">{title}</h3>
        </div>
      )}
      <div className="p-5 flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.icon && (
                  <item.icon className="h-4 w-4 text-content-secondary" />
                )}
                <span className="text-sm text-content-secondary">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-content">
                {item.value}{item.max ? `/${item.max}` : ""}
              </span>
            </div>
            <Progress
              value={item.value}
              max={item.max || 100}
              variant={item.variant}
              size="md"
              animated
            />
          </div>
        ))}
      </div>
    </MotionDiv>
  );
}
