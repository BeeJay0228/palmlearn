"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  floating?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, floating, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasValue = props.value && String(props.value).length > 0;

    if (floating) {
      return (
        <div className="relative">
          <div className="relative">
            <select
              id={selectId}
              className={cn(
                "peer flex h-14 w-full appearance-none rounded-xl border bg-surface px-4 pt-6 pb-2 text-sm text-content transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50",
                error
                  ? "border-danger"
                  : "border-border hover:border-border-strong focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)]",
                className,
              )}
              ref={ref}
              {...props}
            >
              {placeholder && <option value="">{placeholder}</option>}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
          </div>
          {label && (
            <label
              htmlFor={selectId}
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none",
                "peer:placeholder-shown:top-1/2 peer:placeholder-shown:-translate-y-1/2 peer:placeholder-shown:text-sm peer:placeholder-shown:text-content-tertiary/60",
                "peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-content-secondary",
                hasValue && "top-3 -translate-y-0 text-xs text-content-secondary",
                error && "text-danger",
              )}
            >
              {label}
            </label>
          )}
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-content">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            className={cn(
              "flex h-12 w-full appearance-none rounded-xl border bg-surface-secondary px-4 pr-10 text-sm text-content transition-all duration-200 hover:bg-surface-tertiary focus:bg-surface focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus:border-danger",
              className,
            )}
            ref={ref}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
