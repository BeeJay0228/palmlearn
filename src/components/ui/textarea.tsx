"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-content">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error
              ? "border-danger focus:border-danger focus:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]"
              : "border-border hover:border-border-strong focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-content-tertiary">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
