import type { Course, Module, Lesson, CourseStatus } from "@/types";

const COURSES_KEY = "palmlearn-courses";
const SEEDED_KEY = "palmlearn-courses-seeded";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getStore(): Course[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(COURSES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Course[];
  } catch {
    return [];
  }
}

function setStore(data: Course[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COURSES_KEY, JSON.stringify(data));
}

function seedIfEmpty(): void {
  const existing = getStore();
  if (existing.length > 0) return;

  const courses: Course[] = [
    {
      id: generateId(),
      title: "Advanced Financial Analytics",
      subtitle: "Master data-driven financial decision making",
      description: "Learn to analyze complex financial data using modern tools and techniques. This course covers predictive modeling, risk assessment, and portfolio optimization.",
      thumbnail: "",
      banner: "",
      instructor: "Dr. Sarah Chen",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 240,
      difficulty: "advanced",
      language: "English",
      status: "published",
      modules: [],
      resources: [],
      tags: ["finance", "analytics", "advanced"],
      version: 1,
      createdBy: "admin",
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      analytics: { views: 1248, assignedLearners: 320, completionRate: 78, averageScore: 85 },
    },
    {
      id: generateId(),
      title: "Digital Transformation Leadership",
      subtitle: "Lead organizational change in the digital age",
      description: "Equip yourself with strategies to drive digital transformation initiatives. Explore change management, agile methodologies, and innovation frameworks.",
      thumbnail: "",
      banner: "",
      instructor: "Prof. James Wilson",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 180,
      difficulty: "intermediate",
      language: "English",
      status: "published",
      modules: [],
      resources: [],
      tags: ["leadership", "digital", "transformation"],
      version: 2,
      createdBy: "admin",
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      analytics: { views: 892, assignedLearners: 210, completionRate: 82, averageScore: 88 },
    },
    {
      id: generateId(),
      title: "Python for Data Science",
      subtitle: "From zero to data-ready with Python",
      description: "A comprehensive introduction to Python programming for data analysis. Covers pandas, numpy, matplotlib, and scikit-learn with real-world projects.",
      thumbnail: "",
      banner: "",
      instructor: "Dr. Emily Roberts",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 360,
      difficulty: "beginner",
      language: "English",
      status: "published",
      modules: [],
      resources: [],
      tags: ["python", "data-science", "programming"],
      version: 3,
      createdBy: "trainer",
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      analytics: { views: 2456, assignedLearners: 580, completionRate: 65, averageScore: 79 },
    },
    {
      id: generateId(),
      title: "Cybersecurity Fundamentals",
      subtitle: "Protect your organization from modern threats",
      description: "Understand core cybersecurity concepts including network security, encryption, threat detection, and incident response. Prepare for industry certifications.",
      thumbnail: "",
      banner: "",
      instructor: "Alex Thompson",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 300,
      difficulty: "intermediate",
      language: "English",
      status: "review",
      modules: [],
      resources: [],
      tags: ["security", "cybersecurity", "fundamentals"],
      version: 1,
      createdBy: "trainer",
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      analytics: { views: 156, assignedLearners: 45, completionRate: 0, averageScore: 0 },
    },
    {
      id: generateId(),
      title: "Machine Learning Engineering",
      subtitle: "Build and deploy ML models at scale",
      description: "Deep dive into ML engineering including model deployment, MLOps, pipeline automation, and production monitoring. Hands-on with cloud platforms.",
      thumbnail: "",
      banner: "",
      instructor: "Dr. Sarah Chen",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 480,
      difficulty: "advanced",
      language: "English",
      status: "draft",
      modules: [],
      resources: [],
      tags: ["machine-learning", "engineering", "mlops"],
      version: 0,
      createdBy: "admin",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      analytics: { views: 0, assignedLearners: 0, completionRate: 0, averageScore: 0 },
    },
    {
      id: generateId(),
      title: "Effective Communication Skills",
      subtitle: "Master workplace communication",
      description: "Develop essential communication skills for the modern workplace. Covering presentations, writing, negotiation, and cross-cultural communication.",
      thumbnail: "",
      banner: "",
      instructor: "Prof. James Wilson",
      categoryId: "",
      subCategoryId: "",
      estimatedDuration: 120,
      difficulty: "beginner",
      language: "English",
      status: "archived",
      modules: [],
      resources: [],
      tags: ["communication", "soft-skills"],
      version: 4,
      createdBy: "admin",
      createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      analytics: { views: 3456, assignedLearners: 890, completionRate: 91, averageScore: 92 },
    },
  ];

  setStore(courses);
}

export function getCourses(): Course[] {
  ensureCoursesSeeded();
  return getStore();
}

export function getCourseById(id: string): Course | null {
  return getStore().find((c) => c.id === id) ?? null;
}

export function getCourseIdByTitle(title: string): string | undefined {
  return getStore().find((c) => c.title === title)?.id;
}

