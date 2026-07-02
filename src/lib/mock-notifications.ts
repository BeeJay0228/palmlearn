import type { Assignment, Programme } from "@/types";

const STORAGE_KEY = "palmlearn-notifications";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "assignment" | "programme" | "due_reminder" | "completion" | "overdue" | "system";
  read: boolean;
  userId: string;
  link?: string;
  createdAt: string;
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function getStored(): AppNotification[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

function setStored(items: AppNotification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "notif_seed_1", title: "New Assignment", message: "You have been assigned 'New Hire Onboarding - Compliance Training'.", type: "assignment", read: false, userId: "user_learner_1", link: "/learner/assignments", createdAt: now() },
  { id: "notif_seed_2", title: "Assignment Due Soon", message: "'Product Knowledge Refresh - Q2' is due in 7 days.", type: "due_reminder", read: false, userId: "user_learner_1", link: "/learner/assignments", createdAt: now() },
  { id: "notif_seed_3", title: "Course Completed", message: "Congratulations! You completed 'Compliance Fundamentals'.", type: "completion", read: false, userId: "user_learner_2", link: "/learner/my-courses", createdAt: now() },
  { id: "notif_seed_4", title: "Overdue Assignment", message: "'New Hire Onboarding - Compliance Training' is now overdue.", type: "overdue", read: false, userId: "user_learner_1", link: "/learner/assignments", createdAt: now() },
  { id: "notif_seed_5", title: "New Training Programme", message: "New training programme 'Q2 2026 Compliance Blitz' has been launched.", type: "programme", read: false, userId: "user_learner_2", link: "/learner/programmes", createdAt: now() },
];

export function seedNotifications(): void {
  if (typeof window === "undefined") return;
  const existing = getStored();
  if (existing.length === 0) {
    setStored(SEED_NOTIFICATIONS);
  }
}

export function getNotifications(userId?: string): AppNotification[] {
  const all = getStored();
  if (userId) return all.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadCount(userId?: string): number {
  return getNotifications(userId).filter((n) => !n.read).length;
}

export function markAsRead(id: string): void {
  const list = getStored();
  const idx = list.findIndex((n) => n.id === id);
  if (idx !== -1) {
    list[idx].read = true;
    setStored(list);
  }
}

export function markAllAsRead(userId?: string): void {
  const list = getStored();
  const updated = list.map((n) => {
    if (userId && n.userId !== userId) return n;
    return { ...n, read: true };
  });
  setStored(updated);
}

export function notifyAssignmentCreated(assignment: Assignment, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "New Assignment",
    message: `You have been assigned '${assignment.name}'.`,
    type: "assignment",
    read: false,
    userId,
    link: "/learner/assignments",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyProgrammeCreated(programme: Programme, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "New Training Programme",
    message: `Training Programme '${programme.name}' has been assigned to you.`,
    type: "programme",
    read: false,
    userId,
    link: `/learner/programmes/${programme.id}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyProgrammeUpdated(programme: Programme, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Training Programme Updated",
    message: `Training Programme '${programme.name}' has been updated. Check for new content.`,
    type: "programme",
    read: false,
    userId,
    link: `/learner/programmes/${programme.id}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyAssignmentDueSoon(assignment: Assignment, learnerIds: string[], daysLeft: number): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Assignment Due Soon",
    message: `'${assignment.name}' is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
    type: "due_reminder",
    read: false,
    userId,
    link: "/learner/assignments",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyAssignmentOverdue(assignment: Assignment, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Overdue Assignment",
    message: `'${assignment.name}' is now overdue. Please complete it as soon as possible.`,
    type: "overdue",
    read: false,
    userId,
    link: "/learner/assignments",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyAssignmentCompleted(assignment: Assignment, learnerId: string, courseTitle?: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Course Completed",
    message: courseTitle
      ? `Congratulations! You completed '${courseTitle}' in '${assignment.name}'.`
      : `Congratulations! You completed an assignment '${assignment.name}'.`,
    type: "completion",
    read: false,
    userId: learnerId,
    link: "/learner/assignments",
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function deleteNotification(id: string): void {
  const list = getStored();
  setStored(list.filter((n) => n.id !== id));
}

export function createSystemNotification(title: string, message: string, userIds?: string[]): void {
  if (userIds && userIds.length > 0) {
    const notifications: AppNotification[] = userIds.map((userId) => ({
      id: generateId(),
      title,
      message,
      type: "system",
      read: false,
      userId,
      createdAt: now(),
    }));
    const list = getStored();
    list.push(...notifications);
    setStored(list);
  }
}
