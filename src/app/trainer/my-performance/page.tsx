"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { TrainerPerformanceProfile } from "@/components/analytics/trainer-performance-profile";

export default function TrainerMyPerformancePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AuthGuard requiredRole="trainer">
      <TrainerPerformanceProfile trainerId={user.id} />
    </AuthGuard>
  );
}
