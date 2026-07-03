"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProgrammes, getProgrammeProgress, getProgrammeLearnerIds } from "@/lib/programmes";
import { getAssignmentsForLearnerAll, getAssignmentsForProgramme } from "@/lib/learner-assignments";
import { getAllUsers } from "@/lib/auth";
import {
  BarChart3, BookOpen, CheckCircle, Clock, Users,
  FileSpreadsheet, FileText, FileDown, Search, Filter,
  GraduationCap, TrendingUp, AlertTriangle, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TrainingReportsProps {
  isSuperAdmin?: boolean;
}

export function TrainingReports({ isSuperAdmin }: TrainingReportsProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [programmeFilter, setProgrammeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const allUsers = useMemo(() => getAllUsers(), []);
  const allProgrammes = useMemo(() => getProgrammes(), []);


  const learners = useMemo(() => allUsers.filter((u) => u.role === "learner"), [allUsers]);

  const scopedProgrammes = useMemo(() => {
    if (isSuperAdmin || !user) return allProgrammes;
    return allProgrammes.filter(
      (p) => p.createdBy === user.id || p.assignedBy === user.id
    );
  }, [allProgrammes, isSuperAdmin, user]);

  const programmeIds = useMemo(() => scopedProgrammes.map((p) => p.id), [scopedProgrammes]);

  const scopedLearners = useMemo(() => {
    if (isSuperAdmin || programmeIds.length === 0) return learners;
    const assignedIds = new Set<string>();
    for (const pid of programmeIds) {
      const p = allProgrammes.find((x) => x.id === pid);
      if (p) getProgrammeLearnerIds(p).forEach((lid) => assignedIds.add(lid));
    }
    return learners.filter((l) => assignedIds.has(l.id));
  }, [isSuperAdmin, programmeIds, learners, allProgrammes]);

  const allLearnerRecords = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getAssignmentsForLearnerAll>>();
    for (const l of scopedLearners) {
      map.set(l.id, getAssignmentsForLearnerAll(l.id));
    }
    return map;
  }, [scopedLearners]);

  const learnerProgrammeData = useMemo(() => {
    const data: { learnerId: string; programmeId: string; progress: number; completed: boolean; overdue: boolean }[] = [];
    for (const lid of scopedLearners.map((l) => l.id)) {
      for (const p of scopedProgrammes) {
        const isAssigned = getProgrammeLearnerIds(p).includes(lid);
        if (!isAssigned) continue;
        const records = getAssignmentsForProgramme(p.id).filter((r) => r.learnerId === lid);
        const totalCourses = p.courseIds.length;
        const totalAssignments = p.assignmentIds.length;
        const totalItems = totalCourses + totalAssignments;
        const completedItems = records.filter((r) => r.status === "completed").length;
        const progressVal = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        const hasOverdue = records.some((r) => r.status === "overdue");
        data.push({
          learnerId: lid,
          programmeId: p.id,
          progress: progressVal,
          completed: progressVal >= 100,
          overdue: hasOverdue,
        });
      }
    }
    return data;
  }, [scopedLearners, scopedProgrammes]);

  const learnersWithStatus = useMemo(() => {
    return scopedLearners.map((l) => {
      const records = allLearnerRecords.get(l.id) || [];
      const anyCourseRecord = records.filter((r) => r.courseId);
      const completed = anyCourseRecord.length > 0 && anyCourseRecord.every((r) => r.status === "completed");
      const inProgress = anyCourseRecord.some((r) => r.status === "in_progress");
      const overdue = records.some((r) => r.status === "overdue");
      const lpData = learnerProgrammeData.filter((d) => d.learnerId === l.id);
      const lpCompleted = lpData.filter((d) => d.completed).length;
      const lpTotal = lpData.length;
      return {
        ...l,
        records,
        programmeProgresses: lpData,
        lpCompleted,
        lpTotal,
        status: overdue ? "overdue" : completed ? "completed" : inProgress ? "in_progress" : "not_started",
      };
    });
  }, [scopedLearners, allLearnerRecords, learnerProgrammeData]);

  const activeLearners = learnersWithStatus.filter((l) => l.status === "in_progress");
  const completedLearners = learnersWithStatus.filter((l) => l.status === "completed");
  const notStartedLearners = learnersWithStatus.filter((l) => l.status === "not_started");
  const overdueLearners = learnersWithStatus.filter((l) => l.status === "overdue");

  const totalCoursesCompleted = useMemo(() => {
    let count = 0;
    for (const [, records] of allLearnerRecords) {
      count += records.filter((r) => r.courseId && r.status === "completed").length;
    }
    return count;
  }, [allLearnerRecords]);

  const totalAssignmentsCompleted = useMemo(() => {
    let count = 0;
    for (const [, records] of allLearnerRecords) {
      count += records.filter((r) => r.assignmentId && r.status === "completed").length;
    }
    return count;
  }, [allLearnerRecords]);

  const programmeCompletionRate = useMemo(() => {
    const total = scopedProgrammes.length;
    if (total === 0) return 0;
    const completed = scopedProgrammes.filter((p) => p.status === "completed").length;
    return Math.round((completed / total) * 100);
  }, [scopedProgrammes]);

  const averageProgrammeProgress = useMemo(() => {
    const progresses = scopedLearners.flatMap((l) => {
      return scopedProgrammes.map((p) => {
        const progress = getProgrammeProgress(l.id, p);
        return progress.progress;
      });
    });
    if (progresses.length === 0) return 0;
    return Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length);
  }, [scopedLearners, scopedProgrammes]);

  const filteredLearners = useMemo(() => {
    let result = learnersWithStatus;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (programmeFilter !== "all") {
      result = result.filter((l) =>
        l.programmeProgresses.some((d) => d.programmeId === programmeFilter)
      );
    }
    return result;
  }, [learnersWithStatus, search, statusFilter, programmeFilter]);

  const adminMetrics = useMemo(() => {
    if (!isSuperAdmin) return null;
    return {
      totalProgrammes: allProgrammes.length,
      publishedProgrammes: allProgrammes.filter((p) => p.status === "active").length,
      draftProgrammes: allProgrammes.filter((p) => p.status === "draft").length,
      totalLearners: learners.length,
      activeLearners: activeLearners.length,
      notStartedLearners: notStartedLearners.length,
      inProgressLearners: activeLearners.length,
      completedLearners: completedLearners.length,
      completionRate: learners.length > 0 ? Math.round((completedLearners.length / learners.length) * 100) : 0,
      totalCoursesCompleted,
      totalAssignmentsCompleted,
      averageProgrammeProgress,
      overdueLearners: overdueLearners.length,
    };
  }, [isSuperAdmin, allProgrammes, learners, activeLearners, notStartedLearners, completedLearners, overdueLearners, totalCoursesCompleted, totalAssignmentsCompleted, averageProgrammeProgress]);

  const trainerMetrics = useMemo(() => {
    if (isSuperAdmin) return null;
    const uniqueLearners = scopedLearners.length;
    const aLearners = activeLearners.length;
    const cLearners = completedLearners.length;
    const avgCompletion = uniqueLearners > 0
      ? Math.round((cLearners / uniqueLearners) * 100)
      : 0;
    return {
      assignedLearners: uniqueLearners,
      activeLearners: aLearners,
      completedLearners: cLearners,
      averageCompletion: avgCompletion,
      programmeCompletionRate,
      overdueLearners: overdueLearners.length,
    };
  }, [isSuperAdmin, scopedLearners, activeLearners, completedLearners, programmeCompletionRate, overdueLearners]);


  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content">Training Reports</h1>
          <p className="text-sm text-content-secondary mt-1">
            {isSuperAdmin
              ? "Monitor learner engagement, progress and completion across all programmes."
              : "View progress and completion data for your training programmes."}
          </p>
        </div>

        {/* Export buttons */}
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

      {/* Summary Cards */}
      {isSuperAdmin && adminMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          <SummaryCard icon={GraduationCap} label="Total Programmes" value={adminMetrics.totalProgrammes} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
          <SummaryCard icon={CheckCircle} label="Published" value={adminMetrics.publishedProgrammes} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <SummaryCard icon={Clock} label="Draft" value={adminMetrics.draftProgrammes} color="text-gray-600" bg="bg-gray-50 dark:bg-gray-950/30" />
          <SummaryCard icon={Users} label="Total Learners" value={adminMetrics.totalLearners} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
          <SummaryCard icon={TrendingUp} label="Active Learners" value={adminMetrics.activeLearners} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
          <SummaryCard icon={CheckCircle} label="Completed" value={adminMetrics.completedLearners} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <SummaryCard icon={AlertTriangle} label="Overdue" value={adminMetrics.overdueLearners} color="text-red-600" bg="bg-red-50 dark:bg-red-950/30" />
          <SummaryCard icon={BarChart3} label="Completion Rate" value={`${adminMetrics.completionRate}%`} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
          <SummaryCard icon={BookOpen} label="Courses Done" value={adminMetrics.totalCoursesCompleted} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
          <SummaryCard icon={BookOpen} label="Assignments Done" value={adminMetrics.totalAssignmentsCompleted} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-950/30" />
          <SummaryCard icon={TrendingUp} label="Avg Progress" value={`${adminMetrics.averageProgrammeProgress}%`} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/30" />
          <SummaryCard icon={Users} label="Not Started" value={adminMetrics.notStartedLearners} color="text-gray-500" bg="bg-gray-50 dark:bg-gray-950/30" />
        </div>
      )}

      {!isSuperAdmin && trainerMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard icon={Users} label="Assigned Learners" value={trainerMetrics.assignedLearners} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
          <SummaryCard icon={TrendingUp} label="Active Learners" value={trainerMetrics.activeLearners} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
          <SummaryCard icon={CheckCircle} label="Completed" value={trainerMetrics.completedLearners} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <SummaryCard icon={BarChart3} label="Avg Completion" value={`${trainerMetrics.averageCompletion}%`} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
          <SummaryCard icon={GraduationCap} label="Programme Rate" value={`${trainerMetrics.programmeCompletionRate}%`} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/30" />
          <SummaryCard icon={AlertTriangle} label="Overdue" value={trainerMetrics.overdueLearners} color="text-red-600" bg="bg-red-50 dark:bg-red-950/30" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            placeholder="Search learner or programme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors"
        >
          <Filter className="h-4 w-4" /> Filters <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-2xl border border-border/50 bg-surface">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-content-tertiary">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-content outline-none focus:border-primary-500/50"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-content-tertiary">Programme</label>
            <select
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-content outline-none focus:border-primary-500/50"
            >
              <option value="all">All Programmes</option>
              {scopedProgrammes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Learners Table */}
      <Card variant="bordered" padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            <CardTitle>Learners ({filteredLearners.length})</CardTitle>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Learner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Progress</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Programmes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Last Activity</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-content-tertiary">No learners found.</td>
                </tr>
              ) : (
                filteredLearners.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-secondary/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/30 text-xs font-bold text-primary-600">
                          {l.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-content">{l.name}</p>
                          <p className="text-xs text-content-tertiary">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={
                        l.status === "completed" ? "success" :
                        l.status === "in_progress" ? "warning" :
                        l.status === "overdue" ? "danger" : "default"
                      } size="sm">
                        {l.status === "in_progress" ? "In Progress" :
                         l.status === "not_started" ? "Not Started" :
                         l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 max-w-[140px]">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", l.status === "completed" ? "bg-emerald-500" : l.status === "overdue" ? "bg-red-500" : "bg-primary-600")}
                            style={{ width: `${l.lpTotal > 0 ? Math.round((l.lpCompleted / l.lpTotal) * 100) : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-content-tertiary shrink-0">
                          {l.lpTotal > 0 ? Math.round((l.lpCompleted / l.lpTotal) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-content">{l.lpCompleted}/{l.lpTotal}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-content-tertiary">
                        {l.records.length > 0
                          ? new Date(Math.max(...l.records.map((r) => new Date(r.lastActivity || r.assignedDate).getTime()))).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {l.lpTotal > 0 && (
                        <Link
                          href={`/${isSuperAdmin ? "admin" : "trainer"}/programmes/${l.programmeProgresses[0]?.programmeId}/progress`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          View Progress
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Programme Summary */}
      <Card variant="bordered" padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary-600" />
            <CardTitle>Programmes ({scopedProgrammes.length})</CardTitle>
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {scopedProgrammes.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-content-tertiary">No programmes found.</div>
          ) : (
            scopedProgrammes.map((p) => {
              const pLearners = scopedLearners.filter((l) => getProgrammeLearnerIds(p).includes(l.id));
              const pData = learnerProgrammeData.filter((d) => d.programmeId === p.id);
              const pCompleted = pData.filter((d) => d.completed).length;
              const pInProgress = pData.filter((d) => d.progress > 0 && !d.completed).length;
              const pNotStarted = pData.filter((d) => d.progress === 0).length;
              const pOverdue = pData.filter((d) => d.overdue).length;
              const pCompletionRate = pLearners.length > 0 ? Math.round((pCompleted / pLearners.length) * 100) : 0;
              return (
                <div key={p.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-surface-secondary/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-content">{p.name}</p>
                      <Badge variant="secondary" size="sm">{p.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-content-tertiary">
                      <span>{pLearners.length} learners</span>
                      <span>{p.courseIds.length} courses</span>
                      <span>{p.assignmentIds.length} assignments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-600">{pCompleted}</p>
                      <p className="text-content-tertiary">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-amber-600">{pInProgress}</p>
                      <p className="text-content-tertiary">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-500">{pNotStarted}</p>
                      <p className="text-content-tertiary">Not Started</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-red-600">{pOverdue}</p>
                      <p className="text-content-tertiary">Overdue</p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-bold text-content">{pCompletionRate}%</p>
                      <p className="text-content-tertiary">Rate</p>
                    </div>
                  </div>
                  <Link
                    href={`/${isSuperAdmin ? "admin" : "trainer"}/programmes/${p.id}/progress`}
                    className="shrink-0 text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                  >
                    View Progress
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
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
