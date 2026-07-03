"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getCourseProgress, updateLearnerAssignment, markAssignmentCompleted } from "@/lib/learner-assignments";
import { getCourseById } from "@/lib/courses";
import {
  DIFFICULTY_LABELS, DIFFICULTY_COLORS,
  type Course,
} from "@/types";
import {
  PlayCircle, Clock, BookOpen, FileText, MessageCircle, FileDown,
  ArrowLeft, Loader2,
} from "lucide-react";
import Link from "next/link";

interface LearnerCourseViewProps {
  courseId: string;
}

export function LearnerCourseView({ courseId }: LearnerCourseViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const data = useMemo(() => {
    if (!user) return { course: null as Course | null, progress: 0, laId: "", loading: false };
    const found = getCourseById(courseId);
    const cp = getCourseProgress(user.id, courseId);
    return { course: found || null, progress: cp?.progress || 0, laId: cp?.id || "", loading: !found };
  }, [user, courseId]);

  const { course, progress, laId, loading } = data;

  function handleContinue() {
    if (!user || !laId) return;
    setUpdating(true);
    setTimeout(() => {
      const current = getCourseProgress(user.id, courseId);
      if (current) {
        const newProgress = current.status === "not_started" ? 10 : Math.min(100, (current.progress || 0) + 15);
        if (newProgress >= 100) {
          markAssignmentCompleted(laId);
        } else {
          updateLearnerAssignment(laId, {
            progress: newProgress,
            status: "in_progress",
            firstOpened: current.firstOpened || new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            timeSpent: (current.timeSpent || 0) + 15,
          });
        }
      }
      setUpdating(false);
      router.refresh();
    }, 500);
  }

  if (loading) {
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
    return <EmptyState title="Course not found" description="The course you are looking for does not exist." action={<Link href="/learner/dashboard"><Button variant="tertiary"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button></Link>} />;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back button */}
      <Link href="/learner/dashboard" className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Course Banner */}
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
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {course.modules?.length || 0} modules</span>
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {course.instructor}</span>
            </div>
          </div>
          {/* Progress Ring */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{progress}%</span>
              </div>
            </div>
            <span className="text-xs text-primary-200/70">Progress</span>
          </div>
        </div>
      </div>

      {/* Continue / Start Button */}
      <Button size="xl" className="w-full sm:w-auto" onClick={handleContinue} disabled={updating || !laId}>
        {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
        {updating ? "Working..." : progress > 0 ? "Continue Learning" : "Start Course"}
      </Button>

      {/* Course Info */}
      <Card variant="bordered" padding="lg">
        <CardTitle>About this course</CardTitle>
        <p className="text-sm text-content-secondary mt-2 leading-relaxed">{course.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {course.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
          ))}
        </div>
      </Card>

      {/* Modules / Lessons */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-content">Course Content</h2>
        {course.modules?.map((mod, mi) => (
          <Card key={mod.id} variant="bordered" padding="none" className="overflow-hidden">
            <div className="px-5 py-3.5 bg-surface-secondary/50 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-600">{mi + 1}</span>
                <span className="text-sm font-semibold text-content">{mod.title}</span>
              </div>
              <span className="text-xs text-content-tertiary">{mod.duration} min &middot; {mod.lessons?.length || 0} lessons</span>
            </div>
            {mod.lessons?.map((lesson, li) => (
              <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-secondary/30 transition-colors border-b border-border/30 last:border-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-tertiary text-xs font-medium text-content-secondary">
                  {li + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content truncate">{lesson.title}</p>
                  <p className="text-xs text-content-tertiary">{lesson.duration} min</p>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors">
                  <PlayCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>
        ))}
      </div>

      {/* Resources */}
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

      {/* Discussion & Notes Placeholders */}
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
