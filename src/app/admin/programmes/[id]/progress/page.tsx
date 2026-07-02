"use client";

import { use } from "react";
import { ProgrammeProgress } from "@/components/reports/programme-progress";

export default function AdminProgrammeProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProgrammeProgress programmeId={id} isSuperAdmin />;
}
