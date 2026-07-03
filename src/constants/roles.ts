export const ROLES = {
  ADMIN: "admin",
  TRAINER: "trainer",
  LEARNER: "learner",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  admin: "Super Admin",
  trainer: "Trainer",
  learner: "Learner",
};

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
  trainer: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  learner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
};

export const ROLE_ROUTES: Record<string, string> = {
  admin: "/admin",
  trainer: "/trainer",
  learner: "/learner",
};
