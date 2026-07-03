"use client";

import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCoursePerformance, type AnalyticsFilter } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { BookOpen, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export function CoursePerformance({ filter }: { filter: AnalyticsFilter }) {
  const { user } = useAuth();
  const data = useMemo(() => getCoursePerformance(user, filter), [user, filter]);

  const maxRate = Math.max(...data.mostCompleted.map((c) => c.completionRate), 1);

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary-600" />
        <CardTitle>Course Performance</CardTitle>
      </div>
      <CardContent className="p-5">
        <div className="mb-5 p-3 rounded-xl bg-surface-secondary text-center">
          <p className="text-2xl font-bold text-content">{data.averageCompletionRate}%</p>
          <p className="text-xs text-content-tertiary">Average Completion Rate</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Most Completed</p>
            </div>
            {data.mostCompleted.length === 0 ? (
              <p className="text-xs text-content-tertiary py-4 text-center">No data</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.mostCompleted.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-content truncate">{c.title}</span>
                        <span className="text-xs text-content-tertiary shrink-0 ml-2">{c.completionRate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(c.completionRate / maxRate) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Least Completed</p>
            </div>
            {data.leastCompleted.length === 0 ? (
              <p className="text-xs text-content-tertiary py-4 text-center">No data</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.leastCompleted.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-content truncate">{c.title}</span>
                        <span className="text-xs text-content-tertiary shrink-0 ml-2">{c.completionRate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden">
                        <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${(c.completionRate / maxRate) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