export function createCourse(data: Partial<Course>): Course {
  const courses = getStore();
  const now = new Date().toISOString();
  const course: Course = {
    id: generateId(),
    title: data.title || "",
    subtitle: data.subtitle || "",
    description: data.description || "",
    thumbnail: data.thumbnail || "",
    banner: data.banner || "",
    instructor: data.instructor || "",
    categoryId: data.categoryId || "",
    subCategoryId: data.subCategoryId || "",
    estimatedDuration: data.estimatedDuration || 0,
    difficulty: data.difficulty || "beginner",
    language: data.language || "English",
    status: data.status || "draft",
    modules: data.modules || [],
    resources: data.resources || [],
    tags: data.tags || [],
    version: 0,
    createdBy: data.createdBy || "",
    createdAt: now,
    updatedAt: now,
    analytics: { views: 0, assignedLearners: 0, completionRate: 0, averageScore: 0 },
  };
  courses.push(course);
  setStore(courses);
  return course;
}

export function updateCourse(id: string, data: Partial<Course>): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  courses[idx] = { ...courses[idx], ...data, updatedAt: new Date().toISOString() };
  setStore(courses);
  return courses[idx];
}

export function deleteCourse(id: string): boolean {
  const courses = getStore();
  const filtered = courses.filter((c) => c.id !== id);
  if (filtered.length === courses.length) return false;
  setStore(filtered);
  return true;
}

export function duplicateCourse(id: string): Course | null {
  const courses = getStore();
  const original = courses.find((c) => c.id === id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy: Course = {
    ...original,
    id: generateId(),
    title: `${original.title} (Copy)`,
    status: "draft",
    version: 0,
    createdAt: now,
    updatedAt: now,
    analytics: { views: 0, assignedLearners: 0, completionRate: 0, averageScore: 0 },
  };
  courses.push(copy);
  setStore(courses);
  return copy;
}

export function updateCourseStatus(id: string, status: CourseStatus): Course | null {
  return updateCourse(id, { status });
}

export function addModule(courseId: string, module: Omit<Module, "id">): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const newModule: Module = { ...module, id: generateId() };
  courses[idx].modules.push(newModule);
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function updateModule(courseId: string, moduleId: string, data: Partial<Module>): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const mIdx = courses[idx].modules.findIndex((m) => m.id === moduleId);
  if (mIdx === -1) return null;
  courses[idx].modules[mIdx] = { ...courses[idx].modules[mIdx], ...data };
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function deleteModule(courseId: string, moduleId: string): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  courses[idx].modules = courses[idx].modules.filter((m) => m.id !== moduleId);
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function reorderModules(courseId: string, moduleIds: string[]): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const map = new Map(courses[idx].modules.map((m) => [m.id, m]));
  courses[idx].modules = moduleIds.map((id, i) => ({ ...map.get(id)!, order: i }));
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function addLesson(courseId: string, moduleId: string, lesson: Omit<Lesson, "id">): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const mIdx = courses[idx].modules.findIndex((m) => m.id === moduleId);
  if (mIdx === -1) return null;
  const newLesson: Lesson = { ...lesson, id: generateId() };
  courses[idx].modules[mIdx].lessons.push(newLesson);
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function updateLesson(courseId: string, moduleId: string, lessonId: string, data: Partial<Lesson>): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const mIdx = courses[idx].modules.findIndex((m) => m.id === moduleId);
  if (mIdx === -1) return null;
  const lIdx = courses[idx].modules[mIdx].lessons.findIndex((l) => l.id === lessonId);
  if (lIdx === -1) return null;
  courses[idx].modules[mIdx].lessons[lIdx] = { ...courses[idx].modules[mIdx].lessons[lIdx], ...data };
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function deleteLesson(courseId: string, moduleId: string, lessonId: string): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const mIdx = courses[idx].modules.findIndex((m) => m.id === moduleId);
  if (mIdx === -1) return null;
  courses[idx].modules[mIdx].lessons = courses[idx].modules[mIdx].lessons.filter((l) => l.id !== lessonId);
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function reorderLessons(courseId: string, moduleId: string, lessonIds: string[]): Course | null {
  const courses = getStore();
  const idx = courses.findIndex((c) => c.id === courseId);
  if (idx === -1) return null;
  const mIdx = courses[idx].modules.findIndex((m) => m.id === moduleId);
  if (mIdx === -1) return null;
  const map = new Map(courses[idx].modules[mIdx].lessons.map((l) => [l.id, l]));
  courses[idx].modules[mIdx].lessons = lessonIds.map((id, i) => ({ ...map.get(id)!, order: i }));
  courses[idx].updatedAt = new Date().toISOString();
  setStore(courses);
  return courses[idx];
}

export function ensureCoursesSeeded(): void {
  if (typeof window === "undefined") return;
  const seeded = localStorage.getItem(SEEDED_KEY);
  if (seeded) return;
  seedIfEmpty();
  localStorage.setItem(SEEDED_KEY, "1");
}


