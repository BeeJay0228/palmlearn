"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getEnrollments,
  getEnrollment,
  upsertEnrollment,
  trackLesson,
  getResumeData,
  startSession,
  endSession,
  type EnrollmentData,
  type LessonProgressData,
  type ResumeItem,
} from "@/lib/learner-progress";

export function useEnrollments(learnerId: string | undefined) {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!learnerId) return;
    setLoading(true);
    try {
      const data = await getEnrollments(learnerId);
      setEnrollments(data.enrollments);
      setLessonProgress(data.lessonProgress);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [learnerId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { enrollments, lessonProgress, loading, refresh };
}

export function useEnrollment(learnerId: string | undefined, courseId: string | undefined) {
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!learnerId || !courseId) return;
    setLoading(true);
    try {
      const data = await getEnrollment(learnerId, courseId);
      setEnrollment(data.enrollment);
      setLessonProgress(data.lessonProgress);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [learnerId, courseId]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateProgress = useCallback(async (updates: {
    progress?: number;
    status?: string;
    timeSpent?: number;
    currentModuleId?: string;
    currentLessonId?: string;
    currentLessonProgress?: number;
    firstOpened?: string;
  }) => {
    if (!learnerId || !courseId) return;
    try {
      const result = await upsertEnrollment(learnerId, courseId, {
        ...updates,
        lastActivity: new Date().toISOString(),
      });
      setEnrollment(result.enrollment);
    } catch {
    }
  }, [learnerId, courseId]);

  const saveLessonProgress = useCallback(async (
    moduleId: string,
    lessonId: string,
    completed: boolean,
    timeSpent?: number,
  ) => {
    if (!learnerId || !courseId) return;
    try {
      await trackLesson(learnerId, courseId, moduleId, lessonId, { completed, timeSpent });
      setLessonProgress((prev) => {
        const existing = prev.find((l) => l.lessonId === lessonId);
        if (existing) {
          return prev.map((l) =>
            l.lessonId === lessonId
              ? { ...l, completed, timeSpent: (l.timeSpent || 0) + (timeSpent || 0) }
              : l
          );
        }
        return [
          ...prev,
          {
            id: "",
            learnerId,
            courseId,
            moduleId,
            lessonId,
            completed,
            progress: completed ? 100 : 0,
            timeSpent: timeSpent || 0,
          },
        ];
      });
      await updateProgress({
        currentModuleId: moduleId,
        currentLessonId: lessonId,
      });
    } catch {
    }
  }, [learnerId, courseId, updateProgress]);

  return { enrollment, lessonProgress, loading, refresh, updateProgress, saveLessonProgress };
}

export function useResumeData(learnerId: string | undefined) {
  const [items, setItems] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!learnerId) return;
    setLoading(true);
    try {
      const data = await getResumeData(learnerId);
      setItems(data.resumeItems);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [learnerId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, refresh };
}

export function useLearningSession(learnerId: string | undefined, courseId: string | undefined) {
  const sessionIdRef = useRef<string | null>(null);

  const begin = useCallback(async (options?: { lessonId?: string; moduleId?: string }) => {
    if (!learnerId || !courseId) return null;
    try {
      const result = await startSession(learnerId, courseId, options);
      sessionIdRef.current = result.session.id;
      return result.session.id;
    } catch {
      return null;
    }
  }, [learnerId, courseId]);

  const finish = useCallback(async (progressAfter?: number) => {
    if (!learnerId || !sessionIdRef.current) return;
    try {
      await endSession(learnerId, sessionIdRef.current, { progressAfter });
      sessionIdRef.current = null;
    } catch {
    }
  }, [learnerId]);

  return { begin, finish };
}
