"use client";

import { getAllUsers } from "./auth";
import { getCourses } from "./courses";
import { getAssignments } from "./assignments";
import { getLearnerAssignments } from "./learner-assignments";
import { getProgrammes } from "./programmes";
import { getNotifications } from "./mock-notifications";
import { getAttendance } from "./attendance";
import type { User } from "@/types";

export interface AnalyticsFilter {
  dateRange?: "all" | "today" | "week" | "month" | "year";
  programmeId?: string;
  trainerId?: string;
  status?: string;
}

export interface AdminKpiData {
  totalLearners: number;
  activeLearners: number;
  inactiveLearners: number;
  totalProgrammes: number;
  publishedProgrammes: number;
  draftProgrammes: number;
  coursesCompleted: number;
  assignmentsSubmitted: number;
  certificatesIssued: number;
  overallCompletionRate: number;
  averageAssignmentScore: number;
  averageCourseProgress: number;
}

export interface TrainerKpiData {
  totalAssignedLearners: number;
  activeLearners: number;
  programmesPublished: number;
  coursesCompleted: number;
  assignmentsSubmitted: number;
  averageLearnerProgress: number;
  overallCompletionPercent: number;
}

export interface ProgrammePerformance {
  id: string;
  name: string;
  assignedCount: number;
  startedCount: number;
  completedCount: number;
  completionPercentage: number;
  averageProgress: number;
  status: string;
}

export interface CoursePerformance {
  id: string;
  title: string;
  completedCount: number;
  totalAssigned: number;
  completionRate: number;
}

export interface AssignmentPerformance {
  submitted: number;
  pending: number;
  overdue: number;
  averageScore: number;
  total: number;
}

export interface LearnerEngagement {
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
  averageLearningTime: number;
  programmesStarted: number;
  programmesCompleted: number;
}

export interface ActivityEvent {
  id: string;
  type: "programme_started" | "course_completed" | "assignment_submitted" | "programme_completed" | "programme_assigned" | "event_attended";
  title: string;
  description: string;
  time: string;
  userId?: string;
  userName?: string;
}

function getLearnerIds(user?: User | null): string[] {
  if (!user) return [];
  if (user.role === "admin") {
    return getAllUsers().filter((u) => u.role === "learner").map((u) => u.id);
  }
  if (user.role === "trainer") {
    const allUsers = getAllUsers();
    const trainerUser = allUsers.find((u) => u.id === user.id);
    if (trainerUser?.categoryId) {
      return allUsers.filter((u) => u.role === "learner" && u.categoryId === trainerUser.categoryId).map((u) => u.id);
    }
    return [];
  }
  return [];
}

function filterByDate(createdAt: string, dateRange?: string): boolean {
  if (!dateRange || dateRange === "all") return true;
  const d = new Date(createdAt).getTime();
  const now = Date.now();
  switch (dateRange) {
    case "today": return d >= new Date(now).setHours(0, 0, 0, 0);
    case "week": return d >= now - 7 * 86400000;
    case "month": return d >= now - 30 * 86400000;
    case "year": return d >= now - 365 * 86400000;
    default: return true;
  }
}

export function getAdminKpiData(filter?: AnalyticsFilter): AdminKpiData {
  const allUsers = getAllUsers();
  const learners = allUsers.filter((u) => u.role === "learner");
  const programmes = getProgrammes();
  const learnerAssignments = getLearnerAssignments();
  const assignments = getAssignments();
  let filteredLA = learnerAssignments;
  if (filter?.programmeId) {
    const programme = programmes.find((p) => p.id === filter.programmeId);
    if (programme) {
      filteredLA = learnerAssignments.filter((la) =>
        programme.courseIds.includes(la.courseId) || la.campaignId === filter.programmeId
      );
    }
  }

  const completedLAs = filteredLA.filter((la) => la.status === "completed");
  const totalLA = filteredLA.length;

  const totalCourseProgress = filteredLA.reduce((sum, la) => sum + (la.progress || 0), 0);

  const activeLearnerIds = new Set(filteredLA.filter((la) => la.status !== "not_started").map((la) => la.learnerId));
  const learnersWithRecords = new Set(filteredLA.map((la) => la.learnerId));

  return {
    totalLearners: learners.length,
    activeLearners: activeLearnerIds.size,
    inactiveLearners: learners.length - learnersWithRecords.size,
    totalProgrammes: programmes.length,
    publishedProgrammes: programmes.filter((p) => p.status === "active").length,
    draftProgrammes: programmes.filter((p) => p.status === "draft").length,
    coursesCompleted: completedLAs.length,
    assignmentsSubmitted: assignments.length,
    certificatesIssued: 0,
    overallCompletionRate: totalLA > 0 ? Math.round((completedLAs.length / totalLA) * 100) : 0,
    averageAssignmentScore: 0,
    averageCourseProgress: totalLA > 0 ? Math.round(totalCourseProgress / totalLA) : 0,
  };
}

