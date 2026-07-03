"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label htmlFor={checkboxId} className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            ref={ref}
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-200",
              checked
                ? "bg-primary-600 border-primary-600"
                : "border-border group-hover:border-border-strong bg-surface",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            )}
          >
            {checked && <Check className="h-3 w-3 text-white stroke-[3]" />}
          </div>
        </div>
        {label && (
          <span className="text-sm text-content select-none">{label}</span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
