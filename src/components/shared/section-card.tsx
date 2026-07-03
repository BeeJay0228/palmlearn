import { cn } from "@/lib/utils";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SectionCardProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "elevated";
}

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
  variant = "default",
}: SectionCardProps) {
  return (
    <Card variant={variant} padding="none" className={className}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-content-secondary" />}
          <CardTitle className="text-sm">{title}</CardTitle>
          {subtitle && (
            <span className="text-xs text-content-tertiary">{subtitle}</span>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <CardContent className={cn("p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
