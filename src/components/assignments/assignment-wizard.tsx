"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TargetAudienceBuilder } from "./target-audience-builder";
import { AssignmentWizardDetails } from "./assignment-wizard-details";
import { AssignmentWizardContent } from "./assignment-wizard-content";
import { AssignmentWizardSchedule } from "./assignment-wizard-schedule";
import { AssignmentWizardNotifications } from "./assignment-wizard-notifications";
import { AssignmentWizardReview } from "./assignment-wizard-review";
import { cn } from "@/lib/utils";
import {
  type Assignment, type AssignmentType, type AssignmentPriority, type AssignmentStatus,
  type TargetAudience, type AssignmentSchedule, type AssignmentNotifications,
} from "@/types";
import { getCourses } from "@/lib/courses";
import { getProgrammes } from "@/lib/programmes";
import { getUsers } from "@/lib/users";
import {
  X, Check, ArrowLeft, ArrowRight, FileText, BookOpen, Users, Calendar, Bell, Eye,
  Loader2, Save, Send,
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
  const [saving, setSaving] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [dirty, setDirty] = useState(false);

  const courses = useMemo(() => getCourses().filter((c) => c.status === "published"), []);
  const programmes = useMemo(() => getProgrammes(), []);
  const allUsers = useMemo(() => getUsers(), []);
  const selectedCourses = useMemo(() => courses.filter((c) => courseIds.includes(c.id)), [courses, courseIds]);
  const programmeName = useMemo(() => programmes.find((c) => c.id === campaignId)?.name || "", [programmes, campaignId]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const markDirty = useCallback(() => setDirty(true), []);

  // Reset when opening
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("name-type");
      setStep("name-type");
      setErrors({});
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
    } else {
      setErrors({});
    }
  }, [open, editAssignment]);

  function validateStep(current: WizardStep): boolean {
    const errs: Record<string, string> = {};
    switch (current) {
      case "name-type":
        if (!name.trim()) errs.name = "Assignment name is required";
        else if (name.trim().length > 100) errs.name = "Name must be 100 characters or less";
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

  if (!open) return null;

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
            <AssignmentWizardDetails
              name={name} description={description} assignmentType={assignmentType} priority={priority}
              onNameChange={(v) => { setName(v); markDirty(); setErrors({}); }}
              onDescriptionChange={(v) => { setDescription(v); markDirty(); }}
              onTypeChange={(v) => { setAssignmentType(v); markDirty(); }}
              onPriorityChange={(v) => { setPriority(v); markDirty(); }}
              errors={errors} markDirty={markDirty}
            />
          )}

          {/* ========== STEP 2: Content ========== */}
          {step === "content" && (
            <AssignmentWizardContent
              courseIds={courseIds} campaignId={campaignId}
              onCourseIdsChange={(ids) => { setCourseIds(ids); markDirty(); setErrors({}); }}
              onCampaignIdChange={(id) => { setCampaignId(id); markDirty(); }}
              errors={errors} markDirty={markDirty}
            />
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
            <AssignmentWizardSchedule
              schedule={schedule}
              onChange={(s) => { setSchedule(s); markDirty(); }}
              errors={errors}
              markDirty={markDirty}
            />
          )}

          {/* ========== STEP 5: Notifications ========== */}
          {step === "notifications" && (
            <AssignmentWizardNotifications
              notifications={notifications}
              onChange={(n) => { setNotifications(n); markDirty(); }}
              markDirty={markDirty}
            />
          )}

          {/* ========== STEP 6: Review ========== */}
          {step === "review" && (
            <AssignmentWizardReview
              name={name} description={description} assignmentType={assignmentType} priority={priority}
              courseIds={courseIds} campaignId={campaignId}
              audience={audience} schedule={schedule} notifications={notifications}
              errors={errors} allUsersCount={allUsers.filter((u) => u.role !== "admin").length}
              selectedCourses={selectedCourses} programmeName={programmeName}
            />
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
