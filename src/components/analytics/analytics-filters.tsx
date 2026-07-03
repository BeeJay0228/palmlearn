"use client";

import { Select } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { getProgrammes } from "@/lib/programmes";
import { getAllUsers } from "@/lib/auth";
import { useMemo } from "react";
import type { AnalyticsFilter } from "@/lib/analytics";

interface AnalyticsFiltersProps {
  filter: AnalyticsFilter;
  onChange: (f: AnalyticsFilter) => void;
}

export function AnalyticsFilters({ filter, onChange }: AnalyticsFiltersProps) {
  const programmes = useMemo(() => getProgrammes(), []);
  const trainers = useMemo(() => getAllUsers().filter((u) => u.role === "trainer"), []);

  const update = (key: keyof AnalyticsFilter, value: string) => {
    onChange({ ...filter, [key]: value || undefined });
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-surface-secondary p-4 flex items-start gap-4 flex-col sm:flex-row">
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="h-4 w-4 text-content-tertiary" />
        <span className="text-sm font-medium text-content">Filters</span>
      </div>
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        <div className="w-full sm:w-36">
          <Select
            value={filter.dateRange || "all"}
            onChange={(e) => update("dateRange", e.target.value)}
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "year", label: "This Year" },
            ]}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filter.programmeId || ""}
            onChange={(e) => update("programmeId", e.target.value)}
            options={[
              { value: "", label: "All Programmes" },
              ...programmes.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={filter.trainerId || ""}
            onChange={(e) => update("trainerId", e.target.value)}
            options={[
              { value: "", label: "All Trainers" },
              ...trainers.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        </div>
        {filter.dateRange || filter.programmeId || filter.trainerId ? (
          <button
            onClick={() => onChange({})}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors shrink-0"
          >
            Clear Filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
