"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/constants";
import { useScroll } from "@/hooks/use-scroll";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sun, Moon, Menu, X } from "lucide-react";

export function LandingHeader() {
  const { isScrolled } = useScroll(20);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container-site flex h-16 lg:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-primary-600 text-white group-hover:bg-primary-700 transition-colors duration-200">
            <GraduationCap className="h-5 w-5 lg:h-5.5 lg:w-5.5" />
          </div>
          <span className="text-lg lg:text-xl font-bold tracking-tight text-content">
            {APP_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-content-secondary hover:text-content rounded-lg hover:bg-surface-hover transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <Button variant="primary" size="sm" className="hidden md:inline-flex">
            Get Started
          </Button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="fixed top-16 right-0 left-0 z-50 bg-surface border-b border-border md:hidden animate-slide-down">
            <div className="flex flex-col p-4 gap-2">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-content-secondary hover:text-content rounded-lg hover:bg-surface-hover transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <hr className="border-border my-2" />
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-content-secondary hover:text-content rounded-lg hover:bg-surface-hover transition-colors"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
              <Button variant="primary" className="mt-2 w-full">
                Get Started
              </Button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
