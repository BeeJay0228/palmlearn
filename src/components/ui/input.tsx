import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-content placeholder:text-content-tertiary transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-strong",
        filled:
          "border-transparent bg-surface-secondary hover:bg-surface-tertiary focus:bg-surface",
        flushed:
          "border-0 border-b-2 border-border rounded-none px-0 hover:border-border-strong",
      },
      inputSize: {
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
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
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-content">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(inputVariants({ variant, inputSize }), error && "border-danger focus-visible:ring-danger", className)}
          ref={ref}
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
