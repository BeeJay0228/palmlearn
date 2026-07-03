"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label htmlFor={switchId} className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            id={switchId}
            className="peer sr-only"
            ref={ref}
            role="switch"
            {...props}
          />
          <div
            className={cn(
              "h-6 w-11 rounded-full border-2 border-border bg-surface-secondary transition-all duration-200",
              "peer-checked:bg-primary-600 peer-checked:border-primary-600",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:duration-200",
              "peer-checked:after:translate-x-5",
            )}
          />
        </div>
        {label && (
          <span className="text-sm text-content select-none">{label}</span>
        )}
      </label>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
