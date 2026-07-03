"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ReportCenter } from "@/components/reports/report-center";

export default function AdminReportsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <ReportCenter isSuperAdmin />
    </AuthGuard>
  );
}
