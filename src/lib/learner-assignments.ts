import type { LearnerAssignment, LearnerAssignmentStatus, Assignment } from "@/types";
import { checkAndMarkProgrammeCompletion } from "./programmes";

const STORAGE_KEY = "palmlearn-learner-assignments";

function generateId(): string {
  return `la_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function pastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function futureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function getStored(): LearnerAssignment[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LearnerAssignment[];
  } catch {
    return [];
  }
}

function setStored(items: LearnerAssignment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const SEED_LEARNER_ASSIGNMENTS: LearnerAssignment[] = [
  { id: "la_seed_1", assignmentId: "asgn_seed_1", learnerId: "user_learner_1", courseId: "course_1", progress: 45, status: "in_progress", assignedDate: pastDate(7), firstOpened: pastDate(6), lastActivity: pastDate(1), timeSpent: 120 },
  { id: "la_seed_2", assignmentId: "asgn_seed_1", learnerId: "user_learner_2", courseId: "course_1", progress: 100, status: "completed", assignedDate: pastDate(7), firstOpened: pastDate(6), lastActivity: pastDate(2), completedDate: pastDate(2), timeSpent: 240 },
  { id: "la_seed_3", assignmentId: "asgn_seed_2", learnerId: "user_learner_1", courseId: "course_2", progress: 10, status: "in_progress", assignedDate: pastDate(3), firstOpened: pastDate(2), lastActivity: pastDate(1), timeSpent: 30 },
  { id: "la_seed_4", assignmentId: "asgn_seed_3", learnerId: "user_learner_2", courseId: "course_3", progress: 0, status: "not_started", assignedDate: pastDate(14), timeSpent: 0 },
  { id: "la_seed_5", assignmentId: "asgn_seed_4", learnerId: "user_learner_1", courseId: "course_4", progress: 75, status: "in_progress", assignedDate: pastDate(5), firstOpened: pastDate(4), lastActivity: pastDate(1), timeSpent: 180 },
  { id: "la_seed_6", assignmentId: "asgn_seed_4", learnerId: "user_learner_2", courseId: "course_4", progress: 0, status: "not_started", assignedDate: pastDate(5), timeSpent: 0 },
  { id: "la_seed_7", assignmentId: "asgn_seed_1", learnerId: "user_learner_2", courseId: "course_1", progress: 100, status: "completed", assignedDate: pastDate(7), firstOpened: pastDate(6), lastActivity: pastDate(2), completedDate: pastDate(2), timeSpent: 300 },
  { id: "la_seed_8", assignmentId: "asgn_seed_2", learnerId: "user_learner_2", courseId: "course_2", progress: 50, status: "in_progress", assignedDate: pastDate(3), firstOpened: pastDate(2), lastActivity: pastDate(1), timeSpent: 90 },
  { id: "la_seed_9", assignmentId: "asgn_seed_3", learnerId: "user_learner_1", courseId: "course_5", progress: 20, status: "in_progress", assignedDate: pastDate(14), firstOpened: pastDate(10), lastActivity: pastDate(5), timeSpent: 60 },
  { id: "la_seed_10", assignmentId: "asgn_seed_5", learnerId: "user_learner_1", courseId: "course_6", progress: 0, status: "overdue", assignedDate: pastDate(30), firstOpened: pastDate(28), timeSpent: 5 },
];

export function seedLearnerAssignments(): void {
  if (typeof window === "undefined") return;
  const existing = getStored();
  if (existing.length === 0) {
    setStored(SEED_LEARNER_ASSIGNMENTS);
  }
}

export function getLearnerAssignments(): LearnerAssignment[] {
  return getStored();
}

export function getLearnerAssignment(id: string): LearnerAssignment | undefined {
  return getStored().find((la) => la.id === id);
}

export function getAssignmentsForLearner(learnerId: string): LearnerAssignment[] {
  return getStored().filter((la) => la.learnerId === learnerId && (!la.campaignId || la.assignmentId));
}

export function getAssignmentsForLearnerAll(learnerId: string): LearnerAssignment[] {
  return getStored().filter((la) => la.learnerId === learnerId);
}

export function getAssignmentsForCourse(courseId: string): LearnerAssignment[] {
  return getStored().filter((la) => la.courseId === courseId);
}

export function getAssignmentsForAssignment(assignmentId: string): LearnerAssignment[] {
  return getStored().filter((la) => la.assignmentId === assignmentId);
}

export function getAssignmentsForProgramme(programmeId: string): LearnerAssignment[] {
  return getStored().filter((la) => la.campaignId === programmeId);
}

export function createLearnerAssignment(data: Omit<LearnerAssignment, "id" | "assignedDate">): LearnerAssignment {
  const la: LearnerAssignment = { ...data, id: generateId(), assignedDate: now() };
  const list = getStored();
  list.push(la);
  setStored(list);
  return la;
}

export function updateLearnerAssignment(id: string, data: Partial<LearnerAssignment>): LearnerAssignment | undefined {
  const list = getStored();
  const idx = list.findIndex((la) => la.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...data };
  setStored(list);
  return list[idx];
}

export function deleteLearnerAssignment(id: string): boolean {
  const list = getStored();
  const filtered = list.filter((la) => la.id !== id);
  if (filtered.length === list.length) return false;
  setStored(filtered);
  return true;
}

export function bulkCreateFromAssignment(assignmentId: string, learnerIds: string[], courseIds: string[]): LearnerAssignment[] {
  const existing = getStored();
  const created: LearnerAssignment[] = [];
  for (const learnerId of learnerIds) {
    for (const courseId of courseIds) {
      const exists = existing.find((la) => la.assignmentId === assignmentId && la.learnerId === learnerId && la.courseId === courseId);
      if (exists) continue;
      const la = createLearnerAssignment({ assignmentId, learnerId, courseId, progress: 0, status: "not_started", timeSpent: 0 });
      created.push(la);
    }
  }
  return created;
}

export function getLearnerStats(learnerId: string): { total: number; completed: number; inProgress: number; notStarted: number; overdue: number } {
  const items = getAssignmentsForLearnerAll(learnerId);
  return {
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    inProgress: items.filter((i) => i.status === "in_progress").length,
    notStarted: items.filter((i) => i.status === "not_started").length,
    overdue: items.filter((i) => i.status === "overdue").length,
  };
}

export function getCourseProgress(learnerId: string, courseId: string): LearnerAssignment | undefined {
  return getStored().find((la) => la.learnerId === learnerId && la.courseId === courseId);
}

export function markAssignmentInProgress(id: string): LearnerAssignment | undefined {
  return updateLearnerAssignment(id, {
    status: "in_progress",
    firstOpened: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    progress: 10,
  });
}

export function markAssignmentCompleted(id: string): LearnerAssignment | undefined {
  const record = getLearnerAssignment(id);
  if (!record) return undefined;
  const updated = updateLearnerAssignment(id, {
    status: "completed",
    progress: 100,
    completedDate: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  });
  if (updated && record.campaignId) {
    checkAndMarkProgrammeCompletion(record.learnerId, record.campaignId);
  }
  return updated;
}

export function checkAndUpdateOverdueStatus(learnerId: string, assignments: Assignment[]): void {
  const records = getAssignmentsForLearner(learnerId);
  const now = new Date();
  for (const record of records) {
    if (record.status === "completed" || record.status === "overdue") continue;
    const assignment = assignments.find((a) => a.id === record.assignmentId);
    if (!assignment?.schedule?.dueDate) continue;
    const dueDate = new Date(assignment.schedule.dueDate);
    if (dueDate < now) {
      updateLearnerAssignment(record.id, { status: "overdue", lastActivity: now.toISOString() });
    }
  }
}

export function getDaysLeft(assignment: Assignment): number | null {
  if (!assignment.schedule?.dueDate) return null;
  const now = new Date();
  const due = new Date(assignment.schedule.dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
