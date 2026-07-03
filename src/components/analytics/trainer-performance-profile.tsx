"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  getTrainingSummary,
  getTrainerProgrammePerformance,
  getTrainerLearnerPerformance,
  getTrainerAssignmentPerformance,
  getTrainerActivityTimeline,
} from "@/lib/trainer-analytics";
import { getAllUsers } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, BookOpen, Users, CheckCircle, FileText, Award,
  TrendingUp, Clock, GraduationCap, BarChart3,
  AlertTriangle, UserCheck, Edit3,
  Activity, Bell,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, bg }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string; bg: string }) {
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

function ProgressBar({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const barColor = value >= 80 ? "bg-emerald-500" : value >= 40 ? "bg-primary-600" : "bg-amber-500";
  return (
    <div className={cn("flex items-center gap-2", size === "md" && "max-w-[160px]")}>
      <div className={cn("flex-1 rounded-full bg-surface-tertiary overflow-hidden", size === "sm" ? "h-1.5" : "h-2")}>
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs text-content-tertiary shrink-0">{value}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "success" | "warning" | "danger" | "default" | "info"; label: string }> = {
    active: { variant: "success", label: "Active" },
    draft: { variant: "default", label: "Draft" },
    completed: { variant: "info", label: "Completed" },
    archived: { variant: "default", label: "Archived" },
    in_progress: { variant: "warning", label: "In Progress" },
    not_started: { variant: "default", label: "Not Started" },
    overdue: { variant: "danger", label: "Overdue" },
  };
  const s = map[status] || { variant: "default" as const, label: status };
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
}

export function TrainerPerformanceProfile({ trainerId }: { trainerId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const summary = useMemo(() => getTrainingSummary(trainerId), [trainerId]);
  const programmePerf = useMemo(() => getTrainerProgrammePerformance(trainerId), [trainerId]);
  const learnerPerf = useMemo(() => getTrainerLearnerPerformance(trainerId), [trainerId]);
  const assignmentPerf = useMemo(() => getTrainerAssignmentPerformance(trainerId), [trainerId]);
  const timeline = useMemo(() => getTrainerActivityTimeline(trainerId), [trainerId]);

  const allUsers = useMemo(() => getAllUsers(), []);
  const trainer = useMemo(() => allUsers.find((u) => u.id === trainerId), [allUsers, trainerId]);

  if (!trainer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
        <p className="text-content font-semibold">Trainer not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Go Back
        </Button>
      </div>
    );
  }

  const isMyPerformance = user?.id === trainerId;

  const timelineTypeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    created: BookOpen,
    published: CheckCircle,
    updated: Edit3,
    assigned: Users,
    course_completed: GraduationCap,
    submitted: FileText,
    programme_completed: Award,
    notification: Bell,
  };

  const timelineTypeColor: Record<string, string> = {
    created: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    published: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
    updated: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    assigned: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
    course_completed: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    submitted: "text-primary-600 bg-primary-50 dark:bg-primary-950/30",
    programme_completed: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
    notification: "text-gray-600 bg-gray-50 dark:bg-gray-950/30",
  };

  const role = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-content">{isMyPerformance ? "My Performance" : `${trainer.name}'s Performance`}</h2>
          <p className="text-xs text-content-tertiary">Trainer Performance Analytics</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-lg font-bold">
            {trainer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h3 className="text-lg font-bold text-content">{trainer.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">Trainer</Badge>
                <StatusBadge status={trainer.status || "active"} />
              </div>
            </div>
            <p className="text-sm text-content-secondary mt-0.5">{trainer.email}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-content-tertiary">
              <span>Department: <strong className="text-content-secondary">{trainer.categoryId || "—"}</strong></span>
              <span>Joined: <strong className="text-content-secondary">{new Date(trainer.createdAt).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Training Summary KPI Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-content-tertiary" />
          <h3 className="text-sm font-semibold text-content">Training Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          <StatCard icon={BookOpen} label="Programmes Created" value={summary.programmesCreated} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
          <StatCard icon={CheckCircle} label="Published" value={summary.publishedProgrammes} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <StatCard icon={Edit3} label="Draft" value={summary.draftProgrammes} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
          <StatCard icon={Users} label="Learners Assigned" value={summary.learnersAssigned} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/30" />
          <StatCard icon={UserCheck} label="Learners Active" value={summary.learnersActive} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <StatCard icon={GraduationCap} label="Learners Completed" value={summary.learnersCompleted} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
          <StatCard icon={TrendingUp} label="Avg Programme Compl." value={`${summary.averageProgrammeCompletion}%`} color="text-cyan-600" bg="bg-cyan-50 dark:bg-cyan-950/30" />
          <StatCard icon={BarChart3} label="Avg Learner Progress" value={`${summary.averageLearnerProgress}%`} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-950/30" />
          <StatCard icon={Award} label="Avg Assignment Score" value={summary.averageAssignmentScore > 0 ? `${summary.averageAssignmentScore}%` : "N/A"} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30" />
          <StatCard icon={CheckCircle} label="Programme Compl. Rate" value={`${summary.programmeCompletionRate}%`} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-950/30" />
        </div>
      </div>

      {/* Programme Performance */}
      <Card>
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-base font-semibold text-content">Programme Performance</h3>
          <p className="text-xs text-content-tertiary">{programmePerf.length} programme{programmePerf.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/30 sticky top-0">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Programme</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Assigned</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Started</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Completed</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Compl. %</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Avg Progress</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {programmePerf.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-content-tertiary">No programmes created yet.</td></tr>
              ) : (
                programmePerf.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5">
                      <p className="text-sm text-content truncate max-w-[180px]">{p.name}</p>
                      {p.publishedDate && <p className="text-[10px] text-content-tertiary">Published {new Date(p.publishedDate).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm text-content">{p.learnersAssigned}</td>
                    <td className="px-4 py-2.5 text-center text-sm text-content">{p.learnersStarted}</td>
                    <td className="px-4 py-2.5 text-center text-sm text-content">{p.learnersCompleted}</td>
                    <td className="px-4 py-2.5 text-center">{p.completionPercent}%</td>
                    <td className="px-4 py-2.5 max-w-[140px]"><ProgressBar value={p.averageProgress} /></td>
                    <td className="px-4 py-2.5 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/${role}/programmes/${p.id}/analytics`)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-tertiary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => router.push(`/${role}/programmes/${p.id}`)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
                          title="Edit Programme"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Learner + Assignment Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learner Performance */}
        <Card>
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-content">Learner Performance</h3>
            <p className="text-xs text-content-tertiary">{learnerPerf.length} learner{learnerPerf.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-secondary/30 sticky top-0">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Learner</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Programme</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Progress</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Submissions</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {learnerPerf.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-content-tertiary">No learners assigned yet.</td></tr>
                ) : (
                  learnerPerf.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-2.5">
                        <p className="text-sm text-content truncate max-w-[140px]">{l.name}</p>
                        <p className="text-xs text-content-tertiary truncate max-w-[140px]">{l.email}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-content-tertiary truncate max-w-[120px]">{l.programmeName}</td>
                      <td className="px-4 py-2.5 max-w-[120px]"><ProgressBar value={l.progress} /></td>
                      <td className="px-4 py-2.5 text-center text-sm text-content">{l.assignmentsSubmitted}/{l.assignmentsSubmitted + l.assignmentsPending}</td>
                      <td className="px-4 py-2.5 text-center"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => router.push(`/${role}/learners/${l.id}/profile`)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-tertiary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                          title="View Performance"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assignment Performance */}
        <Card>
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-content">Assignment Performance</h3>
            <p className="text-xs text-content-tertiary">{assignmentPerf.assignmentsCreated} assignments created</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard icon={FileText} label="Assignments Created" value={assignmentPerf.assignmentsCreated} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
              <StatCard icon={CheckCircle} label="Submitted" value={assignmentPerf.assignmentsSubmitted} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
              <StatCard icon={Clock} label="Pending" value={assignmentPerf.pendingAssignments} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
              <StatCard icon={AlertTriangle} label="Overdue" value={assignmentPerf.overdueAssignments} color="text-red-600" bg="bg-red-50 dark:bg-red-950/30" />
              <StatCard icon={Award} label="Avg Score" value={assignmentPerf.averageScore > 0 ? `${assignmentPerf.averageScore}%` : "N/A"} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30" />
              <StatCard icon={TrendingUp} label="Submission Rate" value={`${assignmentPerf.submissionRate}%`} color="text-cyan-600" bg="bg-cyan-50 dark:bg-cyan-950/30" />
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-content-tertiary" />
            <h3 className="text-base font-semibold text-content">Activity Timeline</h3>
            <span className="text-xs text-content-tertiary ml-auto">{timeline.length} events</span>
          </div>
        </div>
        <div className="p-5 max-h-[480px] overflow-y-auto">
          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-content-tertiary/40 mx-auto mb-2" />
              <p className="text-sm text-content-tertiary">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              {timeline.slice(0, 40).map((event, idx) => {
                const Icon = timelineTypeIcon[event.type] || CheckCircle;
                const colorClasses = timelineTypeColor[event.type] || "text-gray-600 bg-gray-50 dark:bg-gray-950/30";
                return (
                  <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {idx < Math.min(timeline.length, 40) - 1 && (
                      <div className="absolute left-[17px] top-8 bottom-0 w-px bg-border/50" />
                    )}
                    <div className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full", colorClasses)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="text-sm font-medium text-content">{event.title}</p>
                      <p className="text-xs text-content-tertiary">{event.description}</p>
                      <p className="text-[10px] text-content-tertiary/60 mt-0.5">
                        {new Date(event.time).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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


