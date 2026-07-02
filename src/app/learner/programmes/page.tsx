"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getProgrammes, getProgrammeLearnerIds, getProgrammeProgress, seedProgrammes } from "@/lib/programmes";
import { getAssignmentsForProgramme } from "@/lib/learner-assignments";
import { getCourses } from "@/lib/courses";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookMarked, ChevronRight, BookOpen, CheckCircle, Clock, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LearnerProgrammesPage() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    seedProgrammes();
  }, []);

  const items = useMemo(() => {
    if (!user) return [];
    const allProgrammes = getProgrammes().filter((p) => p.status === "active");
    const courses = getCourses();
    const items: { programme: typeof allProgrammes[number]; isAssigned: boolean; progress: ReturnType<typeof getProgrammeProgress>; courses: typeof courses }[] = [];
    for (const programme of allProgrammes) {
      try {
        const inTargetAudience = getProgrammeLearnerIds(programme).includes(user.id);
        const hasRecords = getAssignmentsForProgramme(programme.id).some(
          (la) => la.learnerId === user.id
        );
        const progress = getProgrammeProgress(user.id, programme);
        items.push({ programme, isAssigned: inTargetAudience || hasRecords, progress, courses });
      } catch {
        // skip problematic programmes
      }
    }
    return items;
  }, [user]);

  if (!user) return null;

  const assignedItems = items.filter((i) => i.isAssigned);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content">Training Programmes</h1>
        <p className="text-sm text-content-secondary mt-1">
          View and track your enrolled training programmes.
        </p>
      </div>

      {assignedItems.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No programmes yet"
          description="When training programmes are assigned to you, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignedItems.map(({ programme, progress }) => {
            const isCompleted = progress.progress >= 100;
            const isInProgress = progress.progress > 0 && !isCompleted;
            return (
              <Link
                key={programme.id}
                href={`/learner/programmes/${programme.id}`}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-border/50 bg-surface transition-all card-hover group",
                  isCompleted && "opacity-75",
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                    isCompleted
                      ? "bg-emerald-50 dark:bg-emerald-950/30"
                      : isInProgress
                        ? "bg-amber-50 dark:bg-amber-950/30"
                        : "bg-surface-tertiary",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-7 w-7 text-emerald-500" />
                  ) : (
                    <BookMarked className="h-7 w-7 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-content truncate">
                      {programme.name}
                    </h3>
                    <Badge
                      variant={isCompleted ? "success" : isInProgress ? "warning" : "default"}
                      size="sm"
                    >
                      {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                  {programme.description && (
                    <p className="text-sm text-content-tertiary mt-1 line-clamp-2">
                      {programme.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 max-w-[200px] h-2 rounded-full bg-surface-tertiary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isCompleted
                            ? "bg-emerald-500"
                            : "bg-primary-600",
                        )}
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-content-secondary">
                      {progress.progress}%
                    </span>
                    <span className="text-xs text-content-tertiary flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {progress.completedCourses}/{progress.totalCourses} courses
                    </span>
                    <span className="text-xs text-content-tertiary flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {progress.completedAssignments}/{progress.totalAssignments} assignments
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-content-tertiary">
                    {programme.endDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(programme.endDate).toLocaleDateString()}
                      </span>
                    )}
                    {(programme.createdBy || programme.publishedBy) && (
                      <span>By: {programme.publishedBy || programme.createdBy}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-content-tertiary shrink-0 group-hover:text-primary-600 transition-colors hidden sm:block" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
