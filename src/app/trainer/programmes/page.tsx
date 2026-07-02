"use client";

import { useEffect } from "react";
import { TrainingProgrammesPage } from "@/components/assignments/training-programmes-page";
import { seedProgrammes } from "@/lib/programmes";

export default function TrainerProgrammesRoute() {
  useEffect(() => {
    seedProgrammes();
  }, []);

  return <TrainingProgrammesPage />;
}
