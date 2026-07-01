"use client";

import { PageHeader } from "@/components/ui/page-header";
import { EventsPage } from "@/components/events/events-page";

export default function TrainerEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Events"
        description="Manage your training events."
      />
      <EventsPage role="trainer" />
    </div>
  );
}
