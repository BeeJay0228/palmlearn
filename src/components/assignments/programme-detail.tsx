"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { getProgramme, getProgrammeProgress, getProgrammeLearnerIds } from "@/lib/programmes";
import { getAssignmentsForProgramme, createLearnerAssignment } from "@/lib/learner-assignments";
import { getCourses } from "@/lib/courses";
import { getAssignments } from "@/lib/assignments";
import { getAllUsers } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  BookOpen, CheckCircle, Clock, ArrowLeft,
  ListChecks, BookMarked, Lock, Play,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROGRAMME_STATUS_LABELS, PROGRAMME_STATUS_COLORS } from "@/types";

interface ProgrammeDetailProps {
  programmeId: string;
}

function allCoursesCompleted(learnerId: string, programmeId: string): boolean {
  const programme = getProgramme(programmeId);
  if (!programme || programme.courseIds.length === 0) return true;
  const records = getAssignmentsForProgramme(programmeId).filter((r) => r.learnerId === learnerId);
  return programme.courseIds.every((cid) =>
    records.some((r) => r.courseId === cid && r.status === "completed")
  );
}

export function ProgrammeDetail({ programmeId }: ProgrammeDetailProps) {
  const { user } = useAuth();
  const router = useRouter();

  const programme = useMemo(() => getProgramme(programmeId), [programmeId]);
  const courses = useMemo(() => getCourses(), []);
  const assignments = useMemo(() => getAssignments(), []);
  const allUsers = useMemo(() => getAllUsers(), []);

  if (!user) return null;

  if (!programme) {
    return (
      <EmptyState
        icon={BookMarked}
        title="Programme not found"
        description="The programme you're looking for doesn't exist or has been removed."
        action={<Button onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Go Back</Button>}
      />
    );
  }

  const currentProgramme = programme;
  const currentUser = user;

  const isAdminOrTrainer = currentUser.role === "admin" || currentUser.role === "trainer";
  const programmeCourses = courses.filter((c) => currentProgramme.courseIds.includes(c.id));
  const programmeAssignments = assignments.filter((a) => currentProgramme.assignmentIds.includes(a.id));
  const learnerRecords = getAssignmentsForProgramme(currentProgramme.id);
  const myRecords = learnerRecords.filter((lr) => lr.learnerId === currentUser.id);

  const myProgress = getProgrammeProgress(currentUser.id, currentProgramme);
  getProgrammeLearnerIds(currentProgramme).includes(currentUser.id);

  const assignedLearners = isAdminOrTrainer
    ? allUsers.filter((u) =>
        u.role === "learner" &&
        getProgrammeLearnerIds(currentProgramme).includes(u.id)
      )
    : [];

  const learnerProgress = isAdminOrTrainer
    ? assignedLearners.map((l) => ({
        learner: l,
        progress: getProgrammeProgress(l.id, currentProgramme),
      }))
    : [];

  const coursesCompleted = allCoursesCompleted(currentUser.id, programmeId);

  function handleContinueCourse(courseId: string) {
    const existing = myRecords.find((r) => r.courseId === courseId);
    if (!existing) {
      createLearnerAssignment({
        assignmentId: "",
        campaignId: currentProgramme.id,
        learnerId: currentUser.id,
        courseId,
        progress: 0,
        status: "not_started",
        timeSpent: 0,
      });
    }
    router.push(`/learner/course-view/${courseId}`);
  }

  function handleStartAssignment(assignmentId: string) {
    router.push(`/learner/assignment/${assignmentId}`);
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href={`/${currentUser.role}/programmes`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-tertiary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-content">{currentProgramme.name}</h1>
            <Badge variant="secondary" className={PROGRAMME_STATUS_COLORS[currentProgramme.status]}>
              {PROGRAMME_STATUS_LABELS[currentProgramme.status]}
            </Badge>
          </div>
          {currentProgramme.description && (
            <p className="text-sm text-content-secondary/80 leading-relaxed mt-1">{currentProgramme.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {programmeCourses.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-surface p-5">
              <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                Courses ({programmeCourses.length})
              </h3>
              <div className="space-y-2">
                {programmeCourses.map((course) => {
                  const record = myRecords.find((r) => r.courseId === course.id);
                  const status = record?.status || "not_started";
                  return (
                    <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary/50">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        status === "completed" ? "bg-emerald-50 dark:bg-emerald-950/30" :
                        status === "in_progress" ? "bg-amber-50 dark:bg-amber-950/30" :
                        "bg-surface-tertiary"
                      )}>
                        {status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-content-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content truncate">{course.title}</p>
                        {record && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                              <div className={cn(
                                "h-full rounded-full",
                                status === "completed" ? "bg-emerald-500" : "bg-primary-600"
                              )} style={{ width: `${record.progress}%` }} />
                            </div>
                            <span className="text-xs text-content-tertiary">{record.progress}%</span>
                          </div>
                        )}
                      </div>
                      {!isAdminOrTrainer && (
                        <button
                          onClick={() => handleContinueCourse(course.id)}
                          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 shrink-0 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                        >
                          <Play className="h-3 w-3" />
                          {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {programmeAssignments.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-surface p-5">
              <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary-600" />
                Assignments ({programmeAssignments.length})
              </h3>
              <div className="space-y-2">
                {programmeAssignments.map((asgn) => {
                  const assignmentRecord = myRecords.find(
                    (r) => r.assignmentId === asgn.id
                  );
                  const isAssignmentCompleted = assignmentRecord?.status === "completed";
                  const canAccess = coursesCompleted || isAdminOrTrainer;
                  return (
                    <div key={asgn.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary/50">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        isAssignmentCompleted ? "bg-emerald-50 dark:bg-emerald-950/30" :
                        canAccess ? "bg-primary-50 dark:bg-primary-950/30" :
                        "bg-surface-tertiary"
                      )}>
                        {isAssignmentCompleted ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : !canAccess && !isAdminOrTrainer ? (
                          <Lock className="h-4 w-4 text-content-tertiary" />
                        ) : (
                          <ListChecks className="h-4 w-4 text-content-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content truncate">{asgn.name}</p>
                        {asgn.schedule?.dueDate && (
                          <p className="text-xs text-content-tertiary">Due: {new Date(asgn.schedule.dueDate).toLocaleDateString()}</p>
                        )}
                        {!canAccess && !isAdminOrTrainer && (
                          <p className="text-xs text-amber-600 mt-0.5">Complete all required Courses to unlock this Assignment.</p>
                        )}
                        {isAssignmentCompleted && (
                          <p className="text-xs text-emerald-600 mt-0.5">Completed</p>
                        )}
                      </div>
                      {!isAdminOrTrainer && canAccess && !isAssignmentCompleted && (
                        <button
                          onClick={() => handleStartAssignment(asgn.id)}
                          className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 shrink-0 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                        >
                          <Play className="h-3 w-3" />
                          Start Assignment
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border/50 bg-surface p-5">
            <h3 className="text-sm font-semibold text-content mb-3">Programme Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-content-tertiary text-xs">Created by</span>
                <p className="text-content font-medium">{currentProgramme.createdBy || "—"}</p>
              </div>
              {currentProgramme.publishedBy && (
                <div>
                  <span className="text-content-tertiary text-xs">Published by</span>
                  <p className="text-content font-medium">{currentProgramme.publishedBy}</p>
                </div>
              )}
              <div>
                <span className="text-content-tertiary text-xs">Assigned by</span>
                <p className="text-content font-medium">{currentProgramme.assignedBy || currentProgramme.publishedBy || "—"}</p>
              </div>
              {currentProgramme.startDate && (
                <div>
                  <span className="text-content-tertiary text-xs">Start Date</span>
                  <p className="text-content font-medium">{new Date(currentProgramme.startDate).toLocaleDateString()}</p>
                </div>
              )}
              {currentProgramme.endDate && (
                <div>
                  <span className="text-content-tertiary text-xs">Due Date</span>
                  <p className="text-content font-medium">{new Date(currentProgramme.endDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <span className="text-content-tertiary text-xs">Created</span>
                <p className="text-content font-medium">{new Date(currentProgramme.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-content-tertiary text-xs">Status</span>
                <Badge variant="secondary" size="sm" className={PROGRAMME_STATUS_COLORS[currentProgramme.status]}>
                  {PROGRAMME_STATUS_LABELS[currentProgramme.status]}
                </Badge>
              </div>
              {currentProgramme.completedAt && (
                <div>
                  <span className="text-content-tertiary text-xs">Completed</span>
                  <p className="text-content font-medium">{new Date(currentProgramme.completedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!isAdminOrTrainer && (
            <div className="rounded-2xl border border-border/50 bg-surface p-5">
              <h3 className="text-sm font-semibold text-content mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-600" />
                Overall Progress
              </h3>
              {currentProgramme.completedAt ? (
                <div className="text-center mb-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-xl font-bold mx-auto bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-2">Completed {new Date(currentProgramme.completedAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="text-center mb-3">
                  <div className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-2xl text-xl font-bold mx-auto",
                    myProgress.progress > 0 ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600" :
                    "bg-surface-tertiary text-content-secondary"
                  )}>
                    {myProgress.progress}%
                  </div>
                </div>
              )}
              <div className="h-2 rounded-full bg-surface-tertiary overflow-hidden mb-4">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    myProgress.progress >= 100 ? "bg-emerald-500" : "bg-primary-600"
                  )}
                  style={{ width: `${myProgress.progress}%` }}
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Courses</span>
                  <span className="text-content font-medium">{myProgress.completedCourses} / {myProgress.totalCourses} Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Assignments</span>
                  <span className="text-content font-medium">{myProgress.completedAssignments} / {myProgress.totalAssignments} Completed</span>
                </div>
              </div>
            </div>
          )}

          {isAdminOrTrainer && (
            <>
              <div className="rounded-2xl border border-border/50 bg-surface p-5">
                <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-600" />
                  Analytics
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-content-tertiary">Completion Rate</span>
                    <span className="text-content font-medium">
                      {assignedLearners.length > 0
                        ? Math.round((learnerProgress.filter((p) => p.progress.progress >= 100).length / assignedLearners.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-tertiary">In Progress</span>
                    <span className="text-content font-medium">
                      {learnerProgress.filter((p) => p.progress.progress > 0 && p.progress.progress < 100).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-tertiary">Not Started</span>
                    <span className="text-content font-medium">
                      {learnerProgress.filter((p) => p.progress.progress === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-tertiary">Total Learners</span>
                    <span className="text-content font-medium">{assignedLearners.length}</span>
                  </div>
                </div>
              </div>
              {learnerProgress.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-surface p-5">
                  <h3 className="text-sm font-semibold text-content mb-3">Learner Progress</h3>
                  <div className="space-y-2">
                    {learnerProgress.map((lp) => (
                      <div key={lp.learner.id} className="flex items-center gap-3 p-2 rounded-xl bg-surface-tertiary/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/30 text-xs font-bold text-primary-600">
                          {lp.learner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-content truncate">{lp.learner.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                              <div className={cn("h-full rounded-full", lp.progress.progress >= 100 ? "bg-emerald-500" : "bg-primary-600")} style={{ width: `${lp.progress.progress}%` }} />
                            </div>
                            <span className="text-xs text-content-tertiary">{lp.progress.progress}%</span>
                          </div>
                        </div>
                        <div className="text-xs text-content-tertiary text-right shrink-0">
                          <div>{lp.progress.completedCourses}/{lp.progress.totalCourses} courses</div>
                          <div>{lp.progress.completedAssignments}/{lp.progress.totalAssignments} assignments</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {programmeCourses.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-surface p-5">
              <h3 className="text-sm font-semibold text-content mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Total Courses</span>
                  <span className="text-content font-medium">{currentProgramme.courseIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Total Assignments</span>
                  <span className="text-content font-medium">{currentProgramme.assignmentIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Target Audience</span>
                  <span className="text-content font-medium capitalize">{currentProgramme.targetAudience?.type || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
