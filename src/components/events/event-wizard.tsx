"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TargetAudienceBuilder } from "@/components/assignments/target-audience-builder";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS,
  RECURRENCE_LABELS, AUDIENCE_TYPE_LABELS,
  type TrainingEvent, type EventType, type EventStatus, type RecurrencePattern,
  type TargetAudience, type EventSchedule, type EventLocation,
  type EventNotifications, type EventResource, type PostEvent,
} from "@/types";
import { getUsers } from "@/lib/users";
import { getCategories, getSubCategories } from "@/lib/organization";
import { X, Check, ArrowLeft, ArrowRight, MapPin, Video, Globe, Bell, Eye, Plus, Trash2, GripVertical, Users } from "lucide-react";

interface EventWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<TrainingEvent, "id" | "createdAt" | "updatedAt">) => void;
  editEvent?: TrainingEvent;
}

type WizardStep = "basic" | "schedule" | "location" | "audience" | "notifications" | "review";

const steps: { key: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "basic", label: "Basic Info", icon: Globe },
  { key: "schedule", label: "Schedule", icon: Eye },
  { key: "location", label: "Location", icon: MapPin },
  { key: "audience", label: "Audience", icon: Users },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "review", label: "Review", icon: Eye },
];

const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const recurrenceOptions = Object.entries(RECURRENCE_LABELS).map(([value, label]) => ({ value, label }));
const platformOptions = [
  { value: "Zoom", label: "Zoom" },
  { value: "Google Meet", label: "Google Meet" },
  { value: "Microsoft Teams", label: "Microsoft Teams" },
  { value: "Custom", label: "Custom" },
];

function defaultSchedule(): EventSchedule {
  return { startDate: "", endDate: "", startTime: "09:00", endTime: "17:00", timezone: "Africa/Lagos", recurrence: "none", capacity: 100, registrationDeadline: null };
}

function defaultLocation(eventType: EventType): EventLocation {
  if (eventType === "virtual" || eventType === "webinar") return { type: eventType, meetingUrl: "", platform: "Zoom" };
  if (eventType === "physical") return { type: eventType, venue: "", address: "", gpsLocation: "" };
  if (eventType === "hybrid") return { type: eventType, meetingUrl: "", platform: "Zoom", venue: "", address: "", gpsLocation: "" };
  if (eventType === "workshop") return { type: eventType, venue: "", address: "" };
  if (eventType === "town_hall") return { type: eventType, meetingUrl: "", platform: "Zoom" };
  return { type: eventType, venue: "" };
}