export function getTrainerKpiData(user: User, filter?: AnalyticsFilter): TrainerKpiData {
  const learnerIds = getLearnerIds(user);
  const programmes = getProgrammes();
  const learnerAssignments = getLearnerAssignments().filter((la) => learnerIds.includes(la.learnerId));

  let filteredLA = learnerAssignments;
  if (filter?.programmeId) {
    const programme = programmes.find((p) => p.id === filter.programmeId);
    if (programme) {
      filteredLA = learnerAssignments.filter((la) =>
        programme.courseIds.includes(la.courseId) || la.campaignId === filter.programmeId
      );
    }
  }

  const completedLAs = filteredLA.filter((la) => la.status === "completed");
  const totalLA = filteredLA.length;
  const totalProgress = filteredLA.reduce((sum, la) => sum + (la.progress || 0), 0);
  const activeLearnerIds = new Set(filteredLA.filter((la) => la.status !== "not_started").map((la) => la.learnerId));
  const trainerProgrammes = programmes.filter((p) => p.assignedBy === user.id);

  return {
    totalAssignedLearners: learnerIds.length,
    activeLearners: activeLearnerIds.size,
    programmesPublished: trainerProgrammes.filter((p) => p.status === "active").length,
    coursesCompleted: completedLAs.length,
    assignmentsSubmitted: filteredLA.filter((la) => la.assignmentId).length,
    averageLearnerProgress: totalLA > 0 ? Math.round(totalProgress / totalLA) : 0,
    overallCompletionPercent: totalLA > 0 ? Math.round((completedLAs.length / totalLA) * 100) : 0,
  };
}

export function getProgrammePerformance(user?: User | null, filter?: AnalyticsFilter): ProgrammePerformance[] {
  const programmes = getProgrammes();
  const allUsers = getAllUsers();
  const learnerAssignments = getLearnerAssignments();

  let filteredProgrammes = programmes;
  if (user && user.role === "trainer") {
    const trainerUser = allUsers.find((u) => u.id === user.id);
    if (trainerUser?.categoryId) {
      const learnerIds = allUsers.filter((u) => u.role === "learner" && u.categoryId === trainerUser.categoryId).map((u) => u.id);
      filteredProgrammes = programmes.filter((p) => {
        const assignedLearners = getAssignedLearnerIds(p, allUsers);
        return assignedLearners.some((id) => learnerIds.includes(id));
      });
    }
  }

  if (filter?.trainerId) {
    filteredProgrammes = filteredProgrammes.filter((p) => p.assignedBy === filter.trainerId);
  }

  return filteredProgrammes.map((p) => {
    const courseRecords = learnerAssignments.filter((la) => p.courseIds.includes(la.courseId));
    const assignedLearnerIds = new Set(courseRecords.map((la) => la.learnerId));
    const startedIds = new Set(courseRecords.filter((la) => la.status !== "not_started").map((la) => la.learnerId));
    const completedIds = new Set(courseRecords.filter((la) => la.status === "completed").map((la) => la.learnerId));
    const allProgress = courseRecords.map((la) => la.progress || 0);
    const avgProgress = allProgress.length > 0 ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length) : 0;
    const assigned = assignedLearnerIds.size;
    const completed = completedIds.size;

    return {
      id: p.id,
      name: p.name,
      assignedCount: assigned,
      startedCount: startedIds.size,
      completedCount: completed,
      completionPercentage: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
      averageProgress: avgProgress,
      status: p.status || "draft",
    };
  }).sort((a, b) => b.assignedCount - a.assignedCount);
}

function getAssignedLearnerIds(programme: import("@/types").Programme, users: User[]): string[] {
  if (programme.targetAudience) {
    const { type, userIds, categoryIds } = programme.targetAudience;
    if (type === "organization") return users.filter((u) => u.role !== "admin").map((u) => u.id);
    if (type === "multiple" || type === "single") return userIds || [];
    if (type === "category") return users.filter((u) => u.categoryId && categoryIds?.includes(u.categoryId)).map((u) => u.id);
    return userIds || [];
  }
  return [];
}

