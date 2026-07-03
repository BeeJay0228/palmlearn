"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bell, Plus, Trash2, GripVertical } from "lucide-react";
import type { EventNotifications, PostEvent, EventResource } from "@/types";

interface EventWizardNotificationsProps {
  notifications: EventNotifications;
  onNotificationsChange: (n: EventNotifications) => void;
  postEvent: PostEvent;
  onPostEventChange: (p: PostEvent) => void;
  resources: EventResource[];
  onAddResource: () => void;
  onUpdateResource: (index: number, field: keyof EventResource, value: string) => void;
  onRemoveResource: (index: number) => void;
}

export function EventWizardNotifications({
  notifications, onNotificationsChange,
  postEvent, onPostEventChange,
  resources, onAddResource, onUpdateResource, onRemoveResource,
}: EventWizardNotificationsProps) {
  const toggleNotif = (key: keyof EventNotifications) => onNotificationsChange({ ...notifications, [key]: !notifications[key] });
  const togglePost = (key: keyof PostEvent) => onPostEventChange({ ...postEvent, [key]: !postEvent[key] });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Configure automated notifications (mock implementation)</span>
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
            <button onClick={() => toggleNotif(item.key)} className={cn("relative inline-flex h-6 w-10 items-center rounded-full transition-colors", notifications[item.key] ? "bg-primary-600" : "bg-surface-tertiary")}>
              <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm", notifications[item.key] ? "translate-x-5" : "translate-x-1")} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-content">Event Resources</h3>
          <Button variant="secondary" size="sm" onClick={onAddResource}><Plus className="h-3.5 w-3.5 mr-1" /> Add Resource</Button>
        </div>
        {resources.length === 0 && <p className="text-xs text-content-tertiary py-4 text-center">No resources added yet. Add slides, PDFs, or documents.</p>}
        <div className="space-y-3">
          {resources.map((res, i) => (
            <div key={res.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
              <GripVertical className="h-4 w-4 text-content-tertiary/50 cursor-grab" />
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Input placeholder="Resource name" value={res.name} onChange={(e) => onUpdateResource(i, "name", e.target.value)} />
                <Select value={res.type} onChange={(e) => onUpdateResource(i, "type", e.target.value)} options={[
                  { value: "pdf", label: "PDF" }, { value: "slides", label: "Slides" },
                  { value: "video", label: "Video" }, { value: "link", label: "Link" },
                  { value: "document", label: "Document" }, { value: "assignment", label: "Assignment" },
                ]} />
                <Input placeholder="URL" value={res.url} onChange={(e) => onUpdateResource(i, "url", e.target.value)} />
              </div>
              <button onClick={() => onRemoveResource(i)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-content-tertiary hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/30">
        <h3 className="text-sm font-bold text-content mb-4">Post-Event</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { key: "feedbackSurvey" as const, label: "Feedback Survey" },
            { key: "certificate" as const, label: "Attendance Certificate" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-border transition-colors">
              <span className="text-sm font-medium text-content">{item.label}</span>
              <button onClick={() => togglePost(item.key)} className={cn("relative inline-flex h-6 w-10 items-center rounded-full transition-colors", postEvent[item.key] ? "bg-primary-600" : "bg-surface-tertiary")}>
                <span className={cn("inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm", postEvent[item.key] ? "translate-x-5" : "translate-x-1")} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <Input label="Session Recording URL (optional)" value={postEvent.recording || ""} onChange={(e) => onPostEventChange({ ...postEvent, recording: e.target.value || null })} placeholder="https://recording.example.com" />
          <div className="space-y-2">
            <label className="text-xs font-medium text-content-secondary">Trainer Notes (optional)</label>
            <textarea value={postEvent.trainerNotes || ""} onChange={(e) => onPostEventChange({ ...postEvent, trainerNotes: e.target.value || null })} placeholder="Post-event notes from the trainer..." rows={3} className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-3 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}