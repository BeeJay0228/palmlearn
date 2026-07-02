import type { Campaign, CampaignStatus, TargetAudience } from "@/types";
import { getCourseIdByTitle, ensureCoursesSeeded } from "./courses";
import { getAssignments } from "./assignments";
import { getAssignmentsForCampaign, createLearnerAssignment, getLearnerAssignments } from "./learner-assignments";
import { getAllUsers } from "./auth";

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

function getStored(): Campaign[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Campaign[];
  } catch {
    return [];
  }
}

function setStored(items: Campaign[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getSeedCampaigns(): Campaign[] {
  ensureCoursesSeeded();
  return [
    {
      id: "camp_seed_1",
      name: "Q2 2026 Compliance Blitz",
      description: "A comprehensive compliance campaign covering AML, KYC, and data protection for all staff. Completes by end of Q2.",
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
      description: "Fast-track program for newly promoted team leads and managers. Covers leadership, product knowledge, and team management.",
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

export function bulkCreateForCampaign(campaignId: string): void {
  const campaign = getCampaign(campaignId);
  if (!campaign || campaign.status !== "active") return;
  const learnerIds = getCampaignLearnerIds(campaign);
  if (learnerIds.length === 0) return;
  const existing = getLearnerAssignments();
  const created: { learnerId: string; courseId: string }[] = [];
  for (const learnerId of learnerIds) {
    for (const courseId of campaign.courseIds) {
      const already = existing.find(
        (la) => la.learnerId === learnerId && la.courseId === courseId && la.campaignId === campaignId
      );
      if (already) continue;
      createLearnerAssignment({
        assignmentId: "",
        campaignId,
        learnerId,
        courseId,
        progress: 0,
        status: "not_started",
        timeSpent: 0,
      });
      created.push({ learnerId, courseId });
    }
  }
}

export function seedCampaigns(): void {
  if (typeof window === "undefined") return;
  const existing = getStored();
  if (existing.length === 0) {
    setStored(getSeedCampaigns());
  }
}

export function getCampaigns(): Campaign[] {
  return getStored();
}

export function getCampaign(id: string): Campaign | undefined {
  return getStored().find((c) => c.id === id);
}

export function createCampaign(data: Omit<Campaign, "id" | "createdAt" | "updatedAt">): Campaign {
  const isActive = data.status === "active";
  const campaign: Campaign = {
    ...data,
    id: generateId(),
    publishedAt: isActive ? now() : undefined,
    publishedBy: isActive ? data.assignedBy : undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  const list = getStored();
  list.push(campaign);
  setStored(list);
  if (isActive) {
    bulkCreateForCampaign(campaign.id);
  }
  return campaign;
}

export function updateCampaign(id: string, data: Partial<Campaign>): Campaign | undefined {
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

export function deleteCampaign(id: string): boolean {
  const list = getStored();
  const filtered = list.filter((c) => c.id !== id);
  if (filtered.length === list.length) return false;
  setStored(filtered);
  return true;
}

export function publishCampaign(id: string, userId: string): Campaign | undefined {
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
  bulkCreateForCampaign(list[idx].id);
  return list[idx];
}

export function duplicateCampaign(id: string): Campaign | undefined {
  const list = getStored();
  const source = list.find((c) => c.id === id);
  if (!source) return undefined;
  const copy: Campaign = {
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

export function filterCampaigns(opts: {
  search?: string;
  status?: CampaignStatus;
  categoryId?: string;
  assignedBy?: string;
  page?: number;
  pageSize?: number;
}): { items: Campaign[]; total: number } {
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

export function getCampaignLearnerIds(campaign: Campaign): string[] {
  if (campaign.targetAudience) {
    const allUsers = getAllUsers();
    const { type, userIds, categoryIds, subCategoryIds, regionIds, stateIds } = campaign.targetAudience;
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

export function getCampaignProgress(learnerId: string, campaign: Campaign): {
  progress: number;
  completedCourses: number;
  totalCourses: number;
  completedAssignments: number;
  totalAssignments: number;
} {
  const records = getAssignmentsForCampaign(campaign.id).filter((la) => la.learnerId === learnerId);
  const completedCourses = records.filter((r) => r.status === "completed").length;
  const totalCourses = campaign.courseIds.length;
  const completedAssignments = assignmentIdsForCampaign(campaign).filter((asgnId) =>
    records.some((r) => r.assignmentId === asgnId && r.status === "completed")
  ).length;
  const totalAssignments = assignmentIdsForCampaign(campaign).length;
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

export function assignmentIdsForCampaign(campaign: Campaign): string[] {
  const linked = getAssignments().filter((a) => a.campaignId === campaign.id).map((a) => a.id);
  const all = [...new Set([...campaign.assignmentIds, ...linked])];
  return all;
}
