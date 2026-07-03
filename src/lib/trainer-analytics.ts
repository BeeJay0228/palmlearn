"use client";

import { getAllUsers } from "./auth";
import { getProgrammes, getProgrammeProgress, getProgrammeLearnerIds } from "./programmes";
import { getAssignmentsForLearnerAll } from "./learner-assignments";
import { getCourses } from "./courses";
import { getAssignments } from "./assignments";
import { getNotifications } from "./mock-notifications";
import { getTrainerLearnerIds, getTrainerProgrammes } from "./trainer-analytics-utils";
import type { User } from "@/types";

export interface TrainerListItem {
  id: string;
  name: string;
  email: string;
  department: string;
  dateJoined: string;
  status: string;
  activeProgrammes: number;
  assignedLearners: number;
  completedLearners: number;
  averageProgress: number;
  programmeCompletionRate: number;
  assignmentCompletionRate: number;
  averageAssignmentScore: number;
  lastActivity: string | null;
}

export interface TrainingSummary {
  programmesCreated: number;
  publishedProgrammes: number;
  draftProgrammes: number;
  learnersAssigned: number;
  learnersActive: number;
  learnersCompleted: number;
  averageProgrammeCompletion: number;
  averageLearnerProgress: number;
  averageAssignmentScore: number;
  programmeCompletionRate: number;
}

export interface ProgrammePerformanceItem {
  id: string;
  name: string;
  publishedDate: string | null;
  learnersAssigned: number;
  learnersStarted: number;
  learnersCompleted: number;
  completionPercent: number;
  averageProgress: number;
  averageAssignmentScore: number;
  status: string;
}

export interface LearnerPerformanceItem {
  id: string;
  name: string;
  email: string;
  programmeName: string;
  progress: number;
  assignmentsSubmitted: number;
  assignmentsPending: number;
  status: string;
  lastActivity: string | null;
}

