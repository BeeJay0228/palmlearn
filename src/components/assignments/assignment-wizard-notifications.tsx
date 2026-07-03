"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AssignmentNotifications } from "@/types";

interface AssignmentWizardNotificationsProps {
  notifications: AssignmentNotifications;
  onChange: (n: AssignmentNotifications) => void;
  markDirty: () => void;
}

export function AssignmentWizardNotifications({ notifications, onChange, markDirty }: AssignmentWizardNotificationsProps) {
  function update(n: AssignmentNotifications) { onChange(n); markDirty(); }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-content">Notifications</h3>
        <p className="text-sm text-content-secondary">Configure how and when learners are notified.</p>
      </div>
      <div className="space-y-3">
        {[
          { key: "sendEmail" as const, label: "Email Notification", desc: "Send email alerts when assignment is created" },
          { key: "inApp" as const, label: "In-App Notification", desc: "Show notification in the platform" },
        ].map(({ key, label, desc }) => (
          <label key={key} className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-surface-secondary/50 transition-colors">
            <input type="checkbox" checked={notifications[key]}
              onChange={(e) => { update({ ...notifications, [key]: e.target.checked }); }}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            <div>
              <p className="text-sm font-medium text-content">{label}</p>
              <p className="text-xs text-content-tertiary">{desc}</p>
            </div>
          </label>
        ))}
        <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-surface-secondary/50 transition-colors">
          <input type="checkbox" checked={notifications.reminderSchedule !== "none"}
            onChange={(e) => { update({ ...notifications, reminderSchedule: e.target.checked ? "weekly" : "none" }); }}
            className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
          <div>
            <p className="text-sm font-medium text-content">Overdue Reminder</p>
            <p className="text-xs text-content-tertiary">Send reminders when assignment is overdue</p>
          </div>
        </label>
      </div>
      {notifications.reminderSchedule !== "none" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Reminder Frequency" value={notifications.reminderSchedule}
            onChange={(e) => { update({ ...notifications, reminderSchedule: e.target.value as "none" | "daily" | "weekly" }); }}
            options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }]} />
          <Input label="Reminder Count" type="number" min={1} max={30}
            value={notifications.reminderFrequency}
            onChange={(e) => { update({ ...notifications, reminderFrequency: parseInt(e.target.value) || 1 }); }}
            floating />
        </div>
      )}
    </div>
  );
}