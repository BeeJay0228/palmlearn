import type {
  Difficulty, CourseStatus, AssignmentType, AssignmentPriority, AssignmentStatus,
  LearnerAssignmentStatus, ProgrammeStatus, AudienceType, EventType, EventStatus,
  AttendanceStatus, RecurrencePattern,
} from "@/types";

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
