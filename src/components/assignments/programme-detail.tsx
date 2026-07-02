"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getProgramme, getProgrammeProgress } from "@/lib/programmes";
import { getAssignmentsForProgramme } from "@/lib/learner-assignments";
import { getCourses } from "@/lib/courses";
import { getAssignments } from "@/lib/assignments";
import { getAllUsers } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  BookOpen, CheckCircle, Clock, Users, ArrowLeft,
  BarChart3, ListChecks, BookMarked,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PROGRAMME_STATUS_LABELS, PROGRAMME_STATUS_COLORS } from "@/types";

interface ProgrammeDetailProps {
  programmeId: string;
}

export function ProgrammeDetail({ programmeId }: ProgrammeDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  const programme = useMemo(() => getProgramme(programmeId), [programmeId]);
  const courses = useMemo(() => getCourses(), []);
  const assignments = useMemo(() => getAssignments(), []);
  const users = useMemo(() => getAllUsers(), []);

  if (!user) return null;

  const currentUser = user;

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
  const programmeCourses = courses.filter((c) => currentProgramme.courseIds.includes(c.id));
  const programmeAssignments = assignments.filter((a) => currentProgramme.assignmentIds.includes(a.id));
  const learnerRecords = getAssignmentsForProgramme(currentProgramme.id);

  const isAdminOrTrainer = currentUser.role === "admin" || currentUser.role === "trainer";

  const assignedLearners = isAdminOrTrainer
    ? users.filter((u) =>
        u.role === "learner" &&
        learnerRecords.some((lr) => lr.learnerId === u.id)
      )
    : [];

  const learnerProgress = isAdminOrTrainer
    ? assignedLearners.map((l) => ({
        learner: l,
        progress: getProgrammeProgress(l.id, currentProgramme),
      }))
    : [];

  const myRecords = learnerRecords.filter((lr) => lr.learnerId === currentUser.id);
  const myProgress = getProgrammeProgress(currentUser.id, currentProgramme);

  function setTab(newTab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "overview") params.delete("tab");
    else params.set("tab", newTab);
    router.push(`/${currentUser.role}/programmes/${currentProgramme.id}${params.toString() ? `?${params.toString()}` : ""}`);
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

      <div className="flex items-center gap-1 border-b border-border/50">
        <button
          onClick={() => setTab("overview")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            tab === "overview"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-content-secondary hover:text-content"
          )}
        >
          <ListChecks className="h-4 w-4 inline mr-1.5" />
          Overview
        </button>
        {isAdminOrTrainer && (
          <button
            onClick={() => setTab("analytics")}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              tab === "analytics"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-content-secondary hover:text-content"
            )}
          >
            <BarChart3 className="h-4 w-4 inline mr-1.5" />
            Analytics
          </button>
        )}
      </div>

      {tab === "overview" && (
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
                        {!isAdminOrTrainer && record && (
                          <Link
                            href={`/${currentUser.role}/courses/${course.id}`}
                            className="text-xs text-primary-600 hover:underline shrink-0"
                          >
                            Continue
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {programmeAssignments.length > 0 && isAdminOrTrainer && (
              <div className="rounded-2xl border border-border/50 bg-surface p-5">
                <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary-600" />
                  Assignments ({programmeAssignments.length})
                </h3>
                <div className="space-y-2">
                  {programmeAssignments.map((asgn) => (
                    <div key={asgn.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-tertiary">
                        <ListChecks className="h-4 w-4 text-content-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content truncate">{asgn.name}</p>
                        {asgn.schedule?.dueDate && (
                          <p className="text-xs text-content-tertiary">Due: {new Date(asgn.schedule.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentProgramme.createdBy && (
              <div className="rounded-2xl border border-border/50 bg-surface p-5">
                <h3 className="text-sm font-semibold text-content mb-3">Programme Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-content-tertiary">Created by</span>
                    <p className="text-content font-medium">{currentProgramme.createdBy}</p>
                  </div>
                  {currentProgramme.publishedBy && (
                    <div>
                      <span className="text-content-tertiary">Published by</span>
                      <p className="text-content font-medium">{currentProgramme.publishedBy}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-content-tertiary">Created</span>
                    <p className="text-content font-medium">{new Date(currentProgramme.createdAt).toLocaleDateString()}</p>
                  </div>
                  {currentProgramme.publishedAt && (
                    <div>
                      <span className="text-content-tertiary">Published</span>
                      <p className="text-content font-medium">{new Date(currentProgramme.publishedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {!isAdminOrTrainer && (
              <div className="rounded-2xl border border-border/50 bg-surface p-5">
                <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-600" />
                  My Progress
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold",
                    myProgress.progress >= 100 ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" :
                    myProgress.progress > 0 ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600" :
                    "bg-surface-tertiary text-content-secondary"
                  )}>
                    {myProgress.progress}%
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-content">{myProgress.completedCourses}/{myProgress.totalCourses} courses</p>
                    <p className="text-xs text-content-tertiary">
                      {myProgress.progress >= 100 ? "Completed" : myProgress.progress > 0 ? "In Progress" : "Not Started"}
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-surface-tertiary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      myProgress.progress >= 100 ? "bg-emerald-500" : "bg-primary-600"
                    )}
                    style={{ width: `${myProgress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {isAdminOrTrainer && (
              <div className="rounded-2xl border border-border/50 bg-surface p-5">
                <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary-600" />
                  Learners ({assignedLearners.length})
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {learnerProgress.map(({ learner, progress }) => (
                    <div key={learner.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-tertiary/50 transition-colors">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/30 text-xs font-medium text-primary-600">
                        {learner.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-content truncate">{learner.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] h-1 rounded-full bg-surface-tertiary overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                progress.progress >= 100 ? "bg-emerald-500" :
                                progress.progress > 0 ? "bg-primary-600" :
                                "bg-surface-tertiary"
                              )}
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-content-tertiary">{progress.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {assignedLearners.length === 0 && (
                    <p className="text-xs text-content-tertiary py-2">No learners assigned yet.</p>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border/50 bg-surface p-5">
              <h3 className="text-sm font-semibold text-content mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                {currentProgramme.startDate && (
                  <div className="flex justify-between">
                    <span className="text-content-tertiary">Start</span>
                    <span className="text-content">{new Date(currentProgramme.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                {currentProgramme.endDate && (
                  <div className="flex justify-between">
                    <span className="text-content-tertiary">End</span>
                    <span className="text-content">{new Date(currentProgramme.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-content-tertiary">Status</span>
                  <Badge variant="secondary" size="sm" className={PROGRAMME_STATUS_COLORS[currentProgramme.status]}>
                    {PROGRAMME_STATUS_LABELS[currentProgramme.status]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "analytics" && isAdminOrTrainer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border/50 bg-surface p-5">
            <h3 className="text-sm font-semibold text-content mb-1">Completion Rate</h3>
            <p className="text-3xl font-bold text-content">
              {assignedLearners.length > 0
                ? Math.round((learnerProgress.filter((p) => p.progress.progress >= 100).length / assignedLearners.length) * 100)
                : 0}%
            </p>
            <p className="text-xs text-content-tertiary mt-1">
              {learnerProgress.filter((p) => p.progress.progress >= 100).length} / {assignedLearners.length} learners
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-surface p-5">
            <h3 className="text-sm font-semibold text-content mb-1">In Progress</h3>
            <p className="text-3xl font-bold text-content">
              {learnerProgress.filter((p) => p.progress.progress > 0 && p.progress.progress < 100).length}
            </p>
            <p className="text-xs text-content-tertiary mt-1">learners actively working</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-surface p-5">
            <h3 className="text-sm font-semibold text-content mb-1">Not Started</h3>
            <p className="text-3xl font-bold text-content">
              {learnerProgress.filter((p) => p.progress.progress === 0).length}
            </p>
            <p className="text-xs text-content-tertiary mt-1">learners yet to begin</p>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-border/50 bg-surface p-5">
            <h3 className="text-sm font-semibold text-content mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-600" />
              Learner Progress Details
            </h3>
            {learnerProgress.length === 0 ? (
              <p className="text-sm text-content-tertiary">No learners assigned to this programme.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 text-content-tertiary font-medium">Learner</th>
                      <th className="text-left py-2 px-3 text-content-tertiary font-medium">Progress</th>
                      <th className="text-left py-2 px-3 text-content-tertiary font-medium">Courses</th>
                      <th className="text-left py-2 px-3 text-content-tertiary font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learnerProgress.map(({ learner, progress }) => (
                      <tr key={learner.id} className="border-b border-border/30 hover:bg-surface-tertiary/30 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/30 text-xs font-medium text-primary-600">
                              {learner.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-content font-medium">{learner.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2 max-w-[150px]">
                            <div className="flex-1 h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  progress.progress >= 100 ? "bg-emerald-500" :
                                  progress.progress > 0 ? "bg-primary-600" : "bg-surface-tertiary"
                                )}
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-content-tertiary w-8 text-right">{progress.progress}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-content-tertiary">
                          {progress.completedCourses}/{progress.totalCourses}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={progress.progress >= 100 ? "success" : progress.progress > 0 ? "warning" : "default"}
                            size="sm"
                          >
                            {progress.progress >= 100 ? "Completed" : progress.progress > 0 ? "In Progress" : "Not Started"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
