"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, COURSE_STATUS_LABELS, COURSE_STATUS_COLORS } from "@/types";
import { BookOpen, Clock, User, Globe, Play, FileText, CheckCircle, ChevronDown } from "lucide-react";

interface CoursePreviewProps {
  course: Course;
  className?: string;
}

export function CoursePreview({ course, className }: CoursePreviewProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(course.modules[0]?.id ?? null);

  const totalDuration = course.modules.reduce((acc, m) => acc + m.duration, 0);
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className={cn("flex flex-col gap-6 max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-0.5 rounded-md text-xs font-semibold", DIFFICULTY_COLORS[course.difficulty])}>
            {DIFFICULTY_LABELS[course.difficulty]}
          </span>
          <span className={cn("px-2 py-0.5 rounded-md text-xs font-semibold", COURSE_STATUS_COLORS[course.status])}>
            {COURSE_STATUS_LABELS[course.status]}
          </span>
          <span className="text-xs text-content-tertiary">v{course.version}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-content">{course.title}</h1>
        {course.subtitle && <p className="text-base text-content-secondary">{course.subtitle}</p>}

        <div className="flex flex-wrap items-center gap-4 text-sm text-content-secondary">
          {course.instructor && (
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {course.instructor}</span>
          )}
          <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {totalDuration} min</span>
          {course.language && (
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> {course.language}</span>
          )}
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <section>
          <h2 className="text-lg font-semibold text-content mb-2">About This Course</h2>
          <p className="text-sm text-content-secondary leading-relaxed">{course.description}</p>
        </section>
      )}

      {/* Course Content */}
      <section>
        <h2 className="text-lg font-semibold text-content mb-4">Course Content</h2>
        <div className="flex items-center gap-3 mb-4 text-sm text-content-secondary">
          <span>{course.modules.length} module{course.modules.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{totalDuration} min total</span>
        </div>

        <div className="flex flex-col gap-2">
          {course.modules.length === 0 ? (
            <div className="py-8 text-center text-sm text-content-tertiary">
              No content has been added to this course yet.
            </div>
          ) : (
            course.modules.map((mod) => {
              const isOpen = expandedModule === mod.id;
              return (
                <div key={mod.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-surface-secondary/50 transition-colors"
                  >
                    <ChevronDown className={cn("h-4 w-4 text-content-tertiary transition-transform", isOpen && "rotate-180")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content">{mod.title || "Untitled Module"}</p>
                      {mod.description && <p className="text-xs text-content-tertiary mt-0.5">{mod.description}</p>}
                    </div>
                    <span className="text-xs text-content-tertiary">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""} · {mod.duration} min</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-border">
                      {mod.lessons.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-content-tertiary">No lessons in this module</p>
                      ) : (
                        mod.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-secondary/30 transition-colors border-b border-border last:border-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-content-tertiary">
                              <span className="text-xs font-medium">{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-content">{lesson.title || "Untitled Lesson"}</p>
                            </div>
                            <div className={cn("flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", lesson.type === "text" ? "text-info bg-info/10" : lesson.type === "video" ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30" : "text-content-tertiary bg-surface-secondary")}>
                              {lesson.type === "text" && <FileText className="h-3 w-3" />}
                              {lesson.type === "video" && <Play className="h-3 w-3" />}
                              {lesson.type !== "text" && lesson.type !== "video" && <FileText className="h-3 w-3" />}
                              {lesson.duration > 0 && <span>{lesson.duration} min</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Resources */}
      {course.resources.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-content mb-3">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {course.resources.map((id) => (
              <div key={id} className="flex items-center gap-2 rounded-lg border border-border bg-surface-secondary p-3">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm text-content">Resource {id.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-content mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-secondary text-xs font-medium text-content-secondary border border-border/50">{tag}</span>
            ))}
          </div>
        </section>
      )}

      {/* Analytics */}
      {course.analytics && (course.analytics.views > 0 || course.analytics.assignedLearners > 0) && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-content mb-3">Course Analytics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-content">{course.analytics.views.toLocaleString()}</p>
              <p className="text-xs text-content-tertiary">Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-content">{course.analytics.assignedLearners.toLocaleString()}</p>
              <p className="text-xs text-content-tertiary">Assigned Learners</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-content">{course.analytics.completionRate}%</p>
              <p className="text-xs text-content-tertiary">Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-content">{course.analytics.averageScore}%</p>
              <p className="text-xs text-content-tertiary">Average Score</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
