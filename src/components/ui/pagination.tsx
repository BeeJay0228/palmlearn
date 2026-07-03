"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showInfo = true,
  totalItems,
  pageSize,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {showInfo && totalItems && pageSize && (
        <p className="text-sm text-content-tertiary">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)}&ndash;{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-sm text-content-tertiary">
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all",
                page === currentPage
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-content-secondary hover:text-content hover:bg-surface-hover",
              )}
            >
              {page}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
    pages.push(total);
  }
  return pages;
}
