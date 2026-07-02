import type { Resource, ResourceType } from "@/types";

const RESOURCES_KEY = "palmlearn-resources";
const SEEDED_KEY = "palmlearn-resources-seeded";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getStore(): Resource[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RESOURCES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Resource[];
  } catch {
    return [];
  }
}

function setStore(data: Resource[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(data));
}

const seedResources: Resource[] = [
  { id: generateId(), name: "Employee Handbook 2026", type: "pdf", url: "#", size: "2.4 MB", description: "Complete employee handbook covering policies and procedures.", tags: ["handbook", "policies"], uploadedBy: "admin", createdAt: new Date(Date.now() - 86400000 * 45).toISOString() },
  { id: generateId(), name: "Onboarding Video", type: "video", url: "#", size: "156 MB", description: "Welcome video for new employees joining the organization.", tags: ["onboarding", "video"], uploadedBy: "admin", createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  { id: generateId(), name: "Leadership Workshop Slides", type: "ppt", url: "#", size: "8.1 MB", description: "Presentation slides from the advanced leadership workshop.", tags: ["leadership", "workshop"], uploadedBy: "trainer1", createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: generateId(), name: "Data Science Cheat Sheet", type: "pdf", url: "#", size: "1.2 MB", description: "Quick reference guide for data science concepts and commands.", tags: ["data-science", "reference"], uploadedBy: "trainer2", createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: generateId(), name: "Company Logo Pack", type: "image", url: "#", size: "4.5 MB", description: "Official company logos in various formats and resolutions.", tags: ["branding", "logos"], uploadedBy: "admin", createdAt: new Date(Date.now() - 86400000 * 90).toISOString() },
  { id: generateId(), name: "Training Templates", type: "template", url: "#", size: "3.2 MB", description: "Ready-to-use templates for creating training materials.", tags: ["templates", "training"], uploadedBy: "admin", createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: generateId(), name: "Software Installation Guide", type: "doc", url: "#", size: "0.8 MB", description: "Step-by-step guide for installing required software.", tags: ["installation", "guide"], uploadedBy: "trainer1", createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: generateId(), name: "Course Assets Bundle", type: "zip", url: "#", size: "45 MB", description: "Compressed bundle of all course-related assets and resources.", tags: ["assets", "bundle"], uploadedBy: "admin", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: generateId(), name: "External API Reference", type: "link", url: "https://example.com/api-docs", size: "—", description: "Link to external API documentation for integrations.", tags: ["api", "reference", "external"], uploadedBy: "trainer2", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: generateId(), name: "Infographic: Learning Paths", type: "image", url: "#", size: "2.1 MB", description: "Visual infographic showing recommended learning paths.", tags: ["infographic", "learning-paths"], uploadedBy: "admin", createdAt: new Date(Date.now() - 86400000 * 25).toISOString() },
];

export function getResources(): Resource[] {
  ensureSeeded();
  return getStore();
}

export function getResourceById(id: string): Resource | null {
  return getStore().find((r) => r.id === id) ?? null;
}

export function createResource(data: Omit<Resource, "id" | "createdAt">): Resource {
  const resources = getStore();
  const resource: Resource = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  resources.push(resource);
  setStore(resources);
  return resource;
}

export function deleteResource(id: string): boolean {
  const resources = getStore();
  const filtered = resources.filter((r) => r.id !== id);
  if (filtered.length === resources.length) return false;
  setStore(filtered);
  return true;
}

export function getResourcesByType(type: ResourceType): Resource[] {
  return getStore().filter((r) => r.type === type);
}

export function searchResources(query: string): Resource[] {
  const q = query.toLowerCase();
  return getStore().filter((r) =>
    r.name.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function ensureSeeded(): void {
  if (typeof window === "undefined") return;
  const seeded = localStorage.getItem(SEEDED_KEY);
  if (seeded) return;
  const existing = getStore();
  if (existing.length === 0) {
    setStore(seedResources);
  }
  localStorage.setItem(SEEDED_KEY, "1");
}
