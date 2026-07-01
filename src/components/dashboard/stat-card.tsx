"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <Card variant="default" padding="md" className={cn("group", className)}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-content-secondary">{title}</p>
            <p className="text-2xl font-bold text-content">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trendUp ? "text-success" : "text-danger",
              )}>
                {trend}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
