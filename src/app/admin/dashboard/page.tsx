"use client";

import { useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardMetricsGrid } from "@/components/dashboard/dashboard-metrics-grid";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getAllUsers } from "@/lib/auth";
import { getCourses } from "@/lib/courses";
import { getAssignments } from "@/lib/assignments";
import { getLearnerAssignments } from "@/lib/learner-assignments";
import { getProgrammes } from "@/lib/programmes";
import { getEvents } from "@/lib/events";
import {
  Users, BookOpen, CalendarDays, TrendingUp, UserPlus, BarChart3,
  GraduationCap, Award, Clock, ClipboardList, Target, PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AssignmentSummaryCards = dynamic(() => import("@/components/assignments/assignment-analytics").then(m => m.AssignmentSummaryCards), { ssr: false });
const RegionalPerformanceWidget = dynamic(() => import("@/components/assignments/assignment-analytics").then(m => m.RegionalPerformanceWidget), { ssr: false });
const RecentAssignmentsWidget = dynamic(() => import("@/components/assignments/assignment-analytics").then(m => m.RecentAssignmentsWidget), { ssr: false });
const AdminEventDashboardCards = dynamic(() => import("@/components/events/event-dashboard-cards").then(m => m.AdminEventDashboardCards), { ssr: false });

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const allUsers = getAllUsers();
    const courses = getCourses();
    const assignments = getAssignments();
    const programmes = getProgrammes();
    const events = getEvents();
    const learnerAssignments = getLearnerAssignments();
    const learners = allUsers.filter((u) => u.role === "learner");
    const trainers = allUsers.filter((u) => u.role === "trainer");
    const thisMonth = new Date().getMonth();
    const thisMonthEvents = events.filter((e) => new Date(e.schedule.startDate).getMonth() === thisMonth);
    const completedAssignments = learnerAssignments.filter((la) => la.status === "completed").length;
    const inProgressAssignments = learnerAssignments.filter((la) => la.status === "in_progress" || la.status === "not_started").length;
    const totalLearnerAssignments = learnerAssignments.length;
    const completionRate = totalLearnerAssignments > 0 ? Math.round((completedAssignments / totalLearnerAssignments) * 100) : 0;
    return {
      totalUsers: allUsers.length,
      learners: learners.length,
      trainers: trainers.length,
      totalCourses: courses.length,
      assignments: assignments.length,
      programmes: programmes.length,
      eventsThisMonth: thisMonthEvents.length,
      completionRate,
      inProgressAssignments,
      completedAssignments,
      totalLearnerAssignments,
    };
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome
        subtitle="Monitor your organization's learning ecosystem at a glance. Track adoption, completion rates, and regional performance."
        action={{ label: "View Reports", href: "/admin/reports" }}
        metrics={[
          { label: "Total Users", value: stats.totalUsers },
          { label: "Completion", value: `${stats.completionRate}%` },
          { label: "Programmes", value: stats.programmes },
        ]}
      />

      <DashboardStats
        stats={[
          { title: "Total Users", value: stats.totalUsers, icon: Users, trend: { value: `${stats.learners} learners`, up: true }, color: "emerald" },
          { title: "Active Courses", value: stats.totalCourses, icon: BookOpen, trend: { value: `${stats.assignments} assignments`, up: true }, color: "blue" },
          { title: "Events This Month", value: stats.eventsThisMonth, icon: CalendarDays, trend: { value: "This month", up: true }, color: "amber" },
          { title: "Completion Rate", value: stats.completionRate, icon: TrendingUp, trend: { value: `${stats.completedAssignments}/${stats.totalLearnerAssignments} done`, up: true }, color: "purple" },
        ]}
      />

      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <AssignmentSummaryCards role="admin" />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-surface-secondary" />}>
          <AdminEventDashboardCards />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <DashboardQuickActions
            title="Quick Actions"
            actions={[
              { label: "Add User", href: "/admin/users", icon: UserPlus, color: "emerald" },
              { label: "View Reports", href: "/admin/reports", icon: BarChart3, color: "blue" },
              { label: "Assignments", href: "/admin/assignments", icon: ClipboardList, color: "amber" },
              { label: "Settings", href: "/admin/settings", icon: GraduationCap, color: "purple" },
            ]}
            columns={2}
          />
          <NotificationsWidget />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary-600" />
                <CardTitle>Learning Adoption Metrics</CardTitle>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Course Completion", value: `${stats.completionRate}%`, sub: `${stats.completedAssignments} completed`, icon: Award, up: true },
                  { label: "In Progress", value: String(stats.inProgressAssignments), sub: "active assignments", icon: Clock, up: true },
                  { label: "Learners", value: String(stats.learners), sub: "total enrolled", icon: Users, up: true },
                  { label: "Programmes", value: String(stats.programmes), sub: "active programmes", icon: Target, up: true },
                ].map((m) => (
                  <div key={m.label} className="text-center group">
                    <div className="flex justify-center mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30 group-hover:scale-110 transition-transform duration-200">
                        <m.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-content">{m.value}</p>
                    <p className="text-xs text-content-tertiary mt-0.5">{m.label}</p>
                    <p className={cn("text-[11px] font-medium mt-0.5", m.up ? "text-success" : "text-content-tertiary")}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-surface-secondary" />}>
              <RegionalPerformanceWidget />
            </Suspense>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-surface-secondary" />}>
              <RecentAssignmentsWidget />
            </Suspense>
          </div>
        </div>
      </div>

      <DashboardMetricsGrid
        items={[
          { label: "Total Trainers", value: stats.trainers, icon: GraduationCap, color: "indigo" },
          { label: "Learners", value: stats.learners, icon: Users, color: "emerald" },
          { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "blue" },
          { label: "Assignments", value: stats.assignments, icon: ClipboardList, color: "amber" },
        ]}
      />
    </div>
  );
}
