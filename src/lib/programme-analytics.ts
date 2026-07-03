"use client";

import { getProgramme, getProgrammeProgress, getProgrammeLearnerIds } from "./programmes";
import { getAllUsers } from "./auth";
import { getCourses } from "./courses";
import { getAssignments } from "./assignments";
import { getAssignmentsForProgramme } from "./learner-assignments";
import type { User } from "@/types";

export interface ProgrammeOverview {
  name: string;
  status: string;
  createdBy: string;
  publishedBy: string;
  createdAt: string;
  updatedAt: string;
  assignedLearners: number;
  startedLearners: number;
  completedLearners: number;
  completionRate: number;
  averageProgress: number;
  averageAssignmentScore: number;
  averageCourseCompletion: number;
  averageTimeToComplete: number;
}

export interface LearnerProgressRow {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedDate: string;
  progress: number;
  coursesCompleted: number;
  totalCourses: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  status: "not_started" | "in_progress" | "completed" | "overdue";
  lastActivity: string | null;
  overallScore: number;
}

export interface CourseBreakdown {
  id: string;
  title: string;
  started: number;
  completed: number;
  completionRate: number;
  averageProgress: number;
  averageTimeSpent: number;
  locked: boolean;
}

export interface AssignmentAnalyticsItem {
  id: string;
  name: string;
  eligible: number;
  submitted: number;
  submissionRate: number;
  averageScore: number;
  passRate: number;
  pending: number;
  overdue: number;
}

export interface TimelineEvent {
  id: string;
  type: "published" | "assigned" | "started" | "completed" | "submitted" | "programme_completed";
  title: string;
  description: string;
  time: string;
  learnerName?: string;
}

export function canViewProgrammeAnalytics(user: User | null, programmeId: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "trainer") {
    const programme = getProgramme(programmeId);
    if (!programme) return false;
    if (programme.assignedBy === user.id || programme.createdBy === user.id) return true;
    const allUsers = getAllUsers();
    const trainerUser = allUsers.find((u) => u.id === user.id);
    if (trainerUser?.categoryId) {
      const programmeLearners = getProgrammeLearnerIds(programme);
      const sameCategoryLearners = allUsers.filter((u) => u.categoryId === trainerUser.categoryId).map((u) => u.id);
      return programmeLearners.some((id) => sameCategoryLearners.includes(id));
    }
    return false;
  }
  return false;
}

export function getProgrammeOverview(programmeId: string): ProgrammeOverview | null {
  const programme = getProgramme(programmeId);
  if (!programme) return null;

  const allUsers = getAllUsers();
  const learnerAssignments = getAssignmentsForProgramme(programmeId);
  const learnerIds = getProgrammeLearnerIds(programme);

  new Set(learnerAssignments.map((la) => la.learnerId));
  const startedIds = new Set(learnerAssignments.filter((la) => la.status !== "not_started").map((la) => la.learnerId));
  const completedIds = new Set(learnerAssignments.filter((la) => la.status === "completed").map((la) => la.learnerId));
  const allProgress = learnerAssignments.map((la) => la.progress || 0);
  const avgProgress = allProgress.length > 0 ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length) : 0;

  const courseCompleted = learnerAssignments.filter((la) => la.courseId && la.status === "completed").length;
  const courseTotal = learnerAssignments.filter((la) => la.courseId).length;
  const avgCourseCompletion = courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0;

  const completedRecords = learnerAssignments.filter((la) => la.status === "completed");
  const timeDiffs: number[] = [];
  for (const la of completedRecords) {
    if (la.assignedDate && la.completedDate) {
      const diff = new Date(la.completedDate).getTime() - new Date(la.assignedDate).getTime();
      timeDiffs.push(Math.round(diff / 86400000));
    }
  }
  const avgTime = timeDiffs.length > 0 ? Math.round(timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length) : 0;

  const completedCountOverlap = programme.courseIds.length > 0
    ? learnerIds.filter((lid) => {
        const records = learnerAssignments.filter((la) => la.learnerId === lid && la.courseId);
        return records.length > 0 && records.every((r) => r.status === "completed");
      }).length
    : completedIds.size;

  return {
    name: programme.name,
    status: programme.status,
    createdBy: allUsers.find((u) => u.id === programme.createdBy)?.name || programme.createdBy || "—",
    publishedBy: allUsers.find((u) => u.id === programme.publishedBy)?.name || programme.publishedBy || "—",
    createdAt: programme.createdAt,
    updatedAt: programme.updatedAt,
    assignedLearners: learnerIds.length,
    startedLearners: startedIds.size,
    completedLearners: completedCountOverlap,
    completionRate: learnerIds.length > 0 ? Math.round((completedCountOverlap / learnerIds.length) * 100) : 0,
    averageProgress: avgProgress,
    averageAssignmentScore: 0,
    averageCourseCompletion: avgCourseCompletion,
    averageTimeToComplete: avgTime,
  };
}

