"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AssignmentSummaryCards, RegionalPerformanceWidget, RecentAssignmentsWidget } from "@/components/assignments/assignment-analytics";
import { AdminEventDashboardCards } from "@/components/events/event-dashboard-cards";
import { getAllUsers } from "@/lib/auth";
import { getCourses } from "@/lib/courses";
import { getAssignments } from "@/lib/assignments";
import { getLearnerAssignments } from "@/lib/learner-assignments";
import { getProgrammes } from "@/lib/programmes";
import { getEvents } from "@/lib/events";
import { Users, BookOpen, CalendarDays, TrendingUp, UserPlus, FileText, BarChart3, GraduationCap, Award, Clock, Activity, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const thisMonth = new Date().getMonth();
    const thisMonthEvents = events.filter((e) => new Date(e.schedule.startDate).getMonth() === thisMonth);
    const completedAssignments = learnerAssignments.filter((la) => la.status === "completed").length;
    const inProgressAssignments = learnerAssignments.filter((la) => la.status === "in_progress" || la.status === "not_started").length;
    const totalLearnerAssignments = learnerAssignments.length;
    const completionRate = totalLearnerAssignments > 0 ? Math.round((completedAssignments / totalLearnerAssignments) * 100) : 0;
    return {
      totalUsers: allUsers.length,
      learners: learners.length,
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
    <div className="flex flex-col gap-6 animate-fade-in">
      <RoleGreeting user={user} />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 lg:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-200" />
              <span className="text-xs font-medium text-primary-200/80 uppercase tracking-wider">Organization Overview</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight">
              Executive Command Center
            </h2>
            <p className="text-sm text-primary-100/80 leading-relaxed">
              Monitor your organization&apos;s learning ecosystem at a glance.
              Track adoption, completion rates, and regional performance.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Total Users", value: String(stats.totalUsers), icon: Users },
              { label: "Completion", value: `${stats.completionRate}%`, icon: Award },
              { label: "Programmes", value: String(stats.programmes), icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-primary-200/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AssignmentSummaryCards role="admin" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminEventDashboardCards />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={String(stats.totalUsers)} icon={Users} trend={`${stats.learners} learners`} trendUp iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard title="Active Courses" value={String(stats.totalCourses)} icon={BookOpen} trend={`${stats.assignments} assignments`} trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard title="Events This Month" value={String(stats.eventsThisMonth)} icon={CalendarDays} trend="This month" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={TrendingUp} trend={`${stats.completedAssignments}/${stats.totalLearnerAssignments}`} trendUp iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RegionalPerformanceWidget />
        </div>

        <div className="lg:col-span-1">
          <RecentAssignmentsWidget />
        </div>

        <div className="lg:col-span-1">
          <ActivityTimeline activities={[]} title="Recent Activity" />
        </div>

        <div className="lg:col-span-1">
          <NotificationsWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions
          className="lg:col-span-1"
          title="Quick Actions"
          actions={[
            { label: "Add User", href: "/admin/users", icon: UserPlus, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "View Reports", href: "/admin/reports", icon: BarChart3, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Assignments", href: "/admin/assignments", icon: ClipboardList, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Settings", href: "/admin/settings", icon: GraduationCap, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
          ]}
        />

        <div className="lg:col-span-2">
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <CardTitle>Learning Adoption Metrics</CardTitle>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Course Completion", value: `${stats.completionRate}%`, sub: `${stats.completedAssignments} completed`, icon: Award, up: true },
                  { label: "In Progress", value: String(stats.inProgressAssignments), sub: "active assignments", icon: Clock, up: true },
                  { label: "Learners", value: String(stats.learners), sub: "total users", icon: Users, up: true },
                  { label: "Programmes", value: String(stats.programmes), sub: "active programmes", icon: Award, up: true },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30">
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
        </div>
      </div>
    </div>
  );
}
