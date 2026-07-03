import { cn } from "@/lib/utils";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  breadcrumb?: BreadcrumbItem[];
}

export function PageHeader({ title, description, action, className, breadcrumb }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-content">{title}</h1>
          {description && (
            <p className="text-sm text-content-secondary/80 leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
