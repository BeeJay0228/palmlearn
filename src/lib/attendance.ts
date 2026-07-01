"use client";

import type { EventAttendance, AttendanceStatus } from "@/types";

const STORAGE_KEY = "palmlearn-attendance";

function generateId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function getStored(): EventAttendance[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as EventAttendance[];
  } catch {
    return [];
  }
}

function setStored(items: EventAttendance[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function seedAttendance(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const seed: EventAttendance[] = [];
    setStored(seed);
  }
}

export function getAttendance(options?: { eventId?: string; learnerId?: string }): EventAttendance[] {
  let records = getStored();
  if (options?.eventId) records = records.filter((a) => a.eventId === options.eventId);
  if (options?.learnerId) records = records.filter((a) => a.learnerId === options.learnerId);
  return records;
}

export function getLearnerAttendance(learnerId: string): EventAttendance[] {
  return getStored().filter((a) => a.learnerId === learnerId);
}

export function getEventAttendance(eventId: string): EventAttendance[] {
  return getStored().filter((a) => a.eventId === eventId);
}

export function registerAttendance(eventId: string, learnerId: string): EventAttendance {
  const records = getStored();
  const existing = records.find((a) => a.eventId === eventId && a.learnerId === learnerId);
  if (existing) return existing;
  const record: EventAttendance = {
    id: generateId(),
    eventId,
    learnerId,
    status: "registered",
    registeredAt: now(),
    joinedAt: null,
    completedAt: null,
    timeAttended: 0,
    earlyExit: false,
    lateArrival: false,
  };
  records.push(record);
  setStored(records);
  return record;
}

export function updateAttendance(id: string, data: Partial<EventAttendance>): EventAttendance | undefined {
  const records = getStored();
  const index = records.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  records[index] = { ...records[index], ...data };
  setStored(records);
  return records[index];
}

export function logJoinEvent(eventId: string, learnerId: string): EventAttendance | undefined {
  const records = getStored();
  const existing = records.find((a) => a.eventId === eventId && a.learnerId === learnerId);
  if (existing) {
    existing.status = "joined";
    existing.joinedAt = now();
    existing.lateArrival = false;
    setStored(records);
    return existing;
  }
  const record: EventAttendance = {
    id: generateId(),
    eventId,
    learnerId,
    status: "joined",
    registeredAt: now(),
    joinedAt: now(),
    completedAt: null,
    timeAttended: 0,
    earlyExit: false,
    lateArrival: false,
  };
  records.push(record);
  setStored(records);
  return record;
}

export function logCompleteEvent(eventId: string, learnerId: string, timeAttended: number): EventAttendance | undefined {
  const records = getStored();
  const existing = records.find((a) => a.eventId === eventId && a.learnerId === learnerId);
  if (existing) {
    existing.status = "completed";
    existing.completedAt = now();
    existing.timeAttended = timeAttended;
    setStored(records);
    return existing;
  }
  return undefined;
}

export function mockInviteLearners(eventId: string, learnerIds: string[]): void {
  const records = getStored();
  for (const learnerId of learnerIds) {
    const existing = records.find((a) => a.eventId === eventId && a.learnerId === learnerId);
    if (!existing) {
      records.push({
        id: generateId(),
        eventId,
        learnerId,
        status: "invited",
        registeredAt: null,
        joinedAt: null,
        completedAt: null,
        timeAttended: 0,
        earlyExit: false,
        lateArrival: false,
      });
    }
  }
  setStored(records);
}

export function getAttendanceStats(eventId: string): {
  invited: number;
  registered: number;
  joined: number;
  completed: number;
  missed: number;
  total: number;
  attendanceRate: number;
} {
  const records = getEventAttendance(eventId);
  const invited = records.filter((a) => a.status === "invited").length;
  const registered = records.filter((a) => a.status === "registered").length;
  const joined = records.filter((a) => a.status === "joined").length;
  const completed = records.filter((a) => a.status === "completed").length;
  const missed = records.filter((a) => a.status === "missed").length;
  const total = records.length;
  const attended = joined + completed;
  return { invited, registered, joined, completed, missed, total, attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0 };
}
