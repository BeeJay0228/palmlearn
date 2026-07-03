"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { TrainerPerformanceProfile } from "@/components/analytics/trainer-performance-profile";

export default function AdminTrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard requiredRole="admin">
      <TrainerPerformanceProfile trainerId={id} />
    </AuthGuard>
  );
}
