"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LearnerCourseView } from "@/components/assignments/learner-course-view";

export default function LearnerCourseViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AuthGuard requiredRole="learner">
      <LearnerCourseView courseId={id} />
    </AuthGuard>
  );
}
