"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Award, Activity, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6">
        <WelcomeCard user={user!} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value="1,284" icon={Users} trend="+12% this month" trendUp />
          <StatCard title="Active Courses" value="48" icon={BookOpen} trend="+4 new this week" trendUp />
          <StatCard title="Certifications" value="3,672" icon={Award} trend="+8% vs last month" trendUp />
          <StatCard title="Completion Rate" value="87%" icon={Activity} trend="+2.5% improvement" trendUp />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">New user registered</p>
                      <p className="text-xs text-content-tertiary">{i * 3} minutes ago</p>
                    </div>
                    <Badge variant="secondary" size="sm">New</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Upcoming Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-xs font-bold">
                      {["Mon", "Tue", "Wed"][i - 1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">
                        {["Leadership Workshop", "Technical Training", "Onboarding Session"][i - 1]}
                      </p>
                      <p className="text-xs text-content-tertiary">
                        {["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM", "9:00 AM - 11:00 AM"][i - 1]}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-content-tertiary" />
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
                    <div className="flex h-2 w-2 mt-2 rounded-full bg-primary-600 shrink-0" />
                    <div>
                      <p className="text-sm text-content">
                        {[
                          "Course 'Data Science Fundamentals' has been approved",
                          "New trainer account created for John Doe",
                          "System maintenance scheduled for this weekend",
                        ][i - 1]}
                      </p>
                      <p className="text-xs text-content-tertiary mt-0.5">{i * 2} hours ago</p>
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
                {["Create Course", "Add Users", "View Reports", "System Settings"].map((action) => (
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
