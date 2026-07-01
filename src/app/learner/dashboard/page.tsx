"use client";

import { useAuth } from "@/hooks/use-auth";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, CheckCircle, Star, Trophy } from "lucide-react";

const recentActivity = [
  { id: "1", icon: PlayCircle, iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400", title: "Course resumed", description: "Continued Advanced Mathematics - Module 4", time: "30m ago" },
  { id: "2", icon: CheckCircle, iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400", title: "Quiz completed", description: "Scored 90% on Data Structures quiz", time: "2h ago" },
  { id: "3", icon: Star, iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400", title: "Achievement unlocked", description: "Completed 5 courses this month!", time: "1d ago" },
  { id: "4", icon: Award, iconBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400", title: "Certificate earned", description: "Python for Data Science certification", time: "2d ago" },
];

const notifications = [
  { id: "1", title: "New course available", description: "Machine Learning Fundamentals is now open", time: "1h ago", unread: true },
  { id: "2", title: "Assignment deadline", description: "Week 5 project due in 2 days", time: "5h ago", unread: true },
  { id: "3", title: "Achievement earned", description: "You earned the 'Fast Learner' badge", time: "1d ago", unread: false },
];

const continueLearning = [
  { title: "Advanced Mathematics", progress: 65, instructor: "Dr. Sarah Chen" },
  { title: "Data Structures & Algorithms", progress: 42, instructor: "Prof. James Wilson" },
  { title: "Python for Data Science", progress: 88, instructor: "Dr. Emily Roberts" },
];

export default function LearnerDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <RoleGreeting user={user} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Courses" value="8" icon={BookOpen} trend="+2" trendUp />
        <StatCard title="Hours This Week" value="14.5" icon={Clock} trend="+2.5" trendUp />
        <StatCard title="Certificates" value="3" icon={Award} trend="+1" trendUp />
        <StatCard title="Avg. Score" value="87%" icon={TrendingUp} trend="+3%" trendUp />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-content mb-4">Continue Learning</h3>
            <div className="flex flex-col gap-4">
              {continueLearning.map((course) => (
                <div key={course.title} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content">{course.title}</p>
                    <p className="text-xs text-content-tertiary">{course.instructor}</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-surface-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-content-secondary">{course.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <QuickActions
          actions={[
            { label: "Continue Learning", href: "/learner/continue-learning", icon: PlayCircle },
            { label: "My Courses", href: "/learner/my-courses", icon: BookOpen },
            { label: "Certificates", href: "/learner/certificates", icon: Award },
            { label: "Achievements", href: "/learner/achievements", icon: Trophy },
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

