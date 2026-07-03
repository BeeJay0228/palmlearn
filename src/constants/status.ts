export const STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PUBLISHED: "published",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ARCHIVED: "archived",
  INACTIVE: "inactive",
  PENDING: "pending",
  OVERDUE: "overdue",
  LOCKED: "locked",
  IN_PROGRESS: "in_progress",
  NOT_STARTED: "not_started",
  EXPIRED: "expired",
  INVITED: "invited",
  REGISTERED: "registered",
  JOINED: "joined",
  MISSED: "missed",
  REVIEW: "review",
} as const;

export const baseStatusBadge = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
export const successBadge = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
export const warningBadge = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
export const dangerBadge = "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
export const infoBadge = "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
