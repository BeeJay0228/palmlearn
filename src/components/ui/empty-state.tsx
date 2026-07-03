import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    wrapper: "py-12 px-4",
    iconContainer: "h-14 w-14 rounded-2xl",
    icon: "h-6 w-6",
    title: "text-base",
  },
  md: {
    wrapper: "py-20 px-4",
    iconContainer: "h-20 w-20 rounded-3xl",
    icon: "h-9 w-9",
    title: "text-lg",
  },
  lg: {
    wrapper: "py-28 px-4",
    iconContainer: "h-24 w-24 rounded-3xl",
    icon: "h-11 w-11",
    title: "text-xl",
  },
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const classes = sizeClasses[size];
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", classes.wrapper, className)}>
      <div className="relative mb-6">
        <div className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-primary-900/10 border border-primary-200/50 dark:border-primary-800/30",
          classes.iconContainer,
        )}>
          <Icon className={cn("text-primary-600 dark:text-primary-400", classes.icon)} />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-400 animate-badge-pulse" />
      </div>
      <h3 className={cn("font-semibold text-content", classes.title)}>{title}</h3>
      {description && (
        <p className="text-sm text-content-secondary mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
