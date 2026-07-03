"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {showHome && (
        <>
          <Link
            href="/dashboard"
            className="flex items-center text-content-tertiary hover:text-content transition-colors"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-content-tertiary/50" />
        </>
      )}
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-content font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            ) : item.href ? (
              <>
                <Link
                  href={item.href}
                  className="text-content-secondary hover:text-content transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-content-tertiary/50 shrink-0" />
              </>
            ) : (
              <>
                <span className="text-content-secondary truncate max-w-[200px]">{item.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-content-tertiary/50 shrink-0" />
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export { Breadcrumb, type BreadcrumbItem };
