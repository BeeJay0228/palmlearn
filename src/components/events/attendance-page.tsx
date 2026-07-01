"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { getEvents } from "@/lib/events";
import { getEventAttendance } from "@/lib/attendance";
import { useAuth } from "@/hooks/use-auth";
import {
  ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS,
  type EventAttendance, type AttendanceStatus,
} from "@/types";
import { getUsers } from "@/lib/users";
import { Search, UserCheck } from "lucide-react";

interface AttendancePageProps {
  role: "admin" | "trainer";
}

export function AttendancePage({ role }: AttendancePageProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [eventFilter] = useState<string>("all");
  void eventFilter;
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "all">("all");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const allEvents = useMemo(() => {
    let events = getEvents();
    if (role === "trainer" && user) {
      events = events.filter((e) => e.trainerId === user.id || e.createdBy === user.id);
    }
    return events;
  }, [role, user]);

  const records = useMemo(() => {
    const result: Array<EventAttendance & { eventTitle: string; learnerName: string; eventDate: string }> = [];
    const users = getUsers();
    for (const event of allEvents) {
      const attendance = getEventAttendance(event.id);
      for (const att of attendance) {
        const learner = users.find((u) => u.id === att.learnerId);
        result.push({
          ...att,
          eventTitle: event.title,
          learnerName: learner?.name || "Unknown",
          eventDate: new Date(event.schedule.startDate).toLocaleDateString(),
        });
      }
    }
    return result;
  }, [allEvents]);

  const filtered = useMemo(() => {
    let result = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.learnerName.toLowerCase().includes(q) || r.eventTitle.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
    return result;
  }, [records, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const columns = [
    { key: "learnerName", header: "Learner", sortable: true, render: (item: typeof paginated[0]) => <span className="text-sm font-medium text-content">{item.learnerName}</span> },
    { key: "eventTitle", header: "Event", sortable: true, render: (item: typeof paginated[0]) => <span className="text-sm text-content">{item.eventTitle}</span> },
    { key: "eventDate", header: "Date", sortable: true },
    { key: "status", header: "Status", render: (item: typeof paginated[0]) => (
      <Badge variant="glass" className={cn("text-[11px]", ATTENDANCE_STATUS_COLORS[item.status])}>
        {ATTENDANCE_STATUS_LABELS[item.status]}
      </Badge>
    )},
    { key: "timeAttended", header: "Time Attended", render: (item: typeof paginated[0]) => (
      <span className="text-xs text-content-tertiary">{item.timeAttended > 0 ? `${item.timeAttended} min` : "-"}</span>
    )},
    { key: "lateArrival", header: "Late", render: (item: typeof paginated[0]) => (
      <span className={cn("text-xs font-medium", item.lateArrival ? "text-amber-500" : "text-content-tertiary")}>
        {item.lateArrival ? "Yes" : "No"}
      </span>
    )},
    { key: "earlyExit", header: "Early Exit", render: (item: typeof paginated[0]) => (
      <span className={cn("text-xs font-medium", item.earlyExit ? "text-amber-500" : "text-content-tertiary")}>
        {item.earlyExit ? "Yes" : "No"}
      </span>
    )},
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
            placeholder="Search learner or event..."
            className="w-full rounded-xl border border-border bg-surface-tertiary pl-10 pr-4 py-2 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as AttendanceStatus | "all"); setPage(0); }}
            className="rounded-xl border border-border bg-surface-tertiary px-3 py-2 text-xs text-content focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="all">All Status</option>
            {(Object.entries(ATTENDANCE_STATUS_LABELS) as [AttendanceStatus, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No attendance records"
          description="Attendance records will appear here once learners start joining events."
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
                Showing {(page * pageSize) + 1}-{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
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
    </div>
  );
}
