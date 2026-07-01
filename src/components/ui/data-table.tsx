"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

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
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        <div className="p-5 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 rounded-xl shimmer-bg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="flex h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] outline-none"
          />
        </div>
      )}

      <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/80">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider",
                      col.sortable !== false && "cursor-pointer select-none hover:text-content transition-colors",
                      col.className,
                    )}
                    onClick={() => col.sortable !== false && toggleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && (
                        sortKey === col.key ? (
                          sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-content-tertiary" />
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
                  <td colSpan={columns.length} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-content-secondary">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className={cn(
                      "transition-all duration-150",
                      onRowClick ? "cursor-pointer" : "",
                      "hover:bg-surface-secondary/60",
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3.5 text-sm text-content", col.className)}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-content-tertiary">
            Showing {page * pageSize + 1}&ndash;{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all",
                  i === page
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-content-secondary hover:text-content hover:bg-surface-hover",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
