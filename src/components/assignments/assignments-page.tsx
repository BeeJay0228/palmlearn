"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { AssignmentWizard } from "./assignment-wizard";
import { cn } from "@/lib/utils";
import {
  createAssignment, updateAssignment, deleteAssignment, filterAssignments, bulkActionAssignment,
} from "@/lib/assignments";
import { bulkCreateFromAssignment } from "@/lib/learner-assignments";
import { getUsers } from "@/lib/users";
import { notifyAssignmentCreated } from "@/lib/mock-notifications";
import {
  ASSIGNMENT_TYPE_LABELS, ASSIGNMENT_TYPE_COLORS,
  ASSIGNMENT_PRIORITY_LABELS, ASSIGNMENT_PRIORITY_COLORS,
  ASSIGNMENT_STATUS_LABELS, ASSIGNMENT_STATUS_COLORS,
  AUDIENCE_TYPE_LABELS,
  type Assignment, type AssignmentType, type AssignmentPriority, type AssignmentStatus,
} from "@/types";
import {
  Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  Trash2, Edit,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: string; sortDir: "asc" | "desc" }) {
  if (sortKey !== col) return <ChevronsUpDown className="h-3.5 w-3.5 text-content-tertiary" />;
  return sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
}

interface AssignmentsPageProps {
  role: "admin" | "trainer";
}

export function AssignmentsPage({ role }: AssignmentsPageProps) {
  void role;
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Assignment | undefined>();
  const [bulkAction, setBulkAction] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  void refreshKey;
  const pageSize = 10;

  const allUsers = getUsers();

  const { items, total } = useMemo(() => {
    const result = filterAssignments({ search: search || undefined, status: (statusFilter as AssignmentStatus) || undefined, type: (typeFilter as AssignmentType) || undefined, priority: (priorityFilter as AssignmentPriority) || undefined, page, pageSize });
    const sorted = [...result.items];
    if (sortKey) {
      sorted.sort((a, b) => {
        const aVal = String(a[sortKey as keyof Assignment] ?? "");
        const bVal = String(b[sortKey as keyof Assignment] ?? "");
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return { items: sorted, total: result.total };
  }, [search, statusFilter, typeFilter, priorityFilter, page, sortKey, sortDir, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((i) => i.id));
  }

  function handleWizardSave(data: Omit<Assignment, "id" | "createdAt" | "updatedAt">) {
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, data);
    } else {
      const newAsgn = createAssignment({ ...data, assignedBy: user?.id || "" });
      const learnerIds: string[] = [];
      if (data.targetAudience.type === "organization") {
        learnerIds.push(...allUsers.filter((u) => u.role !== "admin").map((u) => u.id));
      } else {
        learnerIds.push(...data.targetAudience.userIds);
      }
      if (learnerIds.length > 0) {
        bulkCreateFromAssignment(newAsgn.id, learnerIds, data.courseIds);
        notifyAssignmentCreated(newAsgn, learnerIds);
      }
    }
    setWizardOpen(false);
    setEditingAssignment(undefined);
    setRefreshKey((k) => k + 1);
  }

  function handleDelete() {
    if (!deleteConfirm) return;
    deleteAssignment(deleteConfirm.id);
    setDeleteConfirm(undefined);
    setRefreshKey((k) => k + 1);
  }

  function handleBulkAction(action: string) {
    if (selected.length === 0 || !action) return;
    const fn = action as "delete" | "activate" | "draft" | "complete" | "cancel";
    bulkActionAssignment(selected, fn);
    setSelected([]);
    setBulkAction("");
    setRefreshKey((k) => k + 1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Assignments"
        description="Create and manage learning assignments for your organization."
        action={
          <Button onClick={() => { setEditingAssignment(undefined); setWizardOpen(true); }}>
            <Plus className="h-4 w-4" /> New Assignment
          </Button>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search assignments..."
            className="flex h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[{ value: "", label: "All Statuses" }, ...Object.entries(ASSIGNMENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
        />
        <Select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          options={[{ value: "", label: "All Types" }, ...Object.entries(ASSIGNMENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
        />
        <Select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          options={[{ value: "", label: "All Priorities" }, ...Object.entries(ASSIGNMENT_PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l }))]}
        />
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/50 dark:border-primary-800/30">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <Select
              value={bulkAction}
              onChange={(e) => handleBulkAction(e.target.value)}
              options={[
                { value: "", label: "Bulk Actions" },
                { value: "activate", label: "Activate" },
                { value: "draft", label: "Set to Draft" },
                { value: "complete", label: "Complete" },
                { value: "cancel", label: "Cancel" },
                { value: "delete", label: "Delete" },
              ]}
            />
            <Button variant="tertiary" size="sm" onClick={() => setSelected([])}>Clear</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/80">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-border text-primary-600"
                  />
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider cursor-pointer select-none hover:text-content" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1.5">Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Type</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider cursor-pointer select-none hover:text-content" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1.5">Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Audience</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider cursor-pointer select-none hover:text-content" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-1.5">Created <SortIcon col="createdAt" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-content-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <EmptyState title="No assignments found" description="Create your first assignment to get started." action={<Button onClick={() => { setEditingAssignment(undefined); setWizardOpen(true); }}><Plus className="h-4 w-4" /> New Assignment</Button>} />
                  </td>
                </tr>
              ) : (
                items.map((assignment) => (
                  <tr key={assignment.id} className="transition-all duration-150 hover:bg-surface-secondary/60">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.includes(assignment.id)}
                        onChange={() => toggleSelect(assignment.id)}
                        className="h-4 w-4 rounded border-border text-primary-600"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-content truncate max-w-[240px]">{assignment.name}</p>
                        <p className="text-xs text-content-tertiary truncate max-w-[240px]">{assignment.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className={ASSIGNMENT_TYPE_COLORS[assignment.type]}>{ASSIGNMENT_TYPE_LABELS[assignment.type]}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className={ASSIGNMENT_PRIORITY_COLORS[assignment.priority]}>{ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className={ASSIGNMENT_STATUS_COLORS[assignment.status]}>{ASSIGNMENT_STATUS_LABELS[assignment.status]}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-content-secondary">{AUDIENCE_TYPE_LABELS[assignment.targetAudience.type]}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-content-secondary">{new Date(assignment.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingAssignment(assignment); setWizardOpen(true); }}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(assignment)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-content-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-content-tertiary">Showing {(page - 1) * pageSize + 1}&ndash;{Math.min(page * pageSize, total)} of {total}</p>
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

      {/* Wizard Overlay */}
      <AssignmentWizard open={wizardOpen} onClose={() => { setWizardOpen(false); setEditingAssignment(undefined); }} onSave={handleWizardSave} editAssignment={editingAssignment} />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(undefined)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
