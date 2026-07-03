"use client";

import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getProgrammePerformance, type AnalyticsFilter } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import { PROGRAMME_STATUS_COLORS, PROGRAMME_STATUS_LABELS } from "@/types";

export function ProgrammePerformance({ filter }: { filter: AnalyticsFilter }) {
  const { user } = useAuth();
  const programmes = useMemo(() => getProgrammePerformance(user, filter), [user, filter]);

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-primary-600" />
        <CardTitle>Top Training Programmes</CardTitle>
      </div>
      <CardContent className="p-5">
        {programmes.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Megaphone className="h-8 w-8 text-content-tertiary mb-2" />
            <p className="text-sm text-content-secondary">No programme data available</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {programmes.slice(0, 8).map((p) => (
              <div key={p.id} className="rounded-xl border border-border/50 bg-surface-secondary p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-content truncate">{p.name}</p>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                        PROGRAMME_STATUS_COLORS[p.status as keyof typeof PROGRAMME_STATUS_COLORS] || "",
                      )}>
                        {PROGRAMME_STATUS_LABELS[p.status as keyof typeof PROGRAMME_STATUS_LABELS] || p.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-content">{p.assignedCount}</p>
                    <p className="text-[11px] text-content-tertiary">Assigned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-content">{p.startedCount}</p>
                    <p className="text-[11px] text-content-tertiary">Started</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-content">{p.completedCount}</p>
                    <p className="text-[11px] text-content-tertiary">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-content">{p.completionPercentage}%</p>
                    <p className="text-[11px] text-content-tertiary">Completion</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-content-tertiary shrink-0">Avg Progress</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-tertiary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        p.averageProgress >= 80 ? "bg-emerald-500" : p.averageProgress >= 50 ? "bg-amber-500" : "bg-red-500",
                      )}
                      style={{ width: `${p.averageProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-content shrink-0 w-8 text-right">{p.averageProgress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
