"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";

interface SearchSuggestion {
  label: string;
  description?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect?: () => void;
}

interface GlobalSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  className?: string;
  loading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function GlobalSearch({
  placeholder = "Search learners, courses, programmes...",
  onSearch,
  suggestions = [],
  recentSearches = [],
  className,
  loading = false,
  value: controlledValue,
  onChange,
}: GlobalSearchProps) {
  const [internalValue, setInternalValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = onChange || setInternalValue;

  const hasSuggestions = suggestions.length > 0 || recentSearches.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
      if (e.key === "Enter") {
        onSearch?.(value);
        setShowDropdown(false);
      }
    },
    [value, onSearch],
  );

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-primary-200/60 dark:bg-primary-700/40 text-content font-medium rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center transition-all duration-200",
          focused && "ring-2 ring-primary-500/20",
        )}
      >
        {loading ? (
          <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 animate-spin pointer-events-none" />
        ) : (
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            setFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex h-11 w-full min-w-[280px] rounded-2xl border border-border bg-surface pl-10 pr-10 text-sm text-content placeholder:text-content-tertiary/60 transition-all duration-200 focus:border-primary-500/50 outline-none"
          aria-label="Search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {value && (
          <button
            onClick={() => {
              setValue("");
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/50 bg-surface shadow-xl shadow-black/5 animate-scale-in-sm z-50 overflow-hidden">
          {value.trim().length > 0 && suggestions.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1.5">
                <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                  Suggestions
                </p>
              </div>
              <div className="px-1.5 pb-1.5">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      suggestion.onSelect?.();
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-hover group"
                  >
                    {suggestion.icon && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary group-hover:bg-surface-tertiary transition-colors">
                        <suggestion.icon className="h-4 w-4 text-content-secondary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-content truncate">
                        {highlightMatch(suggestion.label, value)}
                      </p>
                      {suggestion.description && (
                        <p className="text-xs text-content-tertiary truncate">
                          {highlightMatch(suggestion.description, value)}
                        </p>
                      )}
                    </div>
                    {suggestion.href && (
                      <TrendingUp className="h-3.5 w-3.5 text-content-tertiary/50 group-hover:text-primary-500 transition-colors shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className={cn(suggestions.length > 0 && "border-t border-border/50")}>
              <div className="px-4 pt-3 pb-1.5">
                <p className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                  Recent Searches
                </p>
              </div>
              <div className="px-1.5 pb-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setValue(search);
                      onSearch?.(search);
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                  >
                    <Clock className="h-3.5 w-3.5 text-content-tertiary shrink-0" />
                    <span className="text-sm text-content-secondary">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showDropdown && !hasSuggestions && value.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border/50 bg-surface shadow-xl shadow-black/5 animate-scale-in-sm z-50">
          <div className="flex flex-col items-center py-8 text-center px-4">
            <Search className="h-8 w-8 text-content-tertiary/40 mb-3" />
            <p className="text-sm font-medium text-content">No results for &ldquo;{value}&rdquo;</p>
            <p className="text-xs text-content-tertiary mt-1">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
}
