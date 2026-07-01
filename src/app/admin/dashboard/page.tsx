"use client";

import { useAuth } from "@/hooks/use-auth";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Users, BookOpen, CalendarDays, TrendingUp, UserPlus, FileText, Bell, UserCheck, BarChart3, Settings } from "lucide-react";

const recentActivity = [
  { id: "1", icon: UserPlus, iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400", title: "New user registered", description: "Sarah Johnson created a trainer account", time: "5m ago" },
  { id: "2", icon: FileText, iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400", title: "Course updated", description: "Advanced Mathematics curriculum revised", time: "1h ago" },
  { id: "3", icon: Bell, iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400", title: "System notification", description: "Scheduled maintenance tonight at 2 AM", time: "2h ago" },
  { id: "4", icon: UserCheck, iconBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400", title: "Bulk import complete", description: "150 learners added from CSV upload", time: "3h ago" },
];

const notifications = [
  { id: "1", title: "New registration request", description: "5 pending user approvals", time: "10m ago", unread: true },
  { id: "2", title: "Course report ready", description: "Q2 learning analytics generated", time: "1h ago", unread: true },
  { id: "3", title: "System update", description: "Platform version 2.4.0 deployed", time: "3h ago", unread: false },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <RoleGreeting user={user} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="1,284" icon={Users} trend="+12%" trendUp />
        <StatCard title="Active Courses" value="48" icon={BookOpen} trend="+4" trendUp />
        <StatCard title="Events This Month" value="23" icon={CalendarDays} trend="+8" trendUp />
        <StatCard title="Engagement Rate" value="87%" icon={TrendingUp} trend="+5%" trendUp />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WelcomeCard user={user} />
        </div>
        <QuickActions
          actions={[
            { label: "Add User", href: "/admin/users", icon: UserPlus },
            { label: "View Reports", href: "/admin/reports", icon: BarChart3 },
            { label: "Manage Learning", href: "/admin/learning", icon: BookOpen },
            { label: "Settings", href: "/admin/settings", icon: Settings },
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

