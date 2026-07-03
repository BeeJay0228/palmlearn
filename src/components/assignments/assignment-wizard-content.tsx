"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCourses } from "@/lib/courses";
import { getProgrammes } from "@/lib/programmes";
import { Search, Check, X } from "lucide-react";

interface AssignmentWizardContentProps {
  courseIds: string[];
  campaignId: string;
  onCourseIdsChange: (ids: string[]) => void;
  onCampaignIdChange: (id: string) => void;
  errors: Record<string, string>;
  markDirty: () => void;
}

export function AssignmentWizardContent({
  courseIds, campaignId, onCourseIdsChange, onCampaignIdChange, errors, markDirty,
}: AssignmentWizardContentProps) {
  const [courseSearch, setCourseSearch] = useState("");
  const courses = useMemo(() => getCourses().filter((c) => c.status === "published"), []);
  const programmes = useMemo(() => getProgrammes(), []);
  const selectedCourses = courses.filter((c) => courseIds.includes(c.id));

  const filteredCourses = useMemo(() => {
    if (!courseSearch) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter((c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  function toggleCourse(id: string) {
    onCourseIdsChange(courseIds.includes(id) ? courseIds.filter((c) => c !== id) : [...courseIds, id]);
    markDirty();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-content">Learning Content</h3>
        <p className="text-sm text-content-secondary">Select courses and optionally link a training programme.</p>
      </div>
      <div>
        <label className="text-sm font-medium text-content mb-2 block">Training Programme <span className="text-content-tertiary font-normal">(optional)</span></label>
        <select value={campaignId} onChange={(e) => { onCampaignIdChange(e.target.value); markDirty(); }}
          className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all">
          <option value="">No programme</option>
          {programmes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-content mb-2 block">Select Courses <span className="text-content-secondary">({courseIds.length} selected)</span></label>
        {errors.courses && <p className="text-xs text-danger mb-2" role="alert">{errors.courses}</p>}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input type="text" value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} placeholder="Search courses..." className="flex h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all" />
        </div>
        {selectedCourses.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedCourses.map((c) => (
              <Badge key={c.id} variant="secondary" size="sm">
                {c.title}
                <button type="button" onClick={() => toggleCourse(c.id)} className="ml-1 hover:text-content"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-xl border border-border p-2">
          {filteredCourses.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-sm text-content-tertiary">{courseSearch ? "No courses match your search" : "No published courses available"}</div>
          ) : (
            filteredCourses.map((course) => {
              const selected = courseIds.includes(course.id);
              return (
                <button key={course.id} type="button" onClick={() => toggleCourse(course.id)}
                  className={cn("flex items-center gap-3 rounded-xl p-3 text-left transition-all border",
                    selected ? "bg-primary-50/50 border-primary-300 dark:bg-primary-950/20 dark:border-primary-700" : "bg-surface border-border hover:border-border-strong")}>
                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", selected ? "bg-primary-600 border-primary-600" : "border-border")}>
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-content truncate">{course.title}</p>
                    <p className="text-xs text-content-tertiary truncate">{course.instructor} &middot; {course.difficulty}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}