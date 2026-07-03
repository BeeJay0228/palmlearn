"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAssignmentsForLearner, checkAndUpdateOverdueStatus } from "@/lib/learner-assignments";
import { getAssignments } from "@/lib/assignments";
import { getCourses } from "@/lib/courses";
import type { Assignment, Course, LearnerAssignment } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ClipboardList, Clock, ArrowRight, AlertTriangle, CheckCircle, PlayCircle, BookOpen, Search } from "lucide-react";
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

const STATUS_CONFIG: Record<string, { label: string; status: "active" | "in_progress" | "completed" | "draft" | "overdue" | "pending" | "locked" }> = {
  not_started: { label: "Not Started", status: "draft" },
  in_progress: { label: "In Progress", status: "in_progress" },
  completed: { label: "Completed", status: "completed" },
  overdue: { label: "Overdue", status: "overdue" },
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
    if (filterParam === "assignments") setActiveTab("All"); // eslint-disable-line react-hooks/set-state-in-effect
  }, [filterParam]);

  useEffect(() => {
    if (assignmentIdParam) setAssignmentId(assignmentIdParam); // eslint-disable-line react-hooks/set-state-in-effect
  }, [assignmentIdParam]);

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
        ? Math.ceil((new Date(asgn.schedule.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
      result = result.filter((i) =>
        i.assignment?.name.toLowerCase().includes(q) ||
        i.course?.title.toLowerCase().includes(q)
      );
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Assignments"
        description="Track and manage all your assigned courses and assignments."
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-surface text-sm text-content placeholder:text-content-tertiary/60 outline-none transition-all duration-200 focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]"
            aria-label="Search assignments"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
              activeTab === tab
                ? "bg-primary-600 text-white shadow-sm"
                : "text-content-secondary hover:text-content hover:bg-surface-hover",
            )}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({items.filter((i) =>
                  tab === "In Progress" ? i.status === "in_progress" :
                  tab === "Not Started" ? i.status === "not_started" :
                  tab === "Completed" ? i.status === "completed" :
                  i.status === "overdue"
                ).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filterParam === "assignments" && (
        <div className="flex items-center gap-2 text-xs text-primary-600 font-medium bg-primary-50 dark:bg-primary-950/20 px-3 py-2 rounded-lg w-fit">
          <ClipboardList className="h-3.5 w-3.5" />
          Showing all assignments
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === "All" && !search ? ClipboardList : Search}
          title={activeTab === "All" && !search ? "No assignments yet" : "No matches found"}
          description={
            activeTab === "All" && !search
              ? "When you receive assignments, they will appear here."
              : "Try adjusting your search or filter."
          }
          size="md"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isOverdue = item.status === "overdue";
            const isCompleted = item.status === "completed";
            const isInProgress = item.status === "in_progress";
            const isHighlighted = assignmentId === item.assignmentId;
            const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_started;

            return (
              <Link
                key={item.id}
                href={`/learner/assignment/${item.id}`}
                ref={isHighlighted ? highlightRef : undefined}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover block",
                  isOverdue && "border-danger/30 bg-danger/[0.02]",
                  isCompleted && "opacity-80",
                  isHighlighted && "ring-2 ring-primary-500",
                )}
              >
                <div className={cn(
                  "relative h-28 flex items-center justify-center overflow-hidden",
                  isOverdue ? "bg-gradient-to-br from-danger/10 to-danger/5" :
                  isCompleted ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5" :
                  isInProgress ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5" :
                  "bg-gradient-to-br from-surface-tertiary to-surface-secondary",
                )}>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 dark:bg-surface/90 shadow-lg group-hover:scale-110 transition-transform duration-300",
                    isOverdue && "shadow-danger/20",
                    isCompleted && "shadow-emerald-500/20",
                  )}>
                    {isOverdue ? (
                      <AlertTriangle className="h-6 w-6 text-danger" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    ) : isInProgress ? (
                      <PlayCircle className="h-6 w-6 text-amber-500" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-content-tertiary" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-tertiary/60">
                    <div
                      className={cn(
                        "h-full transition-all duration-700",
                        isCompleted ? "bg-emerald-500" : isOverdue ? "bg-danger" : "bg-primary-600",
                      )}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIndicator status={config.status} size="sm" />
                    <span className="text-[10px] font-semibold text-content-tertiary uppercase tracking-wider">
                      {item.assignment?.type || "Assignment"}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-content group-hover:text-primary-600 transition-colors line-clamp-1">
                    {item.assignment?.name || "Untitled Assignment"}
                  </h3>

                  <p className="text-xs text-content-tertiary mt-0.5 truncate">
                    {item.course?.title || "Unknown Course"}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1">
                      <Progress value={item.progress} size="sm" variant={isCompleted ? "success" : isOverdue ? "danger" : "default"} />
                    </div>
                    <span className={cn(
                      "text-xs font-semibold",
                      isCompleted ? "text-emerald-600" : isOverdue ? "text-danger" : "text-content-secondary",
                    )}>
                      {item.progress}%
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    {item.daysLeft != null && !isCompleted ? (
                      <span className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        item.daysLeft <= 3 ? "text-danger" : "text-amber-500",
                      )}>
                        <Clock className="h-3 w-3" />
                        {item.daysLeft <= 0 ? "Overdue" : `${item.daysLeft}d left`}
                      </span>
                    ) : isCompleted ? (
                      <span className="text-xs text-emerald-600 font-medium">Completed</span>
                    ) : (
                      <span className="text-xs text-content-tertiary">No due date</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-content-tertiary group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
