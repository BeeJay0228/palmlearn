"use client";

import { getAllUsers } from "./auth";
import { getProgrammes, getProgrammeLearnerIds } from "./programmes";

export function getTrainerLearnerIds(trainerId: string): Set<string> {
  const programmes = getProgrammes().filter(
    (p) => p.createdBy === trainerId || p.assignedBy === trainerId
  );
  const ids = new Set<string>();
  for (const p of programmes) {
    for (const lid of getProgrammeLearnerIds(p)) ids.add(lid);
  }
  const allUsers = getAllUsers();
  const trainer = allUsers.find((u) => u.id === trainerId);
  if (trainer?.categoryId) {
    for (const u of allUsers) {
      if (u.role === "learner" && u.categoryId === trainer.categoryId) ids.add(u.id);
    }
  }
  return ids;
}

export function getTrainerProgrammes(trainerId: string) {
  return getProgrammes().filter(
    (p) => p.createdBy === trainerId || p.assignedBy === trainerId
  );
}
