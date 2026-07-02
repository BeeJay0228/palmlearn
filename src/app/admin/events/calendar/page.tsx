"use client";

import { PageHeader } from "@/components/ui/page-header";
import { EventCalendar } from "@/components/events/event-calendar";
import { getEvents, seedEvents } from "@/lib/events";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminEventsCalendarPage() {
  const router = useRouter();

  useEffect(() => { seedEvents(); }, []);

  const events = getEvents();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events Calendar"
        description="View and manage training events on a calendar."
      />
      <EventCalendar
        events={events}
        onEventClick={(event) => router.push(`/admin/events/${event.id}`)}
      />
    </div>
  );
}
