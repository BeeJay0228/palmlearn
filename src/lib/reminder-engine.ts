import type { Programme, Assignment, LearnerAssignment } from "@/types";
import { getProgrammes } from "./programmes";
import { getAssignment } from "./assignments";
import { getLearnerAssignments, getAssignmentsForLearnerAll } from "./learner-assignments";
import { getEventsForLearner } from "./events";
import { getAllUsers } from "./auth";
import {
  getNotifications,
  notifyProgrammeDueSoon,
  notifyProgrammeOverdue,
  notifyAssignmentDueSoon,
  notifyAssignmentDueToday,
  notifyAssignmentOverdue,
  notifySmartReminder,
  notifyAdminSummary,
  notifyEventReminder,
  notifyEventToday,
} from "./mock-notifications";

const SENTINEL_KEY = "palmlearn-reminder-sentinel";

function getSentinel(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(SENTINEL_KEY);
  if (!raw) return new Set();
  try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
}

function markSentinel(key: string): void {
  const sent = getSentinel();
  sent.add(key);
  localStorage.setItem(SENTINEL_KEY, JSON.stringify([...sent]));
}

function wasSent(key: string): boolean {
  return getSentinel().has(key);
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getProgrammesForLearner(learnerId: string): Programme[] {
  const programmes = getProgrammes().filter((p) => p.status === "active");
  const learnerCampaignIds = new Set(
    getLearnerAssignments()
      .filter((la) => la.learnerId === learnerId && la.campaignId)
      .map((la) => la.campaignId)
  );
  return programmes.filter((p) => learnerCampaignIds.has(p.id));
}

function getTrainerIds(): string[] {
  return getAllUsers().filter((u) => u.role === "trainer").map((u) => u.id);
}

function getAdminIds(): string[] {
  return getAllUsers().filter((u) => u.role === "admin").map((u) => u.id);
}

function getLearnerName(learnerId: string): string {
  const user = getAllUsers().find((u) => u.id === learnerId);
  return user?.name || learnerId;
}

function hasNotificationType(userId: string, type: string, entityId: string): boolean {
  return getNotifications(userId).some(
    (n) => n.type === type && n.message.includes(entityId)
  );
}

export function runLearnerProgrammeReminders(learnerId: string): void {
  const programmes = getProgrammesForLearner(learnerId);

  for (const prog of programmes) {
    if (!prog.endDate) continue;
    const due = daysUntil(prog.endDate);
    const dateKey = prog.endDate.slice(0, 10);

    if (due === 7) {
      const key = `programme_due_soon:${prog.id}:${learnerId}:7d:${dateKey}`;
      if (!wasSent(key)) {
        notifyProgrammeDueSoon(prog, learnerId, 7);
        markSentinel(key);
      }
    }
    if (due === 3) {
      const key = `programme_due_soon:${prog.id}:${learnerId}:3d:${dateKey}`;
      if (!wasSent(key)) {
        notifyProgrammeDueSoon(prog, learnerId, 3);
        markSentinel(key);
      }
    }
    if (due === 1) {
      const key = `programme_due_soon:${prog.id}:${learnerId}:1d:${dateKey}`;
      if (!wasSent(key)) {
        notifyProgrammeDueSoon(prog, learnerId, 1);
        markSentinel(key);
      }
    }
    if (due < 0) {
      const key = `programme_overdue:${prog.id}:${learnerId}:${dateKey}`;
      if (!wasSent(key)) {
        notifyProgrammeOverdue(prog, learnerId);
        markSentinel(key);
      }
    }
  }
}

export function runLearnerAssignmentReminders(learnerId: string): void {
  const learnerAsgns = getAssignmentsForLearnerAll(learnerId).filter(
    (la) => la.assignmentId && la.status !== "completed" && la.status !== "locked"
  );

  for (const la of learnerAsgns) {
    const assignment = getAssignment(la.assignmentId);
    if (!assignment || !assignment.schedule?.dueDate) continue;
    const due = daysUntil(assignment.schedule.dueDate);
    const dateKey = assignment.schedule.dueDate.slice(0, 10);

    if (due === 3) {
      const key = `assignment_due_soon:${la.assignmentId}:${learnerId}:3d:${dateKey}`;
      if (!wasSent(key)) {
        notifyAssignmentDueSoon(assignment, [learnerId], 3);
        markSentinel(key);
      }
    }
    if (due === 1) {
      const key = `assignment_due_soon:${la.assignmentId}:${learnerId}:1d:${dateKey}`;
      if (!wasSent(key)) {
        notifyAssignmentDueSoon(assignment, [learnerId], 1);
        markSentinel(key);
      }
    }
    if (due === 0) {
      const key = `assignment_due_today:${la.assignmentId}:${learnerId}:${dateKey}`;
      if (!wasSent(key)) {
        notifyAssignmentDueToday(assignment.name, [learnerId]);
        markSentinel(key);
      }
    }
    if (due < 0 && la.status !== "overdue") {
      const key = `assignment_overdue:${la.assignmentId}:${learnerId}:${dateKey}`;
      if (!wasSent(key)) {
        notifyAssignmentOverdue(assignment, [learnerId]);
        markSentinel(key);
      }
    }
  }
}

export function runLearnerEventReminders(learnerId: string): void {
  const events = getEventsForLearner(learnerId);

  for (const event of events) {
    if (!event.schedule?.startDate) continue;
    const due = daysUntil(event.schedule.startDate);
    const dateKey = event.schedule.startDate.slice(0, 10);

    if (due === 3) {
      const key = `event_reminder:${event.id}:${learnerId}:3d:${dateKey}`;
      if (!wasSent(key)) {
        notifyEventReminder(event.title, event.id, [learnerId]);
        markSentinel(key);
      }
    }
    if (due === 1) {
      const key = `event_reminder:${event.id}:${learnerId}:1d:${dateKey}`;
      if (!wasSent(key)) {
        notifyEventReminder(event.title, event.id, [learnerId]);
        markSentinel(key);
      }
    }
    if (due === 0) {
      const key = `event_today:${event.id}:${learnerId}:${dateKey}`;
      if (!wasSent(key)) {
        notifyEventToday(event.title, event.id, [learnerId]);
        markSentinel(key);
      }
    }
  }
}

export function runSmartReminders(learnerId: string): void {
  const today = todayKey();
  const smartKey = `smart_reminder:${learnerId}:${today}`;
  if (wasSent(smartKey)) return;

  const learnerAsgns = getAssignmentsForLearnerAll(learnerId);
  const programmes = getProgrammesForLearner(learnerId);

  const totalItems = learnerAsgns.length;
  const completedItems = learnerAsgns.filter((la) => la.status === "completed").length;
  const inProgress = learnerAsgns.filter((la) => la.status === "in_progress").length;
  const notStarted = learnerAsgns.filter((la) => la.status === "not_started").length;

  const unfinishedCourses = programmes.reduce((count, prog) => {
    const progItems = learnerAsgns.filter((la) => la.campaignId === prog.id);
    const completed = progItems.filter((la) => la.status === "completed").length;
    return count + (progItems.length - completed);
  }, 0);

  const unfinishedAssignments = learnerAsgns.filter(
    (la) => la.assignmentId && la.status !== "completed"
  ).length;

  if (totalItems === 0) {
    notifySmartReminder(learnerId, "All Caught Up!", "You're all caught up. Great work!");
    markSentinel(smartKey);
    return;
  }

  if (completedItems === totalItems) {
    notifySmartReminder(learnerId, "All Caught Up!", "You're all caught up. Great work!");
    markSentinel(smartKey);
    return;
  }

  if (unfinishedCourses === 1 && programmes.length > 0) {
    notifySmartReminder(
      learnerId,
      "Almost There!",
      "You have one unfinished course remaining. Keep going!"
    );
    markSentinel(smartKey);
    return;
  }

  if (unfinishedCourses <= 2 && programmes.length > 0 && completedItems > 0) {
    notifySmartReminder(
      learnerId,
      "Almost There!",
      "You are almost done with this Training Programme!"
    );
    markSentinel(smartKey);
    return;
  }

  if (unfinishedAssignments === 1) {
    notifySmartReminder(
      learnerId,
      "One Left!",
      "Congratulations! Only one Assignment left."
    );
    markSentinel(smartKey);
    return;
  }

  if (completedItems > 0 && notStarted === 0 && inProgress > 0) {
    notifySmartReminder(
      learnerId,
      "Keep It Up!",
      "You're making great progress. Keep up the momentum!"
    );
    markSentinel(smartKey);
    return;
  }
}

export function runLearnerReminders(learnerId: string): void {
  runLearnerProgrammeReminders(learnerId);
  runLearnerAssignmentReminders(learnerId);
  runLearnerEventReminders(learnerId);
  runSmartReminders(learnerId);
}

export function runTrainerReminders(trainerId: string): void {
  const today = todayKey();
  const trainerKey = `trainer_summary:${trainerId}:${today}`;
  if (wasSent(trainerKey)) return;

  const learners = getAllUsers().filter((u) => u.role === "learner");
  let overdueCount = 0;
  let recentCompletions = 0;

  for (const learner of learners) {
    const allAsgns = getAssignmentsForLearnerAll(learner.id);
    const overdue = allAsgns.filter((la) => la.status === "overdue").length;
    if (overdue > 0) overdueCount++;
    const completedRecently = allAsgns.filter((la) => {
      if (la.status !== "completed" || !la.completedDate) return false;
      return daysUntil(la.completedDate) >= -1;
    }).length;
    recentCompletions += completedRecently;
  }

  if (overdueCount > 0) {
    const key = `trainer_overdue_summary:${trainerId}:${today}`;
    if (!wasSent(key)) {
      notifyAdminSummary(
        trainerId,
        "Learners Overdue",
        `${overdueCount} learner${overdueCount !== 1 ? "s" : ""} ha${overdueCount !== 1 ? "ve" : "s"} overdue assignments.`,
        "/trainer/dashboard"
      );
      markSentinel(key);
    }
  }

  if (recentCompletions > 0) {
    const key = `trainer_completion_summary:${trainerId}:${today}`;
    if (!wasSent(key)) {
      notifyAdminSummary(
        trainerId,
        "Recent Completions",
        `${recentCompletions} course${recentCompletions !== 1 ? "s" : ""} completed recently by your learners.`,
        "/trainer/dashboard"
      );
      markSentinel(key);
    }
  }

  markSentinel(trainerKey);
}

export function runAdminReminders(adminId: string): void {
  const today = todayKey();
  const adminKey = `admin_summary:${adminId}:${today}`;
  if (wasSent(adminKey)) return;

  const programmes = getProgrammes().filter((p) => p.status === "active");
  const allAsgns = getLearnerAssignments();

  for (const prog of programmes) {
    const progAsgns = allAsgns.filter((la) => la.campaignId === prog.id);
    const totalLearners = new Set(progAsgns.map((la) => la.learnerId)).size;
    const completedLearners = new Set(
      progAsgns.filter((la) => la.status === "completed").map((la) => la.learnerId)
    ).size;
    const overdueLearners = new Set(
      progAsgns.filter((la) => la.status === "overdue").map((la) => la.learnerId)
    ).size;
    const completionRate = totalLearners > 0 ? Math.round((completedLearners / totalLearners) * 100) : 0;

    if (prog.courseIds.length >= 5 && totalLearners >= 50) {
      const key = `admin_large_programme:${prog.id}:${adminId}`;
      if (!wasSent(key)) {
        notifyAdminSummary(
          adminId,
          "Large Programme Published",
          `'${prog.name}' has ${totalLearners} learners across ${prog.courseIds.length} courses.`,
          "/admin/programmes"
        );
        markSentinel(key);
      }
    }

    if (completionRate >= 80 && totalLearners >= 10) {
      const key = `admin_high_completion:${prog.id}:${adminId}:${today}`;
      if (!wasSent(key)) {
        notifyAdminSummary(
          adminId,
          "High Completion Rate",
          `'${prog.name}' has a ${completionRate}% completion rate with ${completedLearners} of ${totalLearners} learners done.`,
          "/admin/reports"
        );
        markSentinel(key);
      }
    }

    if (overdueLearners >= 5 && totalLearners > 0) {
      const overduePercent = Math.round((overdueLearners / totalLearners) * 100);
      if (overduePercent >= 30) {
        const key = `admin_many_overdue:${prog.id}:${adminId}:${today}`;
        if (!wasSent(key)) {
          notifyAdminSummary(
            adminId,
            "Many Overdue Learners",
            `'${prog.name}' has ${overdueLearners} overdue learners (${overduePercent}%).`,
            "/admin/reports"
          );
          markSentinel(key);
        }
      }
    }
  }

  markSentinel(adminKey);
}

export function runReminderEngine(userId: string, role: string): void {
  if (typeof window === "undefined") return;

  switch (role) {
    case "learner":
      runLearnerReminders(userId);
      break;
    case "trainer":
      runTrainerReminders(userId);
      break;
    case "admin":
      runAdminReminders(userId);
      break;
  }
}
