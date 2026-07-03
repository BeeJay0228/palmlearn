"use client";

import { getAllUsers } from "./auth";
import { getProgrammes, getProgrammeProgress, getProgrammeLearnerIds } from "./programmes";
import { getCourses } from "./courses";
import { getAssignments } from "./assignments";
import { getAssignmentsForLearnerAll, getLearnerStats } from "./learner-assignments";
import { getNotifications } from "./mock-notifications";
import type { User } from "@/types";

export interface LearnerProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  dateJoined: string;
  trainerAssigned: string;
  avatar?: string;
}

export interface LearningSummary {
  programmesAssigned: number;
  programmesStarted: number;
  programmesCompleted: number;
  coursesAssigned: number;
  coursesCompleted: number;
  assignmentsAssigned: number;
  assignmentsSubmitted: number;
  assignmentsOverdue: number;
  averageAssignmentScore: number;
  averageProgrammeProgress: number;
  certificatesEarned: number;
  achievementsEarned: number;
}

export interface LearnerProgramme {
  id: string;
  name: string;
  assignedDate: string;
  dueDate?: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "overdue";
}

export interface CourseHistoryItem {
  id: string;
  title: string;
  programme: string;
  status: string;
  startedDate: string | null;
  completedDate: string | null;
  completionPercent: number;
  timeSpent: number;
}

export interface AssignmentHistoryItem {
  id: string;
  name: string;
  programme: string;
  submissionDate: string | null;
  score: number;
  passed: boolean | null;
  attempts: number;
  status: string;
}

export interface ActivityTimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export interface EngagementMetrics {
  lastActivity: string | null;
  lastLearningActivity: string | null;
  dailyLearningTime: number;
  weeklyLearningTime: number;
  monthlyLearningTime: number;
  learningStreak: number;
}

export interface LearnerNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export function canViewLearnerProfile(currentUser: User | null, targetLearnerId: string): boolean {
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  if (currentUser.role === "trainer") {
    const programmes = getProgrammes().filter(
      (p) => p.createdBy === currentUser.id || p.assignedBy === currentUser.id
    );
    const trainerLearnerIds = new Set<string>();
    for (const p of programmes) {
      const ids = getProgrammeLearnerIds(p);
      for (const id of ids) trainerLearnerIds.add(id);
    }
    if (trainerLearnerIds.has(targetLearnerId)) return true;
    const allUsers = getAllUsers();
    const trainerUser = allUsers.find((u) => u.id === currentUser.id);
    if (trainerUser?.categoryId) {
      const sameCatLearners = allUsers.filter((u) => u.categoryId === trainerUser.categoryId).map((u) => u.id);
      if (sameCatLearners.includes(targetLearnerId)) return true;
    }
    return false;
  }
  return false;
}

export function getTrainerLearners(trainerId: string): User[] {
  const programmes = getProgrammes().filter(
    (p) => p.createdBy === trainerId || p.assignedBy === trainerId
  );
  const learnerIds = new Set<string>();
  for (const p of programmes) {
    const ids = getProgrammeLearnerIds(p);
    for (const id of ids) learnerIds.add(id);
  }
  const allUsers = getAllUsers();
  const trainerUser = allUsers.find((u) => u.id === trainerId);
  if (trainerUser?.categoryId) {
    const sameCat = allUsers.filter((u) => u.categoryId === trainerUser.categoryId && u.role === "learner");
    for (const u of sameCat) learnerIds.add(u.id);
  }
  return allUsers.filter((u) => learnerIds.has(u.id));
}

export function getLearnerProfile(learnerId: string): LearnerProfileData | null {
  const allUsers = getAllUsers();
  const learner = allUsers.find((u) => u.id === learnerId);
  if (!learner) return null;

  const programmes = getProgrammes();
  const createdBy = programmes.find((p) => p.createdBy === learnerId || p.assignedBy === learnerId);
  const trainerUser = createdBy ? allUsers.find((u) => u.id === (createdBy.createdBy || createdBy.assignedBy)) : null;

  return {
    id: learner.id,
    name: learner.name,
    email: learner.email,
    role: learner.role,
    department: learner.categoryId || "—",
    status: learner.status || "active",
    dateJoined: learner.createdAt,
    trainerAssigned: trainerUser?.name || "—",
    avatar: learner.avatar,
  };
}