export interface AssignmentPerformance {
  assignmentsCreated: number;
  assignmentsSubmitted: number;
  pendingAssignments: number;
  overdueAssignments: number;
  averageScore: number;
  submissionRate: number;
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export function getAllTrainerStats(): TrainerListItem[] {
  const allUsers = getAllUsers();
  const trainers = allUsers.filter((u) => u.role === "trainer");

  return trainers.map((t) => {
    const programmes = getTrainerProgrammes(t.id);
    const learnerIds = getTrainerLearnerIds(t.id);
    const lastActivityDates: string[] = [];
    let totalProgress = 0;
    let totalLearnersWithProgramme = 0;
    let completedLearners = 0;
    let totalAssignments = 0;
    let completedAssignments = 0;

    for (const p of programmes) {
      const pLearnerIds = getProgrammeLearnerIds(p);
      for (const lid of pLearnerIds) {
        if (learnerIds.has(lid)) {
          const prog = getProgrammeProgress(lid, p);
          totalProgress += prog.progress;
          totalLearnersWithProgramme++;
          if (prog.progress >= 100) completedLearners++;
          const records = getAssignmentsForLearnerAll(lid).filter((la) => la.campaignId === p.id);
          totalAssignments += records.filter((la) => la.assignmentId).length;
          completedAssignments += records.filter((la) => la.assignmentId && la.status === "completed").length;
          for (const r of records) {
            if (r.lastActivity) lastActivityDates.push(r.lastActivity);
            if (r.completedDate) lastActivityDates.push(r.completedDate);
          }
        }
      }
    }

    return {
      id: t.id,
      name: t.name,
      email: t.email,
      department: t.categoryId || "—",
      dateJoined: t.createdAt,
      status: t.status || "active",
      activeProgrammes: programmes.filter((p) => p.status === "active").length,
      assignedLearners: totalLearnersWithProgramme,
      completedLearners,
      averageProgress: totalLearnersWithProgramme > 0 ? Math.round(totalProgress / totalLearnersWithProgramme) : 0,
      programmeCompletionRate: totalLearnersWithProgramme > 0 ? Math.round((completedLearners / totalLearnersWithProgramme) * 100) : 0,
      assignmentCompletionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
      averageAssignmentScore: 0,
      lastActivity: lastActivityDates.length > 0 ? lastActivityDates.reduce((a, b) => a > b ? a : b) : null,
    };
  });
}

export function getTrainingSummary(trainerId: string): TrainingSummary {
  const programmes = getTrainerProgrammes(trainerId);
  const learnerIds = getTrainerLearnerIds(trainerId);
  let totalProgress = 0;
  let learnersWithRecords = 0;
  let completedLearners = 0;
  let totalAssignments = 0;
  let completedAssignments = 0;

  for (const lid of learnerIds) {
    const allRecords = getAssignmentsForLearnerAll(lid);
    const programmeRecords = allRecords.filter((la) =>
      programmes.some((p) => p.id === la.campaignId)
    );
    if (programmeRecords.length > 0) {
      learnersWithRecords++;
      const isCompleted = programmes.every((p) => {
        const pRecs = programmeRecords.filter((la) => la.campaignId === p.id);
        return p.courseIds.length === 0 || p.courseIds.every((cid) =>
          pRecs.some((r) => r.courseId === cid && r.status === "completed")
        );
      });
      if (isCompleted) completedLearners++;
    }
    const progRecords = programmes.length > 0 ? programmes.map((prog) => {
      const progProg = getProgrammeProgress(lid, prog);
      return progProg.progress;
    }) : [];
    if (progRecords.length > 0) {
      totalProgress += progRecords.reduce((a, b) => a + b, 0) / progRecords.length;
    }
    const allAsgn = allRecords.filter((la) => la.assignmentId);
    totalAssignments += allAsgn.length;
    completedAssignments += allAsgn.filter((la) => la.status === "completed").length;
  }

  return {
    programmesCreated: programmes.length,
    publishedProgrammes: programmes.filter((p) => p.status === "active").length,
    draftProgrammes: programmes.filter((p) => p.status === "draft").length,
    learnersAssigned: learnerIds.size,
    learnersActive: learnersWithRecords,
    learnersCompleted: completedLearners,
    averageProgrammeCompletion: learnerIds.size > 0 ? Math.round((completedLearners / learnerIds.size) * 100) : 0,
    averageLearnerProgress: learnersWithRecords > 0 ? Math.round(totalProgress / learnersWithRecords) : 0,
    averageAssignmentScore: 0,
    programmeCompletionRate: learnerIds.size > 0 ? Math.round((completedLearners / learnerIds.size) * 100) : 0,
  };
}

export function getTrainerProgrammePerformance(trainerId: string): ProgrammePerformanceItem[] {
  const programmes = getTrainerProgrammes(trainerId);
  const learnerIds = getTrainerLearnerIds(trainerId);

  return programmes.map((p) => {
    let started = 0;
    let completed = 0;
    let totalProg = 0;
    let count = 0;
    let totalAsgnScore = 0;
    let asgnCount = 0;

    for (const lid of learnerIds) {
      const pLearnerIds = getProgrammeLearnerIds(p);
      if (!pLearnerIds.includes(lid)) continue;
      const records = getAssignmentsForLearnerAll(lid).filter((la) => la.campaignId === p.id);
      if (records.some((r) => r.status !== "not_started" && r.status !== "locked")) started++;
      const allDone = p.courseIds.length === 0 || p.courseIds.every((cid) =>
        records.some((r) => r.courseId === cid && r.status === "completed")
      );
      if (allDone && records.some((r) => r.status === "completed")) completed++;
      const pr = getProgrammeProgress(lid, p);
      totalProg += pr.progress;
      count++;
      const asgnRecords = records.filter((la) => la.assignmentId && la.status === "completed");
      asgnCount += asgnRecords.length;
    }

    return {
      id: p.id,
      name: p.name,
      publishedDate: p.publishedAt || null,
      learnersAssigned: getProgrammeLearnerIds(p).filter((lid) => learnerIds.has(lid)).length,
      learnersStarted: started,
      learnersCompleted: completed,
      completionPercent: count > 0 ? Math.round((completed / count) * 100) : 0,
      averageProgress: count > 0 ? Math.round(totalProg / count) : 0,
      averageAssignmentScore: asgnCount > 0 ? Math.round(totalAsgnScore / asgnCount) : 0,
      status: p.status,
    };
  });
}

export function getTrainerLearnerPerformance(trainerId: string): LearnerPerformanceItem[] {
  const learnerIds = getTrainerLearnerIds(trainerId);
  const allUsers = getAllUsers();
  const programmes = getTrainerProgrammes(trainerId);

  return Array.from(learnerIds).map((lid) => {
    const learner = allUsers.find((u) => u.id === lid);
    const records = getAssignmentsForLearnerAll(lid);
    const programmeRecords = records.filter((la) =>
      programmes.some((p) => p.id === la.campaignId)
    );
    const submitted = programmeRecords.filter((la) => la.assignmentId && la.status === "completed").length;
    const pending = programmeRecords.filter((la) => la.assignmentId && (la.status === "in_progress" || la.status === "not_started")).length;
    const activeProg = programmes.find((p) => {
      const pr = getProgrammeProgress(lid, p);
      return pr.progress > 0 && pr.progress < 100;
    });
    const isOverdue = programmeRecords.some((r) => r.status === "overdue");
    const isCompleted = programmes.every((p) => {
      const pr = getProgrammeProgress(lid, p);
      return pr.progress >= 100;
    });
    const lastDates = programmeRecords.map((r) => r.lastActivity || r.completedDate || r.firstOpened || "").filter(Boolean) as string[];

    return {
      id: lid,
      name: learner?.name || "Unknown",
      email: learner?.email || "",
      programmeName: activeProg?.name || (isCompleted ? "All Completed" : "—"),
      progress: programmes.length > 0
        ? Math.round(programmes.reduce((sum, p) => sum + getProgrammeProgress(lid, p).progress, 0) / programmes.length)
        : 0,
      assignmentsSubmitted: submitted,
      assignmentsPending: pending,
      status: isOverdue ? "overdue" : isCompleted ? "completed" : pending > 0 || programmes.some((p) => getProgrammeProgress(lid, p).progress > 0) ? "in_progress" : "not_started",
      lastActivity: lastDates.length > 0 ? lastDates.reduce((a, b) => a > b ? a : b) : null,
    };
  });
}

export function getTrainerAssignmentPerformance(trainerId: string): AssignmentPerformance {
  const learnerIds = getTrainerLearnerIds(trainerId);
  const allAssignments = getAssignments();
  const trainerAssignments = allAssignments.filter(
    (a) => a.assignedBy === trainerId || a.publishedBy === trainerId
  );
  const programmes = getTrainerProgrammes(trainerId);

  let totalSubmitted = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let totalCount = 0;

  for (const lid of learnerIds) {
    const records = getAssignmentsForLearnerAll(lid);
    const progRecords = records.filter((la) =>
      programmes.some((p) => p.id === la.campaignId) && la.assignmentId
    );
    totalSubmitted += progRecords.filter((la) => la.status === "completed").length;
    totalPending += progRecords.filter((la) => la.status === "in_progress" || la.status === "not_started").length;
    totalOverdue += progRecords.filter((la) => la.status === "overdue").length;
    totalCount += progRecords.length;
  }

  return {
    assignmentsCreated: trainerAssignments.length,
    assignmentsSubmitted: totalSubmitted,
    pendingAssignments: totalPending,
    overdueAssignments: totalOverdue,
    averageScore: 0,
    submissionRate: totalCount > 0 ? Math.round((totalSubmitted / totalCount) * 100) : 0,
  };
}

export function getTrainerActivityTimeline(trainerId: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const programmes = getTrainerProgrammes(trainerId);
  const allUsers = getAllUsers();
  const notifications = getNotifications();

  for (const p of programmes) {
    if (p.createdAt) {
      events.push({ id: `created_${p.id}`, type: "created", title: "Programme Created", description: `Created programme '${p.name}'`, time: p.createdAt });
    }
    if (p.publishedAt) {
      events.push({ id: `published_${p.id}`, type: "published", title: "Programme Published", description: `Published programme '${p.name}'`, time: p.publishedAt });
    }
    if (p.updatedAt && p.updatedAt !== p.createdAt) {
      events.push({ id: `updated_${p.id}`, type: "updated", title: "Programme Updated", description: `Updated programme '${p.name}'`, time: p.updatedAt });
    }
    const learnerIds = getProgrammeLearnerIds(p);
    for (const lid of learnerIds) {
      const learner = allUsers.find((u) => u.id === lid);
      const records = getAssignmentsForLearnerAll(lid).filter((la) => la.campaignId === p.id);
      if (records.length > 0) {
        events.push({
          id: `assigned_${lid}_${p.id}`,
          type: "assigned",
          title: "Learner Assigned",
          description: `${learner?.name || "A learner"} was assigned to '${p.name}'`,
          time: records[0].assignedDate,
        });
      }
      for (const r of records) {
        if (r.completedDate && r.courseId) {
          const course = getCourses().find((c) => c.id === r.courseId);
          events.push({
            id: `course_comp_${r.id}`,
            type: "course_completed",
            title: "Course Completed",
            description: `${learner?.name || "A learner"} completed '${course?.title || "a course"}'`,
            time: r.completedDate,
          });
        }
        if (r.completedDate && r.assignmentId) {
          const asgn = getAssignments().find((a) => a.id === r.assignmentId);
          events.push({
            id: `sub_${r.id}`,
            type: "submitted",
            title: "Assignment Submitted",
            description: `${learner?.name || "A learner"} submitted '${asgn?.name || "an assignment"}'`,
            time: r.completedDate,
          });
        }
      }
      const allDone = p.courseIds.length > 0 && p.courseIds.every((cid) =>
        records.some((r) => r.courseId === cid && r.status === "completed")
      );
      if (allDone && records.length > 0) {
        const latest = records.reduce((latest, r) => (r.completedDate || r.lastActivity || "") > latest ? (r.completedDate || r.lastActivity || "") : latest, "");
        if (latest) {
          events.push({
            id: `prog_comp_${lid}_${p.id}`,
            type: "programme_completed",
            title: "Programme Completed",
            description: `${learner?.name || "A learner"} completed '${p.name}'`,
            time: latest,
          });
        }
      }
    }
  }

  const trainerNotifications = notifications.filter((n) => {
    const msg = n.message || "";
    const title = n.title || "";
    return msg.includes(allUsers.find((u) => u.id === trainerId)?.name || trainerId) ||
           title.includes("learner") || title.includes("completed") || title.includes("submitted");
  });
  for (const n of trainerNotifications) {
    events.push({
      id: `notif_${n.id}`,
      type: "notification",
      title: n.title,
      description: n.message,
      time: n.createdAt,
    });
  }

  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}
