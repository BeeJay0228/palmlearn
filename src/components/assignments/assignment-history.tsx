"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { getLearnerAssignments } from "@/lib/learner-assignments";
import { getAssignments } from "@/lib/assignments";
import { getCourses } from "@/lib/courses";
import { getUsers } from "@/lib/users";
import {
  LEARNER_ASSIGNMENT_STATUS_LABELS, LEARNER_ASSIGNMENT_STATUS_COLORS,
} from "@/types";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AssignmentHistoryProps {
  role: "admin" | "trainer";
}

export function AssignmentHistory({ role }: AssignmentHistoryProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const allUsers = getUsers();
  const assignments = getAssignments();
  const courses = getCourses();
  const allRecords = getLearnerAssignments();

  const items = useMemo(() => {
    let data = allRecords;
    if (role === "trainer" && user) {
      const trainerAssignmentIds = assignments
        .filter((a) => a.assignedBy === user.id)
        .map((a) => a.id);
      data = data.filter((la) => trainerAssignmentIds.includes(la.assignmentId));
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((la) => {
        const asgn = assignments.find((a) => a.id === la.assignmentId);
        const course = courses.find((c) => c.id === la.courseId);
        const learner = allUsers.find((u) => u.id === la.learnerId);
        return (asgn?.name || "").toLowerCase().includes(q) ||
          (course?.title || "").toLowerCase().includes(q) ||
          (learner?.name || "").toLowerCase().includes(q);
      });
    }
    if (statusFilter) {
      data = data.filter((la) => la.status === statusFilter);
    }
    return data.sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
  }, [search, statusFilter, role, user, allRecords, allUsers, assignments, courses]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginated = items.slice((page - 1) * pageSize, page * pageSize);

  function getUserName(id: string): string {
    return allUsers.find((u) => u.id === id)?.name || id;
  }

  function getAssignmentName(id: string): string {
    return assignments.find((a) => a.id === id)?.name || "Unknown";
  }

  function getCourseName(id: string): string {
    return courses.find((c) => c.id === id)?.title || "Unknown";
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Assignment History"
        description="Track learner progress across all assignments."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search learner, assignment, or course..."
            className="flex h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[{ value: "", label: "All Statuses" }, ...Object.entries(LEARNER_ASSIGNMENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
        />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/80">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Learner</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Assignment</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Course</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Last Activity</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Time Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <EmptyState title="No history found" description="Assignments will appear here once learners start." />
                  </td>
                </tr>
              ) : (
                paginated.map((la) => (
                  <tr key={la.id} className="transition-all duration-150 hover:bg-surface-secondary/60">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-secondary text-xs font-bold text-content-secondary">
                          {getUserName(la.learnerId).charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-content">{getUserName(la.learnerId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-content">{getAssignmentName(la.assignmentId)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-content-secondary">{getCourseName(la.courseId)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-surface-tertiary overflow-hidden">
                          <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${la.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-content-secondary">{la.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className={LEARNER_ASSIGNMENT_STATUS_COLORS[la.status]}>{LEARNER_ASSIGNMENT_STATUS_LABELS[la.status]}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-content-secondary">{new Date(la.assignedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-sm text-content-secondary">{la.lastActivity ? new Date(la.lastActivity).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-content-secondary">{la.timeSpent > 0 ? `${Math.floor(la.timeSpent / 60)}h ${la.timeSpent % 60}m` : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-content-tertiary">Showing {(page - 1) * pageSize + 1}&ndash;{Math.min(page * pageSize, items.length)} of {items.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all", i + 1 === page ? "bg-primary-600 text-white shadow-sm" : "text-content-secondary hover:text-content hover:bg-surface-hover")}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
