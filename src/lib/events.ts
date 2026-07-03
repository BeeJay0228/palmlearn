"use client";

import type { TrainingEvent, EventStatus, EventType, TargetAudience, EventSchedule, EventLocation, EventNotifications, EventResource, PostEvent } from "@/types";
import { notifyEventCreated, notifyEventUpdated } from "./mock-notifications";
import { getAllUsers } from "./auth";

const STORAGE_KEY = "palmlearn-events";

function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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

function getStored(): TrainingEvent[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TrainingEvent[];
  } catch {
    return [];
  }
}

function setStored(items: TrainingEvent[]): void {
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

const SEED_EVENTS: TrainingEvent[] = [
  {
    id: "evt_seed_1",
    title: "Annual Compliance & Ethics Training",
    description: "A comprehensive virtual training covering the latest compliance regulations, ethical standards, and reporting procedures for all staff members.",
    banner: "",
    trainerId: "user_trainer_1",
    categoryId: "cat_1",
    subCategoryId: "subcat_1",
    eventType: "webinar",
    schedule: { startDate: futureDate(7), endDate: futureDate(7), startTime: "10:00", endTime: "12:00", timezone: "Africa/Lagos", recurrence: "none", capacity: 500, registrationDeadline: futureDate(5) },
    location: { type: "webinar", meetingUrl: "https://meet.google.com/abc-defg-hij", platform: "Google Meet" },
    targetAudience: makeAudience("organization"),
    notifications: { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: false, postEventFollowUp: true },
    resources: [],
    postEvent: { feedbackSurvey: true, certificate: true, recording: null, trainerNotes: null, actionItems: [] },
    status: "published",
    createdBy: "user_admin",
    createdAt: pastDate(14),
    updatedAt: pastDate(14),
  },
  {
    id: "evt_seed_2",
    title: "Leadership Workshop: Managing Remote Teams",
    description: "An interactive workshop for team leads and managers on effective remote team management, communication strategies, and performance tracking.",
    banner: "",
    trainerId: "user_trainer_2",
    categoryId: "cat_2",
    subCategoryId: "subcat_2",
    eventType: "workshop",
    schedule: { startDate: futureDate(14), endDate: futureDate(14), startTime: "09:00", endTime: "16:00", timezone: "Africa/Lagos", recurrence: "none", capacity: 30, registrationDeadline: futureDate(10) },
    location: { type: "workshop", venue: "PalmLearn Conference Hall", address: "42 Isaac John Street, Ikeja, Lagos", gpsLocation: "6.6018° N, 3.3515° E" },
    targetAudience: makeAudience("multiple", ["user_learner_1", "user_learner_2", "user_learner_3"]),
    notifications: { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: true, postEventFollowUp: true },
    resources: [{ id: "res_1", name: "Workshop Slides", type: "slides", url: "#" }, { id: "res_2", name: "Remote Team Guide", type: "pdf", url: "#" }],
    postEvent: { feedbackSurvey: true, certificate: true, recording: null, trainerNotes: "Action items to be shared after session", actionItems: ["Set up weekly check-ins", "Review team communication tools"] },
    status: "published",
    createdBy: "user_admin",
    createdAt: pastDate(10),
    updatedAt: pastDate(10),
  },
  {
    id: "evt_seed_3",
    title: "New Hire Onboarding - Lagos Office",
    description: "Physical onboarding session for all new hires at the Lagos office. Meet the team, tour the facility, and complete initial paperwork.",
    banner: "",
    trainerId: "user_trainer_1",
    categoryId: "cat_1",
    subCategoryId: "subcat_1",
    eventType: "physical",
    schedule: { startDate: futureDate(3), endDate: futureDate(3), startTime: "08:00", endTime: "17:00", timezone: "Africa/Lagos", recurrence: "monthly", capacity: 50, registrationDeadline: futureDate(1) },
    location: { type: "physical", venue: "PalmLearn Headquarters", address: "42 Isaac John Street, Ikeja, Lagos", gpsLocation: "6.6018° N, 3.3515° E" },
    targetAudience: makeAudience("category", ["cat_1"]),
    notifications: { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: false, postEventFollowUp: true },
    resources: [{ id: "res_3", name: "Onboarding Checklist", type: "document", url: "#" }],
    postEvent: { feedbackSurvey: true, certificate: false, recording: null, trainerNotes: null, actionItems: [] },
    status: "published",
    createdBy: "user_admin",
    createdAt: pastDate(5),
    updatedAt: pastDate(5),
  },
  {
    id: "evt_seed_4",
    title: "Data Privacy Compliance Briefing",
    description: "Mandatory briefing on updated data privacy regulations. All staff handling personal data must attend.",
    banner: "",
    trainerId: "user_trainer_2",
    categoryId: "cat_1",
    subCategoryId: "subcat_1",
    eventType: "virtual",
    schedule: { startDate: futureDate(1), endDate: futureDate(1), startTime: "14:00", endTime: "15:00", timezone: "Africa/Lagos", recurrence: "none", capacity: 200, registrationDeadline: futureDate(0) },
    location: { type: "virtual", meetingUrl: "https://zoom.us/j/1234567890", platform: "Zoom" },
    targetAudience: makeAudience("organization"),
    notifications: { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: true, postEventFollowUp: true },
    resources: [{ id: "res_4", name: "Privacy Policy 2026", type: "pdf", url: "#" }],
    postEvent: { feedbackSurvey: true, certificate: false, recording: null, trainerNotes: null, actionItems: [] },
    status: "published",
    createdBy: "user_admin",
    createdAt: pastDate(3),
    updatedAt: pastDate(3),
  },
  {
    id: "evt_seed_5",
    title: "Q2 Town Hall Meeting",
    description: "Quarterly town hall with executive leadership. Review Q2 performance, announce Q3 initiatives, and open Q&A session.",
    banner: "",
    trainerId: "user_admin",
    categoryId: "cat_1",
    subCategoryId: "subcat_1",
    eventType: "town_hall",
    schedule: { startDate: futureDate(21), endDate: futureDate(21), startTime: "11:00", endTime: "13:00", timezone: "Africa/Lagos", recurrence: "none", capacity: 1000, registrationDeadline: futureDate(19) },
    location: { type: "town_hall", meetingUrl: "https://teams.microsoft.com/meeting/abc123", platform: "Microsoft Teams" },
    targetAudience: makeAudience("organization"),
    notifications: { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: false, postEventFollowUp: false },
    resources: [{ id: "res_5", name: "Q2 Agenda", type: "document", url: "#" }, { id: "res_6", name: "Q1 Minutes", type: "pdf", url: "#" }],
    postEvent: { feedbackSurvey: true, certificate: false, recording: "https://recording.example.com/q2-townhall", trainerNotes: "Will share minutes within 48 hours", actionItems: ["Follow up on Q2 action items", "Prepare Q3 roadmap"] },
    status: "published",
    createdBy: "user_admin",
    createdAt: pastDate(2),
    updatedAt: pastDate(2),
  },
  {
    id: "evt_seed_6",
    title: "First Aid & Emergency Response Training",
    description: "Hands-on physical training session covering emergency response procedures, first aid basics, and evacuation protocols.",
    banner: "",
    trainerId: "user_trainer_1",
    categoryId: "cat_1",
    subCategoryId: "subcat_1",
    eventType: "physical",
    schedule: { startDate: futureDate(10), endDate: futureDate(10), startTime: "09:00", endTime: "15:00", timezone: "Africa/Lagos", recurrence: "none", capacity: 25, registrationDeadline: futureDate(7) },
    location: { type: "physical", venue: "PalmLearn Training Center", address: "15 Awolowo Road, Ikoyi, Lagos", gpsLocation: "6.4478° N, 3.4323° E" },
    targetAudience: makeAudience("region", ["region_1"]),
    notifications: { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: false, postEventFollowUp: true },
    resources: [{ id: "res_7", name: "First Aid Manual", type: "pdf", url: "#" }],
    postEvent: { feedbackSurvey: true, certificate: true, recording: null, trainerNotes: null, actionItems: [] },
    status: "draft",
    createdBy: "user_admin",
    createdAt: pastDate(1),
    updatedAt: pastDate(1),
  },
];

export function seedEvents(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    setStored(SEED_EVENTS);
  }
}

