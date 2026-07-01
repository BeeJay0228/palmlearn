"use client";

import { m, type TargetAndTransition } from "framer-motion";
import type { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

type AnimationType =
  | "fadeIn"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleIn"
  | "none";

interface MotionDivProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  as?: ElementType;
}

const animations: Record<AnimationType, {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
}> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },
  none: {
    initial: {},
    animate: {},
  },
};

export function MotionDiv({
  children,
  className,
  animation = "slideUp",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
  as: Tag = "div",
}: MotionDivProps) {
  const { initial, animate } = animations[animation];

  return (
    <m.div
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Tag>{children}</Tag>
    </m.div>
  );
}
