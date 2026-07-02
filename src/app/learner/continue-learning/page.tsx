"use client";

import { LearnerContinueLearning } from "@/components/assignments/learner-assignments";

export default function LearnerContinueLearningPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-7xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Continue Learning</h1>
        <p className="text-sm text-content-secondary mt-1">Pick up where you left off across all your enrolled courses.</p>
      </div>
      <LearnerContinueLearning maxItems={999} heading="Your Assignments" />
    </div>
  );
}
