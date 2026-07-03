"use client";

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 w-full rounded-2xl border border-border/50 bg-surface shadow-2xl shadow-black/10 animate-scale-in max-h-[85vh] flex flex-col",
          sizeMap[size],
          className,
        )}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {(title || description) && (
          <div className="flex flex-col gap-1 px-6 pt-6 pb-0">
            {title && (
              <h2 className="text-lg font-semibold text-content tracking-tight pr-8">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-content-secondary leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="overflow-y-auto p-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}
