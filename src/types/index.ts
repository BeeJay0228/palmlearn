export type Theme = "light" | "dark" | "system";

export type AnimationVariant =
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "none";

export type UserRole = "admin" | "trainer" | "learner";

export type UserStatus = "active" | "inactive";

export type Gender = "male" | "female" | "other";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  phone?: string;
  officeAddress?: string;
  homeAddress?: string;
  mustChangePassword: boolean;
  createdAt: string;
  gender?: Gender;
  categoryId?: string;
  subCategoryId?: string;
  regionId?: string;
  stateId?: string;
  status?: UserStatus;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
  isSection?: boolean;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient?: string;
}

export interface DesignTokens {
  colors: {
    primary: Record<number, string>;
    surface: Record<string, string>;
    content: Record<string, string>;
    border: Record<string, string>;
  };
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "danger"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type InputVariant = "default" | "filled" | "flushed";

export type CardVariant = "default" | "elevated" | "bordered" | "ghost";

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  createdAt: string;
}

export interface StateEntity {
  id: string;
  name: string;
  regionId: string;
  createdAt: string;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type CourseStatus = "draft" | "review" | "published" | "archived";

export type ResourceType = "video" | "pdf" | "image" | "ppt" | "doc" | "link" | "zip" | "template";

export type LessonType = "text" | "video" | "pdf" | "image" | "ppt" | "embed" | "attachment";

export interface CourseAnalytics {
  views: number;
  assignedLearners: number;
  completionRate: number;
  averageScore: number;
}

export interface VersionEntry {
  id: string;
  version: number;
  courseId: string;
  data: string;
  createdAt: string;
  createdBy: string;
  note: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  banner: string;
  instructor: string;
  categoryId: string;
  subCategoryId: string;
  estimatedDuration: number;
  difficulty: Difficulty;
  language: string;
  status: CourseStatus;
  modules: Module[];
  resources: string[];
  tags: string[];
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  analytics: CourseAnalytics;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string;
  duration: number;
  order: number;
  notes: string;
  attachments: string[];
  embedUrl: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  url: string;
  size: string;
  description: string;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  intermediate: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  advanced: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: "Draft",
  review: "In Review",
  published: "Published",
  archived: "Archived",
};

export const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  review: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  archived: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

// --- Assignment & Programme Types ---

export type AssignmentType = "mandatory" | "optional" | "recommended" | "refresher";
export type AssignmentPriority = "low" | "medium" | "high" | "critical";
export type AssignmentStatus = "draft" | "active" | "completed" | "cancelled";
export type AudienceType = "single" | "multiple" | "category" | "subcategory" | "region" | "state" | "office" | "trainer_group" | "organization";
export type ScheduleType = "immediate" | "scheduled";
export type ReminderSchedule = "none" | "daily" | "weekly";
export type LearnerAssignmentStatus = "not_started" | "in_progress" | "completed" | "overdue" | "expired" | "locked";
export type ProgrammeStatus = "draft" | "active" | "completed" | "archived";

export interface TargetAudience {
  type: AudienceType;
  userIds: string[];
  categoryIds: string[];
  subCategoryIds: string[];
  regionIds: string[];
  stateIds: string[];
}

export interface AssignmentSchedule {
  type: ScheduleType;
  startDate: string | null;
  dueDate: string | null;
  expiryDate: string | null;
  timezone: string;
}

export interface AssignmentNotifications {
  sendEmail: boolean;
  inApp: boolean;
  reminderSchedule: ReminderSchedule;
  reminderFrequency: number;
}

export interface Assignment {
  id: string;
  name: string;
  description: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  courseIds: string[];
  campaignId?: string;
  assignedBy: string;
  targetAudience: TargetAudience;
  schedule: AssignmentSchedule;
  notifications: AssignmentNotifications;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface Programme {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  assignmentIds: string[];
  targetAudience?: TargetAudience;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  image?: string;
  createdBy?: string;
  assignedBy?: string;
  status: ProgrammeStatus;
  publishedAt?: string;
  publishedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerAssignment {
  id: string;
  assignmentId: string;
  campaignId?: string;
  learnerId: string;
  courseId: string;
  progress: number;
  status: LearnerAssignmentStatus;
  assignedDate: string;
  firstOpened?: string;
  lastActivity?: string;
  completedDate?: string;
  timeSpent: number;
}

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  mandatory: "Mandatory",
  optional: "Optional",
  recommended: "Recommended",
  refresher: "Refresher",
};

export const ASSIGNMENT_TYPE_COLORS: Record<AssignmentType, string> = {
  mandatory: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  optional: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  recommended: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  refresher: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
};

export const ASSIGNMENT_PRIORITY_LABELS: Record<AssignmentPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const ASSIGNMENT_PRIORITY_COLORS: Record<AssignmentPriority, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  high: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  critical: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ASSIGNMENT_STATUS_COLORS: Record<AssignmentStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export const LEARNER_ASSIGNMENT_STATUS_LABELS: Record<LearnerAssignmentStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  expired: "Expired",
  locked: "Locked",
};

export const LEARNER_ASSIGNMENT_STATUS_COLORS: Record<LearnerAssignmentStatus, string> = {
  not_started: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  overdue: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  expired: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  locked: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
};

export const PROGRAMME_STATUS_LABELS: Record<ProgrammeStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const PROGRAMME_STATUS_COLORS: Record<ProgrammeStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  archived: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export const AUDIENCE_TYPE_LABELS: Record<AudienceType, string> = {
  single: "Single Learner",
  multiple: "Multiple Learners",
  category: "By Category",
  subcategory: "By Sub-Category",
  region: "By Region",
  state: "By State",
  office: "By Office",
  trainer_group: "By Trainer Group",
  organization: "Entire Organization",
};

// --- Event Types ---

export type EventType = "virtual" | "physical" | "hybrid" | "webinar" | "workshop" | "town_hall";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type RecurrencePattern = "none" | "daily" | "weekly" | "biweekly" | "monthly";
export type AttendanceStatus = "invited" | "registered" | "joined" | "completed" | "missed";

export interface EventLocation {
  type: EventType;
  meetingUrl?: string;
  platform?: string;
  venue?: string;
  address?: string;
  gpsLocation?: string;
}

export interface EventSchedule {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  recurrence: RecurrencePattern;
  capacity: number;
  registrationDeadline: string | null;
}

export interface EventNotifications {
  registrationConfirmation: boolean;
  reminder24h: boolean;
  reminder1h: boolean;
  reminder15m: boolean;
  postEventFollowUp: boolean;
}

export interface EventResource {
  id: string;
  name: string;
  type: "pdf" | "slides" | "video" | "link" | "document" | "assignment";
  url: string;
}

export interface PostEvent {
  feedbackSurvey: boolean;
  certificate: boolean;
  recording: string | null;
  trainerNotes: string | null;
  actionItems: string[];
}

export interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  banner: string;
  trainerId: string;
  categoryId: string;
  subCategoryId: string;
  eventType: EventType;
  schedule: EventSchedule;
  location: EventLocation;
  targetAudience: TargetAudience;
  notifications: EventNotifications;
  resources: EventResource[];
  postEvent: PostEvent;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  learnerId: string;
  status: AttendanceStatus;
  registeredAt: string | null;
  joinedAt: string | null;
  completedAt: string | null;
  timeAttended: number;
  earlyExit: boolean;
  lateArrival: boolean;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  virtual: "Virtual",
  physical: "Physical",
  hybrid: "Hybrid",
  webinar: "Webinar",
  workshop: "Workshop",
  town_hall: "Town Hall",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  virtual: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  physical: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  hybrid: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  webinar: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  workshop: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
  town_hall: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  completed: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  invited: "Invited",
  registered: "Registered",
  joined: "Joined",
  completed: "Completed",
  missed: "Missed",
};

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  invited: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  registered: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  joined: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  missed: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export const RECURRENCE_LABELS: Record<RecurrencePattern, string> = {
  none: "Does not repeat",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
};