export function getCoursePerformance(user?: User | null, filter?: AnalyticsFilter): {
  mostCompleted: CoursePerformance[];
  leastCompleted: CoursePerformance[];
  averageCompletionRate: number;
} {
  const courses = getCourses();
  let learnerAssignments = getLearnerAssignments();

  if (user && user.role === "trainer") {
    const learnerIds = getLearnerIds(user);
    learnerAssignments = learnerAssignments.filter((la) => learnerIds.includes(la.learnerId));
  }

  if (filter?.programmeId) {
    const programmes = getProgrammes();
    const programme = programmes.find((p) => p.id === filter.programmeId);
    if (programme) {
      learnerAssignments = learnerAssignments.filter((la) => programme.courseIds.includes(la.courseId));
    }
  }

  const courseMap = new Map<string, { completed: number; total: number }>();
  for (const la of learnerAssignments) {
    if (!courseMap.has(la.courseId)) courseMap.set(la.courseId, { completed: 0, total: 0 });
    const entry = courseMap.get(la.courseId)!;
    entry.total++;
    if (la.status === "completed") entry.completed++;
  }

  const performances: CoursePerformance[] = courses.map((c) => {
    const stats = courseMap.get(c.id) || { completed: 0, total: 0 };
    return {
      id: c.id,
      title: c.title,
      completedCount: stats.completed,
      totalAssigned: stats.total,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    };
  });

  const withData = performances.filter((p) => p.totalAssigned > 0).sort((a, b) => b.completionRate - a.completionRate);
  const totalRate = withData.reduce((sum, p) => sum + p.completionRate, 0);

  return {
    mostCompleted: withData.slice(0, 5),
    leastCompleted: [...withData].sort((a, b) => a.completionRate - b.completionRate).slice(0, 5),
    averageCompletionRate: withData.length > 0 ? Math.round(totalRate / withData.length) : 0,
  };
}

export function getAssignmentPerformance(user?: User | null, filter?: AnalyticsFilter): AssignmentPerformance {
  let learnerAssignments = getLearnerAssignments();

  if (user && user.role === "trainer") {
    const learnerIds = getLearnerIds(user);
    learnerAssignments = learnerAssignments.filter((la) => learnerIds.includes(la.learnerId));
  }

  if (filter?.programmeId) {
    const programmes = getProgrammes();
    const programme = programmes.find((p) => p.id === filter.programmeId);
    if (programme) {
      learnerAssignments = learnerAssignments.filter((la) => programme.assignmentIds.includes(la.assignmentId));
    }
  }

  const relevant = learnerAssignments.filter((la) => la.assignmentId);
  const submitted = relevant.filter((la) => la.status === "completed").length;
  const pending = relevant.filter((la) => la.status === "in_progress" || la.status === "not_started").length;
  const overdue = relevant.filter((la) => la.status === "overdue").length;

  return {
    submitted,
    pending,
    overdue,
    averageScore: 0,
    total: relevant.length,
  };
}

export function getLearnerEngagement(user?: User | null, filter?: AnalyticsFilter): LearnerEngagement {
  let learnerAssignments = getLearnerAssignments();

  if (user && user.role === "trainer") {
    const learnerIds = getLearnerIds(user);
    learnerAssignments = learnerAssignments.filter((la) => learnerIds.includes(la.learnerId));
  }

  if (filter?.programmeId) {
    const programmes = getProgrammes();
    const programme = programmes.find((p) => p.id === filter.programmeId);
    if (programme) {
      learnerAssignments = learnerAssignments.filter((la) => programme.courseIds.includes(la.courseId));
    }
  }

  const now = Date.now();
  const day = 86400000;
  const dailyActive = new Set(learnerAssignments.filter((la) => {
    if (!la.lastActivity) return false;
    return new Date(la.lastActivity).getTime() >= now - day;
  }).map((la) => la.learnerId)).size;

  const weeklyActive = new Set(learnerAssignments.filter((la) => {
    if (!la.lastActivity) return false;
    return new Date(la.lastActivity).getTime() >= now - 7 * day;
  }).map((la) => la.learnerId)).size;

  const monthlyActive = new Set(learnerAssignments.filter((la) => {
    if (!la.lastActivity) return false;
    return new Date(la.lastActivity).getTime() >= now - 30 * day;
  }).map((la) => la.learnerId)).size;

  const totalTime = learnerAssignments.reduce((sum, la) => sum + (la.timeSpent || 0), 0);
  const uniqueLearners = new Set(learnerAssignments.map((la) => la.learnerId)).size;

  const programmes = getProgrammes();
  const startedSet = new Set<string>();
  const completedSet = new Set<string>();
  for (const p of programmes) {
    for (const la of learnerAssignments) {
      if (p.courseIds.includes(la.courseId)) {
        if (la.status !== "not_started") startedSet.add(`${la.learnerId}:${p.id}`);
        if (la.status === "completed") {
          const allDone = p.courseIds.every((cid) =>
            learnerAssignments.some((a) => a.learnerId === la.learnerId && a.courseId === cid && a.status === "completed")
          );
          if (allDone) completedSet.add(`${la.learnerId}:${p.id}`);
        }
      }
    }
  }

  return {
    dailyActive,
    weeklyActive,
    monthlyActive,
    averageLearningTime: uniqueLearners > 0 ? Math.round(totalTime / uniqueLearners) : 0,
    programmesStarted: startedSet.size,
    programmesCompleted: completedSet.size,
  };
}

