"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ReportCenter } from "@/components/reports/report-center";

export default function TrainerReportsPage() {
  return (
    <AuthGuard requiredRole="trainer">
      <ReportCenter isSuperAdmin={false} />
    </AuthGuard>
  );
}
