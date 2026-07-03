"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENT_TYPE_LABELS, ASSIGNMENT_PRIORITY_LABELS,
  type AssignmentType, type AssignmentPriority,
} from "@/types";

const NAME_MAX = 100;
const DESC_MAX = 500;

interface AssignmentWizardDetailsProps {
  name: string;
  description: string;
  assignmentType: AssignmentType;
  priority: AssignmentPriority;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTypeChange: (v: AssignmentType) => void;
  onPriorityChange: (v: AssignmentPriority) => void;
  errors: Record<string, string>;
  markDirty: () => void;
}

export function AssignmentWizardDetails({
  name, description, assignmentType, priority,
  onNameChange, onDescriptionChange, onTypeChange, onPriorityChange,
  errors, markDirty,
}: AssignmentWizardDetailsProps) {
  return (
    <div className="space-y-4" role="form" aria-label="Assignment details">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-content">Assignment Details</h3>
        <p className="text-sm text-content-secondary">Define the name, type, and priority of this assignment.</p>
      </div>
      <div>
        <Input label="Assignment Name" value={name}
          onChange={(e) => { onNameChange(e.target.value); markDirty(); }}
          error={errors.name} floating placeholder="e.g. New Hire Compliance Training"
          maxLength={NAME_MAX + 10} />
        <p className={cn("mt-1 text-xs text-right", name.length > NAME_MAX ? "text-danger" : "text-content-tertiary")}>
          {name.length}/{NAME_MAX}
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-content mb-1.5 block">Description <span className="text-content-tertiary font-normal">(optional)</span></label>
        <textarea value={description}
          onChange={(e) => { onDescriptionChange(e.target.value); markDirty(); }}
          placeholder="Describe what this assignment covers..." rows={3} maxLength={DESC_MAX + 10}
          className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all resize-none" />
        <p className={cn("mt-1 text-xs text-right", description.length > DESC_MAX ? "text-danger" : "text-content-tertiary")}>
          {description.length}/{DESC_MAX}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Assignment Type" value={assignmentType}
          onChange={(e) => { onTypeChange(e.target.value as AssignmentType); markDirty(); }}
          options={Object.entries(ASSIGNMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
        <Select label="Priority" value={priority}
          onChange={(e) => { onPriorityChange(e.target.value as AssignmentPriority); markDirty(); }}
          options={Object.entries(ASSIGNMENT_PRIORITY_LABELS).map(([value, label]) => ({ value, label }))} />
      </div>
    </div>
  );
}