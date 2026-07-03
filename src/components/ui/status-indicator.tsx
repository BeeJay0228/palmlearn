"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { StatusType } from "@/types";

const statusDotVariants = cva(
  "inline-flex items-center gap-2 text-sm font-medium",
  {
    variants: {
      status: {
        published: "text-success",
        draft: "text-content-tertiary",
        completed: "text-info",
        pending: "text-warning",
        overdue: "text-danger",
        locked: "text-content-tertiary",
        in_progress: "text-info",
        active: "text-success",
        inactive: "text-content-tertiary",
        cancelled: "text-danger",
        archived: "text-content-tertiary",
        expired: "text-content-tertiary",
      },
    },
    defaultVariants: {
      status: "draft",
    },
  },
);

const statusDotColors: Record<StatusType, string> = {
  published: "bg-success",
  draft: "bg-content-tertiary",
  completed: "bg-info",
  pending: "bg-warning",
  overdue: "bg-danger",
  locked: "bg-content-tertiary",
  in_progress: "bg-info",
  active: "bg-success",
  inactive: "bg-content-tertiary",
  cancelled: "bg-danger",
  archived: "bg-content-tertiary",
  expired: "bg-content-tertiary",
};

const statusLabels: Record<StatusType, string> = {
  published: "Published",
  draft: "Draft",
  completed: "Completed",
  pending: "Pending",
  overdue: "Overdue",
  locked: "Locked",
  in_progress: "In Progress",
  active: "Active",
  inactive: "Inactive",
  cancelled: "Cancelled",
  archived: "Archived",
  expired: "Expired",
};

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  status: StatusType;
  showLabel?: boolean;
  size?: "sm" | "md";
}

function StatusIndicator({ className, status, showLabel = true, size = "md" }: StatusIndicatorProps) {
  return (
    <span className={cn(statusDotVariants({ status }), className)}>
      <span
        className={cn(
          "inline-block rounded-full shrink-0",
          statusDotColors[status],
          size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className={cn(size === "sm" ? "text-xs" : "text-sm")}>
          {statusLabels[status]}
        </span>
      )}
    </span>
  );
}

export { StatusIndicator, statusLabels, statusDotColors };
