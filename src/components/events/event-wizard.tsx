"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TargetAudienceBuilder } from "@/components/assignments/target-audience-builder";
import { cn } from "@/lib/utils";
import { EventWizardBasic } from "./event-wizard-basic";
import { EventWizardSchedule } from "./event-wizard-schedule";
import { EventWizardLocation } from "./event-wizard-location";
import { EventWizardNotifications } from "./event-wizard-notifications";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS,
  RECURRENCE_LABELS, AUDIENCE_TYPE_LABELS,
  type TrainingEvent, type EventType, type EventStatus, type RecurrencePattern,
  type TargetAudience, type EventSchedule, type EventLocation,
  type EventNotifications, type EventResource, type PostEvent,
} from "@/types";
import { getUsers } from "@/lib/users";
import { getCategories, getSubCategories } from "@/lib/organization";
import { X, Check, ArrowLeft, ArrowRight, MapPin, Eye, Users, Bell, Globe } from "lucide-react";

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
      title: title.trim(), description: description.trim(), banner, trainerId, categoryId, subCategoryId, eventType,
      schedule, location, targetAudience: audience, notifications, resources, postEvent,
      status: "published", createdBy: editEvent?.createdBy || "",
    });
    onClose();
  }

  function handleSaveDraft() {
    onSave({
      title: title.trim(), description: description.trim(), banner, trainerId, categoryId, subCategoryId, eventType,
      schedule, location, targetAudience: audience, notifications, resources, postEvent,
      status: "draft" as EventStatus, createdBy: editEvent?.createdBy || "",
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
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface/95 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-bold text-content">{editEvent ? "Edit Event" : "Create Event"}</h2>
            <p className="text-xs text-content-tertiary">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-surface-tertiary transition-colors">
            <X className="h-4 w-4 text-content-tertiary" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((s, i) => {
              const isActive = step === s.key;
              const isCompleted = currentStepIndex > i;
              return (
                <button key={s.key} onClick={() => { if (i <= currentStepIndex + 1) setStep(s.key); }}
                  className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                    isActive && "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800",
                    isCompleted && "text-content-tertiary", !isActive && !isCompleted && "text-content-tertiary/50")}
                >
                  <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    isCompleted ? "bg-primary-600 text-white" : isActive ? "bg-primary-600 text-white" : "bg-surface-tertiary text-content-tertiary")}>
                    {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {step === "basic" && (
            <EventWizardBasic
              title={title} onTitleChange={setTitle}
              description={description} onDescriptionChange={setDescription}
              banner={banner} onBannerChange={setBanner}
              trainerId={trainerId} onTrainerIdChange={setTrainerId}
              categoryId={categoryId} onCategoryIdChange={setCategoryId}
              subCategoryId={subCategoryId} onSubCategoryIdChange={setSubCategoryId}
              eventType={eventType} onEventTypeChange={handleEventTypeChange}
              trainers={trainers} categories={categories} subCategories={subCategories}
              errors={errors}
            />
          )}

          {step === "schedule" && (
            <EventWizardSchedule schedule={schedule} onChange={setSchedule} errors={errors} />
          )}

          {step === "location" && (
            <EventWizardLocation eventType={eventType} location={location} onChange={setLocation} errors={errors} />
          )}

          {step === "audience" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Select who should receive this event</span>
              </div>
              <TargetAudienceBuilder value={audience} onChange={setAudience} />
              {errors.audience && <p className="text-xs text-danger mt-1">{errors.audience}</p>}
            </div>
          )}

          {step === "notifications" && (
            <EventWizardNotifications
              notifications={notifications} onNotificationsChange={setNotifications}
              postEvent={postEvent} onPostEventChange={setPostEvent}
              resources={resources} onAddResource={addResource}
              onUpdateResource={updateResource} onRemoveResource={removeResource}
            />
          )}

          {step === "review" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Review all details before publishing</span>
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
                    <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Trainer</p><p className="text-sm font-medium text-content mt-0.5">{trainers.find((t) => t.id === trainerId)?.name || "Not selected"}</p></div>
                    <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Category</p><p className="text-sm font-medium text-content mt-0.5">{categories.find((c) => c.id === categoryId)?.name || "Not selected"}</p></div>
                    <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Date</p><p className="text-sm font-medium text-content mt-0.5">{schedule.startDate || "Not set"} - {schedule.endDate || "Not set"}</p></div>
                    <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">Time</p><p className="text-sm font-medium text-content mt-0.5">{schedule.startTime} - {schedule.endTime} {schedule.timezone}</p></div>
                  </div>
                  {description && <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Description</p><p className="text-xs text-content-secondary">{description}</p></div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Location</p>
                      {(eventType === "virtual" || eventType === "webinar" || eventType === "town_hall") && <p className="text-xs text-content-secondary">{location.platform}: {location.meetingUrl || "Not set"}</p>}
                      {(eventType === "physical" || eventType === "workshop") && <div><p className="text-xs text-content-secondary">{location.venue || "Not set"}</p><p className="text-xs text-content-tertiary">{location.address || ""}</p></div>}
                      {eventType === "hybrid" && <div><p className="text-xs text-content-secondary">{location.platform}: {location.meetingUrl || "Not set"}</p><p className="text-xs text-content-tertiary">{location.venue} - {location.address}</p></div>}
                    </div>
                    <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Audience</p><p className="text-xs text-content-secondary">{AUDIENCE_TYPE_LABELS[audience.type]}</p></div>
                  </div>
                  {resources.length > 0 && <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-2">Resources ({resources.length})</p><div className="flex flex-wrap gap-2">{resources.map((r) => (<Badge key={r.id} variant="glass" className="bg-surface-tertiary text-content-secondary">{r.name || "Unnamed"} ({r.type})</Badge>))}</div></div>}
                  <div><p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Notifications</p><div className="flex flex-wrap gap-2">
                    {notifications.registrationConfirmation && <Badge variant="glass">Registration Confirmation</Badge>}
                    {notifications.reminder24h && <Badge variant="glass">24h Reminder</Badge>}
                    {notifications.reminder1h && <Badge variant="glass">1h Reminder</Badge>}
                    {notifications.reminder15m && <Badge variant="glass">15m Reminder</Badge>}
                    {notifications.postEventFollowUp && <Badge variant="glass">Post-Event Follow-up</Badge>}
                  </div></div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface/95 backdrop-blur-md">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <div className="flex items-center gap-3">
            {step !== "review" && <Button variant="secondary" onClick={handleSaveDraft}>Save as Draft</Button>}
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && <Button variant="secondary" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>}
              {currentStepIndex < steps.length - 1 ? (
                <Button onClick={handleNext}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={handleSaveDraft}>Save as Draft</Button>
                  <Button onClick={handleSave}><Check className="h-4 w-4 mr-1" /> Publish Event</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}