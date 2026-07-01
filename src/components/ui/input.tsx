import { forwardRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-strong focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)]",
        filled:
          "border-transparent bg-surface-secondary hover:bg-surface-tertiary focus:bg-surface focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)]",
        flushed:
          "border-0 border-b-2 border-border rounded-none px-0 py-2 hover:border-border-strong focus:border-primary-500",
        glass:
          "glass hover:bg-white/80 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-white/5 focus:border-primary-500/50",
      },
      inputSize: {
        sm: "h-9 text-xs",
        md: "h-11 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  floating?: boolean;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, hint, id, floating, placeholder, onFocus, onBlur, rightIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [focused, setFocused] = useState(false);
    const hasValue = props.value && String(props.value).length > 0;

    if (floating) {
      return (
        <div className="relative">
          <input
            id={inputId}
            placeholder={placeholder || " "}
            className={cn(
              "peer flex w-full rounded-xl border bg-surface px-4 pt-6 pb-2 text-sm text-content placeholder-transparent transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                : "border-border hover:border-border-strong focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)]",
              inputSize === "sm" && "pt-5 pb-1 text-xs",
              inputSize === "lg" && "pt-7 pb-3 text-base",
              rightIcon && "pr-10",
              className,
            )}
            ref={ref}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none",
                "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-content-tertiary/60",
                "peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-content-secondary",
                (focused || hasValue) && "top-3 -translate-y-0 text-xs text-content-secondary",
                error && "text-danger",
              )}
            >
              {label}
            </label>
          )}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
          {hint && !error && <p className="mt-1.5 text-xs text-content-tertiary">{hint}</p>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-content">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(inputVariants({ variant, inputSize }), error && "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]", className)}
          ref={ref}
          placeholder={placeholder}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-content-tertiary">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
