"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Clock, Play, CheckCircle, ArrowRight } from "lucide-react";

export default function LearnerDashboard() {
  const { user } = useAuth();

  return (
    <AuthGuard requiredRole="learner">
      <div className="flex flex-col gap-6">
        <WelcomeCard user={user!} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Enrolled Courses" value="4" icon={BookOpen} trend="2 in progress" trendUp />
          <StatCard title="Completed" value="12" icon={CheckCircle} trend="+3 this month" trendUp />
          <StatCard title="Certificates" value="8" icon={Award} trend="1 pending" />
          <StatCard title="Learning Hours" value="47" icon={Clock} trend="+5 this week" trendUp />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" padding="md">
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0 group cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      <Play className="h-5 w-5 ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate group-hover:text-primary-600 transition-colors">
                        {["Data Science Fundamentals", "UI/UX Design Principles", "Project Management"][i - 1]}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-600"
                            style={{ width: [`75%`, `45%`, `90%`][i - 1] }}
                          />
                        </div>
                        <span className="text-xs text-content-tertiary shrink-0">
                          {[`75%`, `45%`, `90%`][i - 1]}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-content-tertiary group-hover:text-primary-600 transition-colors" />
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-primary-700 text-white text-xs font-bold">
                      {["Wed", "Fri", "Mon"][i - 1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">
                        {["Advanced JavaScript", "React Workshop", "Team Collaboration"][i - 1]}
                      </p>
                      <p className="text-xs text-content-tertiary">
                        {["2:00 PM - 4:00 PM", "10:00 AM - 12:30 PM", "1:00 PM - 3:00 PM"][i - 1]}
                      </p>
                    </div>
                    <Badge variant={(["success", "warning", "default"] as const)[i - 1]} size="sm">
                      {["Registered", "Waitlist", "Available"][i - 1]}
                    </Badge>
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
                    <div className="flex h-2 w-2 mt-2 rounded-full bg-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm text-content">
                        {[
                          "New course material available in 'Data Science Fundamentals'",
                          "Reminder: Live session starts in 2 hours",
                          "You earned a new certificate: 'Introduction to Python'",
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
                {["Browse Courses", "View Schedule", "My Progress", "Certificates"].map((action) => (
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
