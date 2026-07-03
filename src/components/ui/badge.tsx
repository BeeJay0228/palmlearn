import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200",
        secondary: "bg-surface-secondary text-content-secondary border border-border",
        success: "bg-success-light text-success dark:bg-success/10",
        warning: "bg-warning-light text-warning dark:bg-warning/10",
        danger: "bg-danger-light text-danger dark:bg-danger/10",
        info: "bg-info-light text-info dark:bg-info/10",
        neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        outline: "border border-border text-content-secondary",
        glass: "glass text-content-secondary text-[11px] font-medium",
        premium: "gradient-border text-primary-700 dark:text-primary-300 text-[11px] font-semibold",
        soft: "bg-surface-secondary text-content-secondary border border-border/50",
      },
      size: {
        sm: "px-2 text-[10px] py-0.5",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
