import type { Programme, ProgrammeStatus, TargetAudience } from "@/types";
import { getCourseIdByTitle, ensureCoursesSeeded, getCourses } from "./courses";
import { getAssignments } from "./assignments";
import { getAssignmentsForProgramme, createLearnerAssignment, getLearnerAssignments } from "./learner-assignments";
import { getAllUsers } from "./auth";
import {
  notifyTrainingProgrammeAssigned,
  notifyTrainingProgrammeUpdated,
  notifyProgrammeCompleted,
  notifyCourseAssigned,
  notifyLearnerCompletedProgramme,
  notifyAdminSummary,
} from "./mock-notifications";

const STORAGE_KEY = "palmlearn-campaigns";

function generateId(): string {
  return `camp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function pastDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getStored(): Programme[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Programme[];
    return list.map((p) => ({
      ...p,
      courseIds: Array.isArray(p.courseIds) ? p.courseIds : [],
      assignmentIds: Array.isArray(p.assignmentIds) ? p.assignmentIds : [],
      assignedBy: p.assignedBy || "",
      createdBy: p.createdBy || "",
    }));
  } catch {
    return [];
  }
}

function setStored(items: Programme[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getSeedProgrammes(): Programme[] {
  ensureCoursesSeeded();
  return [
    {
      id: "camp_seed_1",
      name: "Q2 2026 Compliance Blitz",
      description: "A comprehensive compliance programme covering AML, KYC, and data protection for all staff. Completes by end of Q2.",
      courseIds: [getCourseIdByTitle("Advanced Financial Analytics"), getCourseIdByTitle("Effective Communication Skills")].filter(Boolean) as string[],
      assignmentIds: [],
      targetAudience: { type: "organization", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] },
      assignedBy: "admin_001",
      publishedAt: pastDate(14),
      publishedBy: "admin_001",
      status: "active",
      createdAt: pastDate(14),
      updatedAt: pastDate(14),
    },
    {
      id: "camp_seed_2",
      name: "New Manager Accelerator",
      description: "Fast-track programme for newly promoted team leads and managers. Covers leadership, product knowledge, and team management.",
      courseIds: [getCourseIdByTitle("Digital Transformation Leadership"), getCourseIdByTitle("Python for Data Science")].filter(Boolean) as string[],
      assignmentIds: [],
      targetAudience: { type: "organization", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] },
      assignedBy: "admin_001",
      publishedAt: pastDate(30),
      publishedBy: "admin_001",
      status: "active",
      createdAt: pastDate(30),
      updatedAt: pastDate(7),
    },
    {
      id: "camp_seed_3",
      name: "Engineering Excellence Program",
      description: "Advanced technical training path for the engineering organization. Currently in draft planning.",
      courseIds: [getCourseIdByTitle("Cybersecurity Fundamentals"), getCourseIdByTitle("Machine Learning Engineering")].filter(Boolean) as string[],
      assignmentIds: [],
      targetAudience: { type: "organization", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] },
      assignedBy: "admin_001",
      status: "draft",
      createdAt: pastDate(2),
      updatedAt: pastDate(2),
    },
  ];
}

export function bulkCreateForProgramme(programmeId: string): void {
  const programme = getProgramme(programmeId);
  if (!programme || programme.status !== "active") return;
  const learnerIds = getProgrammeLearnerIds(programme);
  if (learnerIds.length === 0) return;
  const existing = getLearnerAssignments();
  const created: { learnerId: string; courseId: string }[] = [];
  for (const learnerId of learnerIds) {
    for (const courseId of programme.courseIds) {
      const already = existing.find(
        (la) => la.learnerId === learnerId && la.courseId === courseId && la.campaignId === programmeId
      );
      if (already) continue;
      createLearnerAssignment({
        assignmentId: "",
        campaignId: programmeId,
        learnerId,
        courseId,
        progress: 0,
        status: "not_started",
        timeSpent: 0,
      });
      created.push({ learnerId, courseId });
    }
  }
  if (created.length > 0) {
    notifyTrainingProgrammeAssigned(programme, learnerIds);
  }
}

export function seedProgrammes(): void {
  if (typeof window === "undefined") return;
  const existing = getStored();
  if (existing.length === 0) {
    setStored(getSeedProgrammes());
  }
}

export function getProgrammes(): Programme[] {
  return getStored();
}

export function getProgramme(id: string): Programme | undefined {
  return getStored().find((c) => c.id === id);
}

export function createProgramme(data: Omit<Programme, "id" | "createdAt" | "updatedAt">): Programme {
  const isActive = data.status === "active";
  const programme: Programme = {
    ...data,
    id: generateId(),
    createdBy: data.createdBy || data.assignedBy,
    publishedAt: isActive ? now() : undefined,
    publishedBy: isActive ? data.assignedBy : undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  const list = getStored();
  list.push(programme);
  setStored(list);
  if (isActive) {
    bulkCreateForProgramme(programme.id);
    const learnerIds = getProgrammeLearnerIds(programme);
    if (programme.courseIds.length >= 5 || learnerIds.length >= 50) {
      const adminIds = getAllUsers().filter((u) => u.role === "admin").map((u) => u.id);
      for (const adminId of adminIds) {
        notifyAdminSummary(
          adminId,
          "Large Programme Published",
          `'${programme.name}' has been published with ${programme.courseIds.length} courses targeting ${learnerIds.length} learners.`,
          "/admin/programmes"
        );
      }
    }
  }
  return programme;
}

export function updateProgramme(id: string, data: Partial<Programme>): Programme | undefined {
  const list = getStored();
  const idx = list.findIndex((c) => c.id === id);
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

export function updatePublishedProgramme(id: string, data: Partial<Programme>): Programme | undefined {
  const list = getStored();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const old = list[idx];
  list[idx] = { ...old, ...data, updatedAt: now() };
  setStored(list);
  const programme = list[idx];
  if (old.status === "active") {
    const learnerIds = getProgrammeLearnerIds(programme);
    if (learnerIds.length > 0) {
      const existing = getLearnerAssignments();
      if (data.courseIds) {
        const newCourses = data.courseIds.filter((cid) => !old.courseIds.includes(cid));
        for (const learnerId of learnerIds) {
          for (const courseId of newCourses) {
            const already = existing.find(
              (la) => la.learnerId === learnerId && la.courseId === courseId && la.campaignId === programme.id
            );
            if (already) continue;
            createLearnerAssignment({
              assignmentId: "",
              campaignId: programme.id,
              learnerId,
              courseId,
              progress: 0,
              status: "not_started",
              timeSpent: 0,
            });
          }
        }
      }
      if (data.courseIds) {
        const newCourses = data.courseIds.filter((cid) => !old.courseIds.includes(cid));
        const allCourses = getCourses();
        for (const courseId of newCourses) {
          const course = allCourses.find((c) => c.id === courseId);
          if (course) {
            notifyCourseAssigned(course.title, courseId, learnerIds);
          }
        }
      }
      notifyTrainingProgrammeUpdated(programme, learnerIds);
    }
  }
  return programme;
}

export function deleteProgramme(id: string): boolean {
  const list = getStored();
  const filtered = list.filter((c) => c.id !== id);
  if (filtered.length === list.length) return false;
  setStored(filtered);
  return true;
}

export function publishProgramme(id: string, userId: string): Programme | undefined {
  const list = getStored();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  list[idx] = {
    ...list[idx],
    status: "active",
    publishedAt: list[idx].publishedAt || now(),
    publishedBy: list[idx].publishedBy || userId,
    updatedAt: now(),
  };
  setStored(list);
  bulkCreateForProgramme(list[idx].id);
  const programme = list[idx];
  const learnerIds = getProgrammeLearnerIds(programme);
  if (programme.courseIds.length >= 5 || learnerIds.length >= 50) {
    const adminIds = getAllUsers().filter((u) => u.role === "admin").map((u) => u.id);
    for (const adminId of adminIds) {
      notifyAdminSummary(
        adminId,
        "Large Programme Published",
        `'${programme.name}' has been published with ${programme.courseIds.length} courses targeting ${learnerIds.length} learners.`,
        "/admin/programmes"
      );
    }
  }
  return programme;
}

export function duplicateProgramme(id: string): Programme | undefined {
  const list = getStored();
  const source = list.find((c) => c.id === id);
  if (!source) return undefined;
  const copy: Programme = {
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

export function filterProgrammes(opts: {
  search?: string;
  status?: ProgrammeStatus;
  categoryId?: string;
  assignedBy?: string;
  page?: number;
  pageSize?: number;
}): { items: Programme[]; total: number } {
  let items = getStored();
  if (opts.search) {
    const q = opts.search.toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  if (opts.status) items = items.filter((c) => c.status === opts.status);
  if (opts.categoryId) items = items.filter((c) => c.categoryId === opts.categoryId);
  if (opts.assignedBy) items = items.filter((c) => c.assignedBy === opts.assignedBy);
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total };
}

export function getProgrammeLearnerIds(programme: Programme): string[] {
  if (programme.targetAudience) {
    const allUsers = getAllUsers();
    const { type, userIds, categoryIds, subCategoryIds, regionIds, stateIds } = programme.targetAudience;
    if (type === "organization") return allUsers.filter((u) => u.role !== "admin").map((u) => u.id);
    if (type === "multiple" || type === "single") return userIds;
    if (type === "category") return allUsers.filter((u) => u.categoryId && categoryIds.includes(u.categoryId)).map((u) => u.id);
    if (type === "subcategory") return allUsers.filter((u) => u.subCategoryId && subCategoryIds.includes(u.subCategoryId)).map((u) => u.id);
    if (type === "region") return allUsers.filter((u) => u.regionId && regionIds.includes(u.regionId)).map((u) => u.id);
    if (type === "state") return allUsers.filter((u) => u.stateId && stateIds.includes(u.stateId)).map((u) => u.id);
    return userIds;
  }
  return [];
}

export function getProgrammeProgress(learnerId: string, programme: Programme): {
  progress: number;
  completedCourses: number;
  totalCourses: number;
  completedAssignments: number;
  totalAssignments: number;
} {
  const records = getAssignmentsForProgramme(programme.id).filter((la) => la.learnerId === learnerId);
  const completedCourses = records.filter((r) => r.status === "completed").length;
  const totalCourses = programme.courseIds.length;
  const completedAssignments = assignmentIdsForProgramme(programme).filter((asgnId) =>
    records.some((r) => r.assignmentId === asgnId && r.status === "completed")
  ).length;
  const totalAssignments = assignmentIdsForProgramme(programme).length;
  const totalItems = totalCourses + totalAssignments;
  const completedItems = completedCourses + completedAssignments;
  return {
    progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
    completedCourses,
    totalCourses,
    completedAssignments,
    totalAssignments,
  };
}

export function assignmentIdsForProgramme(programme: Programme): string[] {
  const linked = getAssignments().filter((a) => a.campaignId === programme.id).map((a) => a.id);
  const all = [...new Set([...programme.assignmentIds, ...linked])];
  return all;
}

export function isProgrammeComplete(learnerId: string, programme: Programme): boolean {
  if (programme.courseIds.length === 0 && assignmentIdsForProgramme(programme).length === 0) return false;
  const progress = getProgrammeProgress(learnerId, programme);
  return progress.progress >= 100;
}

export function markProgrammeCompleted(learnerId: string, programmeId: string): Programme | undefined {
  const list = getStored();
  const idx = list.findIndex((p) => p.id === programmeId);
  if (idx === -1) return undefined;
  if (list[idx].completedAt) return list[idx];
  list[idx] = {
    ...list[idx],
    status: "completed",
    completedAt: now(),
    updatedAt: now(),
  };
  setStored(list);
  const programme = list[idx];
  notifyProgrammeCompleted(programme.name, programmeId, learnerId);
  const trainerIds = getAllUsers().filter((u) => u.role === "trainer").map((u) => u.id);
  if (trainerIds.length > 0) {
    const learnerName = getAllUsers().find((u) => u.id === learnerId)?.name || learnerId;
    notifyLearnerCompletedProgramme(trainerIds, learnerName, programme.name);
  }
  return programme;
}

export function checkAndMarkProgrammeCompletion(learnerId: string, programmeId: string): void {
  const programme = getProgramme(programmeId);
  if (!programme || programme.status !== "active") return;
  if (isProgrammeComplete(learnerId, programme)) {
    markProgrammeCompleted(learnerId, programmeId);
  }
}
