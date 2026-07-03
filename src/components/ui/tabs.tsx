"use client";

import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  const setValue = (val: string) => {
    if (!isControlled) setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <div className={className} data-active-value={activeValue} ref={(el) => { if (el) (el as unknown as { __setValue?: (v: string) => void }).__setValue = setValue; }}>
      {children}
    </div>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-surface-secondary p-1 border border-border/50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ className, value, children, ...props }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-ring",
        "data-[state=active]:bg-surface data-[state=active]:text-content data-[state=active]:shadow-sm",
        "text-content-secondary hover:text-content",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      data-state="inactive"
      onClick={(e) => {
        const parent = (e.currentTarget as HTMLElement).closest('[data-active-value]') as HTMLElement | null;
        if (parent) {
          const setValueFn = (parent as unknown as { __setValue?: (v: string) => void }).__setValue;
          if (setValueFn) setValueFn(value);
        }
        props.onClick?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ className, children, ...props }: TabsContentProps) {
  return (
    <div
      className={cn("mt-4 focus-ring", className)}
      data-state="inactive"
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
