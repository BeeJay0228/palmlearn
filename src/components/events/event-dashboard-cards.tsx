"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { getEvents } from "@/lib/events";
import { getAttendanceStats } from "@/lib/attendance";
import { CalendarDays, TrendingUp, UserCheck, XCircle, Award, Users } from "lucide-react";

export function AdminEventDashboardCards() {
  const events = getEvents();

  const stats = useMemo(() => {
    const total = events.length;
    const now = new Date();
    const upcoming = events.filter((e) => e.status === "published" && new Date(e.schedule.startDate) > now).length;
    let totalAttended = 0;
    let totalInvited = 0;
    for (const event of events) {
      const s = getAttendanceStats(event.id);
      totalAttended += s.joined + s.completed;
      totalInvited += s.total;
    }
    const attendanceRate = totalInvited > 0 ? Math.round((totalAttended / totalInvited) * 100) : 0;
    const missed = totalInvited - totalAttended;
    return { total, upcoming, attendanceRate, missed };
  }, [events]);

  return (
    <>
      <StatCard title="Total Events" value={String(stats.total)} icon={CalendarDays} trend={`${stats.upcoming} upcoming`} trendUp iconColor="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-950/30" />
      <StatCard title="Upcoming Events" value={String(stats.upcoming)} icon={TrendingUp} trend="Active sessions" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
      <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={UserCheck} trend={`${stats.total} total events`} trendUp={stats.attendanceRate >= 60} iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
      <StatCard title="Missed Sessions" value={String(stats.missed)} icon={XCircle} trend="Requires attention" trendUp={false} iconColor="text-red-600 dark:text-red-400" bgColor="bg-red-50 dark:bg-red-950/30" />
    </>
  );
}

export function TrainerEventDashboardCards() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    if (!user) return { upcoming: 0, attendanceRate: 0, registered: 0, completed: 0 };
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
      attendanceRate: totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0,
      registered: totalRegistered,
      completed,
    };
  }, [user]);

  return (
    <>
      <StatCard title="Upcoming Sessions" value={String(stats.upcoming)} icon={CalendarDays} trend="Next 30 days" trendUp iconColor="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-950/30" />
      <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={UserCheck} trend={`${stats.registered} registered`} trendUp={stats.attendanceRate >= 60} iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
      <StatCard title="Registered Learners" value={String(stats.registered)} icon={Users} trend="Across all events" trendUp iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
      <StatCard title="Completed Events" value={String(stats.completed)} icon={Award} trend="Delivered" trendUp iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
    </>
  );
}
