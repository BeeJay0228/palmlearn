"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAssignmentsForLearner, checkAndUpdateOverdueStatus } from "@/lib/learner-assignments";
import { getAssignments } from "@/lib/assignments";
import { getCourses } from "@/lib/courses";
import type { Assignment, Course, LearnerAssignment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList, Clock, ChevronRight, AlertTriangle, CheckCircle, PlayCircle, BookOpen, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface EnrichedItem extends LearnerAssignment {
  course?: Course;
  assignment?: Assignment;
  daysLeft?: number | null;
}

const STATUS_TABS = ["All", "In Progress", "Not Started", "Completed", "Overdue"] as const;
type Tab = (typeof STATUS_TABS)[number];

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "danger" | "default" | "secondary" | "glass" }> = {
  not_started: { label: "Not Started", variant: "default" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  overdue: { label: "Overdue", variant: "danger" },
};

export default function LearnerAssignmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLAnchorElement>(null);
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const assignmentIdParam = searchParams.get("assignmentId");

  useEffect(() => {
    if (filterParam === "assignments") setActiveTab("All");
    if (assignmentIdParam) setAssignmentId(assignmentIdParam);
  }, [filterParam, assignmentIdParam]);

  const items = useMemo(() => {
    if (!user) return [];
    const allAssignments = getAssignments();
    checkAndUpdateOverdueStatus(user.id, allAssignments);
    const records = getAssignmentsForLearner(user.id);
    const courses = getCourses();
    return records.map<EnrichedItem>((r) => {
      const asgn = allAssignments.find((a) => a.id === r.assignmentId);
      const course = courses.find((c) => c.id === r.courseId);
      const daysLeft = asgn?.schedule?.dueDate
        ? Math.ceil((new Date(asgn.schedule.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      return { ...r, assignment: asgn, course, daysLeft };
    });
  }, [user]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeTab === "In Progress") result = result.filter((i) => i.status === "in_progress");
    else if (activeTab === "Not Started") result = result.filter((i) => i.status === "not_started");
    else if (activeTab === "Completed") result = result.filter((i) => i.status === "completed");
    else if (activeTab === "Overdue") result = result.filter((i) => i.status === "overdue");
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.assignment?.name.toLowerCase().includes(q) || i.course?.title.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeTab, search]);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [assignmentId, filtered]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content">My Assignments</h1>
        <p className="text-sm text-content-secondary mt-1">Track and manage all your assigned courses.</p>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-surface text-sm text-content placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            aria-label="Search assignments"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab
                ? "bg-primary-600 text-white shadow-sm"
                : "text-content-secondary hover:text-content hover:bg-surface-hover",
            )}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({items.filter((i) => tab === "In Progress" ? i.status === "in_progress" : tab === "Not Started" ? i.status === "not_started" : tab === "Completed" ? i.status === "completed" : i.status === "overdue").length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filterParam === "assignments" && (
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium animate-fade-in bg-primary-50 dark:bg-primary-950/20 px-3 py-2 rounded-lg w-fit">
          <ClipboardList className="h-3.5 w-3.5" />
          Showing all assignments
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === "All" && !search ? ClipboardList : Search}
          title={activeTab === "All" && !search ? "No assignments yet" : "No matches found"}
          description={
            activeTab === "All" && !search
              ? "When you receive assignments, they will appear here."
              : "Try adjusting your search or filter."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => {
            const badge = STATUS_BADGE[item.status] || STATUS_BADGE.not_started;
            const isOverdue = item.status === "overdue";
            const isCompleted = item.status === "completed";
            const isHighlighted = assignmentId === item.assignmentId;
            return (
              <Link
                key={item.id}
                href={`/learner/assignment/${item.id}`}
                ref={isHighlighted ? highlightRef : undefined}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-surface transition-all card-hover group",
                  isOverdue && "border-danger/30 bg-danger/[0.02]",
                  isCompleted && "opacity-75",
                  isHighlighted && "ring-2 ring-primary-500 animate-highlight-fade",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    isOverdue ? "bg-danger/10" : isCompleted ? "bg-emerald-50 dark:bg-emerald-950/30" : item.status === "in_progress" ? "bg-amber-50 dark:bg-amber-950/30" : "bg-surface-tertiary",
                  )}
                >
                  {isOverdue ? (
                    <AlertTriangle className="h-6 w-6 text-danger" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : item.status === "in_progress" ? (
                    <PlayCircle className="h-6 w-6 text-amber-500" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-content-tertiary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-content truncate">{item.assignment?.name || "Untitled Assignment"}</p>
                    <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                  </div>
                  <p className="text-xs text-content-tertiary mt-0.5 truncate">{item.course?.title || "Unknown Course"}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {/* Progress bar */}
                    <div className="flex-1 max-w-[200px] h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          isCompleted ? "bg-emerald-500" : isOverdue ? "bg-danger" : "bg-primary-600",
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-content-secondary">{item.progress}%</span>
                    {item.daysLeft != null && !isCompleted && (
                      <span className={cn("text-xs font-medium flex items-center gap-1", item.daysLeft <= 3 ? "text-danger" : "text-amber-500")}>
                        <Clock className="h-3 w-3" />
                        {item.daysLeft <= 0 ? "Overdue" : `${item.daysLeft}d`}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-content-tertiary shrink-0 group-hover:text-primary-600 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
