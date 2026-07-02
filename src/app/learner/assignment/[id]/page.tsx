"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getLearnerAssignment, markAssignmentInProgress, markAssignmentCompleted, getDaysLeft, checkAndUpdateOverdueStatus } from "@/lib/learner-assignments";
import { getAssignment } from "@/lib/assignments";
import { getCourseById } from "@/lib/courses";
import { notifyAssignmentCompleted } from "@/lib/mock-notifications";
import { getAllUsers } from "@/lib/auth";
import type { Course } from "@/types";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, PlayCircle, Loader2, Clock, CalendarDays, User, BookOpen, AlertTriangle, CheckCircle, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENT_PRIORITY_LABELS, ASSIGNMENT_PRIORITY_COLORS,
  DIFFICULTY_LABELS, DIFFICULTY_COLORS,
} from "@/types";

export default function LearnerAssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [localRecord, setLocalRecord] = useState<ReturnType<typeof getLearnerAssignment> | null>(null);

  const data = useMemo(() => {
    if (!user || !id) return { record: null, assignment: null, course: null, publisher: null, loading: false, error: false };
    const record = localRecord || getLearnerAssignment(id);
    if (!record) return { record: null, assignment: null, course: null, publisher: null, loading: false, error: true };
    const asgn = getAssignment(record.assignmentId);
    const course = record.courseId ? getCourseById(record.courseId) : null;
    const publisher = asgn?.publishedBy ? getAllUsers().find((u) => u.id === asgn.publishedBy) : asgn?.assignedBy ? getAllUsers().find((u) => u.id === asgn.assignedBy) : null;
    return { record, assignment: asgn, course, publisher, loading: false, error: false };
  }, [user, id, localRecord]);

  const { record, assignment, course, publisher, loading, error } = data;

  const daysLeft = useMemo(() => assignment ? getDaysLeft(assignment) : null, [assignment]);

  async function handleStart() {
    if (!record) return;
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = markAssignmentInProgress(record.id);
    if (updated) setLocalRecord(updated);
    setUpdating(false);
  }

  async function handleComplete() {
    if (!record || !assignment) return;
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 400));
    const updated = markAssignmentCompleted(record.id);
    if (updated) {
      setLocalRecord(updated);
      notifyAssignmentCompleted(assignment, user!.id, course?.title);
    }
    setUpdating(false);
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto">
        <Skeleton variant="rectangular" className="h-40 w-full" />
        <Skeleton variant="text" className="w-2/3 h-8" />
        <Skeleton variant="card" className="h-48" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Assignment not found"
        description="This assignment does not exist or you do not have access to it."
        action={<Link href="/learner/assignments"><Button variant="tertiary"><ArrowLeft className="h-4 w-4" /> Back to Assignments</Button></Link>}
      />
    );
  }

  const badgeMap: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "secondary" | "glass" }> = {
    not_started: { label: "Not Started", variant: "default" },
    in_progress: { label: "In Progress", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    overdue: { label: "Overdue", variant: "danger" },
    expired: { label: "Expired", variant: "danger" },
    locked: { label: "Locked", variant: "secondary" },
  };
  const badge = badgeMap[record.status] || badgeMap.not_started;

  const isCompleted = record.status === "completed";
  const isOverdue = record.status === "overdue";
  const isInProgress = record.status === "in_progress";
  const isNotStarted = record.status === "not_started";

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/learner/assignments" className="flex items-center gap-1.5 text-sm text-content-secondary hover:text-content transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Assignments
      </Link>

      {/* Header Card */}
      <Card variant="bordered" padding="lg" className={cn(isOverdue && "border-danger/30")}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {assignment && (
                <Badge variant="secondary" className={ASSIGNMENT_PRIORITY_COLORS[assignment.priority]}>
                  {ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="danger" size="sm">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
                </Badge>
              )}
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-content">{assignment?.name || "Untitled Assignment"}</h1>
            {assignment?.description && (
              <p className="text-sm text-content-secondary leading-relaxed">{assignment.description}</p>
            )}
          </div>

          {/* Main action button */}
          {isNotStarted && (
            <Button size="lg" className="shrink-0" onClick={handleStart} disabled={updating}>
              {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              {updating ? "Starting..." : "Start Course"}
            </Button>
          )}
          {isInProgress && (
            <div className="flex gap-2 shrink-0">
              <Button size="lg" onClick={handleComplete} disabled={updating}>
                {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                {updating ? "Completing..." : "Mark Complete"}
              </Button>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 shrink-0 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">Completed</span>
            </div>
          )}
          {isOverdue && (
            <Button size="lg" variant="tertiary" className="shrink-0" onClick={handleStart} disabled={updating}>
              {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              {updating ? "Starting..." : "Resume Course"}
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-content-secondary">Progress</span>
            <span className="text-xs font-bold text-content">{record.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-tertiary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isCompleted ? "bg-emerald-500" : isOverdue ? "bg-danger" : "bg-primary-600",
              )}
              style={{ width: `${record.progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {course && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-2 text-content-secondary mb-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Course</span>
            </div>
            <p className="text-sm font-semibold text-content">{course.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="secondary" size="sm" className={DIFFICULTY_COLORS[course.difficulty]}>{DIFFICULTY_LABELS[course.difficulty]}</Badge>
              <span className="text-xs text-content-tertiary">{course.estimatedDuration} min</span>
            </div>
            <Button
              variant="tertiary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => router.push(`/learner/course-view/${course.id}`)}
            >
              View Course <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Card>
        )}

        {assignment?.schedule?.dueDate && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-2 text-content-secondary mb-2">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Due Date</span>
            </div>
            <p className="text-sm font-semibold text-content">
              {new Date(assignment.schedule.dueDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </p>
            {daysLeft != null && !isCompleted && (
              <span className={cn("text-xs font-medium mt-1 flex items-center gap-1", daysLeft <= 3 ? "text-danger" : "text-amber-500")}>
                <Clock className="h-3 w-3" />
                {daysLeft <= 0 ? "Overdue" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
              </span>
            )}
          </Card>
        )}

        {publisher && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-2 text-content-secondary mb-2">
              <User className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Assigned By</span>
            </div>
            <p className="text-sm font-semibold text-content">{publisher.name}</p>
            <p className="text-xs text-content-tertiary mt-0.5">{publisher.email}</p>
          </Card>
        )}
      </div>

      {/* Status Timeline */}
      <Card variant="bordered" padding="md">
        <CardTitle>Activity</CardTitle>
        <CardContent className="p-0 mt-3">
          <div className="space-y-3">
            {record.firstOpened && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/30">
                  <PlayCircle className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <span className="text-content-secondary">Started on <strong className="text-content">{new Date(record.firstOpened).toLocaleDateString()}</strong></span>
              </div>
            )}
            {record.lastActivity && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <span className="text-content-secondary">Last activity on <strong className="text-content">{new Date(record.lastActivity).toLocaleDateString()}</strong></span>
              </div>
            )}
            {record.completedDate && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <span className="text-content-secondary">Completed on <strong className="text-content">{new Date(record.completedDate).toLocaleDateString()}</strong></span>
              </div>
            )}
            {!record.firstOpened && !record.completedDate && (
              <p className="text-sm text-content-tertiary">No activity recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
