import type { Assignment, AssignmentType, AssignmentPriority, AssignmentStatus, AssignmentSchedule, AssignmentNotifications } from "@/types";
import type { TargetAudience } from "@/types";
import { getAllUsers } from "./auth";
import { notifyAssignmentUnlocked } from "./mock-notifications";
import { bulkCreateFromAssignment } from "./learner-assignments";

export function resolveAssignmentAudience(audience: TargetAudience): string[] {
  const allUsers = getAllUsers();
  const { type, userIds, categoryIds, subCategoryIds, regionIds, stateIds } = audience;
  if (type === "organization") return allUsers.filter((u) => u.role === "learner").map((u) => u.id);
  if (type === "multiple" || type === "single") return userIds;
  if (type === "category") return allUsers.filter((u) => u.categoryId && categoryIds.includes(u.categoryId)).map((u) => u.id);
  if (type === "subcategory") return allUsers.filter((u) => u.subCategoryId && subCategoryIds.includes(u.subCategoryId)).map((u) => u.id);
  if (type === "region") return allUsers.filter((u) => u.regionId && regionIds.includes(u.regionId)).map((u) => u.id);
  if (type === "state") return allUsers.filter((u) => u.stateId && stateIds.includes(u.stateId)).map((u) => u.id);
  return userIds;
}

const STORAGE_KEY = "palmlearn-assignments";

