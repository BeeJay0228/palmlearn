"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import { Pagination } from "./pagination";
import { SkeletonTable } from "./skeleton";
import type { TableColumn } from "@/types";

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  compact?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  pageSize = 10,
  emptyMessage = "No data found.",
  className,
  onRowClick,
  loading = false,
  striped = false,
  stickyHeader = true,
  compact = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    const keys = searchKeys || (columns.length > 0 ? columns.map((c) => c.key as keyof T) : []);
    return data.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  if (loading) {
    return <SkeletonTable rows={6} columns={columns.length} className={className} />;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="flex h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
            aria-label="Search"
          />
        </div>
      )}

      <div className={cn(
        "rounded-2xl border border-border overflow-hidden bg-surface shadow-sm",
        compact && "rounded-xl",
      )}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className={cn("border-b border-border bg-surface-secondary/80", stickyHeader && "sticky top-0 z-10")}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      compact ? "px-3 py-2.5" : "px-4 py-3.5",
                      "text-left text-xs font-semibold text-content-secondary uppercase tracking-wider",
                      col.sortable !== false && "cursor-pointer select-none hover:text-content transition-colors",
                      col.className,
                    )}
                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                    scope="col"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && (
                        sortKey === col.key ? (
                          sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-content-tertiary shrink-0" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className={cn("text-center", compact ? "px-3 py-16" : "px-4 py-20")}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-content-secondary">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr
                    key={keyExtractor(item)}
                    className={cn(
                      "transition-all duration-150",
                      onRowClick ? "cursor-pointer" : "",
                      "hover:bg-surface-secondary/60",
                      striped && idx % 2 === 1 && "bg-surface-secondary/30",
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn(
                        compact ? "px-3 py-2.5" : "px-4 py-3.5",
                        "text-sm text-content",
                        col.className,
                      )}>
                        {col.render ? col.render(item) : String(item[col.key as keyof T] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={sorted.length}
        pageSize={pageSize}
      />
    </div>
  );
}
