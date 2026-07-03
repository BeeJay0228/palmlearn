"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { SectionSummary } from "@/components/ui/section-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLearningPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6 animate-fade-in">
        <PageHeader
          title="Learning Management"
          description="Create, manage, and organize courses, curricula, and learning paths for all users."
          breadcrumb={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Learning Management" },
          ]}
          action={
            <Button>
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          }
        />

        <SectionSummary
          title="Learning Delivery"
          description="Design and deliver comprehensive learning experiences through courses, learning paths, and resource libraries."
          icon={Library}
          stats={[
            { label: "Active Courses", value: "—" },
            { label: "Learning Paths", value: "—" },
            { label: "Resources", value: "—" },
            { label: "Total Enrollments", value: "—" },
          ]}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" asChild>
                <a href="/admin/courses"><BookOpen className="h-4 w-4" /> Courses</a>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <a href="/admin/resource-library"><Library className="h-4 w-4" /> Resources</a>
              </Button>
            </div>
          }
        />

        <EmptyState
          icon={BookOpen}
          title="Learning Management"
          description="This section provides a central hub for managing all learning content. Navigate to Courses or Resource Library to get started."
          size="lg"
          variant="bordered"
          action={
            <div className="flex gap-3">
              <Button asChild>
                <a href="/admin/courses">
                  <BookOpen className="h-4 w-4" /> Browse Courses
                </a>
              </Button>
              <Button variant="secondary" asChild>
                <a href="/admin/resource-library">
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
