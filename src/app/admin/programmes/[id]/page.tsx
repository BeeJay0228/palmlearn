"use client";

import { use } from "react";
import { ProgrammeDetail } from "@/components/assignments/programme-detail";

export default function AdminProgrammeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProgrammeDetail programmeId={id} />;
}
