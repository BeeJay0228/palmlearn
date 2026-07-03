"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, type EventType } from "@/types";

interface EventWizardBasicProps {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  banner: string;
  onBannerChange: (v: string) => void;
  trainerId: string;
  onTrainerIdChange: (v: string) => void;
  categoryId: string;
  onCategoryIdChange: (v: string) => void;
  subCategoryId: string;
  onSubCategoryIdChange: (v: string) => void;
  eventType: EventType;
  onEventTypeChange: (v: EventType) => void;
  trainers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  subCategories: { id: string; name: string }[];
  errors: Record<string, string>;
}

export function EventWizardBasic({
  title, onTitleChange, description, onDescriptionChange, banner, onBannerChange,
  trainerId, onTrainerIdChange, categoryId, onCategoryIdChange,
  subCategoryId, onSubCategoryIdChange, eventType, onEventTypeChange,
  trainers, categories, subCategories, errors,
}: EventWizardBasicProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Input label="Event Title" value={title} onChange={(e) => onTitleChange(e.target.value)} error={errors.title} placeholder="e.g. Annual Compliance Training" />
        </div>
        <div className="space-y-2">
          <Select label="Event Type" value={eventType} onChange={(e) => onEventTypeChange(e.target.value as EventType)} options={Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-content-secondary">Description</label>
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Describe the event, learning objectives, and what participants can expect..." rows={4} className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Select label="Trainer" value={trainerId} onChange={(e) => onTrainerIdChange(e.target.value)} options={trainers.map((t) => ({ value: t.id, label: t.name }))} error={errors.trainerId} />
        </div>
        <div className="space-y-2">
          <Select label="Category" value={categoryId} onChange={(e) => { onCategoryIdChange(e.target.value); onSubCategoryIdChange(""); }} options={categories.map((c) => ({ value: c.id, label: c.name }))} error={errors.categoryId} />
        </div>
        <div className="space-y-2">
          <Select label="Sub-Category" value={subCategoryId} onChange={(e) => onSubCategoryIdChange(e.target.value)} options={subCategories.map((sc) => ({ value: sc.id, label: sc.name }))} error={errors.subCategoryId} disabled={!categoryId} />
        </div>
      </div>
      <div className="space-y-2">
        <Input label="Event Banner URL (optional)" value={banner} onChange={(e) => onBannerChange(e.target.value)} placeholder="https://example.com/banner.jpg" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => onEventTypeChange(key as EventType)} className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition-all border", eventType === key ? EVENT_TYPE_COLORS[key as EventType] + " border-current" : "text-content-tertiary border-border hover:border-content-tertiary")}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}