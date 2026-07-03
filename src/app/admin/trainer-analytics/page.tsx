"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { TrainerAnalyticsList } from "@/components/analytics/trainer-analytics-list";

export default function AdminTrainerAnalyticsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <TrainerAnalyticsList />
    </AuthGuard>
  );
}
