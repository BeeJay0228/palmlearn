"use client";

import { PageHeader } from "@/components/ui/page-header";
import { TrainerEventAnalytics } from "@/components/events/event-analytics";

export default function TrainerEventAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Event Analytics"
        description="Your training event performance and attendance metrics."
      />
      <TrainerEventAnalytics />
    </div>
  );
}
