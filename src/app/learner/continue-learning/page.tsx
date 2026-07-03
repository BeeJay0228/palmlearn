"use client";

import { PageHeader } from "@/components/ui/page-header";
import { LearnerContinueLearning } from "@/components/assignments/learner-assignments";

export default function LearnerContinueLearningPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Continue Learning"
        description="Pick up where you left off across all your enrolled courses and programmes."
      />
      <LearnerContinueLearning maxItems={999} heading="Your Assignments" />
    </div>
  );
}
