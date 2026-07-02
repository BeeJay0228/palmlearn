"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgrammeBuilder } from "./programme-builder";
import { getProgrammes, createProgramme, updateProgramme, updatePublishedProgramme, deleteProgramme, publishProgramme, duplicateProgramme } from "@/lib/programmes";
import { getCourses } from "@/lib/courses";
import { PROGRAMME_STATUS_LABELS, PROGRAMME_STATUS_COLORS, type Programme } from "@/types";
import { Plus, Trash2, Edit, BookOpen, CheckCircle2, Send, Archive, Eye, Copy, BarChart3 } from "lucide-react";

export function TrainingProgrammesPage() {
  const { user } = useAuth();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editProgramme, setEditProgramme] = useState<Programme | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Programme | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const items = useMemo(() => getProgrammes(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const courses = useMemo(() => getCourses(), []);

  function handleSave(data: Omit<Programme, "id" | "createdAt" | "updatedAt">) {
    const userId = user?.id || "admin";
    if (editProgramme) {
      const existing = items.find((p) => p.id === editProgramme.id);
      if (existing?.status === "active") {
        updatePublishedProgramme(editProgramme.id, { ...data, updatedAt: new Date().toISOString() });
      } else {
        updateProgramme(editProgramme.id, { ...data, updatedAt: new Date().toISOString() });
      }
      showSuccess("Training Programme updated successfully.");
    } else {
      createProgramme({ ...data, createdBy: userId, assignedBy: userId });
      showSuccess("Training Programme created successfully.");
    }
    setBuilderOpen(false);
    setEditProgramme(undefined);
    setRefreshKey((k) => k + 1);
  }

  function handleStatusChange(programme: Programme, status: "active" | "completed" | "archived") {
    if (status === "active") {
      publishProgramme(programme.id, user?.id || programme.assignedBy || "admin");
    } else {
      updateProgramme(programme.id, { status });
    }
    setRefreshKey((k) => k + 1);
    showSuccess(`Training Programme ${status === "active" ? "published" : status} successfully.`);
  }

  function handleDelete() {
    if (!deleteConfirm) return;
    deleteProgramme(deleteConfirm.id);
    setDeleteConfirm(undefined);
    setRefreshKey((k) => k + 1);
    showSuccess("Training Programme deleted successfully.");
  }

  function handleDuplicate(programme: Programme) {
    const cp = duplicateProgramme(programme.id);
    if (cp) {
      setRefreshKey((k) => k + 1);
      showSuccess(`Training Programme duplicated as '${cp.name}'.`);
    }
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Training Programmes"
        description="Bundle courses into training programmes for streamlined assignment."
        action={
          <Button onClick={() => { setEditProgramme(undefined); setBuilderOpen(true); }}>
            <Plus className="h-4 w-4" /> New Programme
          </Button>
        }
      />

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 p-4 text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No programmes yet" description="Create your first training programme." action={<Button onClick={() => setBuilderOpen(true)}><Plus className="h-4 w-4" /> New Programme</Button>} />
          </div>
        ) : (
          items.map((programme) => (
            <div
              key={programme.id}
              className="rounded-2xl border border-border/50 bg-surface shadow-sm transition-all card-hover p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-content truncate">{programme.name}</h3>
                  <p className="text-xs text-content-tertiary line-clamp-2">{programme.description}</p>
                </div>
                <Badge variant="secondary" className={PROGRAMME_STATUS_COLORS[programme.status]}>{PROGRAMME_STATUS_LABELS[programme.status]}</Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-content-secondary mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{programme.courseIds.length} course(s)</span>
              </div>

              {programme.courseIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {programme.courseIds.map((cid) => {
                    const course = courses.find((c) => c.id === cid);
                    return course ? (
                      <Badge key={cid} variant="secondary" size="sm">{course.title}</Badge>
                    ) : null;
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-content-tertiary mb-2">
                {programme.createdBy && <span>Created by: {programme.createdBy}</span>}
                {programme.publishedBy && programme.status === "active" && <span>Published by: {programme.publishedBy}</span>}
                {programme.publishedAt && <span>Published: {new Date(programme.publishedAt).toLocaleDateString()}</span>}
              </div>

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <a
                    href={`/${user?.role || "admin"}/programmes/${programme.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`/${user?.role || "admin"}/programmes/${programme.id}?tab=analytics`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                    title="Analytics"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDuplicate(programme)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {programme.status === "draft" && (
                    <button
                      onClick={() => handleStatusChange(programme, "active")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Publish"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {programme.status === "active" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(programme, "completed")}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Complete"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(programme, "archived")}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {programme.status === "completed" && (
                    <button
                      onClick={() => handleStatusChange(programme, "archived")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      title="Archive"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => { setEditProgramme(programme); setBuilderOpen(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(programme)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ProgrammeBuilder open={builderOpen} onClose={() => { setBuilderOpen(false); setEditProgramme(undefined); }} onSave={handleSave} editProgramme={editProgramme} />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(undefined)}
        onConfirm={handleDelete}
        title="Delete Programme"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
