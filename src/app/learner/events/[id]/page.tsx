"use client";

import { use } from "react";
import { EventDetails } from "@/components/events/event-details";
import { useRouter } from "next/navigation";

export default function LearnerEventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <EventDetails eventId={id} onBack={() => router.push("/learner/events")} />
    </div>
  );
}
