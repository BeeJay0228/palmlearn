"use client";

import { PageHeader } from "@/components/ui/page-header";
import { AttendancePage } from "@/components/events/attendance-page";

export default function AdminAttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance"
        description="Track learner attendance across all training events."
      />
      <AttendancePage role="admin" />
    </div>
  );
}
