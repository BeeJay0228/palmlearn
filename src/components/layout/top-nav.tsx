"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Sun, Moon, Bell, Search, Menu } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

interface TopNavProps {
  className?: string;
  onMenuToggle?: () => void;
  title?: string;
}

export function TopNav({ className, onMenuToggle, title }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-xl px-6",
        className,
      )}
    >
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {title && (
        <h1 className="text-lg font-semibold text-content flex-1">{title}</h1>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">
          <Search className="h-4 w-4" />
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
