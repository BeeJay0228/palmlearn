"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LearnerPerformanceProfile } from "@/components/analytics/learner-performance-profile";

export default function AdminLearnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard requiredRole="admin">
      <LearnerPerformanceProfile learnerId={id} />
    </AuthGuard>
  );
}
