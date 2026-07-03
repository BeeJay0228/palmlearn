"use client";

import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getAssignmentPerformance, type AnalyticsFilter } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function AssignmentPerformance({ filter }: { filter: AnalyticsFilter }) {
  const { user } = useAuth();
  const data = useMemo(() => getAssignmentPerformance(user, filter), [user, filter]);

  const total = data.submitted + data.pending + data.overdue || 1;
  const submittedPct = Math.round((data.submitted / total) * 100);
  const pendingPct = Math.round((data.pending / total) * 100);
  const overduePct = Math.round((data.overdue / total) * 100);

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary-600" />
        <CardTitle>Assignment Performance</CardTitle>
      </div>
      <CardContent className="p-5">
        {data.total === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <ClipboardList className="h-8 w-8 text-content-tertiary mb-2" />
            <p className="text-sm text-content-secondary">No assignment data available</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                <div className="flex justify-center mb-1">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-content">{data.submitted}</p>
                <p className="text-[11px] text-content-tertiary">Submitted</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <div className="flex justify-center mb-1">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xl font-bold text-content">{data.pending}</p>
                <p className="text-[11px] text-content-tertiary">Pending</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                <div className="flex justify-center mb-1">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-xl font-bold text-content">{data.overdue}</p>
                <p className="text-[11px] text-content-tertiary">Overdue</p>
              </div>
            </div>

            <div className="h-3 w-full rounded-full bg-surface-tertiary overflow-hidden flex">
              {submittedPct > 0 && (
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${submittedPct}%` }} />
              )}
              {pendingPct > 0 && (
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${pendingPct}%` }} />
              )}
              {overduePct > 0 && (
                <div className="h-full bg-red-500 transition-all" style={{ width: `${overduePct}%` }} />
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-content-tertiary">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Submitted {submittedPct}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending {pendingPct}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Overdue {overduePct}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
