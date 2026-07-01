"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MyEventsPage } from "@/components/events/my-events-page";

export default function TrainerMyEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Events"
        description="Events you have created or are assigned as trainer."
      />
      <MyEventsPage role="trainer" />
    </div>
  );
}
