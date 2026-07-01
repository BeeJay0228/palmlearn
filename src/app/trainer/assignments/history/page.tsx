"use client";

import { useEffect } from "react";
import { AssignmentHistory } from "@/components/assignments/assignment-history";
import { seedLearnerAssignments } from "@/lib/learner-assignments";

export default function TrainerAssignmentHistoryRoute() {
  useEffect(() => {
    seedLearnerAssignments();
  }, []);

  return <AssignmentHistory role="trainer" />;
}
