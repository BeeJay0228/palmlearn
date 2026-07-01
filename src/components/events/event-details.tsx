"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getEvent } from "@/lib/events";
import { getEventAttendance, logJoinEvent, getAttendanceStats } from "@/lib/attendance";
import { useAuth } from "@/hooks/use-auth";
import {
  EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS,
  RECURRENCE_LABELS, ATTENDANCE_STATUS_LABELS,
  type TrainingEvent,
} from "@/types";
import {
  MapPin, Video, Clock, Users, Calendar, FileText, Download,
  ExternalLink, CheckCircle, AlertCircle, ArrowLeft,
} from "lucide-react";

interface EventDetailsProps {
  eventId: string;
  onBack?: () => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setIsPast(true);
        setTimeLeft("Event started");
        return;
      }
      setIsPast(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`);
      else setTimeLeft(`${minutes}m`);
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isPast) return <span className="text-xs text-content-tertiary">{timeLeft}</span>;
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-primary-600" />
      <span className="text-sm font-bold text-primary-600">{timeLeft}</span>
    </div>
  );
}

export function EventDetails({ eventId, onBack }: EventDetailsProps) {
  const { user } = useAuth();
  const [event] = useState<TrainingEvent | undefined>(getEvent(eventId));
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinedStatus, setJoinedStatus] = useState<string | null>(null);

  if (!event || !user) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-content-tertiary/30 mx-auto mb-3" />
        <p className="text-sm text-content-tertiary">Event not found</p>
        {onBack && (
          <Button variant="secondary" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
      </div>
    );
  }

  const isLearner = user.role === "learner";
  const attendance = getEventAttendance(eventId).find((a) => a.learnerId === user.id);
  const stats = getAttendanceStats(eventId);
  const eventDate = new Date(event.schedule.startDate);
  const isPast = eventDate < new Date();

  function handleJoin() {
    setJoining(true);
    setShowJoinDialog(true);
    const currentUser = user;
    const currentEvent = event;
    setTimeout(() => {
      if (!currentUser) return;
      logJoinEvent(eventId, currentUser.id);
      setJoining(false);
      setJoinedStatus("joined");
      if (currentEvent?.location.meetingUrl) {
        window.open(currentEvent.location.meetingUrl, "_blank");
      }
    }, 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-medium text-content-tertiary hover:text-content transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      )}

      {/* Banner */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl h-48 lg:h-64",
        event.banner ? "" : "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900",
      )}>
        {event.banner && (
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="glass" className={EVENT_TYPE_COLORS[event.eventType] + " border-white/20"}>{EVENT_TYPE_LABELS[event.eventType]}</Badge>
            <Badge variant="glass" className={EVENT_STATUS_COLORS[event.status] + " border-white/20"}>{EVENT_STATUS_LABELS[event.status]}</Badge>
            {event.schedule.recurrence !== "none" && (
              <Badge variant="glass" className="bg-purple-500/20 text-purple-200 border-white/20">{RECURRENCE_LABELS[event.schedule.recurrence]}</Badge>
            )}
          </div>
          <h1 className="text-xl lg:text-3xl font-bold text-white">{event.title}</h1>
          <p className="text-sm text-white/70 mt-1">
            {new Date(event.schedule.startDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {" • "}{formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card variant="bordered" padding="md">
            <h3 className="text-sm font-bold text-content mb-2">About this Event</h3>
            <p className="text-sm text-content-secondary leading-relaxed">{event.description || "No description provided."}</p>
          </Card>

          {/* Countdown + Join */}
          {isLearner && !isPast && (
            <Card variant="bordered" padding="md" className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/20 dark:to-primary-900/20 border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-content-tertiary uppercase tracking-wider mb-1">Event starts in</p>
                  <CountdownTimer targetDate={eventDate} />
                </div>
                {attendance?.status === "joined" || joinedStatus === "joined" ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">You&apos;re in!</span>
                  </div>
                ) : (
                  <Button onClick={handleJoin} size="lg" disabled={joining}>
                    {joining ? "Joining..." : "Join Event"}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Resources */}
          {event.resources.length > 0 && (
            <Card variant="bordered" padding="md">
              <CardTitle className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-primary-600" />
                Resources
              </CardTitle>
              <div className="space-y-2">
                {event.resources.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-border transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-tertiary">
                        {res.type === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> :
                         res.type === "slides" ? <FileText className="h-4 w-4 text-amber-500" /> :
                         res.type === "video" ? <Video className="h-4 w-4 text-blue-500" /> :
                         <FileText className="h-4 w-4 text-content-tertiary" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-content">{res.name}</p>
                        <p className="text-[10px] text-content-tertiary uppercase">{res.type}</p>
                      </div>
                    </div>
                    {res.url && res.url !== "#" && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(res.url, "_blank")}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Post-Event */}
          {isPast && (
            <Card variant="bordered" padding="md" className="border-amber-200 dark:border-amber-800">
              <CardTitle className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                Post-Event
              </CardTitle>
              <div className="space-y-3">
                {event.postEvent.feedbackSurvey && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <span className="text-xs font-medium text-content">Feedback Survey</span>
                    <Button variant="secondary" size="sm">Fill Survey</Button>
                  </div>
                )}
                {event.postEvent.certificate && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-medium text-content">Attendance Certificate</span>
                    <Button variant="secondary" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
                  </div>
                )}
                {event.postEvent.recording && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <span className="text-xs font-medium text-content">Session Recording</span>
                    <Button variant="secondary" size="sm" onClick={() => window.open(event.postEvent.recording!, "_blank")}>
                      <Video className="h-3.5 w-3.5 mr-1" /> Watch
                    </Button>
                  </div>
                )}
                {event.postEvent.trainerNotes && (
                  <div className="p-3 rounded-xl bg-surface-tertiary/50">
                    <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Trainer Notes</p>
                    <p className="text-xs text-content-secondary">{event.postEvent.trainerNotes}</p>
                  </div>
                )}
                {event.postEvent.actionItems.length > 0 && (
                  <div className="p-3 rounded-xl bg-surface-tertiary/50">
                    <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-2">Action Items</p>
                    <ul className="space-y-1">
                      {event.postEvent.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-content-secondary">
                          <CheckCircle className="h-3 w-3 text-primary-600 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Discussion placeholder */}
          <Card variant="bordered" padding="md">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-content-tertiary" />
              Discussion
            </CardTitle>
            <div className="text-center py-8">
              <p className="text-xs text-content-tertiary">Discussion feature coming soon</p>
            </div>
          </Card>

          {/* Notes placeholder */}
          <Card variant="bordered" padding="md">
            <CardTitle className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-content-tertiary" />
              Notes
            </CardTitle>
            <div className="text-center py-8">
              <p className="text-xs text-content-tertiary">Notes feature coming soon</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Join Event Dialog */}
          {showJoinDialog && (
            <Card variant="bordered" padding="md" className="border-primary-300 dark:border-primary-700 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/30 dark:to-primary-900/30">
              <div className="text-center py-4 space-y-3">
                {joining ? (
                  <>
                    <div className="flex justify-center">
                      <div className="h-10 w-10 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-content">Joining Event...</p>
                      <p className="text-xs text-content-tertiary mt-1">Preparing your session</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-10 w-10 text-success mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-content">You&apos;re in!</p>
                      <p className="text-xs text-content-tertiary mt-1">Meeting link opening in new tab</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => { if (event.location.meetingUrl) window.open(event.location.meetingUrl, "_blank"); }}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Again
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowJoinDialog(false)}>
                      Close
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Event Details Card */}
          <Card variant="bordered" padding="md">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary-600" />
              Event Details
            </CardTitle>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-content-tertiary mt-0.5" />
                <div>
                  <p className="text-xs text-content-tertiary">Date</p>
                  <p className="text-xs font-medium text-content">
                    {new Date(event.schedule.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    {event.schedule.startDate !== event.schedule.endDate && ` - ${new Date(event.schedule.endDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-content-tertiary mt-0.5" />
                <div>
                  <p className="text-xs text-content-tertiary">Time</p>
                  <p className="text-xs font-medium text-content">{formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}</p>
                  <p className="text-[10px] text-content-tertiary">{event.schedule.timezone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-content-tertiary mt-0.5" />
                <div>
                  <p className="text-xs text-content-tertiary">Capacity</p>
                  <p className="text-xs font-medium text-content">{event.schedule.capacity} attendees</p>
                </div>
              </div>
              {(event.eventType === "virtual" || event.eventType === "webinar" || event.eventType === "town_hall") && (
                <div className="flex items-start gap-3">
                  <Video className="h-4 w-4 text-content-tertiary mt-0.5" />
                  <div>
                    <p className="text-xs text-content-tertiary">Platform</p>
                    <p className="text-xs font-medium text-content">{event.location.platform}</p>
                    {event.location.meetingUrl && event.location.meetingUrl !== "#" && (
                      <Button variant="secondary" size="sm" className="mt-1" onClick={() => window.open(event.location.meetingUrl, "_blank")}>
                        <ExternalLink className="h-3 w-3 mr-1" /> Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {(event.eventType === "physical" || event.eventType === "workshop") && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-content-tertiary mt-0.5" />
                  <div>
                    <p className="text-xs text-content-tertiary">Venue</p>
                    <p className="text-xs font-medium text-content">{event.location.venue}</p>
                    <p className="text-[10px] text-content-tertiary">{event.location.address}</p>
                  </div>
                </div>
              )}
              {event.eventType === "hybrid" && (
                <>
                  <div className="flex items-start gap-3">
                    <Video className="h-4 w-4 text-content-tertiary mt-0.5" />
                    <div>
                      <p className="text-xs text-content-tertiary">Online</p>
                      <p className="text-xs font-medium text-content">{event.location.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-content-tertiary mt-0.5" />
                    <div>
                      <p className="text-xs text-content-tertiary">Venue</p>
                      <p className="text-xs font-medium text-content">{event.location.venue}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Attendance Stats */}
          <Card variant="bordered" padding="md">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary-600" />
              Attendance
            </CardTitle>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-tertiary">Invited</span>
                <span className="text-xs font-semibold text-content">{stats.invited}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-tertiary">Registered</span>
                <span className="text-xs font-semibold text-content">{stats.registered}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-tertiary">Joined</span>
                <span className="text-xs font-semibold text-content">{stats.joined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-tertiary">Completed</span>
                <span className="text-xs font-semibold text-content">{stats.completed}</span>
              </div>
              <div className="border-t border-border/30 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-content">Attendance Rate</span>
                  <span className={cn("text-xs font-bold", stats.attendanceRate >= 75 ? "text-success" : stats.attendanceRate >= 50 ? "text-amber-500" : "text-danger")}>
                    {stats.attendanceRate}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", stats.attendanceRate >= 75 ? "bg-success" : stats.attendanceRate >= 50 ? "bg-amber-500" : "bg-danger")}
                    style={{ width: `${stats.attendanceRate}%` }}
                  />
                </div>
              </div>
              {attendance && (
                <div className="pt-3 border-t border-border/30">
                  <p className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider mb-1">Your Status</p>
                  <Badge variant="glass" className={cn(
                    attendance.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" :
                    attendance.status === "joined" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                    attendance.status === "registered" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  )}>
                    {ATTENDANCE_STATUS_LABELS[attendance.status]}
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Participants placeholder */}
          <Card variant="bordered" padding="md">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-content-tertiary" />
              Participants
            </CardTitle>
            <div className="text-center py-4">
              <p className="text-xs text-content-tertiary">Participant list coming soon</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
