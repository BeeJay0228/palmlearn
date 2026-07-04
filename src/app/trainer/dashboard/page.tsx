"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { useTrainerData } from "@/hooks/use-trainer-data";
import { useRouter } from "next/navigation";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardMetricsGrid } from "@/components/dashboard/dashboard-metrics-grid";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AssignmentSummaryCards = dynamic(() => import("@/components/assignments/assignment-analytics").then(m => m.AssignmentSummaryCards), { ssr: false });
const TrainerEventDashboardCards = dynamic(() => import("@/components/events/event-dashboard-cards").then(m => m.TrainerEventDashboardCards), { ssr: false });
import {
  Users, BookOpen, CalendarDays, TrendingUp, ClipboardList, Award, Clock,
  BarChart3, Star, CheckCircle, PlayCircle, Target,
} from "lucide-react";

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const iconMap: Record<string, typeof BookOpen> = {
  course: BookOpen,
  programme: ClipboardList,
  assignment: ClipboardList,
  event: CalendarDays,
};

const topLearners = [
  { name: "Adaobi Okonkwo", score: 98, course: "Data Science", avatar: "AO", color: "from-amber-400 to-amber-600" },
  { name: "Chidi Eze", score: 95, course: "Mathematics", avatar: "CE", color: "from-blue-400 to-blue-600" },
  { name: "Fatima Bello", score: 92, course: "Physics", avatar: "FB", color: "from-purple-400 to-purple-600" },
  { name: "Emeka Obi", score: 89, course: "Chemistry", avatar: "EO", color: "from-emerald-400 to-emerald-600" },
  { name: "Zainab Yusuf", score: 87, course: "Literature", avatar: "ZY", color: "from-rose-400 to-rose-600" },
];

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { data: trainerData } = useTrainerData();
  const router = useRouter();

  const recentContent = (trainerData?.recentContent as unknown as Array<{ id: string; type: string; title: string; updatedAt: string }>) || [];

  const recentActivity = useMemo(() => {
    return recentContent.slice(0, 5).map((item, idx) => {
      const Icon = iconMap[item.type] || BookOpen;
      const colors: Record<string, { bg: string; color: string }> = {
        course: { bg: "bg-blue-100 dark:bg-blue-950/30", color: "text-blue-600 dark:text-blue-400" },
        programme: { bg: "bg-emerald-100 dark:bg-emerald-950/30", color: "text-emerald-600 dark:text-emerald-400" },
        assignment: { bg: "bg-amber-100 dark:bg-amber-950/30", color: "text-amber-600 dark:text-amber-400" },
        event: { bg: "bg-purple-100 dark:bg-purple-950/30", color: "text-purple-600 dark:text-purple-400" },
      };
      const c = colors[item.type] || colors.course;
      const timeAgo = getTimeAgo(item.updatedAt);
      const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
      return {
        id: item.id || String(idx),
        icon: Icon,
        iconBg: c.bg,
        iconColor: c.color,
        title: `${typeLabel} updated`,
        description: item.title,
        time: timeAgo,
      };
    });
  }, [recentContent]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome
        subtitle="Track learner progress, manage assignments, and inspire your classroom. You have pending reviews that need your attention."
        action={{ label: "My Learners", href: "/trainer/my-learners" }}
        metrics={[
          { label: "Learners", value: "128" },
          { label: "Avg. Score", value: "82%" },
          { label: "Courses", value: "6" },
        ]}
      />

      <DashboardStats
        stats={[
          { title: "My Learners", value: 128, icon: Users, trend: { value: "+8 this month", up: true }, color: "emerald" },
          { title: "Active Courses", value: 6, icon: BookOpen, trend: { value: "+2 new this week", up: true }, color: "blue" },
          { title: "Pending Reviews", value: 24, icon: ClipboardList, trend: { value: "3 overdue", up: false }, color: "amber" },
          { title: "Avg. Performance", value: 82, icon: TrendingUp, trend: { value: "+4% vs last month", up: true }, color: "purple" },
        ]}
      />

      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-surface-secondary" />}>
        <AssignmentSummaryCards role="trainer" />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-xl bg-surface-secondary" />}>
          <TrainerEventDashboardCards />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <DashboardQuickActions
            title="Quick Actions"
            actions={[
              { label: "My Learners", href: "/trainer/my-learners", icon: Users, color: "emerald" },
              { label: "Assignments", href: "/trainer/assignments", icon: ClipboardList, color: "blue" },
              { label: "Schedule Event", href: "/trainer/events", icon: CalendarDays, color: "amber" },
              { label: "Reports", href: "/trainer/reports", icon: BarChart3, color: "purple" },
            ]}
            columns={2}
          />
          <NotificationsWidget />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card variant="default" padding="none">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-amber-500" />
                <CardTitle>Pending Reviews</CardTitle>
              </div>
              <span className="text-xs font-medium text-content-tertiary bg-surface-tertiary px-2 py-0.5 rounded-full">24 pending</span>
            </div>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Assignments", value: "12", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                  { label: "Quiz Results", value: "8", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                  { label: "Certifications", value: "3", icon: Award, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
                  { label: "Enrollments", value: "1", icon: PlayCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                ].map((item) => (
                  <div key={item.label} className="text-center group">
                    <div className="flex justify-center mb-2">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110", item.bg)}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="default" padding="none">
              <div className="px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <CardTitle>Top Performers</CardTitle>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  {topLearners.map((learner, idx) => (
                    <div key={learner.name} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center w-6 text-xs font-bold text-content-tertiary">
                        #{idx + 1}
                      </div>
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white text-xs font-bold", learner.color)}>
                        {learner.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-content group-hover:text-primary-600 transition-colors">{learner.name}</p>
                          <span className="text-xs font-bold text-amber-600">{learner.score}%</span>
                        </div>
                        <p className="text-xs text-content-tertiary">{learner.course}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/trainer/my-learners")}
                  className="w-full mt-4 rounded-xl py-2.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                >
                  View all learners
                </button>
              </CardContent>
            </Card>

            <DashboardActivity activities={recentActivity} title="Recent Activity" />
          </div>
        </div>
      </div>

      <DashboardMetricsGrid
        items={[
          { label: "Active Programmes", value: "4", icon: Target, color: "indigo" },
          { label: "Completion Rate", value: "76%", icon: TrendingUp, color: "emerald" },
          { label: "Avg. Score", value: "82%", icon: Award, color: "blue" },
          { label: "Certifications", value: "12", icon: Star, color: "amber" },
        ]}
      />
    </div>
  );
}
