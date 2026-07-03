"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Search, Check, X,
  SlidersHorizontal,
} from "lucide-react";
import { Pagination } from "./pagination";
import { SkeletonTable } from "./skeleton";
import { Button } from "./button";
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
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  hiddenColumns?: Set<string>;
  onColumnVisibilityChange?: (columns: Set<string>) => void;
  onExport?: () => void;
  totalItems?: number;
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
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  hiddenColumns,
  onColumnVisibilityChange,
  totalItems,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

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

  const visibleColumns = useMemo(() => {
    if (!hiddenColumns) return columns;
    return columns.filter((col) => !hiddenColumns.has(col.key));
  }, [columns, hiddenColumns]);

  const allSelected = paginated.length > 0 && paginated.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected = paginated.some((item) => selectedIds.has(keyExtractor(item)));

  const toggleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }, [sortKey]);

  const toggleSelect = useCallback((id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  }, [selectedIds, onSelectionChange]);

  const toggleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const next = new Set(selectedIds);
      paginated.forEach((item) => next.delete(keyExtractor(item)));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      paginated.forEach((item) => next.add(keyExtractor(item)));
      onSelectionChange(next);
    }
  }, [allSelected, selectedIds, paginated, onSelectionChange, keyExtractor]);

  const toggleColumnVisibility = useCallback((key: string) => {
    if (!onColumnVisibilityChange || !hiddenColumns) return;
    const next = new Set(hiddenColumns);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onColumnVisibilityChange(next);
  }, [hiddenColumns, onColumnVisibilityChange]);

  if (loading) {
    return <SkeletonTable rows={6} columns={columns.length} className={className} />;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-3 flex-wrap">
        {searchable && (
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="flex h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
              aria-label="Search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md text-content-tertiary hover:text-content transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {onColumnVisibilityChange && (
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="h-11"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Columns
            </Button>
            {showColumnMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColumnMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-2xl border border-border/50 bg-surface p-1.5 shadow-xl shadow-black/5 animate-scale-in-sm">
                  {columns.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumnVisibility(col.key)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
                    >
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                        hiddenColumns?.has(col.key)
                          ? "border-border bg-surface"
                          : "border-primary-500 bg-primary-500",
                      )}>
                        {!hiddenColumns?.has(col.key) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {col.header}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className={cn(
        "rounded-2xl border border-border overflow-hidden bg-surface shadow-sm",
        compact && "rounded-xl",
      )}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className={cn("border-b border-border bg-surface-secondary/80", stickyHeader && "sticky top-0 z-10")}>
                {selectable && (
                  <th className={cn(compact ? "px-3 py-2.5" : "px-4 py-3.5", "w-10")}>
                    <button
                      onClick={toggleSelectAll}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                        allSelected
                          ? "bg-primary-600 border-primary-600 text-white"
                          : someSelected
                            ? "bg-primary-600/30 border-primary-600"
                            : "border-border hover:border-content-tertiary",
                      )}
                      aria-label={allSelected ? "Deselect all" : "Select all"}
                    >
                      {allSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </th>
                )}
                {visibleColumns.map((col) => (
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
                  <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className={cn("text-center", compact ? "px-3 py-16" : "px-4 py-20")}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-content-secondary">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "transition-all duration-150",
                        onRowClick && !selectable ? "cursor-pointer" : "",
                        "group",
                        isSelected && "bg-primary-50/50 dark:bg-primary-950/20",
                        !isSelected && "hover:bg-surface-secondary/60",
                        striped && !isSelected && idx % 2 === 1 && "bg-surface-secondary/30",
                      )}
                      onClick={() => {
                        if (selectable) {
                          toggleSelect(id);
                        } else {
                          onRowClick?.(item);
                        }
                      }}
                    >
                      {selectable && (
                        <td className={cn(compact ? "px-3 py-2.5" : "px-4 py-3.5", "w-10")}>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelect(id); }}
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "bg-primary-600 border-primary-600 text-white"
                                : "border-border hover:border-content-tertiary group-hover:border-content-tertiary",
                            )}
                            aria-label={isSelected ? "Deselect" : "Select"}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      )}
                      {visibleColumns.map((col) => (
                        <td key={col.key} className={cn(
                          compact ? "px-3 py-2.5" : "px-4 py-3.5",
                          "text-sm text-content",
                          col.className,
                        )}>
                          {col.render ? col.render(item) : String(item[col.key as keyof T] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems || sorted.length}
        pageSize={pageSize}
      />
    </div>
  );
}
