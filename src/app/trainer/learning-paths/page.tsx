"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Map, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrainerLearningPaths() {
  return (
    <AuthGuard requiredRole="trainer">
      <div className="flex flex-col gap-6 animate-fade-in">
        <PageHeader
          title="Learning Paths"
          description="Design learning paths to guide learners through a structured curriculum."
          breadcrumb={[
            { label: "Dashboard", href: "/trainer/dashboard" },
            { label: "Learning Paths" },
          ]}
          action={
            <Button>
              <Plus className="h-4 w-4" />
              Create Learning Path
            </Button>
          }
        />

        <EmptyState
          icon={Map}
          title="Learning Paths Coming Soon"
          description="Design learning paths to guide learners through a structured curriculum. This feature will be available soon."
          size="lg"
          variant="gradient"
        />
      </div>
    </AuthGuard>
  );
}
