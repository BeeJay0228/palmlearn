"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { AnimationProvider } from "@/providers/animation-provider";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnimationProvider>{children}</AnimationProvider>
    </ThemeProvider>
  );
}
