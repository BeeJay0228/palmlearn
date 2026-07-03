"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { AnalyticsFilters } from "./analytics-filters";
import { AdminKpiCards, TrainerKpiCards } from "./kpi-cards";
import { RecentActivity } from "./recent-activity";
import { ProgrammePerformance } from "./programme-performance";
import { CoursePerformance } from "./course-performance";
import { AssignmentPerformance } from "./assignment-performance";
import { LearnerEngagement } from "./learner-engagement";
import { type AnalyticsFilter } from "@/lib/analytics";

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<AnalyticsFilter>({});

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Learning Analytics"
        description={isAdmin ? "Platform-wide learning performance overview" : "Your learners' performance at a glance"}
      />

      <AnalyticsFilters filter={filter} onChange={setFilter} />

      {isAdmin ? <AdminKpiCards filter={filter} /> : <TrainerKpiCards filter={filter} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgrammePerformance filter={filter} />
        <CoursePerformance filter={filter} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AssignmentPerformance filter={filter} />
        </div>
        <div className="lg:col-span-2">
          <LearnerEngagement filter={filter} />
        </div>
      </div>

      <RecentActivity filter={filter} />
    </div>
  );
}
