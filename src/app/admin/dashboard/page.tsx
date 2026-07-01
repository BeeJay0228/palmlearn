"use client";

import { useAuth } from "@/hooks/use-auth";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AssignmentSummaryCards, RegionalPerformanceWidget, RecentAssignmentsWidget } from "@/components/assignments/assignment-analytics";
import { AdminEventDashboardCards } from "@/components/events/event-dashboard-cards";
import { Users, BookOpen, CalendarDays, TrendingUp, UserPlus, FileText, Bell, UserCheck, BarChart3, GraduationCap, Award, Clock, Activity, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const recentActivity = [
  { id: "1", icon: UserPlus, iconBg: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400", title: "New user registered", description: "Sarah Johnson created a trainer account", time: "5m ago" },
  { id: "2", icon: FileText, iconBg: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400", title: "Course updated", description: "Advanced Mathematics curriculum revised", time: "1h ago" },
  { id: "3", icon: Bell, iconBg: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400", title: "System notification", description: "Scheduled maintenance tonight at 2 AM", time: "2h ago" },
  { id: "4", icon: UserCheck, iconBg: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400", title: "Bulk import complete", description: "150 learners added from CSV upload", time: "3h ago" },
  { id: "5", icon: Award, iconBg: "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400", title: "Certification batch", description: "45 certificates issued for Q2 completions", time: "6h ago" },
];

const notifications = [
  { id: "1", title: "New registration request", description: "5 pending user approvals", time: "10m ago", unread: true },
  { id: "2", title: "Course report ready", description: "Q2 learning analytics generated", time: "1h ago", unread: true },
  { id: "3", title: "System update", description: "Platform version 2.4.0 deployed", time: "3h ago", unread: false },
  { id: "4", title: "Storage warning", description: "Resource library at 82% capacity", time: "8h ago", unread: true },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <RoleGreeting user={user} />

      {/* Hero Section - Welcome + Quick Stats */}
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
              { label: "Active Users", value: "1,284", icon: Users },
              { label: "Completion", value: "87%", icon: Award },
              { label: "Growth", value: "+12%", icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-primary-200/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <AssignmentSummaryCards role="admin" />

      {/* Event Analytics Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminEventDashboardCards />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="1,284" icon={Users} trend="+12% this month" trendUp iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard title="Active Courses" value="48" icon={BookOpen} trend="+4 new this week" trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard title="Events This Month" value="23" icon={CalendarDays} trend="+8 upcoming" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard title="Engagement Rate" value="87%" icon={TrendingUp} trend="+5% vs last month" trendUp iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
      </div>

      {/* Charts & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Assignment Performance */}
        <div className="lg:col-span-1">
          <RegionalPerformanceWidget />
        </div>

        {/* Recent Assignments */}
        <div className="lg:col-span-1">
          <RecentAssignmentsWidget />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <ActivityTimeline activities={recentActivity} title="Recent Activity" />
        </div>

        {/* Notifications */}
        <div className="lg:col-span-1">
          <NotificationsWidget notifications={notifications} title="Notifications" />
        </div>
      </div>

      {/* Quick Actions + Learning Stats */}
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

        {/* Learning Stats */}
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
                  { label: "Course Completion", value: "87%", sub: "2.4% vs last month", icon: Award, up: true },
                  { label: "Avg. Time Spent", value: "14.2h", sub: "1.8h vs last month", icon: Clock, up: true },
                  { label: "Active Learners", value: "892", sub: "64% of total users", icon: Users, up: true },
                  { label: "Certificates Issued", value: "156", sub: "This quarter", icon: Award, up: true },
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
