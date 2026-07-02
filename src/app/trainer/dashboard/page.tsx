"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AssignmentSummaryCards, PendingLearnersWidget } from "@/components/assignments/assignment-analytics";
import { TrainerEventDashboardCards } from "@/components/events/event-dashboard-cards";
import { cn } from "@/lib/utils";
import { Users, BookOpen, CalendarDays, TrendingUp, ClipboardList, Award, Clock, BarChart3, GraduationCap, Star, CheckCircle, PlayCircle } from "lucide-react";

const recentActivity = [
  { id: "1", icon: Users, iconBg: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400", title: "New learner added", description: "Michael Chen joined your Mathematics class", time: "15m ago" },
  { id: "2", icon: ClipboardList, iconBg: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400", title: "Assignment graded", description: "Week 4 quiz results published to 32 learners", time: "1h ago" },
  { id: "3", icon: Clock, iconBg: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400", title: "Session scheduled", description: "Advanced Physics lab rescheduled to Friday", time: "2h ago" },
  { id: "4", icon: Award, iconBg: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400", title: "Certification update", description: "5 learners completed Python certification", time: "4h ago" },
  { id: "5", icon: Star, iconBg: "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400", title: "Top performer", description: "Adaobi scored 98% on advanced assessment", time: "6h ago" },
];

const notifications = [
  { id: "1", title: "New learner request", description: "3 pending enrollment approvals", time: "20m ago", unread: true },
  { id: "2", title: "Curriculum update", description: "Data Science module 3 revised", time: "2h ago", unread: true },
  { id: "3", title: "Meeting reminder", description: "Faculty sync at 3 PM tomorrow", time: "5h ago", unread: false },
];

const topLearners = [
  { name: "Adaobi Okonkwo", score: 98, course: "Data Science", avatar: "AO" },
  { name: "Chidi Eze", score: 95, course: "Mathematics", avatar: "CE" },
  { name: "Fatima Bello", score: 92, course: "Physics", avatar: "FB" },
];

export default function TrainerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <RoleGreeting user={user} />

      {/* Teaching Studio Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 lg:p-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary-200" />
              <span className="text-xs font-medium text-primary-200/80 uppercase tracking-wider">Teaching Studio</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white leading-tight">
              Your Classroom Awaits
            </h2>
            <p className="text-sm text-primary-100/80 leading-relaxed">
              Track learner progress, manage assignments, and inspire your classroom.
              You have pending reviews that need your attention.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Learners", value: "128", icon: Users },
              { label: "Avg. Score", value: "82%", icon: Award },
              { label: "Courses", value: "6", icon: BookOpen },
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
      <AssignmentSummaryCards role="trainer" />

      {/* Event Analytics Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrainerEventDashboardCards />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Learners" value="128" icon={Users} trend="+8 this month" trendUp iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard title="Active Courses" value="6" icon={BookOpen} trend="+2 new this week" trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard title="Pending Reviews" value="24" icon={ClipboardList} trend="3 overdue" iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard title="Avg. Performance" value="82%" icon={TrendingUp} trend="+4% vs last month" trendUp iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Learners */}
        <Card variant="default" padding="none" className="lg:col-span-1">
          <div className="px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <CardTitle>Top Performers</CardTitle>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              {topLearners.map((learner) => (
                <div key={learner.name} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold">
                    {learner.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-content">{learner.name}</p>
                      <span className="text-xs font-bold text-amber-600">{learner.score}%</span>
                    </div>
                    <p className="text-xs text-content-tertiary">{learner.course}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/trainer/my-learners")} className="w-full mt-4 rounded-xl py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
              View all learners
            </button>
          </CardContent>
        </Card>

        {/* Pending Learners */}
        <div className="lg:col-span-1">
          <PendingLearnersWidget />
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

      {/* Quick Actions + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions
          className="lg:col-span-1"
          title="Quick Actions"
          actions={[
            { label: "My Learners", href: "/trainer/my-learners", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Assignments", href: "/trainer/assignments", icon: ClipboardList, color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Schedule Event", href: "/trainer/events", icon: CalendarDays, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Reports", href: "/trainer/reports", icon: BarChart3, color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
          ]}
        />

        {/* Pending Reviews Summary */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <CardTitle>Pending Reviews</CardTitle>
              </div>
              <span className="text-xs text-content-tertiary">24 pending</span>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Assignments", value: "12", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                  { label: "Quiz Results", value: "8", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                  { label: "Certifications", value: "3", icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
                  { label: "Enrollments", value: "1", icon: PlayCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", item.bg)}>
                        <item.icon className={cn("h-5 w-5", item.color)} />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-content">{item.value}</p>
                    <p className="text-xs text-content-tertiary mt-0.5">{item.label}</p>
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
