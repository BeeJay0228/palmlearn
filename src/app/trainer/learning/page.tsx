"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { SectionSummary } from "@/components/ui/section-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrainerLearningPage() {
  return (
    <AuthGuard requiredRole="trainer">
      <div className="flex flex-col gap-6 animate-fade-in">
        <PageHeader
          title="Learning Materials"
          description="Access and manage course materials, lesson plans, and training resources."
          breadcrumb={[
            { label: "Dashboard", href: "/trainer/dashboard" },
            { label: "Learning Materials" },
          ]}
        />

        <SectionSummary
          title="Learning Delivery"
          description="Access your courses and resource library to prepare and deliver learning content to your learners."
          icon={BookOpen}
          stats={[
            { label: "My Courses", value: "—" },
            { label: "Available Resources", value: "—" },
            { label: "Lessons Created", value: "—" },
          ]}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" asChild>
                <a href="/trainer/courses"><BookOpen className="h-4 w-4" /> My Courses</a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href="/trainer/resource-library"><Library className="h-4 w-4" /> Resources</a>
              </Button>
            </div>
          }
        />

        <EmptyState
          icon={BookOpen}
          title="Learning Materials"
          description="Access your courses and teaching resources here. Navigate to My Courses or Resource Library to get started."
          size="lg"
          variant="bordered"
          action={
            <div className="flex gap-3">
              <Button asChild>
                <a href="/trainer/courses">
                  <BookOpen className="h-4 w-4" /> My Courses
                </a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="/trainer/resource-library">
                  <Library className="h-4 w-4" /> Resource Library
                </a>
              </Button>
            </div>
          }
        />
      </div>
    </AuthGuard>
  );
}
