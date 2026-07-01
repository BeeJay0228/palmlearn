"use client";

import { PageHeader } from "@/components/ui/page-header";
import { LearnerEventsPage } from "@/components/events/learner-events";
import { useRouter } from "next/navigation";

export default function LearnerEventsPageRoute() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Events"
        description="View and join your training events, workshops, and sessions."
      />
      <LearnerEventsPage onEventClick={(event) => router.push(`/learner/events/${event.id}`)} />
    </div>
  );
}
