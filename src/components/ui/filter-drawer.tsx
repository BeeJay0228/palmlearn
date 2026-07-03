"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Drawer } from "./drawer";
import { Button } from "./button";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { Input } from "./input";
import { Select } from "./select";
import {
  Filter,
  X,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Check,
} from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  type: "search" | "select" | "multi-select" | "date-range" | "status";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  onSave?: (name: string) => void;
  savedFilters?: SavedFilter[];
  onLoadSaved?: (filter: SavedFilter) => void;
  onDeleteSaved?: (id: string) => void;
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  activeFilters,
  onFilterChange,
  onReset,
  onSave,
  savedFilters = [],
  onLoadSaved,
  onDeleteSaved,
}: FilterDrawerProps) {
  const [saveName, setSaveName] = useState("");
  const [showSave, setShowSave] = useState(false);

  const activeCount = Object.entries(activeFilters).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
  ).length;

  const quickFilters = filters.slice(0, 3);
  const advancedFilters = filters.slice(3);

  return (
    <Drawer open={open} onClose={onClose} side="right" size="md">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-content-secondary" />
            <h3 className="text-base font-semibold text-content">Filters</h3>
            {activeCount > 0 && (
              <Badge variant="default" size="sm">{activeCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeCount > 0 && (
              <Button variant="tertiary" size="sm" onClick={onReset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-5 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-3">
                Quick Filters
              </h4>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => {
                  const isActive = activeFilters[filter.key] !== undefined && activeFilters[filter.key] !== "" && activeFilters[filter.key] !== null;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => {
                        if (isActive) {
                          onFilterChange(filter.key, undefined);
                        } else {
                          if (filter.options && filter.options.length > 0) {
                            onFilterChange(filter.key, filter.options[0].value);
                          } else {
                            onFilterChange(filter.key, "true");
                          }
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-surface-secondary text-content-secondary hover:bg-surface-hover border border-border/50",
                      )}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-5">
              <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                All Filters
              </h4>
              {[...quickFilters, ...advancedFilters].map((filter) => (
                <div key={filter.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-content">{filter.label}</label>
                  {filter.type === "search" && (
                    <Input
                      placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                      value={activeFilters[filter.key] || ""}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      variant="filled"
                      clearable
                      onClear={() => onFilterChange(filter.key, "")}
                    />
                  )}
                  {filter.type === "select" && filter.options && (
                    <Select
                      value={activeFilters[filter.key] || ""}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      options={filter.options}
                      placeholder={filter.placeholder || `All ${filter.label}`}
                    />
                  )}
                  {filter.type === "status" && filter.options && (
                    <div className="flex flex-wrap gap-2">
                      {filter.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onFilterChange(filter.key, opt.value)}
                          className={cn(
                            "rounded-xl px-3 py-1.5 text-xs font-medium transition-all border",
                            activeFilters[filter.key] === opt.value
                              ? "bg-primary-50 text-primary-700 border-primary-300 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-700"
                              : "bg-surface-secondary text-content-secondary border-border/50 hover:bg-surface-hover",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                      {activeFilters[filter.key] && (
                        <button
                          onClick={() => onFilterChange(filter.key, undefined)}
                          className="text-xs text-content-tertiary hover:text-content px-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                  {filter.type === "date-range" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="date" variant="filled" placeholder="From" />
                      <Input type="date" variant="filled" placeholder="To" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {savedFilters.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                    Saved Filters
                  </h4>
                  {savedFilters.map((sf) => (
                    <div
                      key={sf.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2 bg-surface-secondary hover:bg-surface-hover transition-colors cursor-pointer group"
                      onClick={() => onLoadSaved?.(sf)}
                    >
                      <div className="flex items-center gap-2">
                        <Save className="h-3.5 w-3.5 text-content-tertiary" />
                        <span className="text-sm text-content">{sf.name}</span>
                      </div>
                      {onDeleteSaved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSaved(sf.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg text-content-tertiary hover:text-danger hover:bg-danger-light/30 transition-all"
                          aria-label={`Delete ${sf.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border/50 p-4">
          {showSave ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                variant="filled"
                inputSize="sm"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onSave?.(saveName);
                  setSaveName("");
                  setShowSave(false);
                }}
                disabled={!saveName.trim()}
              >
                Save
              </Button>
              <Button variant="tertiary" size="sm" onClick={() => setShowSave(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onSave && (
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setShowSave(true)}>
                  <Save className="h-3.5 w-3.5" />
                  Save Filter
                </Button>
              )}
              <Button variant="tertiary" size="sm" className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
