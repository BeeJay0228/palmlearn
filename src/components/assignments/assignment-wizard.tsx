"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TargetAudienceBuilder } from "./target-audience-builder";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENT_TYPE_LABELS, ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_TYPE_COLORS, ASSIGNMENT_PRIORITY_COLORS,
  AUDIENCE_TYPE_LABELS,
  type Assignment, type AssignmentType, type AssignmentPriority,
  type TargetAudience, type AssignmentSchedule, type AssignmentNotifications,
} from "@/types";
import { getCourses } from "@/lib/courses";
import { getCampaigns } from "@/lib/campaigns";
import { X, Check, ArrowLeft, ArrowRight, BookOpen, Users, Calendar, Bell, Eye } from "lucide-react";

interface AssignmentWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Assignment, "id" | "createdAt" | "updatedAt">) => void;
  editAssignment?: Assignment;
}

type WizardStep = "name-type" | "content" | "audience" | "schedule" | "notifications" | "review";

const steps: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "name-type", label: "Details", icon: BookOpen },
  { key: "content", label: "Content", icon: BookOpen },
  { key: "audience", label: "Audience", icon: Users },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "review", label: "Review", icon: Eye },
];

export function AssignmentWizard({ open, onClose, onSave, editAssignment }: AssignmentWizardProps) {
  const [step, setStep] = useState<WizardStep>("name-type");
  const [name, setName] = useState(editAssignment?.name || "");
  const [description, setDescription] = useState(editAssignment?.description || "");
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(editAssignment?.type || "mandatory");
  const [priority, setPriority] = useState<AssignmentPriority>(editAssignment?.priority || "medium");
  const [courseIds, setCourseIds] = useState<string[]>(editAssignment?.courseIds || []);
  const [campaignId, setCampaignId] = useState<string>(editAssignment?.campaignId || "");
  const [audience, setAudience] = useState<TargetAudience>(editAssignment?.targetAudience || { type: "single", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] });
  const [schedule, setSchedule] = useState<AssignmentSchedule>(editAssignment?.schedule || { type: "immediate", startDate: null, dueDate: null, expiryDate: null, timezone: "Africa/Lagos" });
  const [notifications, setNotifications] = useState<AssignmentNotifications>(editAssignment?.notifications || { sendEmail: true, inApp: true, reminderSchedule: "weekly", reminderFrequency: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const courses = getCourses();
  const campaigns = getCampaigns();

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (courseIds.length === 0) errs.courses = "Select at least one course";
    if (schedule.type === "scheduled") {
      if (!schedule.dueDate) errs.dueDate = "Due date is required for scheduled assignments";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (step === "name-type" && !name.trim()) { setErrors({ name: "Name is required" }); return; }
    if (step === "content" && courseIds.length === 0) { setErrors({ courses: "Select at least one course" }); return; }
    if (step === "schedule" && schedule.type === "scheduled" && !schedule.dueDate) { setErrors({ dueDate: "Due date required" }); return; }
    setErrors({});
    const idx = currentStepIndex;
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
  }

  function handleBack() {
    setErrors({});
    const idx = currentStepIndex;
    if (idx > 0) setStep(steps[idx - 1].key);
  }

  function handleSave() {
    if (!validate()) return;
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
      status: "active",
    });
    onClose();
  }

  function toggleCourse(id: string) {
    setCourseIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    setErrors({});
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface/95 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-content">
            {editAssignment ? "Edit Assignment" : "Create Assignment"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-4 border-b border-border/50 bg-surface-secondary/30">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { if (i < currentStepIndex) setStep(s.key); }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                  step === s.key ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400" : i < currentStepIndex ? "text-content-secondary hover:bg-surface-hover" : "text-content-tertiary",
                  i < currentStepIndex && "cursor-pointer",
                )}
              >
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  step === s.key ? "bg-primary-600 text-white" : i < currentStepIndex ? "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300" : "bg-surface-tertiary text-content-tertiary",
                )}>
                  {i < currentStepIndex ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && <div className={cn("h-px w-6", i < currentStepIndex ? "bg-primary-300" : "bg-border")} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Name & Type */}
          {step === "name-type" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Assignment Details</h3>
                <p className="text-sm text-content-secondary">Define the name, type, and priority of this assignment.</p>
              </div>
              <Input label="Assignment Name" value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }} error={errors.name} floating placeholder="e.g. New Hire Compliance Training" />
              <div>
                <label className="text-sm font-medium text-content mb-1.5 block">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this assignment covers..."
                  rows={3}
                  className="flex w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Assignment Type"
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value as AssignmentType)}
                  options={Object.entries(ASSIGNMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
                  options={Object.entries(ASSIGNMENT_PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </div>
              {assignmentType && (
                <Badge variant="secondary" className={ASSIGNMENT_TYPE_COLORS[assignmentType]}>
                  {ASSIGNMENT_TYPE_LABELS[assignmentType]}
                </Badge>
              )}
            </div>
          )}

          {/* Step 2: Content */}
          {step === "content" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Learning Content</h3>
                <p className="text-sm text-content-secondary">Select courses and optionally link a campaign.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-content mb-2 block">Campaign (optional)</label>
                <Select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  options={[{ value: "", label: "No campaign" }, ...campaigns.map((c) => ({ value: c.id, label: c.name }))]}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-content mb-2 block">Select Courses ({courseIds.length} selected)</label>
                {errors.courses && <p className="text-xs text-danger mb-2">{errors.courses}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto rounded-xl border border-border p-2">
                  {courses.filter((c) => c.status === "published").map((course) => {
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
                  })}
                  {courses.filter((c) => c.status === "published").length === 0 && (
                    <div className="col-span-2 p-6 text-center text-sm text-content-tertiary">No published courses available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Audience */}
          {step === "audience" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Target Audience</h3>
                <p className="text-sm text-content-secondary">Choose who should receive this assignment.</p>
              </div>
              <TargetAudienceBuilder value={audience} onChange={setAudience} />
            </div>
          )}

          {/* Step 4: Schedule */}
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
                    onClick={() => setSchedule({ ...schedule, type: t, startDate: t === "immediate" ? new Date().toISOString() : schedule.startDate })}
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
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" value={schedule.startDate?.split("T")[0] || ""} onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value ? new Date(e.target.value).toISOString() : null })} floating />
                  <Input label="Due Date" type="date" value={schedule.dueDate?.split("T")[0] || ""} onChange={(e) => setSchedule({ ...schedule, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} floating error={errors.dueDate} />
                  <Input label="Expiry Date" type="date" value={schedule.expiryDate?.split("T")[0] || ""} onChange={(e) => setSchedule({ ...schedule, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null })} floating />
                  <Select
                    label="Timezone"
                    value={schedule.timezone}
                    onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
                    options={[{ value: "Africa/Lagos", label: "Africa/Lagos (WAT)" }, { value: "UTC", label: "UTC" }, { value: "America/New_York", label: "America/New_York (EST)" }, { value: "Europe/London", label: "Europe/London (GMT)" }]}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5: Notifications */}
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
                    onChange={(e) => setNotifications({ ...notifications, sendEmail: e.target.checked })}
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
                    onChange={(e) => setNotifications({ ...notifications, inApp: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-content">In-App Notification</p>
                    <p className="text-xs text-content-tertiary">Show notification in the platform</p>
                  </div>
                </label>
              </div>
              <Select
                label="Reminder Schedule"
                value={notifications.reminderSchedule}
                onChange={(e) => setNotifications({ ...notifications, reminderSchedule: e.target.value as "none" | "daily" | "weekly" })}
                options={[{ value: "none", label: "No reminders" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }]}
              />
              {notifications.reminderSchedule !== "none" && (
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Reminder Frequency"
                    type="number"
                    min={1}
                    max={30}
                    value={notifications.reminderFrequency}
                    onChange={(e) => setNotifications({ ...notifications, reminderFrequency: parseInt(e.target.value) || 1 })}
                    floating
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 6: Review */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-content">Review & Confirm</h3>
                <p className="text-sm text-content-secondary">Check all details before publishing.</p>
              </div>
              <Card variant="bordered" padding="md" className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium text-content">{name || "Untitled Assignment"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={ASSIGNMENT_TYPE_COLORS[assignmentType]}>{ASSIGNMENT_TYPE_LABELS[assignmentType]}</Badge>
                      <Badge variant="secondary" className={ASSIGNMENT_PRIORITY_COLORS[priority]}>{ASSIGNMENT_PRIORITY_LABELS[priority]}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-content-tertiary">Courses</p>
                    <p className="text-sm font-medium text-content">{courseIds.length} course(s)</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">Audience</p>
                    <p className="text-sm font-medium text-content">{AUDIENCE_TYPE_LABELS[audience.type]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">Schedule</p>
                    <p className="text-sm font-medium text-content capitalize">{schedule.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-content-tertiary">Notifications</p>
                    <p className="text-sm font-medium text-content">{notifications.sendEmail ? "Email, " : ""}{notifications.inApp ? "In-App" : ""}{notifications.sendEmail || notifications.inApp ? "" : "None"}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-border bg-surface/95 backdrop-blur-sm">
          <Button variant="tertiary" onClick={handleBack} disabled={currentStepIndex === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="tertiary" onClick={onClose}>Cancel</Button>
            {step === "review" ? (
              <Button onClick={handleSave}>
                <Check className="h-4 w-4" /> {editAssignment ? "Update" : "Create"} Assignment
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
