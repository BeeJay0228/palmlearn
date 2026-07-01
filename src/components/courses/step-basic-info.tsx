"use client";

import type { Course, Difficulty } from "@/types";
import { DIFFICULTY_LABELS } from "@/types";
import { getCategories, getSubCategories } from "@/lib/organization";

interface StepBasicInfoProps {
  data: Partial<Course>;
  onChange: (data: Partial<Course>) => void;
}

export function StepBasicInfo({ data, onChange }: StepBasicInfoProps) {
  const categories = getCategories();
  const subCategories = data.categoryId ? getSubCategories(data.categoryId) : [];

  const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

  const update = (field: keyof Course, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-xs font-medium text-content-secondary">Course Title *</label>
          <input
            type="text"
            value={data.title || ""}
            onChange={(e) => update("title", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="e.g., Advanced Financial Analytics"
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-xs font-medium text-content-secondary">Subtitle</label>
          <input
            type="text"
            value={data.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="A brief tagline for the course"
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-xs font-medium text-content-secondary">Description *</label>
          <textarea
            value={data.description || ""}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all resize-none"
            placeholder="Describe what learners will learn in this course"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Thumbnail URL</label>
          <input
            type="text"
            value={data.thumbnail || ""}
            onChange={(e) => update("thumbnail", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="https://example.com/thumb.jpg"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Banner URL</label>
          <input
            type="text"
            value={data.banner || ""}
            onChange={(e) => update("banner", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Instructor *</label>
          <input
            type="text"
            value={data.instructor || ""}
            onChange={(e) => update("instructor", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Full name of instructor"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Language</label>
          <input
            type="text"
            value={data.language || ""}
            onChange={(e) => update("language", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="e.g., English"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Category *</label>
          <select
            value={data.categoryId || ""}
            onChange={(e) => onChange({ ...data, categoryId: e.target.value, subCategoryId: "" })}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Sub-Category</label>
          <select
            value={data.subCategoryId || ""}
            onChange={(e) => update("subCategoryId", e.target.value)}
            disabled={!data.categoryId}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select sub-category</option>
            {subCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Estimated Duration (minutes) *</label>
          <input
            type="number"
            min={1}
            value={data.estimatedDuration || ""}
            onChange={(e) => update("estimatedDuration", parseInt(e.target.value) || 0)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="e.g., 240"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-content-secondary">Difficulty *</label>
          <select
            value={data.difficulty || ""}
            onChange={(e) => update("difficulty", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer"
          >
            <option value="">Select difficulty</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
