"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCourses } from "@/lib/courses";
import { getAssignments } from "@/lib/assignments";
import { TargetAudienceBuilder } from "./target-audience-builder";
import { Check, X, BookOpen } from "lucide-react";
import type { Programme, TargetAudience } from "@/types";

interface ProgrammeBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Programme, "id" | "createdAt" | "updatedAt">) => void;
  editProgramme?: Programme;
}

function defaultTargetAudience(): TargetAudience {
  return { type: "organization", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] };
}

export function ProgrammeBuilder({ open, onClose, onSave, editProgramme }: ProgrammeBuilderProps) {
  const [name, setName] = useState(editProgramme?.name || "");
  const [description, setDescription] = useState(editProgramme?.description || "");
  const [courseIds, setCourseIds] = useState<string[]>(editProgramme?.courseIds || []);
  const [assignmentIds, setAssignmentIds] = useState<string[]>(editProgramme?.assignmentIds || []);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(editProgramme?.targetAudience || defaultTargetAudience());
  const [startDate, setStartDate] = useState(editProgramme?.startDate?.split("T")[0] || "");
  const [endDate, setEndDate] = useState(editProgramme?.endDate?.split("T")[0] || "");
  const [error, setError] = useState("");

  const courses = getCourses().filter((c) => c.status === "published");
  const assignments = getAssignments().filter((a) => a.status === "active");

  function toggleCourse(id: string) {
    setCourseIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  }

  function toggleAssignment(id: string) {
    setAssignmentIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  }

  function handleSave() {
    if (!name.trim()) { setError("Name is required"); return; }
    if (courseIds.length === 0) { setError("Select at least one course"); return; }
    setError("");
    onSave({
      name: name.trim(),
      description: description.trim(),
      courseIds,
      assignmentIds,
      targetAudience,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      status: editProgramme?.status || "draft",
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="text-lg font-semibold text-content">{editProgramme ? "Edit Training Programme" : "Create Training Programme"}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {error && <p className="text-xs text-danger bg-danger/5 rounded-xl px-3 py-2">{error}</p>}

          <Input label="Programme Name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} floating placeholder="e.g. Q2 Compliance Blitz" />
          <div>
            <label className="text-sm font-medium text-content mb-1.5 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the training programme..."
              rows={3}
              className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all resize-none"
            />
          </div>

          {/* Course selection */}
          <div>
            <label className="text-sm font-medium text-content mb-2 block">Courses ({courseIds.length} selected)</label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-border divide-y divide-border/60">
              {courses.length === 0 ? (
                <div className="p-4 text-center text-sm text-content-tertiary">No published courses</div>
              ) : (
                courses.map((course) => {
                  const selected = courseIds.includes(course.id);
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => toggleCourse(course.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-secondary/60",
                        selected && "bg-primary-50/50 dark:bg-primary-950/20",
                      )}
                    >
                      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", selected ? "bg-primary-600 border-primary-600" : "border-border")}>
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-content truncate">{course.title}</p>
                        <p className="text-xs text-content-tertiary">{course.difficulty} &middot; {course.estimatedDuration}min</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Assignment selection */}
          <div>
            <label className="text-sm font-medium text-content mb-2 block">Assignments ({assignmentIds.length} selected) <span className="text-content-tertiary font-normal">(optional)</span></label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-border divide-y divide-border/60">
              {assignments.length === 0 ? (
                <div className="p-4 text-center text-sm text-content-tertiary">No active assignments</div>
              ) : (
                assignments.map((asgn) => {
                  const selected = assignmentIds.includes(asgn.id);
                  return (
                    <button
                      key={asgn.id}
                      type="button"
                      onClick={() => toggleAssignment(asgn.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-secondary/60",
                        selected && "bg-primary-50/50 dark:bg-primary-950/20",
                      )}
                    >
                      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", selected ? "bg-primary-600 border-primary-600" : "border-border")}>
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <p className="text-sm font-medium text-content truncate">{asgn.name}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-content mb-1.5 block">Start Date (optional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-content mb-1.5 block">End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all"
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-sm font-medium text-content mb-2 block">Target Audience</label>
            <TargetAudienceBuilder value={targetAudience} onChange={setTargetAudience} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border sticky bottom-0 bg-surface z-10">
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editProgramme ? "Update" : "Create"} Training Programme</Button>
        </div>
      </div>
    </div>
  );
}
