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
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary mb-4">
        <Icon className="h-8 w-8 text-content-tertiary" />
      </div>
      <h3 className="text-lg font-semibold text-content">{title}</h3>
      {description && (
        <p className="text-sm text-content-secondary mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
