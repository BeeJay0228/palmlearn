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
