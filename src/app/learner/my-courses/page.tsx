"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCourses } from "@/lib/courses";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, User, GraduationCap, BookMarked, ArrowRight } from "lucide-react";
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

  const courses = useMemo(() => getCourses().filter((c) => c.status === "published"), []);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [courseId, courses]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Courses"
        description="Browse and manage all your enrolled and completed courses."
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="When courses are assigned to you, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const isHighlighted = courseId === course.id;
            return (
              <Link
                key={course.id}
                href={`/learner/course-view/${course.id}`}
                ref={isHighlighted ? highlightRef : undefined}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover block",
                  isHighlighted && "ring-2 ring-primary-500",
                )}
              >
                <div className="relative h-32 bg-gradient-to-br from-primary-600/20 via-primary-700/15 to-primary-900/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary-500/10 blur-2xl" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 dark:bg-surface/90 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-6 w-6 text-primary-600" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={DIFFICULTY_COLORS[course.difficulty] || "default"} size="sm">
                      {course.difficulty}
                    </Badge>
                    <span className="text-xs text-content-tertiary">{course.estimatedDuration} min</span>
                  </div>
                  <h3 className="text-sm font-semibold text-content group-hover:text-primary-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-xs text-content-tertiary mt-1 line-clamp-2 leading-relaxed">
                      {course.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-content-tertiary">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {course.instructor}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookMarked className="h-3 w-3" />
                      {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs text-content-tertiary">View course</span>
                    <ArrowRight className="h-3.5 w-3.5 text-content-tertiary group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