export function getLearnerProgressData(programmeId: string): LearnerProgressRow[] {
  const programme = getProgramme(programmeId);
  if (!programme) return [];

  const allUsers = getAllUsers();
  const learnerIds = getProgrammeLearnerIds(programme);
  const learnerAssignments = getAssignmentsForProgramme(programmeId);
  const courses = getCourses();
  const assignments = getAssignments();
  const programmeCourses = courses.filter((c) => programme.courseIds.includes(c.id));
  const programmeAssignments = assignments.filter((a) => programme.assignmentIds.includes(a.id));

  return learnerIds.map((lid) => {
    const learner = allUsers.find((u) => u.id === lid);
    if (!learner) return null;

    const records = learnerAssignments.filter((la) => la.learnerId === lid);
    const progress = getProgrammeProgress(lid, programme);
    const completedCourses = records.filter((r) => r.courseId && r.status === "completed").length;
    const completedAssignments = records.filter((r) => r.assignmentId && r.status === "completed").length;
    const lastActivity = records.length > 0
      ? new Date(Math.max(...records.map((r) => new Date(r.lastActivity || r.assignedDate).getTime())))
      : null;
    const isOverdue = records.some((r) => r.status === "overdue");
    const isCompleted = progress.progress >= 100;
    const isInProgress = progress.progress > 0 && !isCompleted;
    const status: LearnerProgressRow["status"] = isOverdue ? "overdue" : isCompleted ? "completed" : isInProgress ? "in_progress" : "not_started";

    return {
      id: lid,
      name: learner.name,
      email: learner.email,
      department: learner.categoryId || "—",
      assignedDate: records[0]?.assignedDate || programme.createdAt,
      progress: progress.progress,
      coursesCompleted: completedCourses,
      totalCourses: programmeCourses.length,
      assignmentsCompleted: completedAssignments,
      totalAssignments: programmeAssignments.length,
      status,
      lastActivity: lastActivity ? lastActivity.toISOString() : null,
      overallScore: 0,
    };
  }).filter((d): d is LearnerProgressRow => d !== null);
}

export function getCourseBreakdown(programmeId: string): CourseBreakdown[] {
  const programme = getProgramme(programmeId);
  if (!programme) return [];

  const courses = getCourses().filter((c) => programme.courseIds.includes(c.id));
  const learnerAssignments = getAssignmentsForProgramme(programmeId);
  const learnerIds = getProgrammeLearnerIds(programme);

  return courses.map((course) => {
    const records = learnerAssignments.filter((la) => la.courseId === course.id);
    const started = new Set(records.filter((r) => r.status !== "not_started").map((r) => r.learnerId)).size;
    const completed = new Set(records.filter((r) => r.status === "completed").map((r) => r.learnerId)).size;
    const progress = records.map((r) => r.progress || 0);
    const avgProgress = progress.length > 0 ? Math.round(progress.reduce((a, b) => a + b, 0) / progress.length) : 0;
    const timeSpent = records.map((r) => r.timeSpent || 0);
    const avgTime = timeSpent.length > 0 ? Math.round(timeSpent.reduce((a, b) => a + b, 0) / timeSpent.length) : 0;
    const startedCount = learnerIds.length > 0 ? Math.max(started, records.length > 0 ? new Set(records.map((r) => r.learnerId)).size : 0) : 0;

    return {
      id: course.id,
      title: course.title,
      started: startedCount,
      completed,
      completionRate: learnerIds.length > 0 ? Math.round((completed / learnerIds.length) * 100) : 0,
      averageProgress: avgProgress,
      averageTimeSpent: avgTime,
      locked: records.length === 0,
    };
  });
}

