import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 hover:shadow-md hover:shadow-primary-600/20 rounded-xl",
        secondary:
          "bg-surface-secondary text-content border border-border hover:bg-surface-hover hover:border-border-strong active:bg-surface-tertiary rounded-xl",
        tertiary:
          "bg-transparent text-content-secondary hover:text-content hover:bg-surface-hover active:bg-surface-tertiary rounded-xl",
        ghost:
          "bg-transparent text-content-secondary hover:text-content hover:bg-surface-tertiary rounded-xl",
        danger:
          "bg-danger text-white shadow-sm hover:bg-danger-hover active:opacity-80 rounded-xl",
        success:
          "bg-success text-white shadow-sm hover:bg-success-hover active:opacity-80 rounded-xl",
        outline:
          "bg-transparent text-content border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100 dark:hover:bg-primary-950/30 rounded-xl",
        "primary-soft":
          "bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 dark:bg-primary-950/30 dark:text-primary-400 dark:hover:bg-primary-900/40 rounded-xl",
        "glass-primary":
          "glass text-content hover:bg-white/90 dark:hover:bg-white/5 rounded-xl font-semibold",
        link:
          "bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline rounded-xl",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-11 px-5 text-sm gap-2",
        xl: "h-12 px-6 text-base gap-2.5",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        )}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
