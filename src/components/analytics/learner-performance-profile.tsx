"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  canViewLearnerProfile,
  getLearnerProfile,
  getLearnerLearningSummary,
  getLearnerProgrammes,
  getLearnerCourseHistory,
  getLearnerAssignmentHistory,
  getLearnerActivityTimeline,
  getLearnerEngagementMetrics,
  getLearnerNotificationHistory,
  type LearnerProgramme,
  type CourseHistoryItem,
  type AssignmentHistoryItem,
  type ActivityTimelineEvent,
} from "@/lib/learner-analytics";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Users, BookOpen, CheckCircle, FileText, Award,
  TrendingUp, Clock, CalendarDays, UserCheck, UserX, GraduationCap,
  AlertTriangle, PlayCircle, MessageSquare, Bell, Search,
  BarChart3, Mail,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, bg, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string; bg: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold text-content truncate">{value}</p>
        <p className="text-[10px] text-content-tertiary truncate">{label}</p>
        {sub && <p className="text-[9px] text-content-tertiary/60 truncate">{sub}</p>}
      </div>
    </div>
  );
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "success" | "warning" | "danger" | "default"; label: string }> = {
    completed: { variant: "success", label: "Completed" },
    in_progress: { variant: "warning", label: "In Progress" },
    not_started: { variant: "default", label: "Not Started" },
    overdue: { variant: "danger", label: "Overdue" },
    active: { variant: "success", label: "Active" },
    inactive: { variant: "danger", label: "Inactive" },
  };
  const s = map[status] || { variant: "default" as const, label: status };
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>;
}

function ProgrammeCard({ programme }: { programme: LearnerProgramme }) {
  const router = useRouter();
  const role = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "admin";

  return (
    <div className="p-4 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-content truncate">{programme.name}</p>
          <p className="text-xs text-content-tertiary mt-0.5">Assigned: {new Date(programme.assignedDate).toLocaleDateString()}</p>
        </div>
        <StatusBadge status={programme.status} />
      </div>
      {programme.dueDate && (
        <p className="text-xs text-content-tertiary mb-2">Due: {new Date(programme.dueDate).toLocaleDateString()}</p>
      )}
      <ProgressBar value={programme.progress} size="md" />
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
        <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={() => router.push(`/${role}/programmes/${programme.id}`)}>
          <BookOpen className="h-3 w-3 mr-1" /> Open
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={() => router.push(`/${role}/programmes/${programme.id}/analytics`)}>
          <BarChart3 className="h-3 w-3 mr-1" /> Analytics
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={() => router.push(`/${role}/programmes/${programme.id}/progress`)}>
          <Users className="h-3 w-3 mr-1" /> Progress
        </Button>
      </div>
    </div>
  );
}

