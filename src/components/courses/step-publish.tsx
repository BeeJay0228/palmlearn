"use client";

import { cn } from "@/lib/utils";
import type { Course, CourseStatus } from "@/types";
import { COURSE_STATUS_LABELS, COURSE_STATUS_COLORS } from "@/types";
import { CheckCircle2, AlertCircle, BookOpen, Clock, Users } from "lucide-react";

interface StepPublishProps {
  course: Course;
  onStatusChange: (status: CourseStatus) => void;
}

const statusOptions: { value: CourseStatus; description: string }[] = [
  { value: "draft", description: "Only you can see this course. Edit and refine before publishing." },
  { value: "review", description: "Submit for review. Reviewers can provide feedback before publication." },
  { value: "published", description: "Make the course available to assigned learners immediately." },
  { value: "archived", description: "Remove from active use. Learners can no longer access this course." },
];

export function StepPublish({ course, onStatusChange }: StepPublishProps) {
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = course.modules.reduce((acc, m) => acc + m.duration, 0);

  const completeness = [
    { label: "Course Title", done: !!course.title },
    { label: "Description", done: !!course.description },
    { label: "Instructor", done: !!course.instructor },
    { label: "Category", done: !!course.categoryId },
    { label: "Difficulty", done: !!course.difficulty },
    { label: "Duration", done: course.estimatedDuration > 0 },
    { label: "At least 1 Module", done: course.modules.length > 0 },
    { label: "At least 1 Lesson", done: totalLessons > 0 },
  ];

  const completedItems = completeness.filter((c) => c.done).length;
  const totalItems = completeness.length;
  const progress = Math.round((completedItems / totalItems) * 100);
  const isReady = completedItems === totalItems;

  return (
    <div className="flex flex-col gap-6">
      {/* Readiness Check */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-content">Course Readiness</h3>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", isReady ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
            {isReady ? "Ready to Publish" : `${completedItems}/${totalItems} complete`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-secondary overflow-hidden mb-4">
          <div className={cn("h-full rounded-full transition-all", isReady ? "bg-success" : "bg-warning")} style={{ width: `${progress}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {completeness.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              )}
              <span className={cn("text-xs", item.done ? "text-content-secondary" : "text-content")}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-content mb-3">Course Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-content">{course.modules.length}</p>
              <p className="text-xs text-content-tertiary">Modules</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-content">{totalLessons}</p>
              <p className="text-xs text-content-tertiary">Lessons</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-content">{totalDuration}</p>
              <p className="text-xs text-content-tertiary">Total Minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-content">{course.resources.length}</p>
              <p className="text-xs text-content-tertiary">Resources</p>
            </div>
          </div>
        </div>
      </section>

      {/* Status Selection */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-content mb-4">Set Course Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                course.status === opt.value
                  ? "border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 ring-1 ring-primary-600"
                  : "border-border bg-surface-secondary hover:border-border-strong hover:bg-surface-hover"
              )}
            >
              <span className={cn("px-2 py-0.5 rounded-md text-xs font-semibold mt-0.5", COURSE_STATUS_COLORS[opt.value])}>
                {COURSE_STATUS_LABELS[opt.value]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-content">{COURSE_STATUS_LABELS[opt.value]}</p>
                <p className="text-xs text-content-tertiary mt-1">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
