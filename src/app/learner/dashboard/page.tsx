"use client";

import { useAuth } from "@/hooks/use-auth";
import { RoleGreeting } from "@/components/dashboard/role-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LearnerContinueLearning, LearnerMandatoryLearning, LearnerDueSoon, LearnerCompleted } from "@/components/assignments/learner-assignments";
import { TodaysEvents, UpcomingLiveSessions, MissedEvents, CompletedEvents } from "@/components/events/learner-events";
import { BookOpen, Clock, Award, TrendingUp, PlayCircle, CheckCircle, Star, Trophy, ChevronRight, Sparkles, BarChart3, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const recentActivity = [
  { id: "1", icon: PlayCircle, iconBg: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400", title: "Course resumed", description: "Continued Advanced Mathematics - Module 4", time: "30m ago" },
  { id: "2", icon: CheckCircle, iconBg: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400", title: "Quiz completed", description: "Scored 90% on Data Structures quiz", time: "2h ago" },
  { id: "3", icon: Star, iconBg: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400", title: "Achievement unlocked", description: "Completed 5 courses this month!", time: "1d ago" },
  { id: "4", icon: Award, iconBg: "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400", title: "Certificate earned", description: "Python for Data Science certification", time: "2d ago" },
];

const notifications = [
  { id: "1", title: "New course available", description: "Machine Learning Fundamentals is now open", time: "1h ago", unread: true },
  { id: "2", title: "Assignment deadline", description: "Week 5 project due in 2 days", time: "5h ago", unread: true },
  { id: "3", title: "Achievement earned", description: "You earned the 'Fast Learner' badge", time: "1d ago", unread: false },
];

const continueLearning = [
  { title: "Advanced Mathematics", progress: 65, instructor: "Dr. Sarah Chen", category: "Mathematics", thumbnail: "" },
  { title: "Data Structures & Algorithms", progress: 42, instructor: "Prof. James Wilson", category: "Computer Science", thumbnail: "" },
  { title: "Python for Data Science", progress: 88, instructor: "Dr. Emily Roberts", category: "Data Science", thumbnail: "" },
  { title: "Machine Learning Fundamentals", progress: 15, instructor: "Dr. Alan Turing", category: "AI & ML", thumbnail: "" },
];

const achievements = [
  { label: "Day Streak", value: "12", icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { label: "Courses Done", value: "5", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { label: "Certificates", value: "3", icon: Award, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { label: "Top Score", value: "98%", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
];

export default function LearnerDashboard() {
  const { user } = useAuth();

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
            >
              <PlayCircle className="h-4 w-4" />
              Continue Learning
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Streak", value: "12 days", icon: Flame },
              { label: "Courses", value: "8", icon: BookOpen },
              { label: "Avg. Score", value: "87%", icon: Award },
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
        {achievements.map((a) => (
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
        <StatCard title="Enrolled Courses" value="8" icon={BookOpen} trend="+2 this month" trendUp iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard title="Hours This Week" value="14.5" icon={Clock} trend="+2.5 vs last week" trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard title="Certificates" value="3" icon={Award} trend="+1 new" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard title="Avg. Score" value="87%" icon={TrendingUp} trend="+3% improvement" trendUp iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
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

      {/* Continue Learning - Netflix Style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-content">Continue Learning</h2>
          </div>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
            View all courses
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {continueLearning.map((course) => (
            <div
              key={course.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover cursor-pointer"
            >
              {/* Course Banner Placeholder */}
              <div className="relative h-32 bg-gradient-to-br from-primary-600/20 to-primary-800/20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 dark:bg-surface/90 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle className="h-6 w-6 text-primary-600" />
                </div>
                {/* Progress bar on banner */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-tertiary">
                  <div
                    className="h-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="p-4">
                <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  {course.category}
                </span>
                <h3 className="text-sm font-semibold text-content mt-1 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-content-tertiary mt-0.5">{course.instructor}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-semibold text-content-secondary">{course.progress}% complete</span>
                  <button className="rounded-lg p-1.5 text-content-tertiary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline activities={recentActivity} title="Recent Activity" />
        <NotificationsWidget notifications={notifications} title="Notifications" />
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
