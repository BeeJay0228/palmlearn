"use client";

import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollment, useLearningSession } from "@/hooks/use-learner-progress";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseById } from "@/lib/courses";
import {
  getCourseProgress,
  updateLearnerAssignment,
  markAssignmentCompleted,
} from "@/lib/learner-assignments";
import {
  DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  type Course, type Module, type Lesson,
} from "@/types";
import {
  PlayCircle, Clock, BookOpen, FileText, MessageCircle, FileDown,
  ArrowLeft, Loader2, CheckCircle, ChevronDown, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LearnerCourseViewProps {
  courseId: string;
}

export function LearnerCourseView({ courseId }: LearnerCourseViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const {
    enrollment,
    lessonProgress,
    loading: progressLoading,
    updateProgress,
    saveLessonProgress,
    refresh,
  } = useEnrollment(user?.id, courseId);
  const { begin, finish } = useLearningSession(user?.id, courseId);
  const [updating, setUpdating] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{
    moduleId: string;
    lesson: Lesson;
  } | null>(null);
  const sessionStarted = useRef(false);

  const course = useMemo(() => {
    if (!courseId) return null;
    return getCourseById(courseId);
  }, [courseId]);

  const progress = enrollment?.progress || 0;
  const laId = enrollment?.id || "";

  useEffect(() => {
    if (enrollment && enrollment.currentLessonId && enrollment.currentModuleId) {
      const mod = course?.modules.find((m) => m.id === enrollment.currentModuleId);
      const lesson = mod?.lessons.find((l) => l.id === enrollment.currentLessonId);
      if (lesson) {
        setActiveLesson({ moduleId: enrollment.currentModuleId, lesson });
      }
    }
  }, [enrollment, course]);

  const isLessonCompleted = useCallback(
    (lessonId: string) => lessonProgress.find((l) => l.lessonId === lessonId)?.completed ?? false,
    [lessonProgress]
  );

  const completedCount = useMemo(
    () => course?.modules.reduce(
      (sum, m) => sum + m.lessons.filter((l) => isLessonCompleted(l.id)).length,
      0
    ) ?? 0,
    [course, isLessonCompleted]
  );

  const totalLessons = useMemo(
    () => course?.modules.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0,
    [course]
  );

  const calculatedProgress = useMemo(
    () => totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : enrollment?.progress ?? 0,
    [totalLessons, completedCount, enrollment]
  );

  function computeDerivedProgress(moduleLessons: { moduleId: string; lessons: Lesson[] }[]) {
    const allLessons = moduleLessons.flatMap((m) => m.lessons);
    const completed = allLessons.filter((l) => isLessonCompleted(l.id)).length;
    return allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0;
  }

  async function handleStartLesson(moduleId: string, lesson: Lesson) {
    setActiveLesson({ moduleId, lesson });

    try {
      await saveLessonProgress(moduleId, lesson.id, false);
      await updateProgress({
        currentModuleId: moduleId,
        currentLessonId: lesson.id,
      });
    } catch {
    }

    if (!sessionStarted.current) {
      sessionStarted.current = true;
      begin({ lessonId: lesson.id, moduleId });
    }
  }

  async function handleCompleteLesson(moduleId: string, lesson: Lesson) {
    setActiveLesson(null);

    const total = course?.modules.reduce((s, m) => s + m.lessons.length, 0) ?? 0;
    const done = lessonProgress.filter((l) => l.completed).length + 1;
    const derivedProgress = total > 0 ? Math.round((done / total) * 100) : 0;

    try {
      await saveLessonProgress(moduleId, lesson.id, true);
      await finish(derivedProgress);
      sessionStarted.current = false;

      const markComplete = derivedProgress >= 100;
      await updateProgress({
        progress: derivedProgress,
        status: markComplete ? "completed" : "in_progress",
        timeSpent: (enrollment?.timeSpent || 0) + 15,
      });

      if (markComplete && laId) {
        markAssignmentCompleted(laId);
      }
    } catch {
    }
  }

  async function handleContinue() {
    if (!user || !laId) return;
    setUpdating(true);

    try {
      const mods = course?.modules ?? [];
      const currentMod = mods.find((m) => m.id === enrollment?.currentModuleId);
      const currentLess = currentMod?.lessons.find((l) => l.id === enrollment?.currentLessonId);

      if (currentLess && currentMod) {
        setActiveLesson({ moduleId: currentMod.id, lesson: currentLess });
        await saveLessonProgress(currentMod.id, currentLess.id, false);
        setUpdating(false);
        return;
      }

      const firstLesson = mods[0]?.lessons[0];
      if (firstLesson) {
        setActiveLesson({ moduleId: mods[0].id, lesson: firstLesson });
        await saveLessonProgress(mods[0].id, firstLesson.id, false);
        await updateProgress({
          progress: 10,
          status: "in_progress",
          currentModuleId: mods[0].id,
          currentLessonId: firstLesson.id,
          firstOpened: new Date().toISOString(),
        });
      }
    } catch {
    } finally {
      setUpdating(false);
    }
  }

  function handleCloseLesson() {
    if (activeLesson && enrollment) {
      finish(calculatedProgress);
      sessionStarted.current = false;
    }
    setActiveLesson(null);
  }

  if (progressLoading && !course) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <Skeleton variant="rectangular" className="h-48 w-full" />
        <Skeleton variant="text" className="w-2/3 h-8" />
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        description="The course you are looking for does not exist."
        action={
          <Link href="/learner/dashboard">
            <Button variant="tertiary"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>
          </Link>
        }
      />
    );
  }

  if (activeLesson) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCloseLesson}
            className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to course
          </button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleCompleteLesson(activeLesson.moduleId, activeLesson.lesson)}
          >
            <CheckCircle className="h-4 w-4" /> Mark as Complete
          </Button>
        </div>

        <Card variant="bordered" padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="glass">Lesson</Badge>
            <span className="text-xs text-content-tertiary">{activeLesson.lesson.duration} min</span>
          </div>
          <h1 className="text-xl font-bold text-content mb-4">{activeLesson.lesson.title}</h1>

          {activeLesson.lesson.type === "video" && activeLesson.lesson.embedUrl && (
            <div className="aspect-video rounded-xl overflow-hidden bg-surface-secondary mb-4">
              <iframe
                src={activeLesson.lesson.embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="prose prose-sm max-w-none text-content-secondary">
            {activeLesson.lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: activeLesson.lesson.content }} />
            ) : (
              <p className="text-content-tertiary italic">No content for this lesson yet.</p>
            )}
          </div>

          {activeLesson.lesson.attachments && activeLesson.lesson.attachments.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-content">Attachments</h3>
              {activeLesson.lesson.attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary text-sm text-content-secondary">
                  <FileDown className="h-4 w-4" />
                  {att}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={() => handleCompleteLesson(activeLesson.moduleId, activeLesson.lesson)}>
              <CheckCircle className="h-4 w-4" /> Complete &amp; Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/learner/dashboard"
        className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" />
          <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full bg-primary-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        </div>
        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={DIFFICULTY_COLORS[course.difficulty]}>{DIFFICULTY_LABELS[course.difficulty]}</Badge>
              <Badge variant="glass">{course.language}</Badge>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-white leading-tight">{course.title}</h1>
            <p className="text-sm text-primary-100/80 leading-relaxed max-w-xl">{course.subtitle}</p>
            <div className="flex items-center gap-4 text-sm text-primary-200/70">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {course.estimatedDuration} min</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {course.modules.length} modules</span>
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {course.instructor}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - calculatedProgress / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{calculatedProgress}%</span>
              </div>
            </div>
            <span className="text-xs text-primary-200/70">
              {completedCount}/{totalLessons} lessons
            </span>
          </div>
        </div>
      </div>

      <Button size="xl" className="w-full sm:w-auto" onClick={handleContinue} disabled={updating}>
        {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
        {updating ? "Working..." : enrollment?.status === "in_progress" ? "Continue Learning" : "Start Course"}
      </Button>

      <Card variant="bordered" padding="lg">
        <CardTitle>About this course</CardTitle>
        <p className="text-sm text-content-secondary mt-2 leading-relaxed">{course.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {course.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-content">Course Content</h2>
        {course.modules?.map((mod, mi) => {
          const modCompleted = mod.lessons.every((l) => isLessonCompleted(l.id));
          const currentActiveLessonId = activeLesson ? (activeLesson as { moduleId: string; lesson: Lesson }).lesson.id : null;
          return (
            <Card key={mod.id} variant="bordered" padding="none" className="overflow-hidden">
              <div className="px-5 py-3.5 bg-surface-secondary/50 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-600">{mi + 1}</span>
                  <span className="text-sm font-semibold text-content">{mod.title}</span>
                  {modCompleted && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </div>
                <span className="text-xs text-content-tertiary">{mod.duration} min &middot; {mod.lessons.length} lessons</span>
              </div>
              {mod.lessons?.map((l) => {
                const done = isLessonCompleted(l.id);
                const isActive = currentActiveLessonId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => handleStartLesson(mod.id, l)}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-secondary/30 transition-colors border-b border-border/30 last:border-0 text-left",
                      isActive && "bg-primary-50/50 dark:bg-primary-950/20"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium",
                      done
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-surface-tertiary text-content-secondary"
                    )}>
                      {done ? <CheckCircle className="h-4 w-4" /> : l.order + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">{l.title}</p>
                      <p className="text-xs text-content-tertiary">{l.duration} min</p>
                    </div>
                    <PlayCircle className="h-4 w-4 text-content-secondary shrink-0" />
                  </button>
                );
              })}
            </Card>
          );
        })}
      </div>

      {course.resources && course.resources.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-content">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {course.resources.map((res, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-surface card-hover cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/30">
                  <FileDown className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-content">Resource {i + 1}</p>
                  <p className="text-xs text-content-tertiary">Download</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="bordered" padding="md" className="flex items-center gap-3 cursor-pointer card-hover">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-content">Discussion</p>
            <p className="text-xs text-content-tertiary">Coming soon</p>
          </div>
        </Card>
        <Card variant="bordered" padding="md" className="flex items-center gap-3 cursor-pointer card-hover">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-content">Notes</p>
            <p className="text-xs text-content-tertiary">Coming soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
