"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { AnimationProvider } from "@/providers/animation-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnimationProvider>
        <TooltipProvider delayDuration={200} skipDelayDuration={400}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </TooltipProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
}
