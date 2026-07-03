import { cn } from "@/lib/utils";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  breadcrumb?: BreadcrumbItem[];
  tabs?: React.ReactNode;
  sticky?: boolean;
  compact?: boolean;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  breadcrumb,
  tabs,
  sticky = false,
  compact = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        sticky && "sticky top-0 z-20 bg-surface/80 backdrop-blur-xl -mx-4 sm:-mx-6 px-4 sm:px-6",
        className,
      )}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} />
      )}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        compact && "gap-2",
      )}>
        <div className={cn("space-y-1", compact && "space-y-0")}>
          <h1 className={cn(
            "font-bold tracking-tight text-content",
            compact ? "text-xl" : "text-2xl",
          )}>{title}</h1>
          {description && (
            <p className="text-sm text-content-secondary/80 leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {tabs && <div className="-mb-1">{tabs}</div>}
    </div>
  );
}
