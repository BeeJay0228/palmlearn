import type { Assignment, Programme } from "@/types";

const STORAGE_KEY = "palmlearn-notifications";

export type NotificationCategory =
  | "training"
  | "course"
  | "assignment"
  | "event"
  | "resource"
  | "system";

export type NotificationType =
  | "training_programme_assigned"
  | "training_programme_updated"
  | "programme_due_soon"
  | "programme_overdue"
  | "course_assigned"
  | "course_completed"
  | "course_unlocked"
  | "assignment_unlocked"
  | "assignment_submitted"
  | "assignment_due_soon"
  | "assignment_due_today"
  | "assignment_overdue"
  | "event_created"
  | "event_reminder"
  | "event_today"
  | "event_updated"
  | "resource_added"
  | "learner_progress"
  | "admin_summary"
  | "smart_reminder"
  | "welcome"
  | "password_changed"
  | "profile_updated"
  | "announcement";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  link?: string;
  createdAt: string;
}

const CATEGORY_MAP: Record<NotificationType, NotificationCategory> = {
  training_programme_assigned: "training",
  training_programme_updated: "training",
  programme_due_soon: "training",
  programme_overdue: "training",
  course_assigned: "course",
  course_completed: "course",
  course_unlocked: "course",
  assignment_unlocked: "assignment",
  assignment_submitted: "assignment",
  assignment_due_soon: "assignment",
  assignment_due_today: "assignment",
  assignment_overdue: "assignment",
  event_created: "event",
  event_reminder: "event",
  event_today: "event",
  event_updated: "event",
  resource_added: "resource",
  learner_progress: "training",
  admin_summary: "system",
  smart_reminder: "system",
  welcome: "system",
  password_changed: "system",
  profile_updated: "system",
  announcement: "system",
};

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  return CATEGORY_MAP[type];
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

const MIGRATION_KEY = "palmlearn-notif-migration-v2";

function migrateLinks(items: AppNotification[]): boolean {
  if (typeof window !== "undefined" && localStorage.getItem(MIGRATION_KEY)) return false;
  let changed = false;
  for (const n of items) {
    if (!n.link) continue;
    const progMatch = n.link.match(/^\/learner\/programmes\/([^?]+)$/);
    if (progMatch) {
      n.link = `/learner/programmes?filter=training&programmeId=${progMatch[1]}`;
      changed = true;
      continue;
    }
    const courseMatch = n.link.match(/^\/learner\/my-courses\/([^?]+)$/);
    if (courseMatch) {
      n.link = `/learner/my-courses?courseId=${courseMatch[1]}`;
      changed = true;
      continue;
    }
    if (n.link === "/learner/assignments") {
      n.link = `/learner/assignments?filter=assignments`;
      changed = true;
      continue;
    }
    const asgnMatch = n.link.match(/^\/learner\/assignments\/([^?]+)$/);
    if (asgnMatch) {
      n.link = `/learner/assignments?filter=assignments&assignmentId=${asgnMatch[1]}`;
      changed = true;
      continue;
    }
    if (n.link === "/learner/programmes" && (n.type.startsWith("training_") || n.type.startsWith("programme_"))) {
      n.link = `/learner/programmes?filter=training`;
      changed = true;
      continue;
    }
  }
  if (typeof window !== "undefined") localStorage.setItem(MIGRATION_KEY, "1");
  return changed;
}

