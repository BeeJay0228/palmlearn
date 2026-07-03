"use client";

import { type HTMLMotionProps, m } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type AnimationVariant =
  | "fade-in"
  | "fade-in-up"
  | "fade-in-down"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "scale-in-sm"
  | "none";

const variants: Record<string, HTMLMotionProps<"div">> = {
  "fade-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "fade-in-up": {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  "fade-in-down": {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  },
  "slide-down": {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
  },
  "slide-left": {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
  },
  "slide-right": {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 16 },
  },
  "scale-in": {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
  },
  "scale-in-sm": {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  none: {},
};

interface MotionDivProps extends Omit<HTMLMotionProps<"div">, "animate" | "initial" | "exit"> {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
}

const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ className, variant = "fade-in-up", delay = 0, duration, children, ...props }, ref) => {
    const v = variants[variant] || variants["fade-in-up"];
    return (
      <m.div
        ref={ref}
        className={cn(className)}
        {...v}
        transition={{
          duration: duration || 0.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        {...props}
      >
        {children}
      </m.div>
    );
  },
);
MotionDiv.displayName = "MotionDiv";

export { MotionDiv, type AnimationVariant };
