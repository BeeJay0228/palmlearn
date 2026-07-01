"use client";

import { PageHeader } from "@/components/ui/page-header";
import { AdminEventAnalytics } from "@/components/events/event-analytics";

export default function AdminEventAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Event Analytics"
        description="Overview of all training events, attendance rates, and trainer performance."
      />
      <AdminEventAnalytics />
    </div>
  );
}
