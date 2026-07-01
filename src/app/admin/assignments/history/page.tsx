"use client";

import { useEffect } from "react";
import { AssignmentHistory } from "@/components/assignments/assignment-history";
import { seedLearnerAssignments } from "@/lib/learner-assignments";

export default function AdminAssignmentHistoryRoute() {
  useEffect(() => {
    seedLearnerAssignments();
  }, []);

  return <AssignmentHistory role="admin" />;
}
