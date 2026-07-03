"use client";

import { use } from "react";
import { ProgrammeAnalytics } from "@/components/analytics/programme-analytics";

export default function TrainerProgrammeAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProgrammeAnalytics programmeId={id} />;
}
