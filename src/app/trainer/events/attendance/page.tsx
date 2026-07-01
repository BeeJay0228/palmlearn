"use client";

import { PageHeader } from "@/components/ui/page-header";
import { AttendancePage } from "@/components/events/attendance-page";

export default function TrainerAttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance"
        description="Track learner attendance for your training events."
      />
      <AttendancePage role="trainer" />
    </div>
  );
}
