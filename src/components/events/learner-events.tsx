"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEventsForLearner } from "@/lib/events";
import { useAuth } from "@/hooks/use-auth";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS,
  type TrainingEvent,
} from "@/types";
import { getLearnerAttendance, logJoinEvent } from "@/lib/attendance";
import {
  CalendarDays, Clock, MapPin, Video, Globe, CheckCircle,
  AlertCircle, ExternalLink, Play, Users,
} from "lucide-react";

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function CountdownBadge({ targetDate }: { targetDate: Date }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) { setLabel(""); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) setLabel(`Starts in ${days}d ${hours}h`);
      else if (hours > 0) setLabel(`Starts in ${hours}h`);
      else setLabel("Starting soon");
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!label) return null;
  return (
    <Badge variant="glass" className="bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 border-primary-200 dark:border-primary-800 animate-pulse">
      <Clock className="h-3 w-3 mr-1" /> {label}
    </Badge>
  );
}

interface EventCardProps {
  event: TrainingEvent;
  onEventClick?: (event: TrainingEvent) => void;
  onJoin?: (event: TrainingEvent) => void;
  status?: string;
}

function EventCard({ event, onEventClick, onJoin, status }: EventCardProps) {
  const eventDate = new Date(event.schedule.startDate);
  const isPast = eventDate < new Date();
  const isToday = eventDate.toDateString() === new Date().toDateString();

  return (
    <div
      onClick={() => onEventClick?.(event)}
      className="group cursor-pointer rounded-2xl border border-border/50 bg-surface overflow-hidden transition-all card-hover"
    >
      <div className={cn(
        "h-24 relative flex items-center justify-center",
        event.banner ? "" : "bg-gradient-to-br from-primary-600/20 to-primary-800/20",
      )}>
        {event.banner && <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="glass" className={EVENT_TYPE_COLORS[event.eventType] + " text-[10px]"}>
            {EVENT_TYPE_LABELS[event.eventType]}
          </Badge>
        </div>
        {isToday && !isPast && (
          <div className="absolute top-2 left-2">
            <CountdownBadge targetDate={eventDate} />
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h4 className="text-sm font-bold text-content line-clamp-1">{event.title}</h4>
        <div className="flex items-center gap-2 text-[11px] text-content-tertiary">
          <CalendarDays className="h-3 w-3" />
          <span>{eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <Clock className="h-3 w-3 ml-1" />
          <span>{formatTime(event.schedule.startTime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-content-tertiary">
          {event.eventType === "virtual" || event.eventType === "webinar" ? <Video className="h-3 w-3" /> :
           event.eventType === "physical" ? <MapPin className="h-3 w-3" /> :
           <Globe className="h-3 w-3" />}
          <span className="truncate">
            {event.eventType === "virtual" || event.eventType === "webinar" ? event.location.platform :
             event.eventType === "physical" || event.eventType === "workshop" ? event.location.venue :
             "Hybrid"}
          </span>
        </div>
        {status && (
          <Badge variant="glass" className={cn(
            status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
            status === "missed" ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
            "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
        {!isPast && onJoin && (
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onJoin(event); }}
          >
            <Play className="h-3.5 w-3.5 mr-1" /> Join Event
          </Button>
        )}
      </div>
    </div>
  );
}

function JoinDialog({ event, onClose }: { event: TrainingEvent; onClose: () => void }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"joining" | "done">("joining");

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      logJoinEvent(event.id, user.id);
      setStatus("done");
      if (event.location.meetingUrl && event.location.meetingUrl !== "#") {
        window.open(event.location.meetingUrl, "_blank");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [event, user]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border/50 shadow-2xl m-4 p-6" onClick={(e) => e.stopPropagation()}>
        {status === "joining" ? (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full border-3 border-primary-600 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-content">Joining Event</h3>
              <p className="text-sm text-content-tertiary mt-1">Preparing your session...</p>
            </div>
            <div className="space-y-2 text-left bg-surface-tertiary/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-content-secondary">
                <Video className="h-3.5 w-3.5 text-content-tertiary" /> {event.location.platform || event.eventType}
              </div>
              <div className="flex items-center gap-2 text-xs text-content-secondary">
                <Users className="h-3.5 w-3.5 text-content-tertiary" /> {event.title}
              </div>
              <div className="flex items-center gap-2 text-xs text-content-secondary">
                <Clock className="h-3.5 w-3.5 text-content-tertiary" /> {formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-content">You&apos;re in!</h3>
              <p className="text-sm text-content-tertiary mt-1">Meeting link opened in new tab</p>
            </div>
            <div className="flex gap-2 justify-center">
              {event.location.meetingUrl && event.location.meetingUrl !== "#" && (
                <Button variant="secondary" size="sm" onClick={() => window.open(event.location.meetingUrl, "_blank")}>
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Again
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Learner Dashboard Widgets ---

export function TodaysEvents({ onEventClick }: { onEventClick?: (e: TrainingEvent) => void }) {
  const { user } = useAuth();
  const [joiningEvent, setJoiningEvent] = useState<TrainingEvent | null>(null);

  const events = useMemo(() => {
    if (!user) return [];
    const allEvents = getEventsForLearner(user.id);
    const today = new Date().toDateString();
    return allEvents.filter((e) => new Date(e.schedule.startDate).toDateString() === today);
  }, [user]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-bold text-content">Today&apos;s Training</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onEventClick={onEventClick} onJoin={() => setJoiningEvent(event)} />
        ))}
      </div>
      {joiningEvent && <JoinDialog event={joiningEvent} onClose={() => setJoiningEvent(null)} />}
    </div>
  );
}

export function UpcomingLiveSessions({ onEventClick, limit = 4 }: { onEventClick?: (e: TrainingEvent) => void; limit?: number }) {
  const { user } = useAuth();
  const [joiningEvent, setJoiningEvent] = useState<TrainingEvent | null>(null);

  const events = useMemo(() => {
    if (!user) return [];
    const allEvents = getEventsForLearner(user.id);
    const now = new Date();
    return allEvents
      .filter((e) => new Date(e.schedule.startDate) > now)
      .sort((a, b) => new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime())
      .slice(0, limit);
  }, [user, limit]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-content">Upcoming Live Sessions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onEventClick={onEventClick} onJoin={() => setJoiningEvent(event)} />
        ))}
      </div>
      {joiningEvent && <JoinDialog event={joiningEvent} onClose={() => setJoiningEvent(null)} />}
    </div>
  );
}

export function MissedEvents({ onEventClick }: { onEventClick?: (e: TrainingEvent) => void }) {
  const { user } = useAuth();

  const events = useMemo(() => {
    if (!user) return [];
    const allEvents = getEventsForLearner(user.id);
    const attendance = getLearnerAttendance(user.id);
    const missedEventIds = attendance.filter((a) => a.status === "missed" || a.status === "invited").map((a) => a.eventId);
    return allEvents.filter((e) => missedEventIds.includes(e.id) && new Date(e.schedule.startDate) < new Date());
  }, [user]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-danger" />
        <h2 className="text-lg font-bold text-content">Missed Events</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onEventClick={onEventClick} status="missed" />
        ))}
      </div>
    </div>
  );
}

export function CompletedEvents({ onEventClick }: { onEventClick?: (e: TrainingEvent) => void }) {
  const { user } = useAuth();

  const events = useMemo(() => {
    if (!user) return [];
    const attendance = getLearnerAttendance(user.id);
    const completedEventIds = attendance.filter((a) => a.status === "completed").map((a) => a.eventId);
    const allEvents = getEventsForLearner(user.id);
    return allEvents.filter((e) => completedEventIds.includes(e.id));
  }, [user]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-success" />
        <h2 className="text-lg font-bold text-content">Completed Events</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onEventClick={onEventClick} status="completed" />
        ))}
      </div>
    </div>
  );
}

// --- Learner Events Page ---

export function LearnerEventsPage({ onEventClick }: { onEventClick?: (e: TrainingEvent) => void }) {
  const { user } = useAuth();
  const [joiningEvent, setJoiningEvent] = useState<TrainingEvent | null>(null);

  const allEvents = useMemo(() => {
    if (!user) return [];
    return getEventsForLearner(user.id)
      .sort((a, b) => new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime());
  }, [user]);

  const now = new Date();
  const todayStr = now.toDateString();
  const upcoming = allEvents.filter((e) => new Date(e.schedule.startDate) > now);
  const todayEvents = allEvents.filter((e) => new Date(e.schedule.startDate).toDateString() === todayStr);
  const pastEvents = allEvents.filter((e) => new Date(e.schedule.startDate) < now);

  const attendance = useMemo(() => {
    if (!user) return [];
    return getLearnerAttendance(user.id);
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      {/* Today */}
      {todayEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-content">Today&apos;s Events</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayEvents.map((event) => (
              <EventCard key={event.id} event={event} onEventClick={onEventClick} onJoin={() => setJoiningEvent(event)} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-content">Upcoming Events</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-content-tertiary py-8 text-center">No upcoming events</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} onEventClick={onEventClick} onJoin={() => setJoiningEvent(event)} />
            ))}
          </div>
        )}
      </section>

      {/* Past & Completed */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-success" />
          <h2 className="text-lg font-bold text-content">Past Events</h2>
        </div>
        {pastEvents.length === 0 ? (
          <p className="text-sm text-content-tertiary py-8 text-center">No past events</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => {
              const att = attendance.find((a) => a.eventId === event.id);
              return (
                <EventCard key={event.id} event={event} onEventClick={onEventClick}
                  status={att?.status === "completed" ? "completed" : att?.status === "missed" ? "missed" : att?.status || "invited"}
                />
              );
            })}
          </div>
        )}
      </section>

      {joiningEvent && <JoinDialog event={joiningEvent} onClose={() => setJoiningEvent(null)} />}
    </div>
  );
}

export { JoinDialog };
