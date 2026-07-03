"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ASSIGNMENT_TYPE_LABELS, ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_TYPE_COLORS, ASSIGNMENT_PRIORITY_COLORS,
  AUDIENCE_TYPE_LABELS,
  type TargetAudience, type AssignmentSchedule, type AssignmentNotifications,
  type AssignmentType, type AssignmentPriority,
} from "@/types";
import { AlertTriangle } from "lucide-react";

interface AssignmentWizardReviewProps {
  name: string;
  description: string;
  assignmentType: AssignmentType;
  priority: AssignmentPriority;
  courseIds: string[];
  campaignId: string;
  audience: TargetAudience;
  schedule: AssignmentSchedule;
  notifications: AssignmentNotifications;
  errors: Record<string, string>;
  allUsersCount: number;
  selectedCourses: { id: string; title: string }[];
  programmeName: string;
}

export function AssignmentWizardReview({
  name, description, assignmentType, priority, courseIds,
  campaignId, audience, schedule, notifications,
  errors, allUsersCount, selectedCourses, programmeName,
}: AssignmentWizardReviewProps) {
  return (
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
              {Object.entries(errors).map(([key, msg]) => <li key={key}>{msg}</li>)}
            </ul>
          </div>
        </div>
      )}

      <Card variant="bordered" padding="md" className="space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-content-tertiary mb-1">Courses ({courseIds.length})</p>
            {selectedCourses.length > 0 ? (
              <div className="flex flex-wrap gap-1">{selectedCourses.map((c) => (<Badge key={c.id} variant="secondary" size="sm">{c.title}</Badge>))}</div>
            ) : <p className="text-sm text-content-secondary">No courses selected</p>}
          </div>
          <div>
            <p className="text-xs text-content-tertiary mb-1">Target Audience</p>
            <p className="text-sm font-medium text-content">{AUDIENCE_TYPE_LABELS[audience.type]}</p>
            <p className="text-xs text-content-tertiary">{audience.type === "organization" ? `All learners (${allUsersCount} users)` : `${audience.userIds.length + audience.categoryIds.length + audience.subCategoryIds.length + audience.regionIds.length + audience.stateIds.length} selection(s)`}</p>
          </div>
        </div>
        <hr className="border-border/50" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-content-tertiary mb-1">Schedule</p>
            <p className="text-sm font-medium text-content capitalize">{schedule.type}</p>
            {schedule.type === "scheduled" && (<>
              {schedule.startDate && <p className="text-xs text-content-tertiary">Start: {new Date(schedule.startDate).toLocaleString()}</p>}
              {schedule.dueDate && <p className="text-xs text-content-tertiary">Due: {new Date(schedule.dueDate).toLocaleString()}</p>}
            </>)}
          </div>
          <div>
            <p className="text-xs text-content-tertiary mb-1">Notifications</p>
            <p className="text-sm font-medium text-content">
              {[notifications.sendEmail && "Email", notifications.inApp && "In-App", notifications.reminderSchedule !== "none" && `${notifications.reminderSchedule} reminders`].filter(Boolean).join(", ") || "None"}
            </p>
          </div>
        </div>
        {campaignId && programmeName && (<>
          <hr className="border-border/50" />
          <div>
            <p className="text-xs text-content-tertiary mb-1">Training Programme</p>
            <p className="text-sm font-medium text-content">{programmeName}</p>
          </div>
        </>)}
      </Card>
    </div>
  );
}