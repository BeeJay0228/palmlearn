"use client";

import { useMemo, Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-learner-progress";

import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardMetricsGrid } from "@/components/dashboard/dashboard-metrics-grid";
import { DashboardProgress } from "@/components/dashboard/dashboard-progress";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getAssignmentsForLearnerAll } from "@/lib/learner-assignments";
import { getProgrammes, getProgrammeProgress } from "@/lib/programmes";

const LearnerContinueLearning = dynamic(() => import("@/components/assignments/learner-assignments").then(m => m.LearnerContinueLearning), { ssr: false });
const LearnerMandatoryLearning = dynamic(() => import("@/components/assignments/learner-assignments").then(m => m.LearnerMandatoryLearning), { ssr: false });
const LearnerDueSoon = dynamic(() => import("@/components/assignments/learner-assignments").then(m => m.LearnerDueSoon), { ssr: false });
const LearnerCompleted = dynamic(() => import("@/components/assignments/learner-assignments").then(m => m.LearnerCompleted), { ssr: false });
const TodaysEvents = dynamic(() => import("@/components/events/learner-events").then(m => m.TodaysEvents), { ssr: false });
const UpcomingLiveSessions = dynamic(() => import("@/components/events/learner-events").then(m => m.UpcomingLiveSessions), { ssr: false });
const MissedEvents = dynamic(() => import("@/components/events/learner-events").then(m => m.MissedEvents), { ssr: false });
const CompletedEvents = dynamic(() => import("@/components/events/learner-events").then(m => m.CompletedEvents), { ssr: false });
import {
  BookOpen, Clock, Award, TrendingUp, PlayCircle, CheckCircle, Star,
  BarChart3, GraduationCap, Trophy, Target,
} from "lucide-react";

const recentActivity = [
  { id: "1", icon: PlayCircle, iconBg: "bg-blue-100 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400", title: "Course resumed", description: "Continued Advanced Mathematics - Module 4", time: "30m ago" },
  { id: "2", icon: CheckCircle, iconBg: "bg-emerald-100 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400", title: "Quiz completed", description: "Scored 90% on Data Structures quiz", time: "2h ago" },
  { id: "3", icon: Star, iconBg: "bg-amber-100 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400", title: "Achievement unlocked", description: "Completed 5 courses this month!", time: "1d ago" },
  { id: "4", icon: Award, iconBg: "bg-purple-100 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400", title: "Certificate earned", description: "Python for Data Science certification", time: "2d ago" },
];

