"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  canViewProgrammeAnalytics,
  getProgrammeOverview,
  getLearnerProgressData,
  getCourseBreakdown,
  getAssignmentAnalytics,
  getProgrammeTimeline,
  type LearnerProgressRow,
} from "@/lib/programme-analytics";
import { getProgramme } from "@/lib/programmes";
import { cn } from "@/lib/utils";
import {
  Users, UserCheck, UserX, BookOpen, CheckCircle, Clock,
  GraduationCap, TrendingUp, ArrowLeft, Search, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, PlayCircle, Award, AlertTriangle, FileText,
  BarChart3,
} from "lucide-react";

const PROGRESS_COLS: { key: keyof LearnerProgressRow; label: string; sortable?: boolean }[] = [
  { key: "name", label: "Learner", sortable: true },
  { key: "department", label: "Department" },
  { key: "progress", label: "Progress", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "coursesCompleted", label: "Courses" },
  { key: "assignmentsCompleted", label: "Assignments" },
  { key: "lastActivity", label: "Last Activity", sortable: true },
];

function statValue(overview: ReturnType<typeof getProgrammeOverview>, overviewNull: boolean) {
  return {
    assigned: overviewNull ? 0 : overview!.assignedLearners,
    started: overviewNull ? 0 : overview!.startedLearners,
    completed: overviewNull ? 0 : overview!.completedLearners,
    completionRate: overviewNull ? 0 : overview!.completionRate,
    avgProgress: overviewNull ? 0 : overview!.averageProgress,
    avgCourseCompletion: overviewNull ? 0 : overview!.averageCourseCompletion,
    avgTime: overviewNull ? 0 : overview!.averageTimeToComplete,
  };
}

function ProgressBar({ value, size = "sm", color }: { value: number; size?: "sm" | "md"; color?: string }) {
  const barColor = color || (value >= 80 ? "bg-emerald-500" : value >= 40 ? "bg-primary-600" : "bg-amber-500");
  return (
    <div className={cn("flex items-center gap-2", size === "md" && "max-w-[200px]")}>
      <div className={cn("flex-1 rounded-full bg-surface-tertiary overflow-hidden", size === "sm" ? "h-1.5" : "h-2")}>
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-content-tertiary shrink-0">{value}%</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string; bg: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-content truncate">{value}</p>
        <p className="text-xs text-content-tertiary truncate">{label}</p>
        {sub && <p className="text-[10px] text-content-tertiary/70 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
    completed: { variant: "success", label: "Completed" },
    in_progress: { variant: "warning", label: "In Progress" },
    not_started: { variant: "default", label: "Not Started" },
    overdue: { variant: "danger", label: "Overdue" },
  };
  const s = map[status] || { variant: "default" as const, label: status };
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={cn("inline-block ml-1 text-[10px]", active ? "text-primary-600" : "text-content-tertiary/40")}>
      {dir === "asc" ? "▲" : "▼"}
    </span>
  );
}

