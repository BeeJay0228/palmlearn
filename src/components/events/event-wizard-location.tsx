"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Video, MapPin, Globe } from "lucide-react";
import type { EventType, EventLocation } from "@/types";

const platformOptions = [
  { value: "Zoom", label: "Zoom" },
  { value: "Google Meet", label: "Google Meet" },
  { value: "Microsoft Teams", label: "Microsoft Teams" },
  { value: "Custom", label: "Custom" },
];

interface EventWizardLocationProps {
  eventType: EventType;
  location: EventLocation;
  onChange: (loc: EventLocation) => void;
  errors: Record<string, string>;
}

export function EventWizardLocation({ eventType, location, onChange, errors }: EventWizardLocationProps) {
  return (
    <div className="space-y-6">
      {eventType === "virtual" || eventType === "webinar" || eventType === "town_hall" ? (
        <div className="space-y-5">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Virtual Event - Meeting link required</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Select label="Meeting Platform" value={location.platform || "Zoom"} onChange={(e) => onChange({ ...location, platform: e.target.value })} options={platformOptions} />
            </div>
            <div className="space-y-2">
              <Input label="Meeting URL" value={location.meetingUrl || ""} onChange={(e) => onChange({ ...location, meetingUrl: e.target.value })} error={errors.meetingUrl} placeholder="https://zoom.us/j/..." />
            </div>
          </div>
        </div>
      ) : eventType === "physical" || eventType === "workshop" ? (
        <div className="space-y-5">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Physical Event - Venue details required</span>
          </div>
          <div className="space-y-2">
            <Input label="Venue" value={location.venue || ""} onChange={(e) => onChange({ ...location, venue: e.target.value })} error={errors.venue} placeholder="e.g. PalmLearn Conference Hall" />
          </div>
          <div className="space-y-2">
            <Input label="Address" value={location.address || ""} onChange={(e) => onChange({ ...location, address: e.target.value })} error={errors.address} placeholder="e.g. 42 Isaac John Street, Ikeja, Lagos" />
          </div>
          <div className="space-y-2">
            <Input label="GPS Location (optional)" value={location.gpsLocation || ""} onChange={(e) => onChange({ ...location, gpsLocation: e.target.value })} placeholder="e.g. 6.6018° N, 3.3515° E" />
          </div>
        </div>
      ) : eventType === "hybrid" ? (
        <div className="space-y-5">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Hybrid Event - Both meeting link and venue required</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Select label="Meeting Platform" value={location.platform || "Zoom"} onChange={(e) => onChange({ ...location, platform: e.target.value })} options={platformOptions} />
            </div>
            <div className="space-y-2">
              <Input label="Meeting URL" value={location.meetingUrl || ""} onChange={(e) => onChange({ ...location, meetingUrl: e.target.value })} error={errors.meetingUrl} placeholder="https://zoom.us/j/..." />
            </div>
          </div>
          <div className="space-y-2">
            <Input label="Venue" value={location.venue || ""} onChange={(e) => onChange({ ...location, venue: e.target.value })} error={errors.venue} placeholder="e.g. PalmLearn Conference Hall" />
          </div>
          <div className="space-y-2">
            <Input label="Address" value={location.address || ""} onChange={(e) => onChange({ ...location, address: e.target.value })} error={errors.address} placeholder="e.g. 42 Isaac John Street, Ikeja, Lagos" />
          </div>
        </div>
      ) : null}
    </div>
  );
}