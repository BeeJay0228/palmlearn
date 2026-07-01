"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";
import { getResources } from "@/lib/resources";
import { Search, FileText, Video, FileImage, File, Link, Plus, X, Upload } from "lucide-react";

interface StepResourcesProps {
  course: Course;
  onChange: (course: Course) => void;
}

const RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  video: Video,
  pdf: FileText,
  image: FileImage,
  ppt: File,
  doc: FileText,
  link: Link,
  zip: File,
  template: FileText,
};

const RESOURCE_COLORS: Record<string, string> = {
  video: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
  pdf: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
  image: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
  ppt: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
  doc: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400",
  link: "text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400",
  zip: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
  template: "text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400",
};

export function StepResources({ course, onChange }: StepResourcesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const allResources = getResources();

  const filtered = allResources.filter((r) => {
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const isAttached = (id: string) => course.resources.includes(id);

  const toggleResource = (resourceId: string) => {
    const updated = isAttached(resourceId)
      ? course.resources.filter((r) => r !== resourceId)
      : [...course.resources, resourceId];
    onChange({ ...course, resources: updated });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface-secondary pl-9 pr-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Search resources..."
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="ppt">PowerPoint</option>
          <option value="doc">Document</option>
          <option value="link">Link</option>
          <option value="zip">Archive</option>
          <option value="template">Template</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-content-secondary">
          {course.resources.length} resource{course.resources.length !== 1 ? "s" : ""} attached · {filtered.length} available
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border bg-surface-secondary/50">
          <Upload className="h-10 w-10 text-content-tertiary mb-3" />
          <p className="text-sm font-medium text-content-secondary">No resources found</p>
          <p className="text-xs text-content-tertiary mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((resource) => {
            const Icon = RESOURCE_ICONS[resource.type] || FileText;
            const colorClass = RESOURCE_COLORS[resource.type] || "text-content-secondary bg-surface-secondary";
            const attached = isAttached(resource.id);
            return (
              <button
                key={resource.id}
                type="button"
                onClick={() => toggleResource(resource.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                  attached
                    ? "border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 ring-1 ring-primary-600"
                    : "border-border bg-surface-secondary hover:border-border-strong hover:bg-surface-hover"
                )}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content truncate">{resource.name}</p>
                  <p className="text-xs text-content-tertiary truncate mt-0.5">{resource.description}</p>
                  <p className="text-xs text-content-tertiary/70 mt-1">{resource.size} · {resource.type.toUpperCase()}</p>
                </div>
                <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all", attached ? "bg-primary-600 border-primary-600 text-white" : "border-border")}>
                  {attached ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 text-content-tertiary" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
