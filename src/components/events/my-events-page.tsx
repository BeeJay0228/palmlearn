"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEvents, createEvent, updateEvent, deleteEvent, seedEvents } from "@/lib/events";
import { useAuth } from "@/hooks/use-auth";
import { EventWizard } from "./event-wizard";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS,
  type TrainingEvent,
} from "@/types";
import { Plus, CalendarDays, Clock, MapPin, Video, Globe, Pencil, Trash2 } from "lucide-react";

interface MyEventsPageProps {
  role: "admin" | "trainer";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function MyEventsPage(_props: MyEventsPageProps) {
  void _props;
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<TrainingEvent | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  seedEvents();

  const myEvents = useMemo(() => {
    if (!user) return [];
    const allEvents = getEvents();
    return allEvents.filter((e) => e.createdBy === user.id || e.trainerId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [user, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleEdit(event: TrainingEvent) {
    setEditEvent(event);
    setWizardOpen(true);
  }

  function handleDelete() {
    if (deleteConfirm) {
      deleteEvent(deleteConfirm);
      setDeleteConfirm(null);
      setRefreshKey((k) => k + 1);
    }
  }

  function handleSave(data: Omit<TrainingEvent, "id" | "createdAt" | "updatedAt">) {
    if (editEvent) {
      updateEvent(editEvent.id, data);
    } else {
      createEvent({ ...data, createdBy: user?.id || "" });
    }
    setRefreshKey((k) => k + 1);
  }

  const upcoming = myEvents.filter((e) => e.status === "published" && new Date(e.schedule.startDate) > new Date());
  const draft = myEvents.filter((e) => e.status === "draft");
  const past = myEvents.filter((e) => e.status !== "draft" && new Date(e.schedule.startDate) < new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-content-secondary">{myEvents.length} total events</p>
        </div>
        <Button onClick={() => { setEditEvent(undefined); setWizardOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Create Event
        </Button>
      </div>

      {/* Upcoming Events */}
      <section>
        <h3 className="text-sm font-bold text-content mb-3">Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <p className="text-xs text-content-tertiary py-4">No upcoming events</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((event) => (
              <div key={event.id} className="rounded-2xl border border-border/50 bg-surface overflow-hidden transition-all card-hover group">
                <div className="h-20 bg-gradient-to-br from-primary-600/20 to-primary-800/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  <Badge variant="glass" className={cn("absolute top-2 right-2", EVENT_STATUS_COLORS[event.status])}>
                    {EVENT_STATUS_LABELS[event.status]}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-sm font-bold text-content line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-content-tertiary">
                    <CalendarDays className="h-3 w-3" />
                    <span>{new Date(event.schedule.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <Clock className="h-3 w-3 ml-1" />
                    <span>{formatTime(event.schedule.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-content-tertiary">
                    {event.eventType === "virtual" || event.eventType === "webinar" ? <Video className="h-3 w-3" /> :
                     event.eventType === "physical" ? <MapPin className="h-3 w-3" /> :
                     <Globe className="h-3 w-3" />}
                    <span className="truncate">{EVENT_TYPE_LABELS[event.eventType]}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleEdit(event)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(event.id)}>
                      <Trash2 className="h-3 w-3 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Draft Events */}
      <section>
        <h3 className="text-sm font-bold text-content mb-3">Drafts ({draft.length})</h3>
        {draft.length === 0 ? (
          <p className="text-xs text-content-tertiary py-4">No draft events</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {draft.map((event) => (
              <div key={event.id} className="rounded-2xl border border-dashed border-border/50 bg-surface/50 overflow-hidden transition-all card-hover group">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="glass" className={EVENT_STATUS_COLORS[event.status]}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </Badge>
                    <Badge variant="glass" className={EVENT_TYPE_COLORS[event.eventType]}>
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-content line-clamp-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-content-tertiary">
                    <CalendarDays className="h-3 w-3" />
                    <span>{event.schedule.startDate || "No date set"}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleEdit(event)}>
                      <Pencil className="h-3 w-3 mr-1" /> Continue Editing
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(event.id)}>
                      <Trash2 className="h-3 w-3 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      <section>
        <h3 className="text-sm font-bold text-content mb-3">Past ({past.length})</h3>
        {past.length === 0 ? (
          <p className="text-xs text-content-tertiary py-4">No past events</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((event) => (
              <div key={event.id} className="rounded-2xl border border-border/50 bg-surface overflow-hidden transition-all card-hover group opacity-70 hover:opacity-100">
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="glass" className={EVENT_STATUS_COLORS[event.status]}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </Badge>
                    <Badge variant="glass" className={EVENT_TYPE_COLORS[event.eventType]}>
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-content line-clamp-1">{event.title}</h4>
                  <p className="text-xs text-content-tertiary">
                    {new Date(event.schedule.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <EventWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setEditEvent(undefined); }}
        onSave={handleSave}
        editEvent={editEvent}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
