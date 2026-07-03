"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getProgramme, getProgrammeProgress, getProgrammeLearnerIds } from "@/lib/programmes";
import { getAssignmentsForProgramme } from "@/lib/learner-assignments";
import { getCourses } from "@/lib/courses";
import { getAssignments } from "@/lib/assignments";
import { getAllUsers } from "@/lib/auth";
import {
  ArrowLeft, Users, BookOpen, CheckCircle, Clock, Search,
  ChevronLeft, ChevronRight, FileSpreadsheet, FileText, FileDown,
  GraduationCap, PlayCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PROGRAMME_STATUS_LABELS, PROGRAMME_STATUS_COLORS } from "@/types";
import Link from "next/link";

interface ProgrammeProgressProps {
  programmeId: string;
  isSuperAdmin?: boolean;
}

const PAGE_SIZE = 10;

export function ProgrammeProgress({ programmeId, isSuperAdmin }: ProgrammeProgressProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedLearner, setExpandedLearner] = useState<string | null>(null);

  const programme = useMemo(() => getProgramme(programmeId), [programmeId]);
  const allCourses = useMemo(() => getCourses(), []);
  const allAssignments = useMemo(() => getAssignments(), []);
  const allUsers = useMemo(() => getAllUsers(), []);

  const learnerIds = useMemo(
    () => (programme ? getProgrammeLearnerIds(programme) : []),
    [programme]
  );

  const learnerData = useMemo(() => {
    if (!programme) return [];
    return learnerIds.map((lid) => {
      const l = allUsers.find((u) => u.id === lid);
      if (!l) return null;
      const records = getAssignmentsForProgramme(programme.id).filter((r) => r.learnerId === lid);
      const progress = getProgrammeProgress(lid, programme);
      const completedCourses = records.filter((r) => r.courseId && r.status === "completed").length;
      const totalCourses = programme.courseIds.length;
      const completedAssignments = records.filter((r) => r.assignmentId && r.status === "completed").length;
      const totalAssignments = programme.assignmentIds.length;
      const lastActivity = records.length > 0
        ? new Date(Math.max(...records.map((r) => new Date(r.lastActivity || r.assignedDate).getTime())))
        : null;
      const completionDate = records.some((r) => r.status === "completed")
        ? records.filter((r) => r.completedDate).map((r) => r.completedDate).sort().pop()
        : null;
      const isOverdue = records.some((r) => r.status === "overdue");
      const isCompleted = progress.progress >= 100;
      const isInProgress = progress.progress > 0 && !isCompleted;
      const progStatus = isOverdue ? "overdue" : isCompleted ? "completed" : isInProgress ? "in_progress" : "not_started";
      return {
        learner: l,
        records,
        progress,
        completedCourses,
        totalCourses,
        completedAssignments,
        totalAssignments,
        remainingCourses: totalCourses - completedCourses,
        remainingAssignments: totalAssignments - completedAssignments,
        lastActivity,
        completionDate,
        progStatus,
        isOverdue,
        isCompleted,
      };
    }).filter((d): d is NonNullable<typeof d> => d !== null);
  }, [programme, learnerIds, allUsers]);

  const filteredData = useMemo(() => {
    let result = learnerData;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.learner.name.toLowerCase().includes(q) || d.learner.email.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((d) => d.progStatus === statusFilter);
    }
    return result;
  }, [learnerData, search, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => {
    const total = learnerData.length;
    const completed = learnerData.filter((d) => d.isCompleted).length;
    const inProgress = learnerData.filter((d) => d.progStatus === "in_progress").length;
    const notStarted = learnerData.filter((d) => d.progStatus === "not_started").length;
    const overdue = learnerData.filter((d) => d.isOverdue).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalCoursesCompleted = learnerData.reduce((s, d) => s + d.completedCourses, 0);
    const totalAssignmentsCompleted = learnerData.reduce((s, d) => s + d.completedAssignments, 0);
    return { total, completed, inProgress, notStarted, overdue, completionRate, totalCoursesCompleted, totalAssignmentsCompleted };
  }, [learnerData]);

  if (!user || !programme) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <Link href={`/${user?.role || "admin"}/programmes`} className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Programmes
        </Link>
        <p className="text-content-secondary">Programme not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Back */}
      <Link href={`/${isSuperAdmin ? "admin" : "trainer"}/programmes`} className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Programmes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-content">{programme.name}</h1>
            <Badge variant="secondary" className={PROGRAMME_STATUS_COLORS[programme.status]}>
              {PROGRAMME_STATUS_LABELS[programme.status]}
            </Badge>
          </div>
          {programme.description && <p className="text-sm text-content-secondary mt-1">{programme.description}</p>}
        </div>

        {/* Export */}
        <div className="flex items-center gap-2">
          <Button variant="tertiary" size="sm" disabled title="CSV Export (coming soon)">
            <FileSpreadsheet className="h-4 w-4" /> CSV
          </Button>
          <Button variant="tertiary" size="sm" disabled title="Excel Export (coming soon)">
            <FileText className="h-4 w-4" /> Excel
          </Button>
          <Button variant="tertiary" size="sm" disabled title="PDF Export (coming soon)">
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Programme Information */}
      <Card variant="bordered" padding="lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-content-tertiary text-xs">Created by</span>
            <p className="text-content font-medium">{programme.createdBy || "—"}</p>
          </div>
          <div>
            <span className="text-content-tertiary text-xs">Published by</span>
            <p className="text-content font-medium">{programme.publishedBy || "—"}</p>
          </div>
          <div>
            <span className="text-content-tertiary text-xs">Assigned by</span>
            <p className="text-content font-medium">{programme.assignedBy || programme.publishedBy || "—"}</p>
          </div>
          <div>
            <span className="text-content-tertiary text-xs">Created</span>
            <p className="text-content font-medium">{new Date(programme.createdAt).toLocaleDateString()}</p>
          </div>
          {programme.publishedAt && (
            <div>
              <span className="text-content-tertiary text-xs">Published</span>
              <p className="text-content font-medium">{new Date(programme.publishedAt).toLocaleDateString()}</p>
            </div>
          )}
          {programme.endDate && (
            <div>
              <span className="text-content-tertiary text-xs">Due Date</span>
              <p className="text-content font-medium">{new Date(programme.endDate).toLocaleDateString()}</p>
            </div>
          )}
          {programme.completedAt && (
            <div>
              <span className="text-content-tertiary text-xs">Completed</span>
              <p className="text-content font-medium">{new Date(programme.completedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <SummaryCard icon={Users} label="Assigned" value={summary.total} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
        <SummaryCard icon={CheckCircle} label="Completed" value={summary.completed} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
        <SummaryCard icon={PlayCircle} label="In Progress" value={summary.inProgress} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
        <SummaryCard icon={Clock} label="Not Started" value={summary.notStarted} color="text-gray-500" bg="bg-gray-50 dark:bg-gray-950/30" />
        <SummaryCard icon={AlertTriangleIcon} label="Overdue" value={summary.overdue} color="text-red-600" bg="bg-red-50 dark:bg-red-950/30" />
        <SummaryCard icon={GraduationCap} label="Rate" value={`${summary.completionRate}%`} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
        <SummaryCard icon={BookOpen} label="Avg Score" value="—" color="text-teal-600" bg="bg-teal-50 dark:bg-teal-950/30" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            placeholder="Search learner..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-content outline-none focus:border-primary-500/50"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="not_started">Not Started</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Learners Table */}
      <Card variant="bordered" padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            <CardTitle>Learners ({filteredData.length})</CardTitle>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-tertiary disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-content-tertiary">{page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-tertiary disabled:opacity-30 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Learner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Progress</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Courses</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Assignments</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Last Activity</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {pagedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-content-tertiary">No learners found.</td>
                </tr>
              ) : (
                pagedData.map((d) => (
                  <>
                    <tr key={d.learner.id} className="hover:bg-surface-secondary/20 transition-colors cursor-pointer" onClick={() => setExpandedLearner(expandedLearner === d.learner.id ? null : d.learner.id)}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/30 text-xs font-bold text-primary-600">
                            {d.learner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-content">{d.learner.name}</p>
                            <p className="text-xs text-content-tertiary">{d.learner.categoryId ? `Dept: ${d.learner.categoryId}` : "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="flex-1 h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                            <div className={cn("h-full rounded-full", d.isCompleted ? "bg-emerald-500" : d.isOverdue ? "bg-red-500" : "bg-primary-600")} style={{ width: `${d.progress.progress}%` }} />
                          </div>
                          <span className="text-xs text-content-tertiary shrink-0">{d.progress.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={d.progStatus === "completed" ? "success" : d.progStatus === "in_progress" ? "warning" : d.progStatus === "overdue" ? "danger" : "default"} size="sm">
                          {d.progStatus === "in_progress" ? "In Progress" : d.progStatus === "not_started" ? "Not Started" : d.progStatus.charAt(0).toUpperCase() + d.progStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-content">{d.completedCourses}/{d.totalCourses}</span>
                        <span className="text-xs text-content-tertiary ml-1">({d.remainingCourses} left)</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-content">{d.completedAssignments}/{d.totalAssignments}</span>
                        <span className="text-xs text-content-tertiary ml-1">({d.remainingAssignments} left)</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-content-tertiary">{d.lastActivity ? d.lastActivity.toLocaleDateString() : "—"}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-content-tertiary hover:text-content transition-colors">
                          {expandedLearner === d.learner.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedLearner === d.learner.id && (
                      <tr key={`${d.learner.id}-timeline`}>
                        <td colSpan={7} className="px-5 py-4 bg-surface-secondary/10">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">Activity Timeline</p>
                            {d.completionDate && (
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                </div>
                                <span className="text-content-secondary">Programme completed on <strong className="text-content">{d.completionDate ? new Date(d.completionDate).toLocaleDateString() : ""}</strong></span>
                              </div>
                            )}
                            {d.records.filter((r) => r.status === "completed").map((r) => (
                              <div key={r.id} className="flex items-center gap-3 text-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                </div>
                                <span className="text-content-secondary">
                                  {r.courseId ? `Completed: ${allCourses.find((c) => c.id === r.courseId)?.title || "Course"}` :
                                   `Submitted: ${allAssignments.find((a) => a.id === r.assignmentId)?.name || "Assignment"}`}
                                  {r.completedDate && <strong className="text-content ml-1">on {new Date(r.completedDate as string).toLocaleDateString()}</strong>}
                                </span>
                              </div>
                            ))}
                            {d.records.filter((r) => r.firstOpened && r.status !== "completed").map((r) => (
                              <div key={r.id} className="flex items-center gap-3 text-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
                                  <PlayCircle className="h-3.5 w-3.5 text-amber-500" />
                                </div>
                                <span className="text-content-secondary">
                                  Started: {allCourses.find((c) => c.id === r.courseId)?.title || "Course"}
                                  <strong className="text-content ml-1">on {new Date(r.firstOpened as string).toLocaleDateString()}</strong>
                                </span>
                              </div>
                            ))}
                            {d.records.length === 0 && (
                              <p className="text-sm text-content-tertiary">No activity recorded yet.</p>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
                                <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                              </div>
                              <span className="text-content-secondary">Programme Assigned <strong className="text-content">on {new Date(d.records[0]?.assignedDate || programme.createdAt).toLocaleDateString()}</strong></span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold text-content truncate">{value}</p>
        <p className="text-[10px] text-content-tertiary truncate">{label}</p>
      </div>
    </div>
  );
}
