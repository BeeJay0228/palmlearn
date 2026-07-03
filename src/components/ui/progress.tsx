"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", size = "md", showLabel = false, animated = false, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    return (
      <div className={cn("flex items-center gap-3", className)} ref={ref} {...props}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-surface-tertiary",
            size === "sm" && "h-1.5",
            size === "md" && "h-2.5",
            size === "lg" && "h-3.5",
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variant === "default" && "bg-primary-600",
              variant === "success" && "bg-success",
              variant === "warning" && "bg-warning",
              variant === "danger" && "bg-danger",
              animated && "animate-glow-pulse",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-content-secondary shrink-0 min-w-[3ch] text-right">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
