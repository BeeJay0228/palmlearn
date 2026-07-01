"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { AnimationProvider } from "@/providers/animation-provider";
import { AuthProvider } from "@/contexts/auth-context";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnimationProvider>
        <AuthProvider>{children}</AuthProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
}
