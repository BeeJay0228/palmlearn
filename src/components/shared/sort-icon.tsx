import { ChevronUp, ChevronDown, ChevronsUpDown, ArrowUpDown } from "lucide-react";

interface SortIconProps {
  column: string;
  currentSortKey: string;
  currentSortDir: "asc" | "desc";
  variant?: "chevron" | "updown";
}

export function SortIcon({ column, currentSortKey, currentSortDir, variant = "chevron" }: SortIconProps) {
  if (currentSortKey !== column) {
    return variant === "chevron"
      ? <ChevronsUpDown className="h-3.5 w-3.5 text-content-tertiary" />
      : <ArrowUpDown className="h-3.5 w-3.5 text-content-tertiary" />;
  }
  return currentSortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5" />
    : <ChevronDown className="h-3.5 w-3.5" />;
}
