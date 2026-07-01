import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 px-4 text-center", className)}>
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-primary-900/10 border border-primary-200/50 dark:border-primary-800/30">
          <Icon className="h-9 w-9 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-400 animate-badge-pulse" />
      </div>
      <h3 className="text-lg font-semibold text-content">{title}</h3>
      {description && (
        <p className="text-sm text-content-secondary mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
