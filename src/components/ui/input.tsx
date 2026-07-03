import { forwardRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, X } from "lucide-react";

const inputVariants = cva(
  "flex w-full rounded-xl border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-strong focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]",
        filled:
          "border-transparent bg-surface-secondary hover:bg-surface-tertiary focus:bg-surface focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]",
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
  leftIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, hint, id, floating, placeholder, onFocus, onBlur, rightIcon, leftIcon, clearable, onClear, value, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [focused, setFocused] = useState(false);
    const hasValue = value !== undefined && String(value).length > 0;

    const renderInput = () => (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-tertiary pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            inputVariants({ variant, inputSize }),
            leftIcon && "pl-10",
            (rightIcon || clearable) && "pr-10",
            error && "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]",
            className,
          )}
          ref={ref}
          placeholder={placeholder}
          value={value}
          {...props}
        />
        {(rightIcon || (clearable && hasValue)) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {clearable && hasValue && (
              <button
                type="button"
                onClick={onClear || (() => {})}
                className="flex h-5 w-5 items-center justify-center rounded-md text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
                tabIndex={-1}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (floating) {
      return (
        <div className="relative">
          <input
            id={inputId}
            placeholder={placeholder || " "}
            className={cn(
              "peer flex w-full rounded-xl border bg-surface px-4 pt-6 pb-2 text-sm text-content placeholder-transparent transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]"
                : "border-border hover:border-border-strong focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]",
              inputSize === "sm" && "pt-5 pb-1 text-xs",
              inputSize === "lg" && "pt-7 pb-3 text-base",
              rightIcon && "pr-10",
              className,
            )}
            ref={ref}
            value={value}
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
        {renderInput()}
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-content-tertiary">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

function PasswordInput(props: Omit<InputProps, "type" | "rightIcon" | "leftIcon">) {
  const [show, setShow] = useState(false);
  return (
    <Input
      type={show ? "text" : "password"}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="flex h-5 w-5 items-center justify-center rounded-md text-content-tertiary hover:text-content transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
}

function SearchInput(props: Omit<InputProps, "type" | "leftIcon" | "rightIcon">) {
  return (
    <Input
      type="search"
      leftIcon={<Search className="h-4 w-4" />}
      clearable
      {...props}
    />
  );
}

export { Input, inputVariants, PasswordInput, SearchInput };
