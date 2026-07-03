"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Drawer({ open, onClose, title, children, className, side = "right", size = "md" }: DrawerProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

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

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-all duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed inset-y-0 z-50 w-full border-border bg-surface shadow-2xl transition-transform duration-300 ease-out",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          open
            ? side === "right" ? "translate-x-0" : "translate-x-0"
            : side === "right" ? "translate-x-full" : "-translate-x-full",
          sizeMap[size],
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <h2 className="text-lg font-semibold text-content">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </>
  );
}
