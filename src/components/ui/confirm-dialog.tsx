"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 animate-scale-in">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            variant === "danger" && "bg-danger/10",
            variant === "warning" && "bg-warning/10",
            variant === "default" && "bg-primary-50 dark:bg-primary-950/30",
          )}>
            <AlertTriangle className={cn(
              "h-7 w-7",
              variant === "danger" && "text-danger",
              variant === "warning" && "text-warning",
              variant === "default" && "text-primary-600",
            )} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-content">{title}</h3>
            <p className="text-sm text-content-secondary leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end mt-6">
          <Button variant="tertiary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
