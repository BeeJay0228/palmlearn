"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { getEvents, createEvent, updateEvent, deleteEvent, seedEvents } from "@/lib/events";
import { mockInviteLearners } from "@/lib/attendance";
import { useAuth } from "@/hooks/use-auth";
import { EventWizard } from "./event-wizard";
import { getUsers } from "@/lib/users";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS,
  type TrainingEvent, type EventType, type EventStatus,
} from "@/types";
import {
  Plus, Search, CalendarDays, Pencil, Trash2, MapPin, Video, Globe,
} from "lucide-react";

interface EventsPageProps {
  role: "admin" | "trainer";
}

export function EventsPage({ role }: EventsPageProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<TrainingEvent | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;

  seedEvents();

  const allEvents = useMemo(() => {
    let events = getEvents();
    if (role === "trainer" && user) {
      events = events.filter((e) => e.trainerId === user.id || e.createdBy === user.id);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      events = events.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") events = events.filter((e) => e.status === statusFilter);
    if (typeFilter !== "all") events = events.filter((e) => e.eventType === typeFilter);
    events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return events;
  }, [search, statusFilter, typeFilter, role, user, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(allEvents.length / pageSize);
  const paginated = allEvents.slice(page * pageSize, (page + 1) * pageSize);

  const users = getUsers();

  function handleEdit(event: TrainingEvent) {
    setEditEvent(event);
    setWizardOpen(true);
  }

  function handleDelete(id: string) {
    deleteEvent(id);
    setDeleteConfirm(null);
    setRefreshKey((k) => k + 1);
  }

  function handleWizardSave(data: Omit<TrainingEvent, "id" | "createdAt" | "updatedAt">) {
    if (editEvent) {
      updateEvent(editEvent.id, data);
    } else {
      const newEvent = createEvent(data);
      if (data.targetAudience.userIds.length > 0) {
        mockInviteLearners(newEvent.id, data.targetAudience.userIds);
      }
    }
    setRefreshKey((k) => k + 1);
  }

  function formatTime(time: string) {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }

  const columns = [
    {
      key: "title", header: "Event", sortable: true,
      render: (item: TrainingEvent) => (
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", EVENT_TYPE_COLORS[item.eventType])}>
            {item.eventType === "virtual" || item.eventType === "webinar" ? <Video className="h-4 w-4" /> :
             item.eventType === "physical" ? <MapPin className="h-4 w-4" /> :
             <Globe className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-content">{item.title}</p>
            <p className="text-xs text-content-tertiary">{users.find((u) => u.id === item.trainerId)?.name || "Unknown"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "eventType", header: "Type", sortable: true,
      render: (item: TrainingEvent) => (
        <Badge variant="glass" className={cn("text-[11px]", EVENT_TYPE_COLORS[item.eventType])}>
          {EVENT_TYPE_LABELS[item.eventType]}
        </Badge>
      ),
    },
    {
      key: "startDate", header: "Date", sortable: true,
      render: (item: TrainingEvent) => (
        <div className="text-xs text-content">
          <p>{new Date(item.schedule.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          <p className="text-content-tertiary">{formatTime(item.schedule.startTime)} - {formatTime(item.schedule.endTime)}</p>
        </div>
      ),
    },
    {
      key: "status", header: "Status", sortable: true,
      render: (item: TrainingEvent) => (
        <Badge variant="glass" className={cn("text-[11px]", EVENT_STATUS_COLORS[item.status])}>
          {EVENT_STATUS_LABELS[item.status]}
        </Badge>
      ),
    },
    {
      key: "actions", header: "",
      render: (item: TrainingEvent) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleEdit(item)} className="rounded-lg p-1.5 hover:bg-surface-tertiary text-content-tertiary hover:text-content transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-content-tertiary hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search events..."
            className="w-full rounded-xl border border-border bg-surface-tertiary pl-10 pr-4 py-2 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as EventType | "all"); setPage(0); }}
            className="rounded-xl border border-border bg-surface-tertiary px-3 py-2 text-xs text-content focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="all">All Types</option>
            {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as EventStatus | "all"); setPage(0); }}
            className="rounded-xl border border-border bg-surface-tertiary px-3 py-2 text-xs text-content focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="all">All Status</option>
            {(Object.entries(EVENT_STATUS_LABELS) as [EventStatus, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Button onClick={() => { setEditEvent(undefined); setWizardOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Create Event
          </Button>
        </div>
      </div>

      {allEvents.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Create your first training event to get started."
          action={<Button onClick={() => { setEditEvent(undefined); setWizardOpen(true); }}><Plus className="h-4 w-4" /> Create Event</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={paginated}
            keyExtractor={(item) => item.id}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-content-tertiary">
                Showing {(page * pageSize) + 1}-{Math.min((page + 1) * pageSize, allEvents.length)} of {allEvents.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <EventWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setEditEvent(undefined); }}
        onSave={handleWizardSave}
        editEvent={editEvent}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
