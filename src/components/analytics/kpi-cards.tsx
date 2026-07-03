"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { getAdminKpiData, getTrainerKpiData, type AnalyticsFilter } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";
import {
  Users, UserCheck, UserX, BookOpen, CheckCircle, FileText,
  Award, TrendingUp, BarChart3, GraduationCap, Clock,
} from "lucide-react";

export function AdminKpiCards({ filter }: { filter: AnalyticsFilter }) {
  const data = useMemo(() => getAdminKpiData(filter), [filter]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard title="Total Learners" value={String(data.totalLearners)} icon={Users} iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
      <StatCard title="Active Learners" value={String(data.activeLearners)} icon={UserCheck} iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
      <StatCard title="Inactive Learners" value={String(data.inactiveLearners)} icon={UserX} iconColor="text-gray-600 dark:text-gray-400" bgColor="bg-gray-50 dark:bg-gray-950/30" />
      <StatCard title="Total Programmes" value={String(data.totalProgrammes)} icon={BookOpen} iconColor="text-indigo-600 dark:text-indigo-400" bgColor="bg-indigo-50 dark:bg-indigo-950/30" />
      <StatCard title="Published" value={String(data.publishedProgrammes)} icon={CheckCircle} trend={`${data.draftProgrammes} draft`} trendUp iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
      <StatCard title="Courses Completed" value={String(data.coursesCompleted)} icon={GraduationCap} iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
      <StatCard title="Assignments Submitted" value={String(data.assignmentsSubmitted)} icon={FileText} iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
      <StatCard title="Certificates Issued" value={String(data.certificatesIssued)} icon={Award} iconColor="text-rose-600 dark:text-rose-400" bgColor="bg-rose-50 dark:bg-rose-950/30" />
      <StatCard title="Completion Rate" value={`${data.overallCompletionRate}%`} icon={TrendingUp} trend={`${data.coursesCompleted} completed`} trendUp iconColor="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-950/30" />
      <StatCard title="Avg Course Progress" value={`${data.averageCourseProgress}%`} icon={BarChart3} iconColor="text-cyan-600 dark:text-cyan-400" bgColor="bg-cyan-50 dark:bg-cyan-950/30" />
      <StatCard title="Avg Assignment Score" value={data.averageAssignmentScore > 0 ? `${data.averageAssignmentScore}%` : "N/A"} icon={Award} iconColor="text-violet-600 dark:text-violet-400" bgColor="bg-violet-50 dark:bg-violet-950/30" />
    </div>
  );
}

export function TrainerKpiCards({ filter }: { filter: AnalyticsFilter }) {
  const { user } = useAuth();
  const data = useMemo(() => {
    if (!user) return null;
    return getTrainerKpiData(user, filter);
  }, [user, filter]);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard title="Assigned Learners" value={String(data.totalAssignedLearners)} icon={Users} iconColor="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-950/30" />
      <StatCard title="Active Learners" value={String(data.activeLearners)} icon={UserCheck} iconColor="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-950/30" />
      <StatCard title="Programmes Published" value={String(data.programmesPublished)} icon={BookOpen} iconColor="text-indigo-600 dark:text-indigo-400" bgColor="bg-indigo-50 dark:bg-indigo-950/30" />
      <StatCard title="Courses Completed" value={String(data.coursesCompleted)} icon={GraduationCap} iconColor="text-purple-600 dark:text-purple-400" bgColor="bg-purple-50 dark:bg-purple-950/30" />
      <StatCard title="Assignments Submitted" value={String(data.assignmentsSubmitted)} icon={FileText} iconColor="text-amber-600 dark:text-amber-400" bgColor="bg-amber-50 dark:bg-amber-950/30" />
      <StatCard title="Avg Learner Progress" value={`${data.averageLearnerProgress}%`} icon={BarChart3} iconColor="text-cyan-600 dark:text-cyan-400" bgColor="bg-cyan-50 dark:bg-cyan-950/30" />
      <StatCard title="Overall Completion" value={`${data.overallCompletionPercent}%`} icon={TrendingUp} trend={`${data.coursesCompleted} done`} trendUp iconColor="text-primary-600 dark:text-primary-400" bgColor="bg-primary-50 dark:bg-primary-950/30" />
    </div>
  );
}
