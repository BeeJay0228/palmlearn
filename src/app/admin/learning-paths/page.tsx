"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Map, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLearningPaths() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6 animate-fade-in">
        <PageHeader
          title="Learning Paths"
          description="Create structured learning journeys by grouping courses into paths for specific roles or goals."
          breadcrumb={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Learning" },
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