export function getNotifications(userId?: string): AppNotification[] {
  const all = getStored();
  const filtered = userId ? all.filter((n) => n.userId === userId) : all;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

export function markAsUnread(id: string): void {
  const list = getStored();
  const idx = list.findIndex((n) => n.id === id);
  if (idx !== -1) {
    list[idx].read = false;
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

export function deleteAllRead(userId?: string): void {
  const list = getStored();
  setStored(list.filter((n) => {
    if (userId && n.userId !== userId) return true;
    return !n.read;
  }));
}

export function deleteNotification(id: string): void {
  const list = getStored();
  setStored(list.filter((n) => n.id !== id));
}

export function notifyTrainingProgrammeAssigned(programme: Programme, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Training Programme Assigned",
    message: `Training Programme '${programme.name}' has been assigned to you.`,
    type: "training_programme_assigned",
    read: false,
    userId,
    link: `/learner/programmes?filter=training&programmeId=${programme.id}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyTrainingProgrammeUpdated(programme: Programme, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Training Programme Updated",
    message: `Training Programme '${programme.name}' has been updated. Check for new content.`,
    type: "training_programme_updated",
    read: false,
    userId,
    link: `/learner/programmes?filter=training&programmeId=${programme.id}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyCourseAssigned(courseTitle: string, courseId: string, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "New Course Available",
    message: `Course '${courseTitle}' is now available for you.`,
    type: "course_assigned",
    read: false,
    userId,
    link: `/learner/my-courses?courseId=${courseId}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyCourseCompleted(courseTitle: string, courseId: string, learnerId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Course Completed",
    message: `Congratulations! You completed '${courseTitle}'.`,
    type: "course_completed",
    read: false,
    userId: learnerId,
    link: `/learner/my-courses?courseId=${courseId}`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyAssignmentUnlocked(assignment: Assignment, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Assignment Unlocked",
    message: `Assignment '${assignment.name}' has been unlocked and is ready to start.`,
    type: "assignment_unlocked",
    read: false,
    userId,
    link: `/learner/assignments?filter=assignments&assignmentId=${assignment.id}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyAssignmentSubmitted(assignmentName: string, learnerId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Assignment Submitted",
    message: `You have submitted '${assignmentName}'.`,
    type: "assignment_submitted",
    read: false,
    userId: learnerId,
    link: "/learner/assignments",
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyEventCreated(eventTitle: string, eventId: string, targetUserIds: string[]): void {
  const notifications: AppNotification[] = targetUserIds.map((userId) => ({
    id: generateId(),
    title: "New Event",
    message: `New event '${eventTitle}' has been created.`,
    type: "event_created",
    read: false,
    userId,
    link: `/learner/events/${eventId}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyEventUpdated(eventTitle: string, eventId: string, targetUserIds: string[]): void {
  const notifications: AppNotification[] = targetUserIds.map((userId) => ({
    id: generateId(),
    title: "Event Updated",
    message: `Event '${eventTitle}' has been updated.`,
    type: "event_updated",
    read: false,
    userId,
    link: `/learner/events/${eventId}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyEventReminder(eventTitle: string, eventId: string, userIds: string[]): void {
  const notifications: AppNotification[] = userIds.map((userId) => ({
    id: generateId(),
    title: "Event Reminder",
    message: `Reminder: Event '${eventTitle}' is coming up.`,
    type: "event_reminder",
    read: false,
    userId,
    link: `/learner/events/${eventId}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyEventToday(eventTitle: string, eventId: string, userIds: string[]): void {
  const notifications: AppNotification[] = userIds.map((userId) => ({
    id: generateId(),
    title: "Event Starts Today",
    message: `Event '${eventTitle}' starts today!`,
    type: "event_today",
    read: false,
    userId,
    link: `/learner/events/${eventId}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyResourceAdded(resourceName: string, resourceId: string, targetUserIds: string[]): void {
  const notifications: AppNotification[] = targetUserIds.map((userId) => ({
    id: generateId(),
    title: "New Resource Added",
    message: `New resource '${resourceName}' has been added.`,
    type: "resource_added",
    read: false,
    userId,
    link: `/learner/resource-library/${resourceId}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyWelcome(userId: string, userName: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Welcome to PalmLearn",
    message: `Welcome, ${userName}! We're glad to have you on board.`,
    type: "welcome",
    read: false,
    userId,
    link: "/dashboard",
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyPasswordChanged(userId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Password Changed",
    message: "Your password has been changed successfully.",
    type: "password_changed",
    read: false,
    userId,
    link: `/${userId.startsWith("admin") ? "admin" : userId.startsWith("trainer") ? "trainer" : "learner"}/settings`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyProfileUpdated(userId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Profile Updated",
    message: "Your profile has been updated successfully.",
    type: "profile_updated",
    read: false,
    userId,
    link: `/${userId.startsWith("admin") ? "admin" : userId.startsWith("trainer") ? "trainer" : "learner"}/profile`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyAnnouncement(title: string, message: string, userIds: string[]): void {
  const notifications: AppNotification[] = userIds.map((userId) => ({
    id: generateId(),
    title,
    message,
    type: "announcement",
    read: false,
    userId,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function createSystemNotification(title: string, message: string, userIds?: string[]): void {
  if (userIds && userIds.length > 0) {
    const notifications: AppNotification[] = userIds.map((userId) => ({
      id: generateId(),
      title,
      message,
      type: "announcement",
      read: false,
      userId,
      createdAt: now(),
    }));
    const list = getStored();
    list.push(...notifications);
    setStored(list);
  }
}

export function notifyAssignmentDueSoon(assignment: Assignment, learnerIds: string[], daysLeft: number): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Assignment Due Soon",
    message: `'${assignment.name}' is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
    type: "assignment_due_soon",
    read: false,
    userId,
    link: `/learner/assignments?filter=assignments&assignmentId=${assignment.id}`,
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
    type: "assignment_overdue",
    read: false,
    userId,
    link: `/learner/assignments?filter=assignments&assignmentId=${assignment.id}`,
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyAssignmentCompleted(assignment: Assignment, learnerId: string, courseTitle?: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Assignment Submitted",
    message: courseTitle
      ? `You completed '${courseTitle}' in '${assignment.name}'.`
      : `You completed '${assignment.name}'.`,
    type: "assignment_submitted",
    read: false,
    userId: learnerId,
    link: "/learner/assignments",
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyProgrammeCompleted(programmeName: string, programmeId: string, learnerId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Training Programme Completed",
    message: `Congratulations! You have completed '${programmeName}'.`,
    type: "training_programme_assigned",
    read: false,
    userId: learnerId,
    link: `/learner/programmes/${programmeId}`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyProgrammeDueSoon(programme: Programme, learnerId: string, daysLeft: number): void {
  const label = daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`;
  const notification: AppNotification = {
    id: generateId(),
    title: "Training Programme Due Soon",
    message: `Training Programme '${programme.name}' is due ${label}.`,
    type: "programme_due_soon",
    read: false,
    userId: learnerId,
    link: `/learner/programmes?filter=training&programmeId=${programme.id}`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyProgrammeOverdue(programme: Programme, learnerId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Overdue Training Programme",
    message: `Training Programme '${programme.name}' is now overdue. Please complete it as soon as possible.`,
    type: "programme_overdue",
    read: false,
    userId: learnerId,
    link: `/learner/programmes/${programme.id}`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyCourseUnlocked(courseTitle: string, courseId: string, learnerId: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title: "Course Unlocked",
    message: `Course '${courseTitle}' has been unlocked and is ready to start.`,
    type: "course_unlocked",
    read: false,
    userId: learnerId,
    link: `/learner/my-courses/${courseId}`,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifyAssignmentDueToday(assignmentName: string, learnerIds: string[]): void {
  const notifications: AppNotification[] = learnerIds.map((userId) => ({
    id: generateId(),
    title: "Assignment Due Today",
    message: `'${assignmentName}' is due today!`,
    type: "assignment_due_today",
    read: false,
    userId,
    link: "/learner/assignments",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyLearnerStartedProgramme(trainerIds: string[], learnerName: string, programmeName: string): void {
  const notifications: AppNotification[] = trainerIds.map((userId) => ({
    id: generateId(),
    title: "Learner Started Programme",
    message: `${learnerName} has started the Training Programme '${programmeName}'.`,
    type: "learner_progress",
    read: false,
    userId,
    link: "/trainer/dashboard",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyLearnerCompletedCourse(trainerIds: string[], learnerName: string, courseTitle: string): void {
  const notifications: AppNotification[] = trainerIds.map((userId) => ({
    id: generateId(),
    title: "Learner Completed Course",
    message: `${learnerName} has completed the course '${courseTitle}'.`,
    type: "learner_progress",
    read: false,
    userId,
    link: "/trainer/dashboard",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyLearnerSubmittedAssignment(trainerIds: string[], learnerName: string, assignmentName: string): void {
  const notifications: AppNotification[] = trainerIds.map((userId) => ({
    id: generateId(),
    title: "Learner Submitted Assignment",
    message: `${learnerName} has submitted the assignment '${assignmentName}'.`,
    type: "learner_progress",
    read: false,
    userId,
    link: "/trainer/dashboard",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyLearnerCompletedProgramme(trainerIds: string[], learnerName: string, programmeName: string): void {
  const notifications: AppNotification[] = trainerIds.map((userId) => ({
    id: generateId(),
    title: "Learner Completed Programme",
    message: `${learnerName} has completed the Training Programme '${programmeName}'.`,
    type: "learner_progress",
    read: false,
    userId,
    link: "/trainer/dashboard",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyLearnerOverdue(trainerIds: string[], learnerName: string, itemName: string): void {
  const notifications: AppNotification[] = trainerIds.map((userId) => ({
    id: generateId(),
    title: "Learner Overdue",
    message: `${learnerName} is overdue on '${itemName}'.`,
    type: "learner_progress",
    read: false,
    userId,
    link: "/trainer/dashboard",
    createdAt: now(),
  }));
  const list = getStored();
  list.push(...notifications);
  setStored(list);
}

export function notifyAdminSummary(adminId: string, title: string, message: string, link?: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title,
    message,
    type: "admin_summary",
    read: false,
    userId: adminId,
    link: link || "/admin/dashboard",
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function notifySmartReminder(learnerId: string, title: string, message: string): void {
  const notification: AppNotification = {
    id: generateId(),
    title,
    message,
    type: "smart_reminder",
    read: false,
    userId: learnerId,
    createdAt: now(),
  };
  const list = getStored();
  list.push(notification);
  setStored(list);
}

export function seedNotifications(): void {
  if (typeof window === "undefined") return;
  const existing = getStored();
  if (existing.length > 0) {
    if (migrateLinks(existing)) setStored(existing);
    return;
  }

  const seed: AppNotification[] = [
    { id: "notif_seed_1", title: "Training Programme Assigned", message: "Training Programme 'Q2 2026 Compliance Blitz' has been assigned to you.", type: "training_programme_assigned", read: false, userId: "user_learner_1", link: "/learner/programmes?filter=training&programmeId=1", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "notif_seed_2", title: "Assignment Unlocked", message: "Assignment 'New Hire Onboarding - Compliance Training' has been unlocked.", type: "assignment_unlocked", read: false, userId: "user_learner_1", link: "/learner/assignments?filter=assignments&assignmentId=1", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "notif_seed_3", title: "Course Completed", message: "Congratulations! You completed 'Compliance Fundamentals'.", type: "course_completed", read: false, userId: "user_learner_1", link: "/learner/my-courses?courseId=course_1", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "notif_seed_4", title: "New Event", message: "New event 'Annual Compliance Workshop' has been created.", type: "event_created", read: false, userId: "user_learner_1", link: "/learner/events/event_1", createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: "notif_seed_5", title: "New Resource Added", message: "New resource 'Compliance Handbook 2026' has been added.", type: "resource_added", read: false, userId: "user_learner_1", link: "/learner/resource-library/res_1", createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: "notif_seed_6", title: "Welcome to PalmLearn", message: "Welcome, Learner! We're glad to have you on board.", type: "welcome", read: true, userId: "user_learner_1", link: "/dashboard", createdAt: new Date(Date.now() - 604800000).toISOString() },
    { id: "notif_seed_7", title: "Training Programme Updated", message: "Training Programme 'Product Knowledge Refresh - Q2' has been updated.", type: "training_programme_updated", read: false, userId: "user_learner_1", link: "/learner/programmes?filter=training&programmeId=2", createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: "notif_seed_8", title: "New Course Available", message: "Course 'Advanced Compliance' is now available for you.", type: "course_assigned", read: false, userId: "user_learner_1", link: "/learner/my-courses?courseId=course_2", createdAt: new Date(Date.now() - 10800000).toISOString() },
  ];
  setStored(seed);
}
