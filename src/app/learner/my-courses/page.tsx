"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCourses } from "@/lib/courses";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, ChevronRight, Clock, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLORS: Record<string, "default" | "success" | "warning" | "danger" | "secondary" | "glass"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export default function LearnerMyCoursesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  const [courseId, setCourseId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (courseIdParam) setCourseId(courseIdParam);
  }, [courseIdParam]);

  const courses = useMemo(() => {
    return getCourses().filter((c) => c.status === "published");
  }, []);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [courseId, courses]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content">My Courses</h1>
        <p className="text-sm text-content-secondary mt-1">
          Browse and manage all your enrolled and completed courses.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="When courses are assigned to you, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => {
            const isHighlighted = courseId === course.id;
            return (
              <Link
                key={course.id}
                href={`/learner/course-view/${course.id}`}
                ref={isHighlighted ? highlightRef : undefined}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-surface transition-all card-hover group",
                  isHighlighted && "ring-2 ring-primary-500 animate-highlight-fade",
                )}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30">
                  <GraduationCap className="h-7 w-7 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-content truncate">{course.title}</h3>
                    <Badge variant={DIFFICULTY_COLORS[course.difficulty] || "default"} size="sm">
                      {course.difficulty}
                    </Badge>
                  </div>
                  {course.subtitle && (
                    <p className="text-sm text-content-tertiary mt-1 line-clamp-2">{course.subtitle}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-content-tertiary">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {course.instructor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.estimatedDuration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.modules.length} modules
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-content-tertiary shrink-0 group-hover:text-primary-600 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
