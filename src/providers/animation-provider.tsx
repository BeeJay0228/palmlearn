"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
