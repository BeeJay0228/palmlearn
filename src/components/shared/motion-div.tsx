import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";
import type { AnimationVariant } from "@/types";

const variantClasses: Record<string, string> = {
  "fade-in": "animate-fade-in",
  "fade-in-up": "animate-fade-in-up",
  "fade-in-down": "animate-fade-in-down",
  "slide-up": "animate-slide-up",
  "slide-down": "animate-slide-down",
  "slide-left": "animate-slide-left",
  "slide-right": "animate-slide-right",
  "scale-in": "animate-scale-in",
  "scale-in-sm": "animate-scale-in-sm",
  "none": "",
};

interface MotionDivProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
}

const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ className, variant = "fade-in-up", delay = 0, duration, children, style, ...props }, ref) => {
    const animClass = variantClasses[variant] || variantClasses["fade-in-up"];
    return (
      <div
        ref={ref}
        className={cn(animClass, className)}
        style={{
          ...style,
          animationDelay: delay ? `${delay}s` : undefined,
          animationDuration: duration ? `${duration}s` : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
MotionDiv.displayName = "MotionDiv";

export { MotionDiv };