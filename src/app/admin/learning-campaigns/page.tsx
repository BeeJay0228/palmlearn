"use client";

import { useEffect } from "react";
import { LearningCampaignsPage } from "@/components/assignments/learning-campaigns-page";
import { seedCampaigns } from "@/lib/campaigns";

export default function AdminLearningCampaignsRoute() {
  useEffect(() => {
    seedCampaigns();
  }, []);

  return <LearningCampaignsPage />;
}
