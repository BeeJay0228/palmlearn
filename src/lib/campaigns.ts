import type { Campaign, CampaignStatus } from "@/types";
import { getCourseIdByTitle, ensureCoursesSeeded } from "./courses";

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
      status: "active",
      createdAt: pastDate(14),
      updatedAt: pastDate(14),
    },
    {
      id: "camp_seed_2",
      name: "New Manager Accelerator",
      description: "Fast-track program for newly promoted team leads and managers. Covers leadership, product knowledge, and team management.",
      courseIds: [getCourseIdByTitle("Digital Transformation Leadership"), getCourseIdByTitle("Python for Data Science")].filter(Boolean) as string[],
      status: "active",
      createdAt: pastDate(30),
      updatedAt: pastDate(7),
    },
    {
      id: "camp_seed_3",
      name: "Engineering Excellence Program",
      description: "Advanced technical training path for the engineering organization. Currently in draft planning.",
      courseIds: [getCourseIdByTitle("Cybersecurity Fundamentals"), getCourseIdByTitle("Machine Learning Engineering")].filter(Boolean) as string[],
      status: "draft",
      createdAt: pastDate(2),
      updatedAt: pastDate(2),
    },
  ];
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
  const campaign: Campaign = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const list = getStored();
  list.push(campaign);
  setStored(list);
  return campaign;
}

export function updateCampaign(id: string, data: Partial<Campaign>): Campaign | undefined {
  const list = getStored();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...data, updatedAt: now() };
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

export function filterCampaigns(opts: { search?: string; status?: CampaignStatus; page?: number; pageSize?: number }): { items: Campaign[]; total: number } {
  let items = getStored();
  if (opts.search) {
    const q = opts.search.toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  if (opts.status) items = items.filter((c) => c.status === opts.status);
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 10;
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total };
}
