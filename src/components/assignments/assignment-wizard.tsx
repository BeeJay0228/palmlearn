"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TargetAudienceBuilder } from "./target-audience-builder";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENT_TYPE_LABELS, ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_TYPE_COLORS, ASSIGNMENT_PRIORITY_COLORS,
  AUDIENCE_TYPE_LABELS,
  type Assignment, type AssignmentType, type AssignmentPriority, type AssignmentStatus,
  type TargetAudience, type AssignmentSchedule, type AssignmentNotifications,
} from "@/types";
import { getCourses } from "@/lib/courses";
import { getProgrammes } from "@/lib/programmes";
import { getUsers } from "@/lib/users";
import {
  X, Check, ArrowLeft, ArrowRight, FileText, BookOpen, Users, Calendar, Bell, Eye,
  Search, AlertTriangle, Loader2, Save, Send,
} from "lucide-react";

interface AssignmentWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => void;
  editAssignment?: Assignment;
}

type WizardStep = "name-type" | "content" | "audience" | "schedule" | "notifications" | "review";

const STEPS: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "name-type", label: "Details", icon: FileText },
  { key: "content", label: "Content", icon: BookOpen },
  { key: "audience", label: "Audience", icon: Users },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "review", label: "Review", icon: Eye },
];

const NAME_MAX = 100;
const DESC_MAX = 500;

function getDefaultAudience(): TargetAudience {
  return { type: "single", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] };
}

function getDefaultSchedule(): AssignmentSchedule {
  return { type: "immediate", startDate: null, dueDate: null, expiryDate: null, timezone: "Africa/Lagos" };
}

function getDefaultNotifications(): AssignmentNotifications {
  return { sendEmail: true, inApp: true, reminderSchedule: "weekly", reminderFrequency: 1 };
}

