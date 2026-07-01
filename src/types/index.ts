export type Theme = "light" | "dark" | "system";

export type AnimationVariant =
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "none";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
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
