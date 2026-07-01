"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
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
              "flex h-12 w-full appearance-none rounded-xl border bg-surface-secondary px-4 pr-10 text-sm text-content transition-all duration-200 hover:bg-surface-tertiary focus:bg-surface focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)] outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger",
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