export function getLearnerLearningSummary(learnerId: string): LearningSummary {
  const programmes = getProgrammes();
  const learnerAssignments = getAssignmentsForLearnerAll(learnerId);
  const allCourses = getCourses();
  const allAssignments = getAssignments();
  const allUsers = getAllUsers();

  const assignedProgrammes = programmes.filter((p) => {
    const ids = getProgrammeLearnerIds(p);
    return ids.includes(learnerId);
  });

  const programmesStarted = assignedProgrammes.filter((p) => {
    const records = learnerAssignments.filter((la) => la.campaignId === p.id);
    return records.some((r) => r.status !== "not_started" && r.status !== "locked");
  });

  const programmesCompleted = assignedProgrammes.filter((p) => {
    const records = learnerAssignments.filter((la) => la.campaignId === p.id);
    const courseIds = p.courseIds;
    return courseIds.length > 0 && courseIds.every((cid) =>
      records.some((r) => r.courseId === cid && r.status === "completed")
    );
  });

  const totalCourses = learnerAssignments.filter((la) => la.courseId).length;
  const completedCourses = learnerAssignments.filter((la) => la.courseId && la.status === "completed").length;
  const totalAssignments = learnerAssignments.filter((la) => la.assignmentId).length;
  const submittedAssignments = learnerAssignments.filter((la) => la.assignmentId && la.status === "completed").length;
  const overdueAssignments = learnerAssignments.filter((la) => la.status === "overdue").length;

  const avgProgrammeProgress = assignedProgrammes.length > 0
    ? Math.round(
        assignedProgrammes.reduce((sum, p) => {
          const prog = getProgrammeProgress(learnerId, p);
          return sum + prog.progress;
        }, 0) / assignedProgrammes.length
      )
    : 0;

  return {
    programmesAssigned: assignedProgrammes.length,
    programmesStarted: programmesStarted.length,
    programmesCompleted: programmesCompleted.length,
    coursesAssigned: totalCourses,
    coursesCompleted: completedCourses,
    assignmentsAssigned: totalAssignments,
    assignmentsSubmitted: submittedAssignments,
    assignmentsOverdue: overdueAssignments,
    averageAssignmentScore: 0,
    averageProgrammeProgress: avgProgrammeProgress,
    certificatesEarned: programmesCompleted.length,
    achievementsEarned: 0,
  };
}

export function getLearnerProgrammes(learnerId: string): LearnerProgramme[] {
  const programmes = getProgrammes();
  const learnerAssignments = getAssignmentsForLearnerAll(learnerId);

  return programmes
    .filter((p) => {
      const ids = getProgrammeLearnerIds(p);
      return ids.includes(learnerId);
    })
    .map((p) => {
      const records = learnerAssignments.filter((la) => la.campaignId === p.id);
      const progress = getProgrammeProgress(learnerId, p);
      const isOverdue = records.some((r) => r.status === "overdue");
      const isCompleted = progress.progress >= 100;
      const isInProgress = records.some((r) => r.status === "in_progress" || r.status === "completed");
      const isStarted = records.some((r) => r.status !== "not_started" && r.status !== "locked");

      let status: LearnerProgramme["status"] = "not_started";
      if (isOverdue) status = "overdue";
      else if (isCompleted) status = "completed";
      else if (isStarted) status = "in_progress";

      return {
        id: p.id,
        name: p.name,
        assignedDate: records[0]?.assignedDate || p.createdAt,
        dueDate: p.endDate,
        progress: progress.progress,
        status,
      };
    });
}

export function getLearnerCourseHistory(learnerId: string): CourseHistoryItem[] {
  const learnerAssignments = getAssignmentsForLearnerAll(learnerId);
  const allCourses = getCourses();
  const programmes = getProgrammes();

  return learnerAssignments
    .filter((la) => la.courseId)
    .map((la) => {
      const course = allCourses.find((c) => c.id === la.courseId);
      const programme = programmes.find((p) => p.id === la.campaignId);
      return {
        id: la.id,
        title: course?.title || "Unknown Course",
        programme: programme?.name || "—",
        status: la.status,
        startedDate: la.firstOpened || null,
        completedDate: la.completedDate || null,
        completionPercent: la.progress || 0,
        timeSpent: la.timeSpent || 0,
      };
    });
}

export function getLearnerAssignmentHistory(learnerId: string): AssignmentHistoryItem[] {
  const learnerAssignments = getAssignmentsForLearnerAll(learnerId);
  const allAssignments = getAssignments();
  const programmes = getProgrammes();

  return learnerAssignments
    .filter((la) => la.assignmentId)
    .map((la) => {
      const asgn = allAssignments.find((a) => a.id === la.assignmentId);
      const programme = programmes.find((p) => p.id === la.campaignId);
      return {
        id: la.id,
        name: asgn?.name || "Unknown Assignment",
        programme: programme?.name || "—",
        submissionDate: la.completedDate || null,
        score: 0,
        passed: la.status === "completed" ? true : null,
        attempts: 1,
        status: la.status,
      };
    });
}

