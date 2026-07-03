"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ToastType } from "@/types";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  undoable?: boolean;
  onUndo?: () => void;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const iconMap: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: "border-l-success bg-success-light/10 dark:bg-success/5",
  error: "border-l-danger bg-danger-light/10 dark:bg-danger/5",
  warning: "border-l-warning bg-warning-light/10 dark:bg-warning/5",
  info: "border-l-info bg-info-light/10 dark:bg-info/5",
};

const iconColorMap: Record<ToastType, string> = {
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
  info: "text-info",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [ { ...t, id }, ...prev ]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = iconMap[t.type];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(t.id), 300);
    }, t.duration || 4000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [t.id, t.duration, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border border-border/50 bg-surface shadow-xl shadow-black/5 p-4 transition-all duration-300 border-l-4",
        colorMap[t.type],
        visible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-8 opacity-0 scale-95",
      )}
      role="alert"
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColorMap[t.type])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-content">{t.title}</p>
        {t.message && (
          <p className="text-xs text-content-secondary mt-0.5">{t.message}</p>
        )}
        {t.undoable && (
          <button
            onClick={() => {
              t.onUndo?.();
              onDismiss(t.id);
            }}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 mt-1.5 transition-colors"
          >
            Undo
          </button>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(t.id), 300);
        }}
        className="flex h-6 w-6 items-center justify-center rounded-lg text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
