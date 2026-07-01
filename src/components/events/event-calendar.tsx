"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS,
  type TrainingEvent, type EventType,
} from "@/types";
import { ChevronLeft, ChevronRight, MapPin, Video, Globe, CalendarDays, List, LayoutGrid } from "lucide-react";

type CalendarView = "month" | "week" | "day" | "agenda";

interface EventCalendarProps {
  events: TrainingEvent[];
  onEventClick?: (event: TrainingEvent) => void;
  compact?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getDaysInWeek(year: number, month: number, day: number): Date[] {
  const date = new Date(year, month, day);
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }
  return days;
}

export function EventCalendar({ events, onEventClick, compact = false }: EventCalendarProps) {
  const today = new Date();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    let result = events;
    if (typeFilter !== "all") result = result.filter((e) => e.eventType === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return result;
  }, [events, typeFilter, search]);

  function navigate(direction: "prev" | "next") {
    const factor = direction === "next" ? 1 : -1;
    if (view === "month") {
      setCurrentDate(new Date(year, month + factor, 1));
    } else if (view === "week" || view === "day") {
      const days = view === "week" ? 7 : 1;
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + factor * days);
      setCurrentDate(newDate);
    } else {
      setCurrentDate(new Date(year, month + factor, 1));
    }
  }

  function goToday() {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }

  const eventsForDate = useMemo(() => {
    const map = new Map<string, TrainingEvent[]>();
    for (const event of filteredEvents) {
      const key = new Date(event.schedule.startDate).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [filteredEvents]);

  const selectedEvents = selectedDate ? eventsForDate.get(selectedDate.toDateString()) || [] : [];

  const weekDays = useMemo(() => {
    if (view === "week" && selectedDate) {
      return getDaysInWeek(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    }
    if (view === "day" && selectedDate) {
      return [selectedDate];
    }
    return [];
  }, [view, selectedDate]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base font-bold text-content min-w-[180px] text-center">
            {view === "month" && `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month]} ${year}`}
            {view === "week" && selectedDate && `Week of ${selectedDate.toLocaleDateString()}`}
            {view === "day" && selectedDate && selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {view === "agenda" && `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month]} ${year}`}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={goToday} className="ml-2">
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-border/50 overflow-hidden">
            {(["month", "week", "day", "agenda"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v ? "bg-primary-600 text-white" : "text-content-tertiary hover:text-content",
                )}
              >
                {v === "month" ? <LayoutGrid className="h-3.5 w-3.5" /> : v === "week" ? "W" : v === "day" ? "D" : <List className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-xl border border-border bg-surface-tertiary px-4 py-2 pl-10 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTypeFilter("all")}
              className={cn("px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border", typeFilter === "all" ? "bg-primary-600 text-white border-primary-600" : "border-border text-content-tertiary hover:text-content")}
            >
              All
            </button>
            {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(typeFilter === key ? "all" : key)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                  typeFilter === key ? EVENT_TYPE_COLORS[key] + " border-current" : "border-border text-content-tertiary hover:text-content",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className={cn("lg:col-span-2", compact && "lg:col-span-3")}>
          {/* Month View */}
          {view === "month" && (
            <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border/50">
                {DAYS.map((day) => (
                  <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/30 p-1.5" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const key = date.toDateString();
                  const dayEvents = eventsForDate.get(key) || [];
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "min-h-[100px] border-b border-r border-border/30 p-1.5 text-left transition-all hover:bg-surface-tertiary/50",
                        isSelected && "bg-primary-50 dark:bg-primary-950/20 ring-1 ring-primary-500",
                      )}
                    >
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday(date) && "bg-primary-600 text-white",
                        isSelected && !isToday(date) && "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300",
                        !isSelected && !isToday(date) && "text-content",
                      )}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity",
                              EVENT_TYPE_COLORS[event.eventType],
                            )}
                          >
                            {event.schedule.startTime} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[10px] text-content-tertiary pl-1">+{dayEvents.length - 3} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week / Day View */}
          {(view === "week" || view === "day") && (
            <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden">
              {weekDays.map((date) => {
                const key = date.toDateString();
                const dayEvents = eventsForDate.get(key) || [];
                const hours = Array.from({ length: 12 }, (_, i) => i + 8);
                return (
                  <div key={key} className="border-b border-border/30 last:border-b-0">
                    <div className={cn(
                      "px-4 py-2 text-sm font-semibold border-b border-border/30",
                      isToday(date) ? "bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-300" : "text-content",
                    )}>
                      {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                      {isToday(date) && <span className="ml-2 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded-full">Today</span>}
                    </div>
                    <div className="divide-y divide-border/30">
                      {hours.map((hour) => {
                        const hourEvents = dayEvents.filter((e) => {
                          const eventHour = parseInt(e.schedule.startTime.split(":")[0]);
                          return eventHour === hour;
                        });
                        return (
                          <div key={hour} className="flex min-h-[48px] group">
                            <div className="w-16 px-2 py-1.5 text-[10px] text-content-tertiary text-right border-r border-border/30">
                              {String(hour).padStart(2, "0")}:00
                            </div>
                            <div className="flex-1 px-2 py-1 space-y-0.5">
                              {hourEvents.map((event) => (
                                <div
                                  key={event.id}
                                  onClick={() => onEventClick?.(event)}
                                  className={cn(
                                    "px-2 py-1 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity truncate",
                                    EVENT_TYPE_COLORS[event.eventType],
                                  )}
                                >
                                  {event.schedule.startTime} - {event.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Agenda View */}
          {view === "agenda" && (
            <div className="space-y-3">
              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 text-content-tertiary/30 mx-auto mb-3" />
                  <p className="text-sm text-content-tertiary">No events found</p>
                </div>
              )}
              {Array.from(eventsForDate.entries())
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([dateKey, dayEvents]) => (
                  <div key={dateKey}>
                    <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2 px-1">
                      {new Date(dateKey).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                      {isToday(new Date(dateKey)) && <span className="ml-2 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded-full">Today</span>}
                    </h4>
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className="w-full text-left p-3 rounded-xl border border-border/50 bg-surface hover:border-border transition-all card-hover flex items-start gap-3"
                        >
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0", EVENT_TYPE_COLORS[event.eventType])}>
                            {event.eventType === "virtual" || event.eventType === "webinar" ? <Video className="h-4 w-4" /> :
                             event.eventType === "physical" ? <MapPin className="h-4 w-4" /> :
                             <Globe className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-content truncate">{event.title}</p>
                            <p className="text-xs text-content-tertiary mt-0.5">
                              {formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}
                            </p>
                          </div>
                          <Badge variant="glass" className={EVENT_TYPE_COLORS[event.eventType] + " flex-shrink-0"}>
                            {EVENT_TYPE_LABELS[event.eventType]}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {!compact && (
          <div className="space-y-4">
            <Card variant="bordered" padding="md">
              <h4 className="text-sm font-bold text-content mb-3">
                {selectedDate ? selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Select a date"}
              </h4>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-8 w-8 text-content-tertiary/30 mx-auto mb-2" />
                  <p className="text-xs text-content-tertiary">No events on this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="w-full text-left p-3 rounded-xl border border-border/50 hover:border-border transition-all card-hover"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0", EVENT_TYPE_COLORS[event.eventType])}>
                          {event.eventType === "virtual" || event.eventType === "webinar" ? <Video className="h-3.5 w-3.5" /> :
                           event.eventType === "physical" ? <MapPin className="h-3.5 w-3.5" /> :
                           <Globe className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-content truncate">{event.title}</p>
                          <p className="text-[10px] text-content-tertiary">{formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="glass" className={EVENT_TYPE_COLORS[event.eventType] + " text-[9px]"}>
                              {EVENT_TYPE_LABELS[event.eventType]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Legend */}
            <Card variant="bordered" padding="sm">
              <h4 className="text-xs font-bold text-content mb-2">Legend</h4>
              <div className="space-y-1.5">
                {(Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", EVENT_TYPE_COLORS[key].replace("bg-", "").replace(" text-", " ").split(" ")[0] ? "bg-blue-500" : "bg-gray-500")} />
                    <span className="text-[11px] text-content-secondary">{label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
