"use client";

import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { EventCalendar } from "@/components/events/event-calendar";
import { getEvents, seedEvents } from "@/lib/events";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function TrainerEventsCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  seedEvents();

  const events = useMemo(() => {
    const all = getEvents();
    if (!user) return all;
    return all.filter((e) => e.trainerId === user.id || e.createdBy === user.id);
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events Calendar"
        description="View your training events on a calendar."
      />
      <EventCalendar
        events={events}
        onEventClick={(event) => router.push(`/trainer/events/${event.id}`)}
      />
    </div>
  );
}
