import type { VersionEntry } from "@/types";

const VERSIONS_KEY = "palmlearn-course-versions";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getStore(): VersionEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(VERSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as VersionEntry[];
  } catch {
    return [];
  }
}

function setStore(data: VersionEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(data));
}

export function getVersions(courseId: string): VersionEntry[] {
  return getStore()
    .filter((v) => v.courseId === courseId)
    .sort((a, b) => b.version - a.version);
}

export function createVersion(courseId: string, data: string, createdBy: string, note: string): VersionEntry {
  const versions = getStore();
  const existing = versions.filter((v) => v.courseId === courseId);
  const nextVersion = existing.length > 0 ? Math.max(...existing.map((v) => v.version)) + 1 : 1;
  const entry: VersionEntry = {
    id: generateId(),
    version: nextVersion,
    courseId,
    data,
    createdAt: new Date().toISOString(),
    createdBy,
    note,
  };
  versions.push(entry);
  setStore(versions);
  return entry;
}

export function getLatestVersion(courseId: string): VersionEntry | null {
  const versions = getVersions(courseId);
  return versions[0] ?? null;
}

export function getVersionCount(courseId: string): number {
  return getVersions(courseId).length;
}
