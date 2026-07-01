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
