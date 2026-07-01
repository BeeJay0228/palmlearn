"use client";

import { useEffect } from "react";
import { LearningCampaignsPage } from "@/components/assignments/learning-campaigns-page";
import { seedCampaigns } from "@/lib/campaigns";

export default function TrainerLearningCampaignsRoute() {
  useEffect(() => {
    seedCampaigns();
  }, []);

  return <LearningCampaignsPage />;
}
