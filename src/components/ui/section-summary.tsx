import { cn } from "@/lib/utils";
import { Card } from "./card";

interface SectionSummaryProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
  stats?: { label: string; value: string | number }[];
}

export function SectionSummary({
  title,
  description,
  icon: Icon,
  action,
  className,
  stats,
}: SectionSummaryProps) {
  return (
    <Card variant="gradient" padding="lg" className={cn("relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-800/30">
              <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-content tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-content-secondary/80 leading-relaxed max-w-2xl">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {stats && stats.length > 0 && (
        <div className="relative z-10 mt-5 pt-5 border-t border-primary-200/30 dark:border-primary-800/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-content">{stat.value}</p>
                <p className="text-xs text-content-secondary/70 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
