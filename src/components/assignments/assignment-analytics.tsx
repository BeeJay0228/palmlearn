"use client";

import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getLearnerAssignments } from "@/lib/learner-assignments";
import { getAssignments } from "@/lib/assignments";
import { getCourses } from "@/lib/courses";
import { getUsers } from "@/lib/users";
import { BarChart3, TrendingUp, Award, Clock, Users, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AssignmentSummaryCards({ role }: { role: "admin" | "trainer" }) {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const allRecords = getLearnerAssignments();
    let filtered = allRecords;
    if (role === "trainer" && user) {
      const users = getUsers();
      const trainerUser = users.find((u) => u.id === user.id);
      if (trainerUser?.categoryId) {
        const sameCategory = users.filter((u) => u.categoryId === trainerUser.categoryId).map((u) => u.id);
        filtered = allRecords.filter((r) => sameCategory.includes(r.learnerId));
      }
    }
    const total = filtered.length;
    const completed = filtered.filter((r) => r.status === "completed").length;
    const inProgress = filtered.filter((r) => r.status === "in_progress").length;
    const overdue = filtered.filter((r) => r.status === "overdue").length;
    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [role, user]);

  const cards = [
    { label: "Total Assignments", value: stats.total, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Overdue", value: stats.overdue, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <Card key={card.label} variant="bordered" padding="sm" className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", card.bg)}>
            <card.icon className={cn("h-5 w-5", card.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-content">{card.value}</p>
            <p className="text-xs text-content-tertiary truncate">{card.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RegionalPerformanceWidget() {
  const regions = useMemo(() => {
    const records = getLearnerAssignments();
    const users = getUsers();
    const regionMap = new Map<string, { completed: number; total: number }>();
    const regionNames: Record<string, string> = {};

    users.forEach((u) => {
      if (u.regionId) {
        const name = regionNames[u.regionId] || u.regionId;
        regionNames[u.regionId] = name;
      }
    });

    records.forEach((r) => {
      const learner = users.find((u) => u.id === r.learnerId);
      const rid = learner?.regionId || "unknown";
      if (!regionMap.has(rid)) regionMap.set(rid, { completed: 0, total: 0 });
      const entry = regionMap.get(rid)!;
      entry.total++;
      if (r.status === "completed") entry.completed++;
    });

    return Array.from(regionMap.entries()).map(([id, data]) => ({
      name: regionNames[id] || id,
      count: data.total,
      completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    })).sort((a, b) => b.completion - a.completion);
  }, []);

  if (regions.length === 0) return null;

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary-600" />
          <CardTitle>Regional Assignment Performance</CardTitle>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          {regions.slice(0, 5).map((r) => (
            <div key={r.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-content">{r.name}</span>
                <span className="text-xs text-content-secondary">{r.count} learners &middot; {r.completion}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-tertiary overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000", r.completion >= 80 ? "bg-emerald-500" : r.completion >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${r.completion}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentAssignmentsWidget() {
  const recent = useMemo(() => {
    const assignments = getAssignments();
    const courses = getCourses();
    return [...assignments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((a) => ({
      ...a,
      courseTitles: a.courseIds.map((cid) => courses.find((c) => c.id === cid)?.title || "Unknown").join(", "),
    }));
  }, []);

  if (recent.length === 0) return null;

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary-600" />
          <CardTitle>Recent Assignments</CardTitle>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          {recent.map((a) => (
            <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0 last:pb-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30">
                <BookOpen className="h-4 w-4 text-primary-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-content truncate">{a.name}</p>
                <p className="text-xs text-content-tertiary truncate">{a.courseTitles}</p>
              </div>
              <span className="text-xs text-content-tertiary shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PendingLearnersWidget() {
  const { user } = useAuth();

  const pending = useMemo(() => {
    if (!user) return [];
    const records = getLearnerAssignments();
    const allUsers = getUsers();
    const trainerUser = allUsers.find((u) => u.id === user.id);
    const relevantUsers = trainerUser?.categoryId
      ? allUsers.filter((u) => u.categoryId === trainerUser.categoryId)
      : allUsers;

    const learnerMap = new Map<string, { overdue: number; inProgress: number }>();
    relevantUsers.forEach((u) => learnerMap.set(u.id, { overdue: 0, inProgress: 0 }));

    records.forEach((r) => {
      if (!learnerMap.has(r.learnerId)) return;
      const entry = learnerMap.get(r.learnerId)!;
      if (r.status === "overdue") entry.overdue++;
      if (r.status === "in_progress") entry.inProgress++;
    });

    return Array.from(learnerMap.entries())
      .filter(([, v]) => v.overdue > 0 || v.inProgress > 0)
      .map(([id, v]) => ({ name: allUsers.find((u) => u.id === id)?.name || id, ...v }))
      .sort((a, b) => b.overdue - a.overdue)
      .slice(0, 6);
  }, [user]);

  if (pending.length === 0) return null;

  return (
    <Card variant="default" padding="none">
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-500" />
          <CardTitle>Pending Learners</CardTitle>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex flex-col gap-2.5">
          {pending.map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-content">{p.name}</span>
              <div className="flex items-center gap-3 text-xs">
                {p.inProgress > 0 && <span className="text-amber-600">{p.inProgress} in progress</span>}
                {p.overdue > 0 && <span className="text-danger">{p.overdue} overdue</span>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
