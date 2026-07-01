"use client";

import { PageHeader } from "@/components/ui/page-header";
import { EventsPage } from "@/components/events/events-page";

export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Events"
        description="Manage and oversee all training events across the organization."
      />
      <EventsPage role="admin" />
    </div>
  );
}