function generateId(): string {
  return `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function futureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getStored(): Assignment[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Assignment[];
  } catch {
    return [];
  }
}

function setStored(items: Assignment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeAudience(type: TargetAudience["type"], ids: string[] = []): TargetAudience {
  const base = { userIds: [] as string[], categoryIds: [] as string[], subCategoryIds: [] as string[], regionIds: [] as string[], stateIds: [] as string[] };
  if (type === "single" || type === "multiple") base.userIds = ids;
  else if (type === "category") base.categoryIds = ids;
  else if (type === "subcategory") base.subCategoryIds = ids;
  else if (type === "region") base.regionIds = ids;
  else if (type === "state") base.stateIds = ids;
  return { ...base, type };
}

function defaultSchedule(type: "immediate" | "scheduled" = "immediate", startDays = 0, dueDays = 30): AssignmentSchedule {
  return {
    type,
    startDate: type === "scheduled" ? futureDate(startDays) : now(),
    dueDate: futureDate(dueDays),
    expiryDate: futureDate(dueDays + 90),
    timezone: "Africa/Lagos",
  };
}

function defaultNotifications(): AssignmentNotifications {
  return { sendEmail: true, inApp: true, reminderSchedule: "weekly", reminderFrequency: 1 };
}

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "asgn_seed_1",
    name: "New Hire Onboarding - Compliance Training",
    description: "Mandatory compliance training for all new hires in the Lagos office. Covers AML, KYC, and data protection.",
    type: "mandatory",
    priority: "critical",
    courseIds: ["course_1"],
    assignedBy: "user_admin",
    targetAudience: makeAudience("office", ["lagos-main"]),
    schedule: defaultSchedule("immediate", 0, 30),
    notifications: defaultNotifications(),
    status: "active",
    createdAt: pastDate(7),
    updatedAt: pastDate(7),
  },
  {
    id: "asgn_seed_2",
    name: "Product Knowledge Refresh - Q2",
    description: "Quarterly refresher on PalmPay product suite for all customer-facing staff.",
    type: "refresher",
    priority: "medium",
    courseIds: ["course_2"],
    assignedBy: "user_admin",
    targetAudience: makeAudience("category", ["cat_1"]),
    schedule: defaultSchedule("scheduled", 14, 60),
    notifications: { sendEmail: true, inApp: true, reminderSchedule: "weekly", reminderFrequency: 2 },
    status: "active",
    createdAt: pastDate(3),
    updatedAt: pastDate(3),
  },
  {
    id: "asgn_seed_3",
    name: "Leadership Development Path",
    description: "Recommended leadership courses for team leads and managers across all regions.",
    type: "recommended",
    priority: "high",
    courseIds: ["course_3", "course_5"],
    assignedBy: "user_admin",
    targetAudience: makeAudience("region", ["region_1"]),
    schedule: defaultSchedule("scheduled", 7, 90),
    notifications: { sendEmail: true, inApp: true, reminderSchedule: "weekly", reminderFrequency: 1 },
    status: "active",
    createdAt: pastDate(14),
    updatedAt: pastDate(14),
  },
  {
    id: "asgn_seed_4",
    name: "Technical Training - Engineering Team",
    description: "Advanced technical training for the engineering team. Optional but recommended.",
    type: "optional",
    priority: "medium",
    courseIds: ["course_4"],
    assignedBy: "user_admin",
    targetAudience: makeAudience("multiple", ["user_learner_1", "user_learner_2"]),
    schedule: defaultSchedule("immediate", 0, 45),
    notifications: { sendEmail: false, inApp: true, reminderSchedule: "none", reminderFrequency: 0 },
    status: "active",
    createdAt: pastDate(5),
    updatedAt: pastDate(5),
  },
  {
    id: "asgn_seed_5",
    name: "Fraud Prevention Training Draft",
    description: "Advanced fraud detection and prevention training (still in draft).",
    type: "mandatory",
    priority: "critical",
    courseIds: ["course_6"],
    assignedBy: "user_admin",
    targetAudience: makeAudience("organization"),
    schedule: defaultSchedule("scheduled", 30, 60),
    notifications: defaultNotifications(),
    status: "draft",
    createdAt: pastDate(1),
    updatedAt: pastDate(1),
  },
];

export function seedAssignments(): void {
  if (typeof window === "undefined") return;
  const existing = getStored();
  if (existing.length === 0) {
    setStored(SEED_ASSIGNMENTS);
  }
}

export function getAssignments(): Assignment[] {
  return getStored();
}

export function getAssignment(id: string): Assignment | undefined {
  return getStored().find((a) => a.id === id);
}

export function createAssignment(data: Omit<Assignment, "id" | "createdAt" | "updatedAt">): Assignment {
  const isActive = data.status === "active";
  const assignment: Assignment = {
    ...data,
    id: generateId(),
    publishedAt: isActive ? now() : undefined,
    publishedBy: isActive ? data.assignedBy : undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  const list = getStored();
  list.push(assignment);
  setStored(list);
  return assignment;
}

export function updateAssignment(id: string, data: Partial<Assignment>): Assignment | undefined {
  const list = getStored();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  const wasDraft = list[idx].status !== "active";
  const becomingActive = data.status === "active";
  list[idx] = {
    ...list[idx],
    ...data,
    publishedAt: becomingActive && wasDraft ? (data.publishedAt || now()) : list[idx].publishedAt,
    publishedBy: becomingActive && wasDraft ? (data.publishedBy || list[idx].assignedBy) : list[idx].publishedBy,
    updatedAt: now(),
  };
  setStored(list);
  return list[idx];
}

export function deleteAssignment(id: string): boolean {
  const list = getStored();
  const filtered = list.filter((a) => a.id !== id);
  if (filtered.length === list.length) return false;
  setStored(filtered);
  return true;
}

export function filterAssignments(opts: { search?: string; status?: AssignmentStatus; type?: AssignmentType; priority?: AssignmentPriority; assignedBy?: string; page?: number; pageSize?: number }): { items: Assignment[]; total: number } {
  let items = getStored();
  if (opts.search) {
    const q = opts.search.toLowerCase();
    items = items.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }
  if (opts.status) items = items.filter((a) => a.status === opts.status);
  if (opts.type) items = items.filter((a) => a.type === opts.type);
  if (opts.priority) items = items.filter((a) => a.priority === opts.priority);
  if (opts.assignedBy) items = items.filter((a) => a.assignedBy === opts.assignedBy);
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total };
}

export function publishAssignment(id: string, userId: string): Assignment | undefined {
  const list = getStored();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  list[idx] = {
    ...list[idx],
    status: "active" as AssignmentStatus,
    publishedAt: list[idx].publishedAt || now(),
    publishedBy: list[idx].publishedBy || userId,
    updatedAt: now(),
  };
  setStored(list);
  const assignment = list[idx];
  if (assignment.targetAudience) {
    const learnerIds = resolveAssignmentAudience(assignment.targetAudience);
    const courseIds = assignment.courseIds || [];
    if (learnerIds.length > 0) {
      bulkCreateFromAssignment(assignment.id, learnerIds, courseIds);
      notifyAssignmentUnlocked(assignment, learnerIds);
    }
  }
  return assignment;
}

export function duplicateAssignment(id: string): Assignment | undefined {
  const list = getStored();
  const source = list.find((a) => a.id === id);
  if (!source) return undefined;
  const copy: Assignment = {
    ...source,
    id: generateId(),
    name: `${source.name} (Copy)`,
    status: "draft",
    publishedAt: undefined,
    publishedBy: undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  list.push(copy);
  setStored(list);
  return copy;
}

export function bulkActionAssignment(ids: string[], action: "delete" | "activate" | "draft" | "complete" | "cancel"): number {
  const list = getStored();
  let count = 0;
  const updated = list.map((a) => {
    if (ids.includes(a.id)) {
      count++;
      if (action === "delete") return null;
      if (action === "activate") return { ...a, status: "active" as AssignmentStatus, publishedAt: a.publishedAt || now(), updatedAt: now() };
      if (action === "draft") return { ...a, status: "draft" as AssignmentStatus, updatedAt: now() };
      if (action === "complete") return { ...a, status: "completed" as AssignmentStatus, updatedAt: now() };
      if (action === "cancel") return { ...a, status: "cancelled" as AssignmentStatus, updatedAt: now() };
    }
    return a;
  }).filter(Boolean) as Assignment[];
  setStored(updated);
  return count;
}
