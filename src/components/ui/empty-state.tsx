import { cn } from "@/lib/utils";
import {
  Inbox,
  SearchX,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Bell,
  Megaphone,
  Library,
  FileBarChart,
  GraduationCap,
  Lightbulb,
  Target,
} from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "subtle" | "bordered" | "gradient";
}

const sizeClasses = {
  sm: {
    wrapper: "py-12 px-4",
    iconContainer: "h-14 w-14 rounded-2xl",
    icon: "h-6 w-6",
    title: "text-base",
  },
  md: {
    wrapper: "py-20 px-4",
    iconContainer: "h-20 w-20 rounded-3xl",
    icon: "h-9 w-9",
    title: "text-lg",
  },
  lg: {
    wrapper: "py-28 px-4",
    iconContainer: "h-24 w-24 rounded-3xl",
    icon: "h-11 w-11",
    title: "text-xl",
  },
};

const variantClasses = {
  default: {
    container: "",
    iconContainer: "bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-primary-900/10 border border-primary-200/50 dark:border-primary-800/30",
    icon: "text-primary-600 dark:text-primary-400",
    dot: "bg-primary-400",
  },
  subtle: {
    container: "",
    iconContainer: "bg-surface-secondary border border-border/50",
    icon: "text-content-tertiary",
    dot: "bg-content-tertiary",
  },
  bordered: {
    container: "border-2 border-dashed border-border rounded-3xl mx-4",
    iconContainer: "bg-surface-secondary border border-border/50",
    icon: "text-content-tertiary",
    dot: "bg-content-tertiary",
  },
  gradient: {
    container: "rounded-3xl bg-gradient-to-br from-primary-50/50 to-primary-100/20 dark:from-primary-950/20 dark:to-primary-900/5 border border-primary-200/30 dark:border-primary-800/20 mx-4",
    iconContainer: "bg-white dark:bg-primary-950/50 border border-primary-200/50 dark:border-primary-800/30 shadow-sm",
    icon: "text-primary-600 dark:text-primary-400",
    dot: "bg-primary-400",
  },
};

const emptyStateIcons = {
  default: Inbox,
  search: SearchX,
  users: Users,
  courses: BookOpen,
  assignments: ClipboardList,
  analytics: BarChart3,
  notifications: Bell,
  programmes: Megaphone,
  library: Library,
  reports: FileBarChart,
  learning: GraduationCap,
  ideas: Lightbulb,
  goals: Target,
} as const;

export type EmptyStateVariant = keyof typeof emptyStateIcons;

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
  variant = "default",
}: EmptyStateProps) {
  const IconComponent = Icon || emptyStateIcons.default;
  const classes = sizeClasses[size];
  const vc = variantClasses[variant];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      classes.wrapper,
      vc.container,
      className,
    )}>
      <div className="relative mb-6">
        <div className={cn(
          "flex items-center justify-center",
          classes.iconContainer,
          vc.iconContainer,
        )}>
          <IconComponent className={cn(vc.icon, classes.icon)} />
        </div>
        <div className={cn(
          "absolute -top-1 -right-1 h-4 w-4 rounded-full animate-badge-pulse",
          vc.dot,
        )} />
      </div>
      <h3 className={cn("font-semibold text-content", classes.title)}>{title}</h3>
      {description && (
        <p className="text-sm text-content-secondary mt-1.5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
