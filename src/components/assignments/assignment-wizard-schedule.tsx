"use client";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AssignmentSchedule } from "@/types";

interface AssignmentWizardScheduleProps {
  schedule: AssignmentSchedule;
  onChange: (s: AssignmentSchedule) => void;
  errors: Record<string, string>;
  markDirty: () => void;
}

export function AssignmentWizardSchedule({ schedule, onChange, errors, markDirty }: AssignmentWizardScheduleProps) {
  function setSchedule(s: AssignmentSchedule) { onChange(s); markDirty(); }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-content">Schedule</h3>
        <p className="text-sm text-content-secondary">Set when this assignment takes effect.</p>
      </div>
      <div className="flex gap-2">
        {(["immediate", "scheduled"] as const).map((t) => (
          <button key={t} type="button" onClick={() => { setSchedule({ ...schedule, type: t, startDate: t === "immediate" ? null : schedule.startDate }); }}
            className={cn("flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border",
              schedule.type === t ? "bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-950/30 dark:border-primary-700 dark:text-primary-400" : "bg-surface border-border text-content-secondary hover:border-border-strong")}>
            {t === "immediate" ? "Immediate" : "Scheduled"}
          </button>
        ))}
      </div>
      {schedule.type === "scheduled" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content">Start Date</label>
              <input type="date" value={schedule.startDate?.split("T")[0] || ""}
                onChange={(e) => { setSchedule({ ...schedule, startDate: e.target.value ? new Date(e.target.value).toISOString() : null }); }}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none" />
              {errors.startDate && <p className="text-xs text-danger">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content">Start Time</label>
              <input type="time" value={schedule.startDate?.split("T")[1]?.slice(0, 5) || "09:00"}
                onChange={(e) => {
                  const d = schedule.startDate ? new Date(schedule.startDate) : new Date();
                  const [h, m] = e.target.value.split(":").map(Number);
                  d.setHours(h, m, 0, 0);
                  setSchedule({ ...schedule, startDate: d.toISOString() });
                }}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content">Due Date</label>
              <input type="date" value={schedule.dueDate?.split("T")[0] || ""}
                onChange={(e) => { setSchedule({ ...schedule, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null }); }}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none" />
              {errors.dueDate && <p className="text-xs text-danger">{errors.dueDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content">Due Time</label>
              <input type="time" value={schedule.dueDate?.split("T")[1]?.slice(0, 5) || "17:00"}
                onChange={(e) => {
                  const d = schedule.dueDate ? new Date(schedule.dueDate) : new Date();
                  const [h, m] = e.target.value.split(":").map(Number);
                  d.setHours(h, m, 0, 0);
                  setSchedule({ ...schedule, dueDate: d.toISOString() });
                }}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-content">Expiry Date <span className="text-content-tertiary font-normal">(optional)</span></label>
              <input type="date" value={schedule.expiryDate?.split("T")[0] || ""}
                onChange={(e) => { setSchedule({ ...schedule, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : null }); }}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content transition-all focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-content mb-1.5 block">Timezone</label>
              <select value={schedule.timezone}
                onChange={(e) => { setSchedule({ ...schedule, timezone: e.target.value }); }}
                className="flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all">
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}