export function getAssignmentAnalytics(programmeId: string): AssignmentAnalyticsItem[] {
  const programme = getProgramme(programmeId);
  if (!programme) return [];

  const assignments = getAssignments().filter((a) => programme.assignmentIds.includes(a.id));
  const learnerIds = getProgrammeLearnerIds(programme);
  const learnerAssignments = getAssignmentsForProgramme(programmeId);

  return assignments.map((asgn) => {
    const records = learnerAssignments.filter((la) => la.assignmentId === asgn.id);
    const submitted = records.filter((r) => r.status === "completed").length;
    const pending = records.filter((r) => r.status === "in_progress" || r.status === "not_started").length;
    const overdue = records.filter((r) => r.status === "overdue").length;
    const totalEligible = Math.max(learnerIds.length, records.length);

    return {
      id: asgn.id,
      name: asgn.name,
      eligible: totalEligible,
      submitted,
      submissionRate: totalEligible > 0 ? Math.round((submitted / totalEligible) * 100) : 0,
      averageScore: 0,
      passRate: 0,
      pending,
      overdue,
    };
  });
}

export function getProgrammeTimeline(programmeId: string): TimelineEvent[] {
  const programme = getProgramme(programmeId);
  if (!programme) return [];

  const events: TimelineEvent[] = [];
  const allUsers = getAllUsers();
  const learnerAssignments = getAssignmentsForProgramme(programmeId);
  const learnerIds = getProgrammeLearnerIds(programme);
  const courses = getCourses();
  const assignments = getAssignments();

  const getLearnerName = (id: string) => allUsers.find((u) => u.id === id)?.name || id;

  if (programme.publishedAt) {
    events.push({
      id: "published",
      type: "published",
      title: "Programme Published",
      description: `Published by ${allUsers.find((u) => u.id === programme.publishedBy)?.name || programme.publishedBy || "Unknown"}`,
      time: programme.publishedAt,
    });
  }

  for (const lid of learnerIds) {
    const records = learnerAssignments.filter((la) => la.learnerId === lid);
    const name = getLearnerName(lid);

    if (records.length > 0) {
      events.push({
        id: `assigned_${lid}`,
        type: "assigned",
        title: "Learner Assigned",
        description: `${name} was assigned to this programme`,
        time: records[0].assignedDate,
        learnerName: name,
      });
    }

    for (const r of records) {
      if (r.firstOpened) {
        const course = courses.find((c) => c.id === r.courseId);
        events.push({
          id: `started_${r.id}`,
          type: "started",
          title: "Course Started",
          description: `${name} started '${course?.title || "a course"}'`,
          time: r.firstOpened,
          learnerName: name,
        });
      }
      if (r.completedDate && r.courseId) {
        const course = courses.find((c) => c.id === r.courseId);
        events.push({
          id: `course_comp_${r.id}`,
          type: "completed",
          title: "Course Completed",
          description: `${name} completed '${course?.title || "a course"}'`,
          time: r.completedDate,
          learnerName: name,
        });
      }
      if (r.completedDate && r.assignmentId) {
        const asgn = assignments.find((a) => a.id === r.assignmentId);
        events.push({
          id: `sub_${r.id}`,
          type: "submitted",
          title: "Assignment Submitted",
          description: `${name} submitted '${asgn?.name || "an assignment"}'`,
          time: r.completedDate,
          learnerName: name,
        });
      }
    }

    const allDone = programme.courseIds.length > 0 && programme.courseIds.every((cid) =>
      records.some((r) => r.courseId === cid && r.status === "completed")
    );
    if (allDone && records.length > 0) {
      const latestDate = records.reduce((latest, r) => {
        const d = r.completedDate || r.lastActivity || "";
        return d > latest ? d : latest;
      }, "");
      if (latestDate) {
        events.push({
          id: `prog_comp_${lid}`,
          type: "programme_completed",
          title: "Programme Completed",
          description: `${name} completed the entire programme`,
          time: latestDate,
          learnerName: name,
        });
      }
    }
  }

  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}
