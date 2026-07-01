"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Course, CourseStatus, Difficulty } from "@/types";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, COURSE_STATUS_COLORS } from "@/types";
import { getCourses, deleteCourse, updateCourseStatus } from "@/lib/courses";
import { getCategories } from "@/lib/organization";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CourseBuilder } from "./course-builder";
import { CoursePreview } from "./course-preview";
import { Search, Plus, Eye, Edit3, Trash2, BookOpen, BookCopy, ChevronUp, ChevronDown, X } from "lucide-react";

type SortField = "title" | "difficulty" | "status" | "updatedAt" | "estimatedDuration";

interface SortHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortAsc: boolean;
  onToggle: (field: SortField) => void;
  className?: string;
}

function SortHeader({ field, label, sortField, sortAsc, onToggle, className }: SortHeaderProps) {
  const isActive = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={cn("flex items-center gap-1 text-xs font-semibold text-content-tertiary hover:text-content transition-colors", className)}
    >
      {label}
      {isActive && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
    </button>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CoursesPage() {
  const allCourses = useMemo(() => getCourses(), []);
  const categories = useMemo(() => getCategories(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let result = [...allCourses];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    if (difficultyFilter !== "all") result = result.filter((c) => c.difficulty === difficultyFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "difficulty": cmp = a.difficulty.localeCompare(b.difficulty); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "estimatedDuration": cmp = a.estimatedDuration - b.estimatedDuration; break;
        case "updatedAt": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [allCourses, searchQuery, statusFilter, difficultyFilter, sortField, sortAsc]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteCourse(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleStatusChange = (course: Course, status: CourseStatus) => {
    updateCourseStatus(course.id, status);
  };

  const getCategoryName = (id: string): string => {
    return categories.find((c) => c.id === id)?.name || "—";
  };

  const shProps = (field: SortField) => ({ field, sortField, sortAsc, onToggle: toggleSort });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Courses"
        description="Create, manage, and organize your learning content"
        action={
          <button
            type="button"
            onClick={() => { setEditingCourse(null); setShowBuilder(true); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Search courses..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as CourseStatus | "all"); setCurrentPage(0); }}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => { setDifficultyFilter(e.target.value as Difficulty | "all"); setCurrentPage(0); }}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <p className="text-xs text-content-tertiary whitespace-nowrap">{filtered.length} course{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50">
                <th className="text-left px-4 py-3 w-12"></th>
                <th className="text-left px-4 py-3"><SortHeader {...shProps("title")} label="Course Title" /></th>
                <th className="text-left px-4 py-3 hidden md:table-cell"><span className="text-xs font-semibold text-content-tertiary">Category</span></th>
                <th className="text-left px-4 py-3 hidden lg:table-cell"><span className="text-xs font-semibold text-content-tertiary">Instructor</span></th>
                <th className="text-left px-4 py-3"><SortHeader {...shProps("difficulty")} label="Level" /></th>
                <th className="text-left px-4 py-3 hidden md:table-cell"><SortHeader {...shProps("estimatedDuration")} label="Duration" /></th>
                <th className="text-left px-4 py-3"><SortHeader {...shProps("status")} label="Status" /></th>
                <th className="text-left px-4 py-3 hidden lg:table-cell"><SortHeader {...shProps("updatedAt")} label="Updated" /></th>
                <th className="text-right px-4 py-3"><span className="text-xs font-semibold text-content-tertiary">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16">
                    <div className="flex flex-col items-center text-center">
                      <BookCopy className="h-10 w-10 text-content-tertiary mb-3" />
                      <p className="text-sm font-medium text-content-secondary">
                        {searchQuery || statusFilter !== "all" || difficultyFilter !== "all"
                          ? "No courses match your filters"
                          : "No courses yet"}
                      </p>
                      <p className="text-xs text-content-tertiary mt-1">
                        {searchQuery || statusFilter !== "all" || difficultyFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Create your first course to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map((course) => (
                  <tr key={course.id} className="border-b border-border hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-content">{course.title || "Untitled"}</p>
                      <p className="text-xs text-content-tertiary mt-0.5 line-clamp-1">{course.description}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-content-secondary">{getCategoryName(course.categoryId)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-content-secondary">{course.instructor || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-md text-xs font-semibold", DIFFICULTY_COLORS[course.difficulty])}>
                        {DIFFICULTY_LABELS[course.difficulty]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-content-secondary">{formatDuration(course.estimatedDuration)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={course.status}
                        onChange={(e) => handleStatusChange(course, e.target.value as CourseStatus)}
                        className={cn("px-2 py-0.5 rounded-md text-xs font-semibold border-0 cursor-pointer appearance-none outline-none", COURSE_STATUS_COLORS[course.status])}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-content-tertiary">{formatDate(course.updatedAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewCourse(course)}
                          className="rounded-lg p-1.5 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingCourse(course); setShowBuilder(true); }}
                          className="rounded-lg p-1.5 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(course)}
                          className="rounded-lg p-1.5 text-content-tertiary hover:text-danger hover:bg-danger/5 transition-colors"
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

        {pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-content-tertiary">
              Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    i === currentPage
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400"
                      : "text-content-secondary hover:text-content hover:bg-surface-hover"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={currentPage === pageCount - 1}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showBuilder && (
        <CourseBuilder
          initialData={editingCourse || undefined}
          onClose={() => { setShowBuilder(false); setEditingCourse(null); }}
        />
      )}

      {previewCourse && (
        <div className="fixed inset-0 z-50 bg-surface overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur-xl px-4 lg:px-6 h-16">
            <h2 className="text-lg font-semibold text-content">Course Preview</h2>
            <button
              type="button"
              onClick={() => setPreviewCourse(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
          <div className="p-4 lg:p-6">
            <CoursePreview course={previewCourse} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete Course"
      />
    </div>
  );
}
