"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LearnerContinueLearning, LearnerMandatoryLearning, LearnerDueSoon, LearnerCompleted } from "@/components/assignments/learner-assignments";
import { TodaysEvents, UpcomingLiveSessions, MissedEvents, CompletedEvents } from "@/components/events/learner-events";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, CheckCircle, Star, Trophy, ChevronRight, Sparkles, BarChart3, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssignmentsForLearner, getAssignmentsForLearnerAll } from "@/lib/learner-assignments";
import { getProgrammes, getProgrammeProgress } from "@/lib/programmes";
import { getCourses } from "@/lib/courses";

const recentActivity = [
  { id: "1", icon: PlayCircle, iconBg: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400", title: "Course resumed", description: "Continued Advanced Mathematics - Module 4", time: "30m ago" },
  { id: "2", icon: CheckCircle, iconBg: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400", title: "Quiz completed", description: "Scored 90% on Data Structures quiz", time: "2h ago" },
  { id: "3", icon: Star, iconBg: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400", title: "Achievement unlocked", description: "Completed 5 courses this month!", time: "1d ago" },
  { id: "4", icon: Award, iconBg: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400", title: "Certificate earned", description: "Python for Data Science certification", time: "2d ago" },
];

export default function LearnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const metrics = useMemo(() => {
    if (!user) return null;
    const allRecords = getAssignmentsForLearnerAll(user.id);
    const standaloneRecords = getAssignmentsForLearner(user.id);

    const courses = getCourses();

    // Enrolled courses (any record with a courseId)
    const enrolledCourseIds = new Set(allRecords.map((r) => r.courseId).filter(Boolean));
    const enrolledCourses = enrolledCourseIds.size;

    // Programmes assigned
    const allProgrammes = getProgrammes();
    const assignedProgrammes = allProgrammes.filter((p) => {
      const progress = getProgrammeProgress(user.id, p);
      return progress.totalCourses > 0 || progress.totalAssignments > 0;
    });
    const programmesActive = assignedProgrammes.filter((p) => p.status === "active" || (p.status !== "completed" && getProgrammeProgress(user.id, p).progress > 0 && getProgrammeProgress(user.id, p).progress < 100));
    const programmesCompleted = assignedProgrammes.filter((p) => p.status === "completed" || getProgrammeProgress(user.id, p).progress >= 100);
    const totalProgrammes = assignedProgrammes.length;

    // Assignments
    const standaloneAssignments = allRecords.filter((r) => r.assignmentId && !r.campaignId);
    const assignedAssignments = standaloneAssignments.length;
    const completedAssignments = standaloneAssignments.filter((r) => r.status === "completed").length;
    const inProgressAssignments = standaloneAssignments.filter((r) => r.status === "in_progress").length;

    // Courses completed
    const completedCourses = allRecords.filter((r) => r.courseId && r.status === "completed").length;

    return {
      enrolledCourses,
      totalProgrammes,
      programmesActive: programmesActive.length,
      programmesCompleted: programmesCompleted.length,
      completedCourses,
      assignedAssignments,
      completedAssignments,
      inProgressAssignments,
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <RoleGreeting user={user} />

      {/* Learning Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 lg:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-200" />
              <span className="text-xs font-medium text-primary-200/80 uppercase tracking-wider">Your Learning Journey</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight">
              Continue Building Your Knowledge
            </h2>
            <p className="text-sm text-primary-100/80 leading-relaxed">
              Pick up where you left off. Your next breakthrough is just one lesson away.
            </p>
            <Button
              variant="glass-primary"
              size="lg"
              className="text-white border-white/20 hover:bg-white/15"
              onClick={() => router.push("/learner/continue-learning")}
            >
              <PlayCircle className="h-4 w-4" />
              Continue Learning
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Programmes", value: metrics?.totalProgrammes ?? 0, icon: GraduationCap },
              { label: "Completed", value: metrics?.completedCourses ?? 0, icon: CheckCircle },
              { label: "Courses Enrolled", value: metrics?.enrolledCourses ?? 0, icon: Award },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-primary-200/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Assigned Programmes", value: metrics?.totalProgrammes ?? 0, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
          { label: "Active Programmes", value: metrics?.programmesActive ?? 0, icon: PlayCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
          { label: "Completed Programmes", value: metrics?.programmesCompleted ?? 0, icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Assignments Done", value: metrics?.completedAssignments ?? 0, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
        ].map((a) => (
          <div key={a.label} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.bg)}>
              <a.icon className={cn("h-5 w-5", a.color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-content">{a.value}</p>
              <p className="text-xs text-content-tertiary">{a.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Courses" value={String(metrics?.enrolledCourses ?? 0)} icon={BookOpen} trend={`${metrics?.completedCourses ?? 0} completed`} trendUp iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard title="Assigned Assignments" value={String(metrics?.assignedAssignments ?? 0)} icon={Clock} trend={`${metrics?.completedAssignments ?? 0} completed`} trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard title="Courses Completed" value={String(metrics?.completedCourses ?? 0)} icon={Award} trend="real-time" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard title="Active Programmes" value={String(metrics?.programmesActive ?? 0)} icon={TrendingUp} trend={`${metrics?.programmesCompleted ?? 0} completed`} trendUp iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
      </div>

      {/* Event-based Learning Widgets */}
      <TodaysEvents onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      <UpcomingLiveSessions onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      <MissedEvents onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />
      <CompletedEvents onEventClick={(event) => window.location.href = `/learner/events/${event.id}`} />

      {/* Assignment-based Learning Widgets */}
      <LearnerMandatoryLearning />
      <LearnerDueSoon />
      <LearnerContinueLearning />
      <LearnerCompleted />

      {/* Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline activities={recentActivity} title="Recent Activity" />
        <NotificationsWidget />
      </div>

      {/* Quick Actions + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions
          className="lg:col-span-1"
          title="Quick Links"
          actions={[
            { label: "Continue Learning", href: "/learner/continue-learning", icon: PlayCircle, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "My Courses", href: "/learner/my-courses", icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Certificates", href: "/learner/certificates", icon: Award, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Achievements", href: "/learner/achievements", icon: Trophy, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
          ]}
        />

        {/* Learning Journey Timeline Placeholder */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                <CardTitle>Weekly Progress</CardTitle>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <span className="text-xs text-content-tertiary">{day}</span>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-8 rounded-full bg-primary-600 transition-all duration-500"
                          style={{
                            height: `${[45, 70, 55, 85, 60, 30, 0][["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day)]}%`,
                            maxHeight: "80px",
                            minHeight: "4px",
                          }}
                        />
                        <span className="text-[10px] text-content-tertiary">
                          {[45, 70, 55, 85, 60, 30, 0][["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day)]}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