export function ProgrammeAnalytics({ programmeId }: { programmeId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const hasAccess = useMemo(() => canViewProgrammeAnalytics(user, programmeId), [user, programmeId]);
  const programme = useMemo(() => getProgramme(programmeId), [programmeId]);

  const overview = useMemo(() => hasAccess ? getProgrammeOverview(programmeId) : null, [hasAccess, programmeId]);
  const rawLearners = useMemo(() => hasAccess ? getLearnerProgressData(programmeId) : [], [hasAccess, programmeId]);
  const courses = useMemo(() => hasAccess ? getCourseBreakdown(programmeId) : [], [hasAccess, programmeId]);
  const assignmentStats = useMemo(() => hasAccess ? getAssignmentAnalytics(programmeId) : [], [hasAccess, programmeId]);
  const timeline = useMemo(() => hasAccess ? getProgrammeTimeline(programmeId) : [], [hasAccess, programmeId]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<keyof LearnerProgressRow | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [expandedLearner, setExpandedLearner] = useState<string | null>(null);
  const perPage = 10;

  if (!programme) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <p className="text-content font-semibold">Programme not found</p>
        <p className="text-sm text-content-tertiary mt-1">The programme you are looking for does not exist.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Go Back
        </Button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
        <p className="text-content font-semibold">Access Denied</p>
        <p className="text-sm text-content-tertiary mt-1">You do not have permission to view analytics for this programme.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Go Back
        </Button>
      </div>
    );
  }

  const filtered = useMemo(() => {
    let data = [...rawLearners];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      data = data.filter((d) => d.status === statusFilter);
    }
    if (sortKey) {
      data.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
      });
    }
    return data;
  }, [rawLearners, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function handleSort(key: keyof LearnerProgressRow) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const overviewData = overview ? {
    assigned: overview.assignedLearners,
    started: overview.startedLearners,
    completed: overview.completedLearners,
    completionRate: overview.completionRate,
    avgProgress: overview.averageProgress,
    avgCourseCompletion: overview.averageCourseCompletion,
    avgTime: overview.averageTimeToComplete,
  } : {
    assigned: 0, started: 0, completed: 0, completionRate: 0,
    avgProgress: 0, avgCourseCompletion: 0, avgTime: 0,
  };

  const timelineTypeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    published: CheckCircle,
    assigned: Users,
    started: PlayCircle,
    completed: GraduationCap,
    submitted: FileText,
    programme_completed: Award,
  };

  const timelineTypeColor: Record<string, string> = {
    published: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    assigned: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    started: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    completed: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    submitted: "text-primary-600 bg-primary-50 dark:bg-primary-950/30",
    programme_completed: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
  };

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
    { value: "not_started", label: "Not Started" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-content">{overview?.name || programme.name}</h2>
          <p className="text-xs text-content-tertiary">Programme Analytics &amp; Insights</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatCard icon={Users} label="Assigned" value={overviewData.assigned} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard icon={UserCheck} label="Started" value={overviewData.started} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard icon={GraduationCap} label="Completed" value={overviewData.completed} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard icon={CheckCircle} label="Completion Rate" value={`${overviewData.completionRate}%`} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-950/30" sub={`${overviewData.completed} of ${overviewData.assigned}`} />
        <StatCard icon={TrendingUp} label="Avg Progress" value={`${overviewData.avgProgress}%`} color="text-cyan-600" bg="bg-cyan-50 dark:bg-cyan-950/30" />
        <StatCard icon={BookOpen} label="Avg Course Compl." value={`${overviewData.avgCourseCompletion}%`} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/30" />
        <StatCard icon={Clock} label="Avg Time to Complete" value={overviewData.avgTime > 0 ? `${overviewData.avgTime}d` : "—"} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30" />
      </div>

      {/* Learner Progress Section */}
      <Card>
        <div className="p-4 sm:p-5 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-content">Learner Progress</h3>
              <p className="text-xs text-content-tertiary">{filtered.length} learners</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-content-tertiary pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search learners..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="h-8 w-44 rounded-lg border border-border/50 bg-surface px-3 pl-8 text-xs text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-8 rounded-lg border border-border/50 bg-surface px-2 text-xs text-content focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/30">
                {PROGRESS_COLS.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "text-left px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-content select-none"
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.label}
                    {col.sortable && (
                      <SortIcon active={sortKey === col.key} dir={sortKey === col.key ? sortDir : "asc"} />
                    )}
                  </th>
                ))}
                <th className="text-right px-4 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={PROGRESS_COLS.length + 1} className="px-4 py-8 text-center text-sm text-content-tertiary">No learners found.</td>
                </tr>
              ) : (
                paged.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/30 text-xs font-bold text-primary-600">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-content truncate max-w-[160px]">{d.name}</p>
                          <p className="text-xs text-content-tertiary truncate max-w-[160px]">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-content-tertiary">{d.department}</td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <ProgressBar value={d.progress} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-content">{d.coursesCompleted}/{d.totalCourses}</td>
                    <td className="px-4 py-3 text-sm text-content">{d.assignmentsCompleted}/{d.totalAssignments}</td>
                    <td className="px-4 py-3 text-sm text-content-tertiary whitespace-nowrap">
                      {d.lastActivity ? new Date(d.lastActivity).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedLearner(expandedLearner === d.id ? null : d.id)}
                        className="text-content-tertiary hover:text-content transition-colors"
                      >
                        {expandedLearner === d.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <p className="text-xs text-content-tertiary">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={cn(
                      "flex h-7 min-w-[28px] items-center justify-center rounded-lg text-xs font-medium transition-colors",
                      p === page ? "bg-primary-600 text-white" : "text-content-secondary hover:bg-surface-secondary"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Course & Assignment Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Breakdown */}
        <Card>
          <div className="px-4 sm:px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-content">Course Breakdown</h3>
            <p className="text-xs text-content-tertiary">{courses.length} courses in this programme</p>
          </div>
          <div className="p-4 sm:p-5 space-y-3 max-h-[400px] overflow-y-auto">
            {courses.length === 0 ? (
              <p className="text-sm text-content-tertiary text-center py-4">No courses in this programme.</p>
            ) : (
              courses.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-border/50 bg-surface-secondary/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-content truncate max-w-[200px]" title={c.title}>{c.title}</p>
                    <Badge variant={c.completionRate >= 80 ? "success" : c.completionRate >= 40 ? "warning" : "default"} size="sm">
                      {c.completionRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-content-tertiary mb-2">
                    <span><strong className="text-content-secondary">{c.started}</strong> started</span>
                    <span><strong className="text-content-secondary">{c.completed}</strong> completed</span>
                  </div>
                  <ProgressBar value={c.averageProgress} color={c.completionRate >= 80 ? "bg-emerald-500" : c.completionRate >= 40 ? "bg-primary-600" : "bg-amber-500"} />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Assignment Analytics */}
        <Card>
          <div className="px-4 sm:px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-content">Assignment Analytics</h3>
            <p className="text-xs text-content-tertiary">{assignmentStats.length} assignments</p>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-secondary/30 sticky top-0">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Name</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Submitted</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Rate</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Pending</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {assignmentStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-content-tertiary">No assignments.</td>
                  </tr>
                ) : (
                  assignmentStats.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2.5 text-sm text-content truncate max-w-[160px]">{a.name}</td>
                      <td className="px-4 py-2.5 text-center text-sm text-content">{a.submitted}/{a.eligible}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge variant={a.submissionRate >= 80 ? "success" : a.submissionRate >= 40 ? "warning" : "danger"} size="sm">{a.submissionRate}%</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-amber-600">{a.pending}</td>
                      <td className="px-4 py-2.5 text-center text-sm text-red-600">{a.overdue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <div className="px-4 sm:px-5 py-4 border-b border-border/50">
          <h3 className="text-base font-semibold text-content">Programme Timeline</h3>
          <p className="text-xs text-content-tertiary">{timeline.length} events in chronological order</p>
        </div>
        <div className="p-4 sm:p-5 max-h-[480px] overflow-y-auto">
          {timeline.length === 0 ? (
            <p className="text-sm text-content-tertiary text-center py-4">No activity recorded yet.</p>
          ) : (
            <div className="relative space-y-0">
              {timeline.map((event, idx) => {
                const Icon = timelineTypeIcon[event.type] || CheckCircle;
                const colorClasses = timelineTypeColor[event.type] || "text-gray-600 bg-gray-50";
                return (
                  <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {idx < timeline.length - 1 && (
                      <div className="absolute left-[17px] top-8 bottom-0 w-px bg-border/50" />
                    )}
                    <div className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full", colorClasses)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-sm font-medium text-content">{event.title}</p>
                      <p className="text-xs text-content-tertiary">{event.description}</p>
                      <p className="text-[10px] text-content-tertiary/60 mt-0.5">
                        {new Date(event.time).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
