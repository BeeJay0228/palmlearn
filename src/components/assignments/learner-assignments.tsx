"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getAssignmentsForLearner } from "@/lib/learner-assignments";
import { getAssignments } from "@/lib/assignments";
import { getCourses } from "@/lib/courses";
import { getProgrammes, getProgrammeProgress } from "@/lib/programmes";
import { useAuth } from "@/hooks/use-auth";
import type { LearnerAssignment, Course, Assignment } from "@/types";
import { PlayCircle, Clock, AlertCircle, CheckCircle, BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";

interface EnrichedItem extends LearnerAssignment {
  course: Course | undefined;
  assignment: Assignment | undefined;
  daysLeft?: number | null;
}

interface ProgrammeCard {
  type: "programme";
  id: string;
  name: string;
  description: string;
  progress: number;
  totalCourses: number;
  completedCourses: number;
}

export function LearnerContinueLearning({ maxItems = 8, heading = "Continue Learning" }: { maxItems?: number; heading?: string }) {
  const { user } = useAuth();

  const items = useMemo(() => {
    if (!user) return [];
    const records = getAssignmentsForLearner(user.id).filter((r) => r.status === "in_progress" || r.status === "not_started");
    const courses = getCourses();
    const assignments = getAssignments();
    const enriched: EnrichedItem[] = records.map((r) => {
      const course = courses.find((c) => c.id === r.courseId);
      const asgn = assignments.find((a) => a.id === r.assignmentId);
      return { ...r, course, assignment: asgn };
    });
    // Sort: assignments first, then standalone courses
    enriched.sort((a, b) => {
      if (a.assignmentId && !b.assignmentId) return -1;
      if (!a.assignmentId && b.assignmentId) return 1;
      return 0;
    });
    return enriched;
  }, [user]);

  const programmeItems = useMemo(() => {
    if (!user) return [];
    if (items.length > 0) return [];
    const programmes = getProgrammes().filter((p) => p.status === "active");
    const withProgress = programmes.map((p) => {
      const progress = getProgrammeProgress(user.id, p);
      return { ...p, prog: progress };
    }).filter((p) => p.prog.totalCourses > 0 && p.prog.progress < 100);
    return withProgress.map<ProgrammeCard>((p) => ({
      type: "programme",
      id: p.id,
      name: p.name,
      description: p.description,
      progress: p.prog.progress,
      totalCourses: p.prog.totalCourses,
      completedCourses: p.prog.completedCourses,
    }));
  }, [user, items]);

  const allDone = items.length === 0 && programmeItems.length === 0;

  if (allDone) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-content">{heading}</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-border/50 bg-surface">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 mb-4">
            <CheckCircle className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-lg font-semibold text-content">You&apos;re all caught up!</p>
          <p className="text-sm text-content-tertiary mt-1">No pending courses, assignments, or programmes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PlayCircle className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-bold text-content">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.slice(0, maxItems).map((item) => (
          <Link key={item.id} href={item.course ? `/learner/course-view/${item.course.id}` : "#"} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover cursor-pointer block">
            <div className="relative h-28 bg-gradient-to-br from-primary-600/20 to-primary-800/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 dark:bg-surface/90 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <PlayCircle className="h-5 w-5 text-primary-600" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-tertiary">
                <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
            <div className="p-3.5">
              <p className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider truncate">
                {item.assignment?.name || "Assignment"}
              </p>
              <h3 className="text-sm font-semibold text-content mt-0.5 line-clamp-1">{item.course?.title || "Unknown Course"}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold text-content-secondary">{item.progress}%</span>
                <ChevronRight className="h-3.5 w-3.5 text-content-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        ))}
        {programmeItems.slice(0, maxItems).map((item) => (
          <Link key={item.id} href={`/learner/programmes/${item.id}`} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover cursor-pointer block">
            <div className="relative h-28 bg-gradient-to-br from-purple-600/20 to-purple-800/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 dark:bg-surface/90 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-tertiary">
                <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
            <div className="p-3.5">
              <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider truncate">
                Training Programme
              </p>
              <h3 className="text-sm font-semibold text-content mt-0.5 line-clamp-1">{item.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold text-content-secondary">{item.completedCourses}/{item.totalCourses} courses</span>
                <ChevronRight className="h-3.5 w-3.5 text-content-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LearnerMandatoryLearning() {
  const { user } = useAuth();

  const mandatory = useMemo(() => {
    if (!user) return [];
    const records = getAssignmentsForLearner(user.id).filter((r) => r.status === "not_started");
    const assignments = getAssignments();
    const courses = getCourses();
    return records.map<EnrichedItem>((r) => {
      const asgn = assignments.find((a) => a.id === r.assignmentId);
      const course = courses.find((c) => c.id === r.courseId);
      return { ...r, assignment: asgn, course };
    }).filter((r) => r.assignment?.type === "mandatory" || r.assignment?.type === "refresher");
  }, [user]);

  if (mandatory.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-danger" />
        <h2 className="text-lg font-bold text-content">Mandatory Learning</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mandatory.slice(0, 6).map((item) => (
          <Link key={item.id} href={item.course ? `/learner/course-view/${item.course.id}` : "#"} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10">
              <BookOpen className="h-5 w-5 text-danger" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content truncate">{item.course?.title || "Unknown"}</p>
              <p className="text-xs text-content-tertiary truncate">{item.assignment?.name}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-content-tertiary shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LearnerDueSoon() {
  const { user } = useAuth();

  const dueSoon = useMemo(() => {
    if (!user) return [];
    const records = getAssignmentsForLearner(user.id).filter((r) => r.status === "not_started" || r.status === "in_progress");
    const assignments = getAssignments();
    const courses = getCourses();
    const now = new Date();
    return records.map<EnrichedItem>((r) => {
      const asgn = assignments.find((a) => a.id === r.assignmentId);
      const course = courses.find((c) => c.id === r.courseId);
      const dueDate = asgn?.schedule?.dueDate ? new Date(asgn.schedule.dueDate) : null;
      const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      return { ...r, assignment: asgn, course, daysLeft };
    }).filter((r) => r.daysLeft != null && r.daysLeft >= 0 && r.daysLeft <= 14)
      .sort((a, b) => (a.daysLeft as number) - (b.daysLeft as number));
  }, [user]);

  if (dueSoon.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-content">Due Soon</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dueSoon.slice(0, 6).map((item) => (
          <Link key={item.id} href={item.course ? `/learner/course-view/${item.course.id}` : "#"} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-surface transition-all card-hover">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content truncate">{item.course?.title || "Unknown"}</p>
              <p className={cn("text-xs font-medium", item.daysLeft != null && item.daysLeft <= 3 ? "text-danger" : "text-amber-500")}>
                {item.daysLeft != null ? `${item.daysLeft} day${item.daysLeft !== 1 ? "s" : ""} left` : "No due date"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-content-tertiary shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LearnerCompleted() {
  const { user } = useAuth();

  const completed = useMemo(() => {
    if (!user) return [];
    const records = getAssignmentsForLearner(user.id).filter((r) => r.status === "completed");
    const courses = getCourses();
    const assignments = getAssignments();
    return records.map<EnrichedItem>((r) => {
      const course = courses.find((c) => c.id === r.courseId);
      const asgn = assignments.find((a) => a.id === r.assignmentId);
      return { ...r, course, assignment: asgn };
    });
  }, [user]);

  if (completed.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-content">Completed</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {completed.slice(0, 6).map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-surface opacity-75">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content truncate">{item.course?.title || "Unknown"}</p>
              <p className="text-xs text-content-tertiary">{item.completedDate ? new Date(item.completedDate).toLocaleDateString() : "Completed"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
