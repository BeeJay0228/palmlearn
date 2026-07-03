"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getProgrammes, getProgrammeLearnerIds, getProgrammeProgress, seedProgrammes } from "@/lib/programmes";
import { getAssignmentsForProgramme } from "@/lib/learner-assignments";
import { getCourses } from "@/lib/courses";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { BookMarked, BookOpen, Clock, Users, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Programme } from "@/types";

function ProgrammeCard({ programme, progress, isHighlighted }: {
  programme: Programme;
  progress: { progress: number; completedCourses: number; totalCourses: number; completedAssignments: number; totalAssignments: number };
  isHighlighted: boolean;
}) {
  const isCompleted = progress.progress >= 100;
  const isInProgress = progress.progress > 0 && !isCompleted;
  const status: "active" | "completed" | "in_progress" = isCompleted ? "completed" : isInProgress ? "in_progress" : "active";

  return (
    <Link
      href={`/learner/programmes/${programme.id}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover block",
        isCompleted && "opacity-80",
        isHighlighted && "ring-2 ring-primary-500",
      )}
    >
      <div className="relative h-36 bg-gradient-to-br from-primary-600/20 via-primary-700/15 to-primary-900/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary-500/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-primary-400/10 blur-2xl" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 dark:bg-surface/90 shadow-lg group-hover:scale-110 transition-transform duration-300">
          {isCompleted ? (
            <GraduationCap className="h-7 w-7 text-emerald-500" />
          ) : (
            <BookMarked className="h-7 w-7 text-primary-600" />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface-tertiary/60">
          <div
            className={cn(
              "h-full transition-all duration-700",
              isCompleted ? "bg-emerald-500" : "bg-primary-600",
            )}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <StatusIndicator status={status} size="sm" />
          <span className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">
            Programme
          </span>
        </div>

        <h3 className="text-sm font-semibold text-content group-hover:text-primary-600 transition-colors line-clamp-1">
          {programme.name}
        </h3>

        {programme.description && (
          <p className="text-xs text-content-tertiary mt-1 line-clamp-2 leading-relaxed">
            {programme.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-content-tertiary">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {progress.completedCourses}/{progress.totalCourses}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {progress.completedAssignments}/{progress.totalAssignments}
          </span>
          {programme.endDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(programme.endDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1">
            <Progress value={progress.progress} size="sm" variant={isCompleted ? "success" : "default"} />
          </div>
          <span className={cn(
            "text-xs font-semibold",
            isCompleted ? "text-emerald-600" : "text-content-secondary",
          )}>
            {Math.round(progress.progress)}%
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-content-tertiary">
            {isCompleted ? "Completed" : isInProgress ? `${progress.completedCourses} course${progress.completedCourses !== 1 ? "s" : ""} done` : "Not started"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-content-tertiary group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

export default function LearnerProgrammesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [programmeId, setProgrammeId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const programmeIdParam = searchParams.get("programmeId");

  useEffect(() => { seedProgrammes(); }, []);

  useEffect(() => {
    if (filterParam === "training") setTab("active"); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filterParam]);

  useEffect(() => {
    if (programmeIdParam) setProgrammeId(programmeIdParam); // eslint-disable-line react-hooks/set-state-in-effect
  }, [programmeIdParam]);

  const items = useMemo(() => {
    if (!user) return [];
    const allProgrammes = getProgrammes().filter((p) =>
      tab === "active" ? p.status === "active" : p.status === "completed"
    );
    const courses = getCourses();
    return allProgrammes
      .map((programme) => {
        try {
          const inTargetAudience = getProgrammeLearnerIds(programme).includes(user.id);
          const hasRecords = getAssignmentsForProgramme(programme.id).some(
            (la) => la.learnerId === user.id
          );
          const progress = getProgrammeProgress(user.id, programme);
          return { programme, isAssigned: inTargetAudience || hasRecords, progress, courses };
        } catch {
          return null;
        }
      })
      .filter((i): i is NonNullable<typeof i> => i !== null && i.isAssigned);
  }, [user, tab]);

  useEffect(() => {
    if (highlightRef.current && programmeId) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [programmeId, items]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Training Programmes"
        description="View and track your enrolled training programmes."
      />

      <div className="flex items-center gap-1 bg-surface-tertiary/50 p-1 rounded-xl w-fit">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              tab === t
                ? "bg-surface text-content shadow-sm"
                : "text-content-tertiary hover:text-content",
            )}
          >
            {t === "active" ? "Active" : "Completed"}
          </button>
        ))}
      </div>

      {filterParam === "training" && (
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium bg-primary-50 dark:bg-primary-950/20 px-3 py-2 rounded-lg w-fit">
          <BookMarked className="h-3.5 w-3.5" />
          Showing all programmes
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No programmes yet"
          description="When training programmes are assigned to you, they will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ programme, progress }) => (
            <div key={programme.id} ref={programmeId === programme.id ? highlightRef : undefined}>
              <ProgrammeCard
                programme={programme}
                progress={progress}
                isHighlighted={programmeId === programme.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