export function getRecentActivity(user?: User | null, filter?: AnalyticsFilter): ActivityEvent[] {
  const activities: ActivityEvent[] = [];
  const allUsers = getAllUsers();
  const programmes = getProgrammes();
  let learnerAssignments = getLearnerAssignments();
  const notifications = getNotifications();

  if (user && user.role === "trainer") {
    const learnerIds = getLearnerIds(user);
    learnerAssignments = learnerAssignments.filter((la) => learnerIds.includes(la.learnerId));
  }

  const getLearnerName = (id: string) => allUsers.find((u) => u.id === id)?.name || id;

  for (const la of learnerAssignments) {
    if (!la.firstOpened && la.status === "not_started") continue;
    const ts = la.lastActivity || la.firstOpened || la.assignedDate;
    if (!filterByDate(ts, filter?.dateRange)) continue;

    if (la.firstOpened) {
      const course = getCourses().find((c) => c.id === la.courseId);
      activities.push({
        id: `start_${la.id}`,
        type: "programme_started",
        title: "Learner Started a Course",
        description: `${getLearnerName(la.learnerId)} started '${course?.title || "Unknown Course"}'`,
        time: la.firstOpened,
        userId: la.learnerId,
        userName: getLearnerName(la.learnerId),
      });
    }
    if (la.status === "completed" && la.completedDate) {
      const course = getCourses().find((c) => c.id === la.courseId);
      activities.push({
        id: `complete_${la.id}`,
        type: "course_completed",
        title: "Course Completed",
        description: `${getLearnerName(la.learnerId)} completed '${course?.title || "Unknown Course"}'`,
        time: la.completedDate,
        userId: la.learnerId,
        userName: getLearnerName(la.learnerId),
      });
    }
  }

  for (const p of programmes) {
    if (p.courseIds.length === 0) continue;
    for (const learnerId of new Set(learnerAssignments.filter((la) => p.courseIds.includes(la.courseId)).map((la) => la.learnerId))) {
      const courseRecords = learnerAssignments.filter((la) => la.learnerId === learnerId && p.courseIds.includes(la.courseId));
      const allCompleted = courseRecords.every((la) => la.status === "completed");
      if (allCompleted && courseRecords.length > 0) {
        const latestDate = courseRecords.reduce((latest, la) => {
          const d = la.completedDate || la.lastActivity || "";
          return d > latest ? d : latest;
        }, "");
        if (latestDate && filterByDate(latestDate, filter?.dateRange)) {
          activities.push({
            id: `prog_comp_${learnerId}_${p.id}`,
            type: "programme_completed",
            title: "Programme Completed",
            description: `${getLearnerName(learnerId)} completed the programme '${p.name}'`,
            time: latestDate,
            userId: learnerId,
            userName: getLearnerName(learnerId),
          });
        }
      }
    }
  }

  for (const n of notifications) {
    if (!filterByDate(n.createdAt, filter?.dateRange)) continue;
    if (n.type === "training_programme_assigned" && n.title !== "Training Programme Completed") {
      activities.push({
        id: `notif_${n.id}`,
        type: "programme_assigned",
        title: "Programme Assigned",
        description: n.message,
        time: n.createdAt,
        userId: n.userId,
        userName: getLearnerName(n.userId),
      });
    }
    if (n.type === "assignment_submitted") {
      activities.push({
        id: `notif_${n.id}`,
        type: "assignment_submitted",
        title: "Assignment Submitted",
        description: n.message,
        time: n.createdAt,
        userId: n.userId,
        userName: getLearnerName(n.userId),
      });
    }
  }

  const attendanceRecords = getAttendance();
  for (const a of attendanceRecords) {
    const ts = a.joinedAt || a.registeredAt;
    if (ts && filterByDate(ts, filter?.dateRange) && a.status === "completed") {
      activities.push({
        id: `att_${a.id}`,
        type: "event_attended",
        title: "Event Attended",
        description: `${getLearnerName(a.learnerId)} attended an event`,
        time: ts,
        userId: a.learnerId,
        userName: getLearnerName(a.learnerId),
      });
    }
  }

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);
}
