"use client";

import { useAuth } from "@/hooks/use-auth";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Users, BookOpen, CalendarDays, TrendingUp, ClipboardList, Award, Clock, BarChart3 } from "lucide-react";

const recentActivity = [
  { id: "1", icon: Users, iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400", title: "New learner added", description: "Michael Chen joined your Mathematics class", time: "15m ago" },
  { id: "2", icon: ClipboardList, iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400", title: "Assignment graded", description: "Week 4 quiz results published to 32 learners", time: "1h ago" },
  { id: "3", icon: Clock, iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400", title: "Session scheduled", description: "Advanced Physics lab rescheduled to Friday", time: "2h ago" },
  { id: "4", icon: Award, iconBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400", title: "Certification update", description: "5 learners completed Python certification", time: "4h ago" },
];

const notifications = [
  { id: "1", title: "New learner request", description: "3 pending enrollment approvals", time: "20m ago", unread: true },
  { id: "2", title: "Curriculum update", description: "Data Science module 3 revised", time: "2h ago", unread: true },
  { id: "3", title: "Meeting reminder", description: "Faculty sync at 3 PM tomorrow", time: "5h ago", unread: false },
];

export default function TrainerDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <RoleGreeting user={user} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Learners" value="128" icon={Users} trend="+8" trendUp />
        <StatCard title="Active Courses" value="6" icon={BookOpen} trend="+2" trendUp />
        <StatCard title="Pending Reviews" value="24" icon={ClipboardList} trend="-3" />
        <StatCard title="Avg. Performance" value="82%" icon={TrendingUp} trend="+4%" trendUp />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WelcomeCard user={user} />
        </div>
        <QuickActions
          actions={[
            { label: "My Learners", href: "/trainer/my-learners", icon: Users },
            { label: "Assignments", href: "/trainer/assignments", icon: ClipboardList },
            { label: "Schedule Event", href: "/trainer/events", icon: CalendarDays },
            { label: "Reports", href: "/trainer/reports", icon: BarChart3 },
          ]}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline activities={recentActivity} />
        <NotificationsWidget notifications={notifications} />
      </div>
    </div>
  );
}

