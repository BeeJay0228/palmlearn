"use client";

import { useMemo } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";
import { getEvents } from "@/lib/events";
import { getAttendanceStats } from "@/lib/attendance";
import { useAuth } from "@/hooks/use-auth";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from "@/types";
import { getUsers } from "@/lib/users";
import {
  CalendarDays, Users, TrendingUp, UserCheck, Clock, Award, BarChart3,
  CheckCircle, XCircle,
} from "lucide-react";

// --- Admin Analytics ---

export function AdminEventAnalytics() {
  const events = getEvents();

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === "published").length;
    const draft = events.filter((e) => e.status === "draft").length;
    const completed = events.filter((e) => e.status === "completed").length;
    const cancelled = events.filter((e) => e.status === "cancelled").length;
    const now = new Date();
    const upcoming = events.filter((e) => e.status === "published" && new Date(e.schedule.startDate) > now).length;
    const totalCapacity = events.reduce((sum, e) => sum + e.schedule.capacity, 0);
    let totalAttended = 0;
    let totalInvited = 0;
    let totalCompletedAttendance = 0;
    const trainerAttendance: Record<string, { events: number; attended: number; registered: number }> = {};

    for (const event of events) {
      const s = getAttendanceStats(event.id);
      totalAttended += s.joined + s.completed;
      totalInvited += s.total;
      totalCompletedAttendance += s.completed;
      if (event.trainerId) {
        if (!trainerAttendance[event.trainerId]) trainerAttendance[event.trainerId] = { events: 0, attended: 0, registered: 0 };
        trainerAttendance[event.trainerId].events++;
        trainerAttendance[event.trainerId].attended += s.joined + s.completed;
        trainerAttendance[event.trainerId].registered += s.registered;
      }
    }

    const users = getUsers();
    const topTrainers = Object.entries(trainerAttendance)
      .map(([id, data]) => ({
        name: users.find((u) => u.id === id)?.name || id,
        events: data.events,
        attended: data.attended,
        rate: data.registered > 0 ? Math.round((data.attended / data.registered) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);

    return {
      total, published, draft, completed, cancelled, upcoming,
      totalCapacity, totalAttended, totalInvited, totalCompletedAttendance,
      attendanceRate: totalInvited > 0 ? Math.round((totalAttended / totalInvited) * 100) : 0,
      topTrainers,
    };
  }, [events]);

  const eventTypeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const event of events) {
      dist[event.eventType] = (dist[event.eventType] || 0) + 1;
    }
    return dist;
  }, [events]);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={String(stats.total)} icon={CalendarDays} trend={`${stats.upcoming} upcoming`} trendUp iconColor="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-950/30" />
        <StatCard title="Upcoming Events" value={String(stats.upcoming)} icon={TrendingUp} trend="Active sessions" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={UserCheck} trend={`${stats.totalAttended} attended`} trendUp={stats.attendanceRate >= 60} iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
        <StatCard title="Missed Sessions" value={String(stats.totalInvited - stats.totalAttended)} icon={XCircle} trend={`${stats.completed} completed`} trendUp={false} iconColor="text-red-600 dark:text-red-400" bgColor="bg-red-50 dark:bg-red-950/30" />
      </div>

      {/* Average Attendance & Top Trainers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Type Distribution */}
        <Card variant="default" padding="none">
          <div className="px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary-600" />
              <CardTitle>Event Type Distribution</CardTitle>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="space-y-3">
              {(Object.entries(eventTypeDistribution) as [string, number][]).map(([type, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <Badge variant="glass" className={cn("w-24 text-[11px]", EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS])}>
                      {EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_COLORS]}
                    </Badge>
                    <div className="flex-1 h-2 rounded-full bg-surface-tertiary overflow-hidden">
                      <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-content-secondary w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Trainers */}
        <Card variant="default" padding="none">
          <div className="px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary-600" />
              <CardTitle>Top Trainers</CardTitle>
            </div>
          </div>
          <CardContent className="p-5">
            {stats.topTrainers.length === 0 ? (
              <p className="text-xs text-content-tertiary text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.topTrainers.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold",
                      i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                      i === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" :
                      i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" :
                      "bg-surface-tertiary text-content-tertiary",
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-content">{t.name}</p>
                      <p className="text-[10px] text-content-tertiary">{t.events} events · {t.attended} attendees</p>
                    </div>
                    <span className="text-xs font-bold text-success">{t.rate}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Status Overview */}
      <Card variant="default" padding="none">
        <div className="px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary-600" />
            <CardTitle>Event Status Overview</CardTitle>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Published", value: stats.published, color: "bg-emerald-500", icon: CheckCircle },
              { label: "Draft", value: stats.draft, color: "bg-gray-400", icon: Clock },
              { label: "Completed", value: stats.completed, color: "bg-blue-500", icon: Award },
              { label: "Cancelled", value: stats.cancelled, color: "bg-red-500", icon: XCircle },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-surface-tertiary/50">
                <item.icon className={cn("h-5 w-5 mx-auto mb-2", item.label === "Published" ? "text-emerald-500" : item.label === "Draft" ? "text-gray-400" : item.label === "Completed" ? "text-blue-500" : "text-red-500")} />
                <p className="text-xl font-bold text-content">{item.value}</p>
                <p className="text-xs text-content-tertiary">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Trainer Analytics ---

export function TrainerEventAnalytics() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    if (!user) return { upcoming: 0, registered: 0, completed: 0, attendanceRate: 0, total: 0 };
    const myEvents = getEvents().filter((e) => e.trainerId === user.id || e.createdBy === user.id);
    const now = new Date();
    const upcoming = myEvents.filter((e) => e.status === "published" && new Date(e.schedule.startDate) > now).length;
    const completed = myEvents.filter((e) => e.status === "completed").length;
    let totalRegistered = 0;
    let totalAttended = 0;
    for (const event of myEvents) {
      const s = getAttendanceStats(event.id);
      totalRegistered += s.registered;
      totalAttended += s.joined + s.completed;
    }
    return {
      upcoming,
      registered: totalRegistered,
      completed,
      attendanceRate: totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0,
      total: myEvents.length,
    };
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Upcoming Sessions" value={String(stats.upcoming)} icon={CalendarDays} trend={`${stats.total} total events`} trendUp iconColor="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-950/30" />
      <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={UserCheck} trend={`${stats.registered} registered`} trendUp={stats.attendanceRate >= 60} iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
      <StatCard title="Registered Learners" value={String(stats.registered)} icon={Users} trend={`Across ${stats.total} events`} trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
      <StatCard title="Completed Events" value={String(stats.completed)} icon={Award} trend="Delivered successfully" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
    </div>
  );
}