export function AssignmentWizard({ open, onClose, onSave, editAssignment }: AssignmentWizardProps) {
  const [step, setStep] = useState<WizardStep>("name-type");
  const [name, setName] = useState(editAssignment?.name || "");
  const [description, setDescription] = useState(editAssignment?.description || "");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(editAssignment?.type || "mandatory");
  const [priority, setPriority] = useState<AssignmentPriority>(editAssignment?.priority || "medium");
  const [courseIds, setCourseIds] = useState<string[]>(editAssignment?.courseIds || []);
  const [campaignId, setCampaignId] = useState<string>(editAssignment?.campaignId || "");
  const [audience, setAudience] = useState<TargetAudience>(editAssignment?.targetAudience || getDefaultAudience());
  const [schedule, setSchedule] = useState<AssignmentSchedule>(editAssignment?.schedule || getDefaultSchedule());
  const [notifications, setNotifications] = useState<AssignmentNotifications>(editAssignment?.notifications || getDefaultNotifications());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseSearch, setCourseSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);

  const courses = useMemo(() => getCourses().filter((c) => c.status === "published"), []);
  const programmes = useMemo(() => getProgrammes(), []);
  const allUsers = useMemo(() => getUsers(), []);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const markDirty = useCallback(() => setDirty(true), []);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setStep("name-type");
      setErrors({});
      setCourseSearch("");
      setSaving(false);
      setShowCancelConfirm(false);
      setDirty(false);
      setName(editAssignment?.name || "");
      setDescription(editAssignment?.description || "");
      setAssignmentType(editAssignment?.type || "mandatory");
      setPriority(editAssignment?.priority || "medium");
      setCourseIds(editAssignment?.courseIds || []);
      setCampaignId(editAssignment?.campaignId || "");
      setAudience(editAssignment?.targetAudience || getDefaultAudience());
      setSchedule(editAssignment?.schedule || getDefaultSchedule());
      setNotifications(editAssignment?.notifications || getDefaultNotifications());
    }
  }, [open, editAssignment]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter((c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  function validateStep(current: WizardStep): boolean {
    const errs: Record<string, string> = {};
    switch (current) {
      case "name-type":
        if (!name.trim()) errs.name = "Assignment name is required";
        else if (name.trim().length > NAME_MAX) errs.name = `Name must be ${NAME_MAX} characters or less`;
        break;
      case "content":
        if (courseIds.length === 0) errs.courses = "Select at least one course";
        break;
      case "audience": {
        const hasSelection = audience.userIds.length > 0 || audience.categoryIds.length > 0 ||
          audience.subCategoryIds.length > 0 || audience.regionIds.length > 0 ||
          audience.stateIds.length > 0 || audience.type === "organization";
        if (!hasSelection) errs.audience = "Select at least one audience member or group";
        break;
      }
      case "schedule":
        if (schedule.type === "scheduled") {
          if (!schedule.startDate) errs.startDate = "Start date is required";
          if (!schedule.dueDate) errs.dueDate = "Due date is required";
          if (schedule.startDate && schedule.dueDate && new Date(schedule.dueDate) < new Date(schedule.startDate)) {
            errs.dueDate = "Due date cannot be before start date";
          }
        }
        break;
      case "notifications":
        break;
      case "review":
        break;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateAll(): boolean {
    const allErrors: Record<string, string> = {};
    if (!name.trim()) allErrors.name = "Assignment name is required";
    if (courseIds.length === 0) allErrors.courses = "Select at least one course";
    const hasAudience = audience.userIds.length > 0 || audience.categoryIds.length > 0 ||
      audience.subCategoryIds.length > 0 || audience.regionIds.length > 0 ||
      audience.stateIds.length > 0 || audience.type === "organization";
    if (!hasAudience) allErrors.audience = "Select at least one audience member or group";
    if (schedule.type === "scheduled") {
      if (!schedule.dueDate) allErrors.dueDate = "Due date is required";
      if (schedule.startDate && schedule.dueDate && new Date(schedule.dueDate) < new Date(schedule.startDate)) {
        allErrors.dueDate = "Due date cannot be before start date";
      }
    }
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  }

  function handleBack() {
    setErrors({});
    const idx = currentStepIndex;
    if (idx > 0) setStep(STEPS[idx - 1].key);
  }

  async function handleSave(status: AssignmentStatus) {
    if (status === "active" && !validateAll()) {
      // Navigate to first errored step
      const errStep = STEPS.find((s) => {
        const test: Record<string, string> = {};
        if (s.key === "name-type" && !name.trim()) return true;
        if (s.key === "content" && courseIds.length === 0) return true;
        if (s.key === "audience") {
          const ha = audience.userIds.length > 0 || audience.categoryIds.length > 0 ||
            audience.subCategoryIds.length > 0 || audience.regionIds.length > 0 ||
            audience.stateIds.length > 0 || audience.type === "organization";
          if (!ha) return true;
        }
        if (s.key === "schedule" && schedule.type === "scheduled") {
          if (!schedule.dueDate) return true;
          if (schedule.startDate && schedule.dueDate && new Date(schedule.dueDate) < new Date(schedule.startDate)) return true;
        }
        return false;
      });
      if (errStep) setStep(errStep.key);
      return;
    }
    if (status === "draft" && !name.trim()) {
      setErrors({ name: "Assignment name is required to save" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave({
      name: name.trim(),
      description: description.trim(),
      type: assignmentType,
      priority,
      courseIds,
      campaignId: campaignId || undefined,
      assignedBy: editAssignment?.assignedBy || "",
      targetAudience: audience,
      schedule,
      notifications,
      status,
    });
    setSaving(false);
  }

  function handleClose() {
    if (dirty) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  }

  function handleDiscard() {
    setShowCancelConfirm(false);
    onClose();
  }

  function toggleCourse(id: string) {
    setCourseIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    markDirty();
    setErrors({});
  }

  if (!open) return null;

  const selectedCourses = courses.filter((c) => courseIds.includes(c.id));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface/95 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-content">
            {editAssignment ? "Edit Assignment" : "Create Assignment"}
          </h2>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-4 border-b border-border/50 bg-surface-secondary/30 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { if (i < currentStepIndex) setStep(s.key); }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                  step === s.key ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400" : i < currentStepIndex ? "text-content-secondary hover:bg-surface-hover" : "text-content-tertiary",
                  i < currentStepIndex && "cursor-pointer",
                )}
                aria-current={step === s.key ? "step" : undefined}
                tabIndex={i < currentStepIndex ? 0 : -1}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  step === s.key ? "bg-primary-600 text-white" : i < currentStepIndex ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300" : "bg-surface-tertiary text-content-tertiary",
                )}>
                  {i < currentStepIndex ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={cn("h-px w-6 shrink-0", i < currentStepIndex ? "bg-primary-300" : "bg-border")} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ========== STEP 1: Details ========== */}
          {step === "name-type" && (
            <div className="space-y-4" role="form" aria-label="Assignment details">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Assignment Details</h3>
                <p className="text-sm text-content-secondary">Define the name, type, and priority of this assignment.</p>
              </div>
              <div>
                <Input
                  label="Assignment Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); markDirty(); setErrors({}); }}
                  error={errors.name}
                  floating
                  placeholder="e.g. New Hire Compliance Training"
                  maxLength={NAME_MAX + 10}
                />
                <p className={cn("mt-1 text-xs text-right", name.length > NAME_MAX ? "text-danger" : "text-content-tertiary")}>
                  {name.length}/{NAME_MAX}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-content mb-1.5 block">Description <span className="text-content-tertiary font-normal">(optional)</span></label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); markDirty(); }}
                  placeholder="Describe what this assignment covers..."
                  rows={3}
                  maxLength={DESC_MAX + 10}
                  className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all resize-none"
                  aria-describedby="desc-counter"
                />
                <p id="desc-counter" className={cn("mt-1 text-xs text-right", description.length > DESC_MAX ? "text-danger" : "text-content-tertiary")}>
                  {description.length}/{DESC_MAX}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Assignment Type"
                  value={assignmentType}
                  onChange={(e) => { setAssignmentType(e.target.value as AssignmentType); markDirty(); }}
                  options={Object.entries(ASSIGNMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => { setPriority(e.target.value as AssignmentPriority); markDirty(); }}
                  options={Object.entries(ASSIGNMENT_PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </div>
            </div>
          )}

          {/* ========== STEP 2: Content ========== */}
          {step === "content" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Learning Content</h3>
                <p className="text-sm text-content-secondary">Select courses and optionally link a training programme.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-content mb-2 block">Training Programme <span className="text-content-tertiary font-normal">(optional)</span></label>
                <Select
                  value={campaignId}
                  onChange={(e) => { setCampaignId(e.target.value); markDirty(); }}
                  options={[{ value: "", label: "No programme" }, ...programmes.map((c) => ({ value: c.id, label: c.name }))]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-content mb-2 block">Select Courses <span className="text-content-secondary">({courseIds.length} selected)</span></label>
                {errors.courses && <p className="text-xs text-danger mb-2" role="alert">{errors.courses}</p>}

                {/* Course search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="flex h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all"
                  />
                </div>

                {/* Selected course preview */}
                {selectedCourses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedCourses.map((c) => (
                      <Badge key={c.id} variant="secondary" size="sm">
                        {c.title}
                        <button type="button" onClick={() => toggleCourse(c.id)} className="ml-1 hover:text-content">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Course list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-xl border border-border p-2">
                  {filteredCourses.length === 0 ? (
                    <div className="col-span-2 p-6 text-center text-sm text-content-tertiary">
                      {courseSearch ? "No courses match your search" : "No published courses available"}
                    </div>
                  ) : (
                    filteredCourses.map((course) => {
                      const selected = courseIds.includes(course.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl p-3 text-left transition-all border",
                            selected ? "bg-primary-50/50 border-primary-300 dark:bg-primary-950/20 dark:border-primary-700" : "bg-surface border-border hover:border-border-strong",
                          )}
                        >
                          <div className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                            selected ? "bg-primary-600 border-primary-600" : "border-border",
                          )}>
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
          )}

          {/* ========== STEP 3: Audience ========== */}
          {step === "audience" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Target Audience</h3>
                <p className="text-sm text-content-secondary">Choose who should receive this assignment.</p>
              </div>
              {errors.audience && <p className="text-xs text-danger" role="alert">{errors.audience}</p>}
              <TargetAudienceBuilder value={audience} onChange={(a) => { setAudience(a); markDirty(); }} />
            </div>
          )}

          {/* ========== STEP 4: Schedule ========== */}
          {step === "schedule" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Schedule</h3>
                <p className="text-sm text-content-secondary">Set when this assignment takes effect.</p>
              </div>
              <div className="flex gap-2">
                {(["immediate", "scheduled"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSchedule({ ...schedule, type: t, startDate: t === "immediate" ? null : schedule.startDate }); markDirty(); }}
                    className={cn(
                      "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border",
                      schedule.type === t ? "bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-950/30 dark:border-primary-700 dark:text-primary-400" : "bg-surface border-border text-content-secondary hover:border-border-strong",
                    )}
                  >
                    {t === "immediate" ? "Immediate" : "Scheduled"}
                  </button>
                ))}
              </div>
              {schedule.type === "scheduled" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-content">Start Date</label>
                      <input
                        type="date"
                        value={schedule.startDate?.split("T")[0] || ""}
                        onChange={(e) => { setSchedule({ ...schedule, startDate: e.target.value ? new Date(e.target.value).toISOString() : null }); markDirty(); }}
                        className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
                      />
                      {errors.startDate && <p className="text-xs text-danger">{errors.startDate}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-content">Start Time</label>
                      <input
                        type="time"
                        value={schedule.startDate?.split("T")[1]?.slice(0, 5) || "09:00"}
                        onChange={(e) => {
                          const d = schedule.startDate ? new Date(schedule.startDate) : new Date();
                          const [h, m] = e.target.value.split(":").map(Number);
                          d.setHours(h, m, 0, 0);
                          setSchedule({ ...schedule, startDate: d.toISOString() });
                          markDirty();
                        }}
                        className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-content">Due Date</label>
                      <input
                        type="date"
                        value={schedule.dueDate?.split("T")[0] || ""}
                        onChange={(e) => { setSchedule({ ...schedule, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }); markDirty(); }}
                        className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
                      />
                      {errors.dueDate && <p className="text-xs text-danger">{errors.dueDate}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-content">Due Time</label>
                      <input
                        type="time"
                        value={schedule.dueDate?.split("T")[1]?.slice(0, 5) || "17:00"}
                        onChange={(e) => {
                          const d = schedule.dueDate ? new Date(schedule.dueDate) : new Date();
                          const [h, m] = e.target.value.split(":").map(Number);
                          d.setHours(h, m, 0, 0);
                          setSchedule({ ...schedule, dueDate: d.toISOString() });
                          markDirty();
                        }}
                        className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-content">Expiry Date</label>
                      <input
                        type="date"
                        value={schedule.expiryDate?.split("T")[0] || ""}
                        onChange={(e) => { setSchedule({ ...schedule, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null }); markDirty(); }}
                        className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none"
                      />
                    </div>
                    <Select
                      label="Timezone"
                      value={schedule.timezone}
                      onChange={(e) => { setSchedule({ ...schedule, timezone: e.target.value }); markDirty(); }}
                      options={[
                        { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
                        { value: "UTC", label: "UTC" },
                        { value: "America/New_York", label: "America/New_York (EST)" },
                        { value: "Europe/London", label: "Europe/London (GMT)" },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========== STEP 5: Notifications ========== */}
          {step === "notifications" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Notifications</h3>
                <p className="text-sm text-content-secondary">Configure how and when learners are notified.</p>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifications.sendEmail}
                    onChange={(e) => { setNotifications({ ...notifications, sendEmail: e.target.checked }); markDirty(); }}
                    className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-content">Email Notification</p>
                    <p className="text-xs text-content-tertiary">Send email alerts when assignment is created</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifications.inApp}
                    onChange={(e) => { setNotifications({ ...notifications, inApp: e.target.checked }); markDirty(); }}
                    className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-content">In-App Notification</p>
                    <p className="text-xs text-content-tertiary">Show notification in the platform</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifications.reminderSchedule !== "none"}
                    onChange={(e) => {
                      setNotifications({ ...notifications, reminderSchedule: e.target.checked ? "weekly" : "none" });
                      markDirty();
                    }}
                    className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-content">Overdue Reminder</p>
                    <p className="text-xs text-content-tertiary">Send reminders when assignment is overdue</p>
                  </div>
                </label>
              </div>
              {notifications.reminderSchedule !== "none" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Reminder Frequency"
                    value={notifications.reminderSchedule}
                    onChange={(e) => { setNotifications({ ...notifications, reminderSchedule: e.target.value as "none" | "daily" | "weekly" }); markDirty(); }}
                    options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }]}
                  />
                  <Input
                    label="Reminder Count"
                    type="number"
                    min={1}
                    max={30}
                    value={notifications.reminderFrequency}
                    onChange={(e) => { setNotifications({ ...notifications, reminderFrequency: parseInt(e.target.value) || 1 }); markDirty(); }}
                    floating
                  />
                </div>
              )}
            </div>
          )}

          {/* ========== STEP 6: Review ========== */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Review &amp; Confirm</h3>
                <p className="text-sm text-content-secondary">Check all details before saving or publishing.</p>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-danger/5 border border-danger/20 p-4 text-sm text-danger">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Please fix the following errors:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-danger/80">
                      {Object.entries(errors).map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Card variant="bordered" padding="md" className="space-y-4">
                {/* Assignment info */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-content">{name || "Untitled Assignment"}</p>
                      {description && <p className="text-xs text-content-tertiary mt-0.5 line-clamp-2">{description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className={ASSIGNMENT_TYPE_COLORS[assignmentType]}>{ASSIGNMENT_TYPE_LABELS[assignmentType]}</Badge>
                      <Badge variant="secondary" className={ASSIGNMENT_PRIORITY_COLORS[priority]}>{ASSIGNMENT_PRIORITY_LABELS[priority]}</Badge>
                    </div>
                  </div>
                </div>
                <hr className="border-border/50" />

                {/* Courses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-content-tertiary mb-1">Courses ({courseIds.length})</p>
                    {selectedCourses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedCourses.map((c) => (
                          <Badge key={c.id} variant="secondary" size="sm">{c.title}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-content-secondary">No courses selected</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary mb-1">Target Audience</p>
                    <p className="text-sm font-medium text-content">{AUDIENCE_TYPE_LABELS[audience.type]}</p>
                    <p className="text-xs text-content-tertiary">
                      {audience.type === "organization"
                        ? `All learners (${allUsers.filter((u) => u.role !== "admin").length} users)`
                        : `${audience.userIds.length + audience.categoryIds.length + audience.subCategoryIds.length + audience.regionIds.length + audience.stateIds.length} selection(s)`
                      }
                    </p>
                  </div>
                </div>
                <hr className="border-border/50" />

                {/* Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-content-tertiary mb-1">Schedule</p>
                    <p className="text-sm font-medium text-content capitalize">{schedule.type}</p>
                    {schedule.type === "scheduled" && (
                      <>
                        {schedule.startDate && <p className="text-xs text-content-tertiary">Start: {new Date(schedule.startDate).toLocaleString()}</p>}
                        {schedule.dueDate && <p className="text-xs text-content-tertiary">Due: {new Date(schedule.dueDate).toLocaleString()}</p>}
                      </>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary mb-1">Notifications</p>
                    <p className="text-sm font-medium text-content">
                      {[
                        notifications.sendEmail && "Email",
                        notifications.inApp && "In-App",
                        notifications.reminderSchedule !== "none" && `${notifications.reminderSchedule} reminders`,
                      ].filter(Boolean).join(", ") || "None"}
                    </p>
                  </div>
                </div>
                {campaignId && programmes.find((c) => c.id === campaignId) && (
                  <>
                    <hr className="border-border/50" />
                    <div>
                      <p className="text-xs text-content-tertiary mb-1">Training Programme</p>
                      <p className="text-sm font-medium text-content">{programmes.find((c) => c.id === campaignId)?.name}</p>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-border bg-surface/95 backdrop-blur-sm">
          <Button variant="tertiary" onClick={handleBack} disabled={currentStepIndex === 0 || saving}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="tertiary" onClick={handleClose} disabled={saving}>Cancel</Button>
            {step === "review" ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSave("active")}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {saving ? "Publishing..." : "Publish"}
                </Button>
              </>
            ) : (
              <Button onClick={handleNext} disabled={saving}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved changes confirm */}
      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleDiscard}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        variant="warning"
      />
    </div>
  );
}
