export interface EnrollmentData {
  id: string;
  learnerId: string;
  courseId: string;
  campaignId?: string | null;
  progress: number;
  status: string;
  assignedDate: string;
  firstOpened?: string | null;
  lastActivity?: string | null;
  completedDate?: string | null;
  timeSpent: number;
  currentModuleId?: string | null;
  currentLessonId?: string | null;
  currentLessonProgress?: number | null;
}

export interface LessonProgressData {
  id: string;
  learnerId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  progress: number;
  timeSpent: number;
}

export interface ResumeItem {
  id: string;
  courseId: string;
  campaignId?: string | null;
  progress: number;
  status: string;
  currentModuleId?: string | null;
  currentLessonId?: string | null;
  currentLessonProgress?: number | null;
  lastActivity?: string | null;
  timeSpent: number;
}

const BASE = "/api/learner-progress";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getEnrollments(learnerId: string): Promise<{
  enrollments: EnrollmentData[];
  lessonProgress: LessonProgressData[];
}> {
  return fetchJson(`${BASE}/${learnerId}`);
}

export async function getEnrollment(
  learnerId: string,
  courseId: string
): Promise<{
  enrollment: EnrollmentData | null;
  lessonProgress: LessonProgressData[];
}> {
  return fetchJson(`${BASE}/${learnerId}/course/${courseId}`);
}

export async function upsertEnrollment(
  learnerId: string,
  courseId: string,
  data: {
    progress?: number;
    status?: string;
    timeSpent?: number;
    lastActivity?: string;
    firstOpened?: string;
    completedDate?: string | null;
    currentModuleId?: string | null;
    currentLessonId?: string | null;
    currentLessonProgress?: number | null;
    campaignId?: string | null;
    assignmentId?: string;
  }
): Promise<{ enrollment: EnrollmentData }> {
  return fetchJson(`${BASE}/${learnerId}/course/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function trackLesson(
  learnerId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  data: {
    completed?: boolean;
    timeSpent?: number;
    progress?: number;
  }
): Promise<{ lesson: LessonProgressData }> {
  return fetchJson(`${BASE}/${learnerId}/lesson`, {
    method: "POST",
    body: JSON.stringify({ courseId, moduleId, lessonId, ...data }),
  });
}

export async function getResumeData(
  learnerId: string
): Promise<{ resumeItems: ResumeItem[] }> {
  return fetchJson(`${BASE}/${learnerId}/resume`);
}

export async function startSession(
  learnerId: string,
  courseId: string,
  options?: { lessonId?: string; moduleId?: string; progressBefore?: number }
): Promise<{ session: { id: string } }> {
  return fetchJson(`${BASE}/${learnerId}/session`, {
    method: "POST",
    body: JSON.stringify({ action: "start", courseId, ...options }),
  });
}

export async function endSession(
  learnerId: string,
  sessionId: string,
  data: { duration?: number; progressAfter?: number }
): Promise<void> {
  await fetchJson(`${BASE}/${learnerId}/session`, {
    method: "POST",
    body: JSON.stringify({ action: "end", sessionId, ...data }),
  });
}
