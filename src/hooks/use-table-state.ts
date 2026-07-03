"use client";

import { useState, useMemo, useCallback, useDeferredValue } from "react";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface UseTableStateOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  defaultPageSize?: number;
  searchFields?: (keyof T)[];
}

interface UseTableStateReturn<T> {
  search: string;
  setSearch: (value: string) => void;
  deferredSearch: string;
  sort: SortConfig;
  setSort: (config: SortConfig) => void;
  toggleSort: (key: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  filteredData: T[];
  paginatedData: T[];
}

export function useTableState<T extends Record<string, unknown>>({
  data,
  defaultSort,
  defaultPageSize = 10,
  searchFields,
}: UseTableStateOptions<T>): UseTableStateReturn<T> {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sort, setSort] = useState<SortConfig>(
    defaultSort ?? { key: "", direction: "asc" }
  );
  const [page, setPage] = useState(1);
  const pageSize = defaultPageSize;

  const toggleSort = useCallback((key: string) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (deferredSearch && searchFields) {
      const query = deferredSearch.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value != null && String(value).toLowerCase().includes(query);
        })
      );
    }

    if (sort.key) {
      result.sort((a, b) => {
        const aVal = a[sort.key];
        const bVal = b[sort.key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sort.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, deferredSearch, searchFields, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return {
    search,
    setSearch,
    deferredSearch,
    sort,
    setSort,
    toggleSort,
    page,
    setPage,
    pageSize: defaultPageSize,
    totalPages,
    filteredData,
    paginatedData,
  };
}