export function EventWizard({ open, onClose, onSave, editEvent }: EventWizardProps) {
  const [step, setStep] = useState<WizardStep>("basic");
  const [title, setTitle] = useState(editEvent?.title || "");
  const [description, setDescription] = useState(editEvent?.description || "");
  const [banner, setBanner] = useState(editEvent?.banner || "");
  const [trainerId, setTrainerId] = useState(editEvent?.trainerId || "");
  const [categoryId, setCategoryId] = useState(editEvent?.categoryId || "");
  const [subCategoryId, setSubCategoryId] = useState(editEvent?.subCategoryId || "");
  const [eventType, setEventType] = useState<EventType>(editEvent?.eventType || "virtual");
  const [schedule, setSchedule] = useState<EventSchedule>(editEvent?.schedule || defaultSchedule());
  const [location, setLocation] = useState<EventLocation>(editEvent?.location || defaultLocation("virtual"));
  const [audience, setAudience] = useState<TargetAudience>(editEvent?.targetAudience || { type: "single", userIds: [], categoryIds: [], subCategoryIds: [], regionIds: [], stateIds: [] });
  const [notifications, setNotifications] = useState<EventNotifications>(editEvent?.notifications || { registrationConfirmation: true, reminder24h: true, reminder1h: true, reminder15m: false, postEventFollowUp: true });
  const [resources, setResources] = useState<EventResource[]>(editEvent?.resources || []);
  const [postEvent, setPostEvent] = useState<PostEvent>(editEvent?.postEvent || { feedbackSurvey: true, certificate: false, recording: null, trainerNotes: null, actionItems: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const users = getUsers();
  const trainers = users.filter((u) => u.role === "trainer" || u.role === "admin");
  const categories = getCategories();
  const subCategories = getSubCategories().filter((sc) => sc.categoryId === categoryId);

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  function getStepErrors(s: WizardStep): Record<string, string> {
    const errs: Record<string, string> = {};
    if (s === "basic") {
      if (!title.trim()) errs.title = "Title is required";
      if (!trainerId) errs.trainerId = "Trainer is required";
      if (!categoryId) errs.categoryId = "Category is required";
      if (categoryId && !subCategoryId) errs.subCategoryId = "Sub-category is required";
    }
    if (s === "schedule") {
      if (!schedule.startDate) errs.startDate = "Start date is required";
      if (!schedule.endDate) errs.endDate = "End date is required";
      if (schedule.startDate && schedule.endDate && new Date(schedule.endDate) < new Date(schedule.startDate)) {
        errs.endDate = "End date must be after start date";
      }
      if (!schedule.capacity || schedule.capacity < 1) errs.capacity = "Capacity must be at least 1";
    }
    if (s === "location") {
      if ((eventType === "virtual" || eventType === "webinar" || eventType === "hybrid" || eventType === "town_hall") && !location.meetingUrl?.trim()) {
        errs.meetingUrl = "Meeting URL is required";
      }
      if ((eventType === "physical" || eventType === "hybrid" || eventType === "workshop") && !location.venue?.trim()) {
        errs.venue = "Venue is required";
      }
      if ((eventType === "physical" || eventType === "workshop") && !location.address?.trim()) {
        errs.address = "Address is required";
      }
    }
    if (s === "audience") {
      if (audience.type === "single" && audience.userIds.length === 0) errs.audience = "Select at least one learner";
      if (audience.type === "multiple" && audience.userIds.length === 0) errs.audience = "Select at least one learner";
      if (audience.type === "category" && audience.categoryIds.length === 0) errs.audience = "Select at least one category";
      if (audience.type === "subcategory" && audience.subCategoryIds.length === 0) errs.audience = "Select at least one sub-category";
      if (audience.type === "region" && audience.regionIds.length === 0) errs.audience = "Select at least one region";
      if (audience.type === "state" && audience.stateIds.length === 0) errs.audience = "Select at least one state";
    }
    return errs;
  }

  function validateStep(s: WizardStep): boolean {
    const errs = getStepErrors(s);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      const idx = steps.findIndex((s) => s.key === step);
      if (idx < steps.length - 1) setStep(steps[idx + 1].key);
    }
  }

  function handlePrev() {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  }

  function handleSave() {
    const firstInvalid = steps.find((s) => {
      const errs = getStepErrors(s.key);
      if (Object.keys(errs).length > 0) { setErrors(errs); return true; }
      return false;
    });
    if (firstInvalid) { setStep(firstInvalid.key); return; }
    onSave({
      title: title.trim(),
      description: description.trim(),
      banner,
      trainerId,
      categoryId,
      subCategoryId,
      eventType,
      schedule,
      location,
      targetAudience: audience,
      notifications,
      resources,
      postEvent,
      status: "published",
      createdBy: editEvent?.createdBy || "",
    });
    onClose();
  }

  function handleSaveDraft() {
    onSave({
      title: title.trim(),
      description: description.trim(),
      banner,
      trainerId,
      categoryId,
      subCategoryId,
      eventType,
      schedule,
      location,
      targetAudience: audience,
      notifications,
      resources,
      postEvent,
      status: "draft" as EventStatus,
      createdBy: editEvent?.createdBy || "",
    });
    onClose();
  }

  function addResource() {
    setResources([...resources, { id: `res_${Date.now()}`, name: "", type: "pdf", url: "" }]);
  }

  function updateResource(index: number, field: keyof EventResource, value: string) {
    const updated = [...resources];
    updated[index] = { ...updated[index], [field]: value };
    setResources(updated);
  }

  function removeResource(index: number) {
    setResources(resources.filter((_, i) => i !== index));
  }

  function handleEventTypeChange(t: EventType) {
    setEventType(t);
    setLocation(defaultLocation(t));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border/50 shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface/95 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-bold text-content">{editEvent ? "Edit Event" : "Create Event"}</h2>
            <p className="text-xs text-content-tertiary">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-surface-tertiary transition-colors">
            <X className="h-4 w-4 text-content-tertiary" />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((s, i) => {
              const isActive = step === s.key;
              const isCompleted = currentStepIndex > i;
              return (
                <button
                  key={s.key}
                  onClick={() => { if (i <= currentStepIndex + 1) setStep(s.key); }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                    isActive && "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800",
                    isCompleted && "text-content-tertiary",
                    !isActive && !isCompleted && "text-content-tertiary/50",
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    isCompleted ? "bg-primary-600 text-white" : isActive ? "bg-primary-600 text-white" : "bg-surface-tertiary text-content-tertiary",
                  )}>
                    {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Basic Info */}
          {step === "basic" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Input
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={errors.title}
                    placeholder="e.g. Annual Compliance Training"
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    label="Event Type"
                    value={eventType}
                    onChange={(e) => handleEventTypeChange(e.target.value as EventType)}
                    options={eventTypeOptions}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-content-secondary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event, learning objectives, and what participants can expect..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Select
                    label="Trainer"
                    value={trainerId}
                    onChange={(e) => setTrainerId(e.target.value)}
                    options={trainers.map((t) => ({ value: t.id, label: t.name }))}
                    error={errors.trainerId}
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    label="Category"
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); }}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    error={errors.categoryId}
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    label="Sub-Category"
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    options={subCategories.map((sc) => ({ value: sc.id, label: sc.name }))}
                    error={errors.subCategoryId}
                    disabled={!categoryId}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  label="Event Banner URL (optional)"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleEventTypeChange(key as EventType)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                      eventType === key ? EVENT_TYPE_COLORS[key as EventType] + " border-current" : "text-content-tertiary border-border hover:border-content-tertiary",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === "schedule" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Input
                    label="Start Date"
                    type="date"
                    value={schedule.startDate}
                    onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
                    error={errors.startDate}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="End Date"
                    type="date"
                    value={schedule.endDate}
                    onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })}
                    error={errors.endDate}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Input
                    label="Start Time"
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="End Time"
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Select
                    label="Timezone"
                    value={schedule.timezone}
                    onChange={(e) => setSchedule({ ...schedule, timezone: e.target.value })}
                    options={[
                      { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
                      { value: "Africa/Abuja", label: "Africa/Abuja (WAT)" },
                      { value: "America/New_York", label: "America/New_York (EST)" },
                      { value: "Europe/London", label: "Europe/London (GMT)" },
                      { value: "UTC", label: "UTC" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    label="Recurrence"
                    value={schedule.recurrence}
                    onChange={(e) => setSchedule({ ...schedule, recurrence: e.target.value as RecurrencePattern })}
                    options={recurrenceOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Capacity"
                    type="number"
                    value={String(schedule.capacity)}
                    onChange={(e) => setSchedule({ ...schedule, capacity: parseInt(e.target.value) || 0 })}
                    error={errors.capacity}
                    min={1}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  label="Registration Deadline (optional)"
                  type="date"
                  value={schedule.registrationDeadline || ""}
                  onChange={(e) => setSchedule({ ...schedule, registrationDeadline: e.target.value || null })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === "location" && (
            <div className="space-y-6">
              {eventType === "virtual" || eventType === "webinar" || eventType === "town_hall" ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Virtual Event - Meeting link required
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Select
                        label="Meeting Platform"
                        value={location.platform || "Zoom"}
                        onChange={(e) => setLocation({ ...location, platform: e.target.value })}
                        options={platformOptions}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Meeting URL"
                        value={location.meetingUrl || ""}
                        onChange={(e) => setLocation({ ...location, meetingUrl: e.target.value })}
                        error={errors.meetingUrl}
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  </div>
                </div>
              ) : eventType === "physical" || eventType === "workshop" ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Physical Event - Venue details required
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Venue"
                      value={location.venue || ""}
                      onChange={(e) => setLocation({ ...location, venue: e.target.value })}
                      error={errors.venue}
                      placeholder="e.g. PalmLearn Conference Hall"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Address"
                      value={location.address || ""}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      error={errors.address}
                      placeholder="e.g. 42 Isaac John Street, Ikeja, Lagos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="GPS Location (optional)"
                      value={location.gpsLocation || ""}
                      onChange={(e) => setLocation({ ...location, gpsLocation: e.target.value })}
                      placeholder="e.g. 6.6018° N, 3.3515° E"
                    />
                  </div>
                </div>
              ) : eventType === "hybrid" ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Hybrid Event - Both meeting link and venue required
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Select
                        label="Meeting Platform"
                        value={location.platform || "Zoom"}
                        onChange={(e) => setLocation({ ...location, platform: e.target.value })}
                        options={platformOptions}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Meeting URL"
                        value={location.meetingUrl || ""}
                        onChange={(e) => setLocation({ ...location, meetingUrl: e.target.value })}
                        error={errors.meetingUrl}
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Venue"
                      value={location.venue || ""}
                      onChange={(e) => setLocation({ ...location, venue: e.target.value })}
                      error={errors.venue}
                      placeholder="e.g. PalmLearn Conference Hall"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      label="Address"
                      value={location.address || ""}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      error={errors.address}
                      placeholder="e.g. 42 Isaac John Street, Ikeja, Lagos"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 4: Audience */}
          {step === "audience" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Select who should receive this event
                </span>
              </div>
              <TargetAudienceBuilder
                value={audience}
                onChange={setAudience}
              />
              {errors.audience && (
                <p className="text-xs text-danger mt-1">{errors.audience}</p>
              )}
            </div>
          )}

          {/* Step 5: Notifications */}
          {step === "notifications" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Configure automated notifications (mock implementation)
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { key: "registrationConfirmation" as const, label: "Registration Confirmation" },
                  { key: "reminder24h" as const, label: "Reminder 24 hours before" },
                  { key: "reminder1h" as const, label: "Reminder 1 hour before" },
                  { key: "reminder15m" as const, label: "Reminder 15 minutes before" },
                  { key: "postEventFollowUp" as const, label: "Post-event follow-up" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
                    <span className="text-sm font-medium text-content">{item.label}</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={cn(
                        "relative inline-flex h-6 w-10 items-center rounded-full transition-colors",
                        notifications[item.key] ? "bg-primary-600" : "bg-surface-tertiary",
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                        notifications[item.key] ? "translate-x-5" : "translate-x-1",
                      )} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="pt-4 border-t border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-content">Event Resources</h3>
                  <Button variant="secondary" size="sm" onClick={addResource}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Resource
                  </Button>
                </div>
                {resources.length === 0 && (
                  <p className="text-xs text-content-tertiary py-4 text-center">
                    No resources added yet. Add slides, PDFs, or documents.
                  </p>
                )}
                <div className="space-y-3">
                  {resources.map((res, i) => (
                    <div key={res.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                      <GripVertical className="h-4 w-4 text-content-tertiary/50 cursor-grab" />
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <Input
                          placeholder="Resource name"
                          value={res.name}
                          onChange={(e) => updateResource(i, "name", e.target.value)}
                        />
                        <Select
                          value={res.type}
                          onChange={(e) => updateResource(i, "type", e.target.value)}
                          options={[
                            { value: "pdf", label: "PDF" },
                            { value: "slides", label: "Slides" },
                            { value: "video", label: "Video" },
                            { value: "link", label: "Link" },
                            { value: "document", label: "Document" },
                            { value: "assignment", label: "Assignment" },
                          ]}
                        />
                        <Input
                          placeholder="URL"
                          value={res.url}
                          onChange={(e) => updateResource(i, "url", e.target.value)}
                        />
                      </div>
                      <button onClick={() => removeResource(i)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-content-tertiary hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Event */}
              <div className="pt-4 border-t border-border/30">
                <h3 className="text-sm font-bold text-content mb-4">Post-Event</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[
                    { key: "feedbackSurvey" as const, label: "Feedback Survey" },
                    { key: "certificate" as const, label: "Attendance Certificate" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
                      <span className="text-sm font-medium text-content">{item.label}</span>
                      <button
                        onClick={() => setPostEvent({ ...postEvent, [item.key]: !postEvent[item.key] })}
                        className={cn(
                          "relative inline-flex h-6 w-10 items-center rounded-full transition-colors",
                          postEvent[item.key] ? "bg-primary-600" : "bg-surface-tertiary",
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                          postEvent[item.key] ? "translate-x-5" : "translate-x-1",
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  <Input
                    label="Session Recording URL (optional)"
                    value={postEvent.recording || ""}
                    onChange={(e) => setPostEvent({ ...postEvent, recording: e.target.value || null })}
                    placeholder="https://recording.example.com"
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-content-secondary">Trainer Notes (optional)</label>
                    <textarea
                      value={postEvent.trainerNotes || ""}
                      onChange={(e) => setPostEvent({ ...postEvent, trainerNotes: e.target.value || null })}
                      placeholder="Post-event notes from the trainer..."
                      rows={3}
                      className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === "review" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Review all details before publishing
                </span>
              </div>

              <Card variant="bordered" padding="md">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-content">{title || "Untitled Event"}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="glass" className={EVENT_TYPE_COLORS[eventType]}>{EVENT_TYPE_LABELS[eventType]}</Badge>
                      <Badge variant="glass" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{RECURRENCE_LABELS[schedule.recurrence]}</Badge>
                      <Badge variant="glass" className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">{schedule.capacity} seats</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-tertiary/50">
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Trainer</p>
                      <p className="text-sm font-medium text-content mt-0.5">{trainers.find((t) => t.id === trainerId)?.name || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Category</p>
                      <p className="text-sm font-medium text-content mt-0.5">{categories.find((c) => c.id === categoryId)?.name || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Date</p>
                      <p className="text-sm font-medium text-content mt-0.5">{schedule.startDate || "Not set"} - {schedule.endDate || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Time</p>
                      <p className="text-sm font-medium text-content mt-0.5">{schedule.startTime} - {schedule.endTime} {schedule.timezone}</p>
                    </div>
                  </div>

                  {description && (
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Description</p>
                      <p className="text-xs text-content-secondary">{description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Location</p>
                      {(eventType === "virtual" || eventType === "webinar" || eventType === "town_hall") && (
                        <p className="text-xs text-content-secondary">{location.platform}: {location.meetingUrl || "Not set"}</p>
                      )}
                      {(eventType === "physical" || eventType === "workshop") && (
                        <div>
                          <p className="text-xs text-content-secondary">{location.venue || "Not set"}</p>
                          <p className="text-xs text-content-tertiary">{location.address || ""}</p>
                        </div>
                      )}
                      {eventType === "hybrid" && (
                        <div>
                          <p className="text-xs text-content-secondary">{location.platform}: {location.meetingUrl || "Not set"}</p>
                          <p className="text-xs text-content-tertiary">{location.venue} - {location.address}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Audience</p>
                      <p className="text-xs text-content-secondary">{AUDIENCE_TYPE_LABELS[audience.type]}</p>
                    </div>
                  </div>

                  {resources.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-2">Resources ({resources.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {resources.map((r) => (
                          <Badge key={r.id} variant="glass" className="bg-surface-tertiary text-content-secondary">{r.name || "Unnamed"} ({r.type})</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Notifications</p>
                    <div className="flex flex-wrap gap-2">
                      {notifications.registrationConfirmation && <Badge variant="glass">Registration Confirmation</Badge>}
                      {notifications.reminder24h && <Badge variant="glass">24h Reminder</Badge>}
                      {notifications.reminder1h && <Badge variant="glass">1h Reminder</Badge>}
                      {notifications.reminder15m && <Badge variant="glass">15m Reminder</Badge>}
                      {notifications.postEventFollowUp && <Badge variant="glass">Post-Event Follow-up</Badge>}
                      {!notifications.registrationConfirmation && !notifications.reminder24h && !notifications.reminder1h && !notifications.reminder15m && !notifications.postEventFollowUp && (
                        <span className="text-xs text-content-tertiary">None configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface/95 backdrop-blur-md">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {step !== "review" && (
              <Button variant="secondary" onClick={handleSaveDraft}>
                Save as Draft
              </Button>
            )}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button variant="secondary" onClick={handlePrev}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              {currentStepIndex < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={handleSaveDraft}>
                    Save as Draft
                  </Button>
                  <Button onClick={handleSave}>
                    <Check className="h-4 w-4 mr-1" /> Publish Event
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
