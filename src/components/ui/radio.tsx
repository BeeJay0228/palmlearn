"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps {
  children: React.ReactNode;
  className?: string;
}

function RadioGroup({ children, className }: RadioGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {children}
    </div>
  );
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <label htmlFor={radioId} className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            id={radioId}
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
              "border-border group-hover:border-border-strong bg-surface",
              "peer-checked:border-primary-600 peer-checked:bg-primary-600",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            )}
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-white transition-all duration-200 scale-0",
                "peer-checked:scale-100",
              )}
            />
          </div>
        </div>
        {label && (
          <span className="text-sm text-content select-none">{label}</span>
        )}
      </label>
    );
  },
);
Radio.displayName = "Radio";

export { RadioGroup, Radio };