export function getLearnerActivityTimeline(learnerId: string): ActivityTimelineEvent[] {
  const events: ActivityTimelineEvent[] = [];
  const programmes = getProgrammes();
  const learnerAssignments = getAssignmentsForLearnerAll(learnerId);
  const allCourses = getCourses();
  const allAssignments = getAssignments();
  const allUsers = getAllUsers();

  const assignedProgrammes = programmes.filter((p) => {
    const ids = getProgrammeLearnerIds(p);
    return ids.includes(learnerId);
  });

  for (const p of assignedProgrammes) {
    const records = learnerAssignments.filter((la) => la.campaignId === p.id);
    if (records.length > 0) {
      events.push({
        id: `assigned_${p.id}`,
        type: "assigned",
        title: "Programme Assigned",
        description: `Assigned to '${p.name}'`,
        time: records[0].assignedDate,
      });
    }
  }

  for (const la of learnerAssignments) {
    if (la.firstOpened && la.courseId) {
      const course = allCourses.find((c) => c.id === la.courseId);
      events.push({
        id: `started_${la.id}`,
        type: "started",
        title: "Course Started",
        description: `Started '${course?.title || "a course"}'`,
        time: la.firstOpened,
      });
    }
    if (la.completedDate && la.courseId) {
      const course = allCourses.find((c) => c.id === la.courseId);
      events.push({
        id: `course_comp_${la.id}`,
        type: "completed",
        title: "Course Completed",
        description: `Completed '${course?.title || "a course"}'`,
        time: la.completedDate,
      });
    }
    if (la.completedDate && la.assignmentId) {
      const asgn = allAssignments.find((a) => a.id === la.assignmentId);
      events.push({
        id: `sub_${la.id}`,
        type: "submitted",
        title: "Assignment Submitted",
        description: `Submitted '${asgn?.name || "an assignment"}'`,
        time: la.completedDate,
      });
    }
  }

  for (const p of assignedProgrammes) {
    const records = learnerAssignments.filter((la) => la.campaignId === p.id);
    const courseIds = p.courseIds;
    const allDone = courseIds.length > 0 && courseIds.every((cid) =>
      records.some((r) => r.courseId === cid && r.status === "completed")
    );
    if (allDone && records.length > 0) {
      const latestDate = records.reduce((latest, r) => {
        const d = r.completedDate || r.lastActivity || "";
        return d > latest ? d : latest;
      }, "");
      if (latestDate) {
        events.push({
          id: `prog_comp_${p.id}`,
          type: "programme_completed",
          title: "Programme Completed",
          description: `Completed '${p.name}'`,
          time: latestDate,
        });
      }
    }
  }

  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function getLearnerEngagementMetrics(learnerId: string): EngagementMetrics {
  const learnerAssignments = getAssignmentsForLearnerAll(learnerId);

  const lastActivityDates = learnerAssignments
    .map((la) => la.lastActivity || la.completedDate || la.firstOpened || la.assignedDate)
    .filter(Boolean) as string[];

  const lastActivity = lastActivityDates.length > 0
    ? lastActivityDates.reduce((latest, d) => d > latest ? d : latest, lastActivityDates[0])
    : null;

  const lastLearning = learnerAssignments
    .filter((la) => la.lastActivity)
    .map((la) => la.lastActivity as string)
    .reduce((latest, d) => d > latest ? d : latest, "");

  const now = Date.now();
  const day = 86400000;
  const dailyTime = learnerAssignments
    .filter((la) => la.lastActivity && (now - new Date(la.lastActivity).getTime()) < day)
    .reduce((sum, la) => sum + (la.timeSpent || 0), 0);
  const weeklyTime = learnerAssignments
    .filter((la) => la.lastActivity && (now - new Date(la.lastActivity).getTime()) < 7 * day)
    .reduce((sum, la) => sum + (la.timeSpent || 0), 0);
  const monthlyTime = learnerAssignments
    .filter((la) => la.lastActivity && (now - new Date(la.lastActivity).getTime()) < 30 * day)
    .reduce((sum, la) => sum + (la.timeSpent || 0), 0);

  return {
    lastActivity,
    lastLearningActivity: lastLearning || null,
    dailyLearningTime: dailyTime,
    weeklyLearningTime: weeklyTime,
    monthlyLearningTime: monthlyTime,
    learningStreak: 0,
  };
}

export function getLearnerNotificationHistory(learnerId: string): LearnerNotification[] {
  const allNotifications = getNotifications();
  return allNotifications
    .filter((n) => n.userId === learnerId)
    .map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      link: n.link,
    }));
}
