"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  title: string;
  description?: string;
  onComplete?: () => void;
  variant?: "success" | "premium";
  duration?: number;
}

export function Celebration({
  show,
  title,
  description,
  onComplete,
  variant = "success",
  duration = 2000,
}: CelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onComplete?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center pointer-events-none transition-all duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-3 text-center transition-all duration-300",
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-4",
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full animate-scale-in",
            variant === "success"
              ? "bg-success-light/80 dark:bg-success/10"
              : "bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20",
          )}
        >
          <div className="relative">
            {variant === "premium" && (
              <Sparkles className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-float" />
            )}
            {variant === "success" && (
              <CheckCircle2 className="h-8 w-8 text-success animate-scale-in" />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-content">{title}</p>
          {description && (
            <p className="text-sm text-content-secondary">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