export default function LearnerDashboard() {
  const { user } = useAuth();
  const { enrollments: apiEnrollments, loading: apiLoading } = useEnrollments(user?.id);
  const [localMetrics, setLocalMetrics] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!user) return;
    const allRecords = getAssignmentsForLearnerAll(user.id);
    const enrolledCourseIds = new Set(allRecords.map((r) => r.courseId).filter(Boolean));
    const enrolledCourses = enrolledCourseIds.size;
    const allProgrammes = getProgrammes();
    const assignedProgrammes = allProgrammes.filter((p) => {
      const progress = getProgrammeProgress(user.id, p);
      return progress.totalCourses > 0 || progress.totalAssignments > 0;
    });
    const programmesActive = assignedProgrammes.filter((p) =>
      p.status === "active" || (p.status !== "completed" && getProgrammeProgress(user.id, p).progress > 0 && getProgrammeProgress(user.id, p).progress < 100)
    );
    const programmesCompleted = assignedProgrammes.filter((p) =>
      p.status === "completed" || getProgrammeProgress(user.id, p).progress >= 100
    );
    const totalProgrammes = assignedProgrammes.length;
    const standaloneAssignments = allRecords.filter((r) => r.assignmentId && !r.campaignId);
    const assignedAssignments = standaloneAssignments.length;
    const completedAssignments = standaloneAssignments.filter((r) => r.status === "completed").length;
    const inProgressAssignments = standaloneAssignments.filter((r) => r.status === "in_progress").length;
    const completedCourses = allRecords.filter((r) => r.courseId && r.status === "completed").length;

    setLocalMetrics({
      enrolledCourses,
      totalProgrammes,
      programmesActive: programmesActive.length,
      programmesCompleted: programmesCompleted.length,
      completedCourses,
      assignedAssignments,
      completedAssignments,
      inProgressAssignments,
    });
  }, [user]);

  const metrics = useMemo(() => {
    if (!user) return null;

    const fromLocal = localMetrics || {
      enrolledCourses: 0, totalProgrammes: 0, programmesActive: 0,
      programmesCompleted: 0, completedCourses: 0, assignedAssignments: 0,
      completedAssignments: 0, inProgressAssignments: 0,
    };

    const enrolledCourseIds = new Set(apiEnrollments.map((e) => e.courseId));
    const apiCompleted = apiEnrollments.filter((e) => e.status === "completed").length;
    const apiInProgress = apiEnrollments.filter((e) => e.status === "in_progress").length;

    return {
      enrolledCourses: Math.max(enrolledCourseIds.size, fromLocal.enrolledCourses),
      totalProgrammes: fromLocal.totalProgrammes,
      programmesActive: fromLocal.programmesActive,
      programmesCompleted: fromLocal.programmesCompleted,
      completedCourses: Math.max(apiCompleted, fromLocal.completedCourses),
      assignedAssignments: fromLocal.assignedAssignments,
      completedAssignments: fromLocal.completedAssignments,
      inProgressAssignments: Math.max(apiInProgress, fromLocal.inProgressAssignments),
    };
  }, [user, apiEnrollments, localMetrics]);

  if (!user) return null;

  const m = metrics || {
    enrolledCourses: 0, totalProgrammes: 0, programmesActive: 0,
    programmesCompleted: 0, completedCourses: 0, assignedAssignments: 0,
    completedAssignments: 0, inProgressAssignments: 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome
        subtitle="Pick up where you left off. Your next breakthrough is just one lesson away."
        action={{ label: "Continue Learning", href: "/learner/continue-learning" }}
        metrics={[
          { label: "Programmes", value: m.totalProgrammes },
          { label: "Completed", value: m.completedCourses },
          { label: "Enrolled", value: m.enrolledCourses },
        ]}
      />

      <DashboardMetricsGrid
        items={[
          { label: "Assigned Programmes", value: m.totalProgrammes, icon: GraduationCap, color: "purple" },
          { label: "Active Programmes", value: m.programmesActive, icon: PlayCircle, color: "emerald" },
          { label: "Completed Programmes", value: m.programmesCompleted, icon: CheckCircle, color: "blue" },
          { label: "Assignments Done", value: m.completedAssignments, icon: Trophy, color: "amber" },
        ]}
      />

      <DashboardStats
        stats={[
          { title: "Enrolled Courses", value: m.enrolledCourses, icon: BookOpen, trend: { value: `${m.completedCourses} completed`, up: true }, color: "emerald" },
          { title: "Assigned Assignments", value: m.assignedAssignments, icon: Clock, trend: { value: `${m.completedAssignments} completed`, up: true }, color: "blue" },
          { title: "Courses Completed", value: m.completedCourses, icon: Award, trend: { value: "Keep going!", up: true }, color: "amber" },
          { title: "Active Programmes", value: m.programmesActive, icon: TrendingUp, trend: { value: `${m.programmesCompleted} completed`, up: true }, color: "purple" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardProgress
          title="Learning Progress"
          items={[
            { label: "Course Completion", value: m.completedCourses, max: Math.max(m.enrolledCourses, 1), icon: Target, variant: "default" },
            { label: "Assignments Completed", value: m.completedAssignments, max: Math.max(m.assignedAssignments, 1), icon: CheckCircle, variant: "success" },
          ]}
        />
        <DashboardActivity activities={recentActivity} title="Recent Activity" />
      </div>

      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <TodaysEvents onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      </Suspense>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <UpcomingLiveSessions onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      </Suspense>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <MissedEvents onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      </Suspense>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <CompletedEvents onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      </Suspense>

      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <LearnerMandatoryLearning />
      </Suspense>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <LearnerDueSoon />
      </Suspense>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <LearnerContinueLearning />
      </Suspense>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <LearnerCompleted />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <DashboardQuickActions
            title="Quick Links"
            actions={[
              { label: "Continue Learning", href: "/learner/continue-learning", icon: PlayCircle, color: "emerald" },
              { label: "My Courses", href: "/learner/my-courses", icon: BookOpen, color: "blue" },
              { label: "Certificates", href: "/learner/certificates", icon: Award, color: "amber" },
              { label: "Achievements", href: "/learner/achievements", icon: Trophy, color: "purple" },
            ]}
            columns={2}
          />
          <NotificationsWidget />
        </div>

        <div className="lg:col-span-2">
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                <CardTitle>Weekly Learning Activity</CardTitle>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex items-end justify-between gap-3 h-40 px-2">
                {[
                  { day: "Mon", minutes: 45 },
                  { day: "Tue", minutes: 70 },
                  { day: "Wed", minutes: 55 },
                  { day: "Thu", minutes: 85 },
                  { day: "Fri", minutes: 60 },
                  { day: "Sat", minutes: 30 },
                  { day: "Sun", minutes: 0 },
                ].map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] text-content-tertiary font-medium">{d.minutes}m</span>
                    <div className="w-full rounded-full bg-primary-100 dark:bg-primary-950/30 overflow-hidden relative" style={{ height: "100px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-700"
                        style={{ height: `${Math.max(d.minutes, 4)}%` }}
                      />
                    </div>
                    <span className="text-xs text-content-tertiary">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
