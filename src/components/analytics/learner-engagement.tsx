"use client";

import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getLearnerEngagement, type AnalyticsFilter } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Users, Zap, CalendarDays, Clock, PlayCircle, Award,
  TrendingUp, Activity,
} from "lucide-react";

function DonutChart({ value, max, size = 80, color = "text-primary-600", strokeColor = "stroke-primary-500" }: { value: number; max: number; size?: number; color?: string; strokeColor?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-tertiary" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={cn("transition-all duration-1000", strokeColor)} />
      </svg>
      <span className={cn("absolute text-xs font-bold", color)}>{pct}%</span>
    </div>
  );
}

function WeeklyBarChart() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heights = useMemo(() => days.map(() => Math.floor(Math.random() * 60) + 20), []);

  return (
    <div className="flex items-end justify-between gap-1.5 h-24">
      {days.map((day, i) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-primary-500/60 dark:bg-primary-400/60 transition-all duration-1000" style={{ height: `${heights[i]}%` }} />
          <span className="text-[10px] text-content-tertiary">{day}</span>
        </div>
      ))}
    </div>
  );
}

export function LearnerEngagement({ filter }: { filter: AnalyticsFilter }) {
  const { user } = useAuth();
  const data = useMemo(() => getLearnerEngagement(user, filter), [user, filter]);

  const maxActive = Math.max(data.dailyActive, data.weeklyActive, data.monthlyActive, 1);

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary-600" />
        <CardTitle>Learner Engagement</CardTitle>
      </div>
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-surface-secondary">
            <p className="text-lg font-bold text-content">{data.dailyActive}</p>
            <p className="text-[11px] text-content-tertiary">Daily Active</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-secondary">
            <p className="text-lg font-bold text-content">{data.weeklyActive}</p>
            <p className="text-[11px] text-content-tertiary">Weekly Active</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-secondary">
            <p className="text-lg font-bold text-content">{data.monthlyActive}</p>
            <p className="text-[11px] text-content-tertiary">Monthly Active</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-surface-secondary">
            <p className="text-lg font-bold text-content">{data.programmesStarted}</p>
            <p className="text-[11px] text-content-tertiary">Programmes Started</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-secondary">
            <p className="text-lg font-bold text-content">{data.programmesCompleted}</p>
            <p className="text-[11px] text-content-tertiary">Programmes Completed</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <DonutChart value={data.dailyActive} max={maxActive} color="text-blue-600" strokeColor="stroke-blue-500" />
            <span className="text-[10px] text-content-tertiary">Daily</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <DonutChart value={data.weeklyActive} max={maxActive} color="text-emerald-600" strokeColor="stroke-emerald-500" />
            <span className="text-[10px] text-content-tertiary">Weekly</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <DonutChart value={data.monthlyActive} max={maxActive} color="text-purple-600" strokeColor="stroke-purple-500" />
            <span className="text-[10px] text-content-tertiary">Monthly</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-content-secondary">Avg Learning Time</span>
            <span className="text-xs font-bold text-content">{data.averageLearningTime} min</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-tertiary overflow-hidden">
            <div className="h-full rounded-full bg-primary-500 transition-all duration-1000" style={{ width: `${Math.min(data.averageLearningTime, 100)}%` }} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-content-secondary mb-2">Weekly Activity Trend</p>
          <WeeklyBarChart />
        </div>
      </CardContent>
    </Card>
  );
}
