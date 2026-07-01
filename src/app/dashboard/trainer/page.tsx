"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Calendar, Clock, Star } from "lucide-react";

export default function TrainerDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard requiredRole="trainer">
      <div className="flex flex-col gap-6">
        <WelcomeCard user={user!} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Courses" value="6" icon={BookOpen} trend="2 ongoing" trendUp />
          <StatCard title="Total Learners" value="142" icon={Users} trend="+8 this week" trendUp />
          <StatCard title="Sessions This Month" value="18" icon={Calendar} trend="3 upcoming" trendUp />
          <StatCard title="Avg. Rating" value="4.8" icon={Star} trend="Excellent" trendUp />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">
                        {["New learner enrolled in your course", "Assignment submitted by Sarah", "Course material updated"][i - 1]}
                      </p>
                      <p className="text-xs text-content-tertiary">{i * 5} minutes ago</p>
                    </div>
                    <Badge variant="secondary" size="sm">New</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                      {["Mon", "Thu", "Fri"][i - 1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">
                        {["Python Advanced", "Data Structures", "System Design"][i - 1]}
                      </p>
                      <p className="text-xs text-content-tertiary">
                        {["10:00 AM - 12:00 PM", "2:00 PM - 3:30 PM", "11:00 AM - 1:00 PM"][i - 1]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-content-tertiary">
                      <Clock className="h-3 w-3" />
                      {["2h", "1.5h", "2h"][i - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-secondary">
                    <div className="flex h-2 w-2 mt-2 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm text-content">
                        {[
                          "Course 'Python Advanced' has 5 new enrollments",
                          "Reminder: Upload materials for tomorrow's session",
                          "New feedback available for your recent course",
                        ][i - 1]}
                      </p>
                      <p className="text-xs text-content-tertiary mt-0.5">{i * 3} hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {["New Course", "Schedule Session", "Upload Material", "View Analytics"].map((action) => (
                  <button
                    key={action}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface-secondary hover:bg-surface-hover hover:border-border-strong transition-all text-sm font-medium text-content-secondary hover:text-content"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