export function LearnerPerformanceProfile({ learnerId }: { learnerId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const hasAccess = useMemo(() => canViewLearnerProfile(user, learnerId), [user, learnerId]);
  const profile = useMemo(() => hasAccess ? getLearnerProfile(learnerId) : null, [hasAccess, learnerId]);
  const summary = useMemo(() => hasAccess ? getLearnerLearningSummary(learnerId) : null, [hasAccess, learnerId]);
  const programmes = useMemo(() => hasAccess ? getLearnerProgrammes(learnerId) : [], [hasAccess, learnerId]);
  const courses = useMemo(() => hasAccess ? getLearnerCourseHistory(learnerId) : [], [hasAccess, learnerId]);
  const assignments = useMemo(() => hasAccess ? getLearnerAssignmentHistory(learnerId) : [], [hasAccess, learnerId]);
  const timeline = useMemo(() => hasAccess ? getLearnerActivityTimeline(learnerId) : [], [hasAccess, learnerId]);
  const engagement = useMemo(() => hasAccess ? getLearnerEngagementMetrics(learnerId) : null, [hasAccess, learnerId]);
  const notifications = useMemo(() => hasAccess ? getLearnerNotificationHistory(learnerId) : [], [hasAccess, learnerId]);

  if (!hasAccess || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
        <p className="text-content font-semibold">{!profile ? "Learner not found" : "Access Denied"}</p>
        <p className="text-sm text-content-tertiary mt-1">
          {!profile ? "This learner does not exist." : "You do not have permission to view this profile."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Go Back
        </Button>
      </div>
    );
  }

  const timelineTypeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    assigned: Users,
    started: PlayCircle,
    completed: GraduationCap,
    submitted: FileText,
    programme_completed: Award,
  };

  const timelineTypeColor: Record<string, string> = {
    assigned: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    started: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    completed: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    submitted: "text-primary-600 bg-primary-50 dark:bg-primary-950/30",
    programme_completed: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
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
          <h2 className="text-xl font-bold text-content">Learner Performance Profile</h2>
          <p className="text-xs text-content-tertiary">Complete training record for {profile.name}</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xl font-bold">
            {profile.avatar || profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h3 className="text-lg font-bold text-content">{profile.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="info" size="sm">Learner</Badge>
                <StatusBadge status={profile.status} />
              </div>
            </div>
            <p className="text-sm text-content-secondary mt-0.5">{profile.email}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-content-tertiary">
              <span>Department: <strong className="text-content-secondary">{profile.department}</strong></span>
              <span>Joined: <strong className="text-content-secondary">{new Date(profile.dateJoined).toLocaleDateString()}</strong></span>
              <span>Trainer: <strong className="text-content-secondary">{profile.trainerAssigned}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Summary KPI Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-content-tertiary" />
          <h3 className="text-sm font-semibold text-content">Learning Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <StatCard icon={BookOpen} label="Programmes Assigned" value={summary?.programmesAssigned ?? 0} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-950/30" />
          <StatCard icon={PlayCircle} label="Programmes Started" value={summary?.programmesStarted ?? 0} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
          <StatCard icon={GraduationCap} label="Programmes Completed" value={summary?.programmesCompleted ?? 0} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <StatCard icon={BookOpen} label="Courses Assigned" value={summary?.coursesAssigned ?? 0} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/30" />
          <StatCard icon={CheckCircle} label="Courses Completed" value={summary?.coursesCompleted ?? 0} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <StatCard icon={FileText} label="Assignments Assigned" value={summary?.assignmentsAssigned ?? 0} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-950/30" />
          <StatCard icon={CheckCircle} label="Assignments Submitted" value={summary?.assignmentsSubmitted ?? 0} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/30" />
          <StatCard icon={Clock} label="Assignments Overdue" value={summary?.assignmentsOverdue ?? 0} color="text-red-600" bg="bg-red-50 dark:bg-red-950/30" />
          <StatCard icon={Award} label="Avg Programme Progress" value={`${summary?.averageProgrammeProgress ?? 0}%`} color="text-cyan-600" bg="bg-cyan-50 dark:bg-cyan-950/30" />
          <StatCard icon={Award} label="Avg Assignment Score" value="N/A" color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/30" />
          <StatCard icon={Award} label="Certificates Earned" value={summary?.certificatesEarned ?? 0} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-950/30" />
          <StatCard icon={Award} label="Achievements" value="0" color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/30" />
        </div>
      </div>

      {/* Current Training Programmes */}
      <Card>
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-content">Current Training Programmes</h3>
              <p className="text-xs text-content-tertiary">{programmes.length} programme{programmes.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
        <div className={cn("p-5", programmes.length > 0 && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")}>
          {programmes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-content-tertiary/40 mx-auto mb-2" />
              <p className="text-sm text-content-tertiary">No programmes assigned yet.</p>
            </div>
          ) : (
            programmes.map((p) => <ProgrammeCard key={p.id} programme={p} />)
          )}
        </div>
      </Card>

      {/* Course & Assignment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course History */}
        <Card>
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-content">Course History</h3>
            <p className="text-xs text-content-tertiary">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-secondary/30 sticky top-0">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Course</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Programme</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Progress</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {courses.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-content-tertiary">No courses taken yet.</td></tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2.5">
                        <p className="text-sm text-content truncate max-w-[140px]">{c.title}</p>
                        {c.startedDate && <p className="text-[10px] text-content-tertiary">Started {new Date(c.startedDate).toLocaleDateString()}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-content-tertiary truncate max-w-[120px]">{c.programme}</td>
                      <td className="px-4 py-2.5 text-center"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-2.5 max-w-[120px]"><ProgressBar value={c.completionPercent} /></td>
                      <td className="px-4 py-2.5 text-center text-xs text-content-tertiary whitespace-nowrap">{Math.floor(c.timeSpent / 60)}h {c.timeSpent % 60}m</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assignment History */}
        <Card>
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-base font-semibold text-content">Assignment History</h3>
            <p className="text-xs text-content-tertiary">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-secondary/30 sticky top-0">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Assignment</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Programme</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Score</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {assignments.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-content-tertiary">No assignments yet.</td></tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2.5 text-sm text-content truncate max-w-[140px]">{a.name}</td>
                      <td className="px-4 py-2.5 text-xs text-content-tertiary truncate max-w-[120px]">{a.programme}</td>
                      <td className="px-4 py-2.5 text-center"><StatusBadge status={a.status} /></td>
                      <td className="px-4 py-2.5 text-center text-sm text-content">{a.passed === true ? <span className="text-emerald-600 font-medium">Pass</span> : a.passed === false ? <span className="text-red-600 font-medium">Fail</span> : "—"}</td>
                      <td className="px-4 py-2.5 text-center text-xs text-content-tertiary whitespace-nowrap">{a.submissionDate ? new Date(a.submissionDate).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Engagement Metrics + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <div className="px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-content-tertiary" />
              <h3 className="text-base font-semibold text-content">Engagement Metrics</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: "Last Activity", value: engagement?.lastActivity ? new Date(engagement.lastActivity).toLocaleDateString() : "—", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                { icon: PlayCircle, label: "Last Learning Activity", value: engagement?.lastLearningActivity ? new Date(engagement.lastLearningActivity).toLocaleDateString() : "—", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                { icon: Clock, label: "Daily Learning Time", value: `${Math.floor((engagement?.dailyLearningTime ?? 0) / 60)}h ${(engagement?.dailyLearningTime ?? 0) % 60}m`, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                { icon: CalendarDays, label: "Weekly Learning Time", value: `${Math.floor((engagement?.weeklyLearningTime ?? 0) / 60)}h ${(engagement?.weeklyLearningTime ?? 0) % 60}m`, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
                { icon: CalendarDays, label: "Monthly Learning Time", value: `${Math.floor((engagement?.monthlyLearningTime ?? 0) / 60)}h ${(engagement?.monthlyLearningTime ?? 0) % 60}m`, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
                { icon: TrendingUp, label: "Learning Streak", value: `${engagement?.learningStreak ?? 0} days`, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
              ].map((item) => (
                <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} color={item.color} bg={item.bg} />
              ))}
            </div>
          </div>
        </Card>

        {/* Learning Activity Timeline */}
        <Card>
          <div className="px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-content-tertiary" />
              <h3 className="text-base font-semibold text-content">Learning Activity Timeline</h3>
            </div>
          </div>
          <div className="p-5 max-h-[420px] overflow-y-auto">
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-content-tertiary/40 mx-auto mb-2" />
                <p className="text-sm text-content-tertiary">No activity recorded yet.</p>
              </div>
            ) : (
              <div className="relative space-y-0">
                {timeline.slice(0, 30).map((event, idx) => {
                  const Icon = timelineTypeIcon[event.type] || CheckCircle;
                  const colorClasses = timelineTypeColor[event.type] || "text-gray-600 bg-gray-50";
                  return (
                    <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {idx < Math.min(timeline.length, 30) - 1 && (
                        <div className="absolute left-[17px] top-8 bottom-0 w-px bg-border/50" />
                      )}
                      <div className={cn("flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full", colorClasses)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="text-sm font-medium text-content">{event.title}</p>
                        <p className="text-xs text-content-tertiary">{event.description}</p>
                        <p className="text-[10px] text-content-tertiary/60 mt-0.5">{formatTimeAgo(event.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Notification History */}
      <Card>
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-content-tertiary" />
            <h3 className="text-base font-semibold text-content">Notification History</h3>
            <span className="text-xs text-content-tertiary ml-auto">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/30 sticky top-0">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Notification</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Type</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {notifications.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-content-tertiary">No notifications yet.</td></tr>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <tr key={n.id} className={cn(!n.read && "bg-primary-50/30 dark:bg-primary-950/10")}>
                    <td className="px-4 py-2.5">
                      <p className={cn("text-sm truncate max-w-[240px]", n.read ? "text-content-secondary" : "text-content font-medium")}>{n.title}</p>
                      <p className="text-xs text-content-tertiary truncate max-w-[240px]">{n.message}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-content-tertiary capitalize">{n.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex items-center gap-1 text-xs", n.read ? "text-content-tertiary" : "text-primary-600 font-medium")}>
                        {n.read ? "Read" : "New"}
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-content-tertiary whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-base font-semibold text-content">Quick Actions</h3>
        </div>
        <div className="p-5 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push(`/${role}/programmes`)}>
            <BookOpen className="h-4 w-4 mr-1.5" /> View Training Programmes
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${role}/messages?userId=${learnerId}`)}>
            <Mail className="h-4 w-4 mr-1.5" /> Send Reminder
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${role}/programmes?assign=${learnerId}`)}>
            <BookOpen className="h-4 w-4 mr-1.5" /> Assign Programme
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${role}/notifications?userId=${learnerId}`)}>
            <Bell className="h-4 w-4 mr-1.5" /> View Notifications
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/${role}/assignments?learnerId=${learnerId}`)}>
            <FileText className="h-4 w-4 mr-1.5" /> View Assignments
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Return to Learner List
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