export function getEvents(): TrainingEvent[] {
  return getStored();
}

export function getEvent(id: string): TrainingEvent | undefined {
  return getStored().find((e) => e.id === id);
}

export function createEvent(data: Omit<TrainingEvent, "id" | "createdAt" | "updatedAt">): TrainingEvent {
  const events = getStored();
  const event: TrainingEvent = {
    ...data,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  events.push(event);
  setStored(events);
  return event;
}

export function updateEvent(id: string, data: Partial<Omit<TrainingEvent, "id" | "createdAt">>): TrainingEvent | undefined {
  const events = getStored();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  events[index] = { ...events[index], ...data, updatedAt: now() };
  setStored(events);
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = getStored();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return false;
  events.splice(index, 1);
  setStored(events);
  return true;
}

export function filterEvents(params: {
  search?: string;
  status?: EventStatus;
  eventType?: EventType;
  categoryId?: string;
  trainerId?: string;
}): TrainingEvent[] {
  let events = getStored();
  if (params.search) {
    const q = params.search.toLowerCase();
    events = events.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }
  if (params.status) events = events.filter((e) => e.status === params.status);
  if (params.eventType) events = events.filter((e) => e.eventType === params.eventType);
  if (params.categoryId) events = events.filter((e) => e.categoryId === params.categoryId);
  if (params.trainerId) events = events.filter((e) => e.trainerId === params.trainerId);
  return events;
}

export function getEventsForLearner(learnerId: string): TrainingEvent[] {
  const events = getStored();
  const users = JSON.parse(localStorage.getItem("palmlearn-users") || "[]") as Array<{ id: string; categoryId?: string; subCategoryId?: string; regionId?: string; stateId?: string }>;
  const learner = users.find((u) => u.id === learnerId);
  if (!learner) return [];
  return events.filter((e) => {
    if (e.status !== "published") return false;
    const ta = e.targetAudience;
    if (ta.type === "single" || ta.type === "multiple") return ta.userIds.includes(learnerId);
    if (ta.type === "organization") return true;
    if (ta.type === "category") return learner.categoryId ? ta.categoryIds.includes(learner.categoryId) : false;
    if (ta.type === "subcategory") return learner.subCategoryId ? ta.subCategoryIds.includes(learner.subCategoryId) : false;
    if (ta.type === "region") return learner.regionId ? ta.regionIds.includes(learner.regionId) : false;
    if (ta.type === "state") return learner.stateId ? ta.stateIds.includes(learner.stateId) : false;
    return false;
  });
}
