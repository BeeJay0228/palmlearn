"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RECURRENCE_LABELS, type EventSchedule, type RecurrencePattern } from "@/types";

interface EventWizardScheduleProps {
  schedule: EventSchedule;
  onChange: (s: EventSchedule) => void;
  errors: Record<string, string>;
}

export function EventWizardSchedule({ schedule, onChange, errors }: EventWizardScheduleProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Input label="Start Date" type="date" value={schedule.startDate} onChange={(e) => onChange({ ...schedule, startDate: e.target.value })} error={errors.startDate} />
        </div>
        <div className="space-y-2">
          <Input label="End Date" type="date" value={schedule.endDate} onChange={(e) => onChange({ ...schedule, endDate: e.target.value })} error={errors.endDate} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Input label="Start Time" type="time" value={schedule.startTime} onChange={(e) => onChange({ ...schedule, startTime: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Input label="End Time" type="time" value={schedule.endTime} onChange={(e) => onChange({ ...schedule, endTime: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Select label="Timezone" value={schedule.timezone} onChange={(e) => onChange({ ...schedule, timezone: e.target.value })} options={[
            { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
            { value: "Africa/Abuja", label: "Africa/Abuja (WAT)" },
            { value: "America/New_York", label: "America/New_York (EST)" },
            { value: "Europe/London", label: "Europe/London (GMT)" },
            { value: "UTC", label: "UTC" },
          ]} />
        </div>
        <div className="space-y-2">
          <Select label="Recurrence" value={schedule.recurrence} onChange={(e) => onChange({ ...schedule, recurrence: e.target.value as RecurrencePattern })} options={Object.entries(RECURRENCE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        </div>
        <div className="space-y-2">
          <Input label="Capacity" type="number" value={String(schedule.capacity)} onChange={(e) => onChange({ ...schedule, capacity: parseInt(e.target.value) || 0 })} error={errors.capacity} min={1} />
        </div>
      </div>
      <div className="space-y-2">
        <Input label="Registration Deadline (optional)" type="date" value={schedule.registrationDeadline || ""} onChange={(e) => onChange({ ...schedule, registrationDeadline: e.target.value || null })} />
      </div>
    </div>
  );
}