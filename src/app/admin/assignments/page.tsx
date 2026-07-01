"use client";

import { useEffect } from "react";
import { AssignmentsPage } from "@/components/assignments/assignments-page";
import { seedAssignments } from "@/lib/assignments";
import { seedLearnerAssignments } from "@/lib/learner-assignments";

export default function AdminAssignmentsRoute() {
  useEffect(() => {
    seedAssignments();
    seedLearnerAssignments();
  }, []);

  return <AssignmentsPage role="admin" />;
}
