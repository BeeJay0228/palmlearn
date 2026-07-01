"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Course, CourseStatus, Difficulty } from "@/types";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, COURSE_STATUS_COLORS } from "@/types";
import { getCourses, deleteCourse, updateCourseStatus } from "@/lib/courses";
import { getCategories } from "@/lib/organization";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CourseBuilder } from "./course-builder";
import { CoursePreview } from "./course-preview";
import { Search, Plus, Eye, Edit3, Trash2, BookOpen, BookCopy, ChevronUp, ChevronDown, X, ArrowUpDown, Clock, User } from "lucide-react";

type SortField = "title" | "difficulty" | "status" | "updatedAt" | "estimatedDuration";

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
  const [refreshKey, setRefreshKey] = useState(0);
  const allCourses = useMemo(() => getCourses(), [refreshKey]);
  const categories = useMemo(() => getCategories(), [refreshKey]);
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
      setRefreshKey((k) => k + 1);
    }
  };

  const handleStatusChange = (course: Course, status: CourseStatus) => {
    updateCourseStatus(course.id, status);
    setRefreshKey((k) => k + 1);
  };

  const getCategoryName = (id: string): string => {
    return categories.find((c) => c.id === id)?.name || "\u2014";
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-content-tertiary/50" />;
    return sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Courses"
        description="Create, manage, and organize your learning content"
        action={
          <Button onClick={() => { setEditingCourse(null); setShowBuilder(true); }}>
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        }
      />

      {/* Filters */}
      <Card variant="default" padding="md">
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                className="h-11 w-full rounded-xl border border-border bg-surface-secondary/50 pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all"
                placeholder="Search courses..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as CourseStatus | "all"); setCurrentPage(0); }}
              className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all appearance-none cursor-pointer"
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
              className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <span className="text-xs text-content-tertiary whitespace-nowrap">{filtered.length} course{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-surface-secondary/80">
                <th className="text-left px-4 py-3.5 w-12"></th>
                <th className="text-left px-4 py-3.5">
                  <button onClick={() => toggleSort("title")} className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content transition-colors uppercase tracking-wider">
                    Course Title {renderSortIcon("title")}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 hidden md:table-cell"><span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Category</span></th>
                <th className="text-left px-4 py-3.5 hidden lg:table-cell"><span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Instructor</span></th>
                <th className="text-left px-4 py-3.5">
                  <button onClick={() => toggleSort("difficulty")} className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content transition-colors uppercase tracking-wider">
                    Level {renderSortIcon("difficulty")}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 hidden md:table-cell">
                  <button onClick={() => toggleSort("estimatedDuration")} className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content transition-colors uppercase tracking-wider">
                    Duration {renderSortIcon("estimatedDuration")}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5">
                  <button onClick={() => toggleSort("status")} className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content transition-colors uppercase tracking-wider">
                    Status {renderSortIcon("status")}
                  </button>
                </th>
                <th className="text-left px-4 py-3.5 hidden lg:table-cell">
                  <button onClick={() => toggleSort("updatedAt")} className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content transition-colors uppercase tracking-wider">
                    Updated {renderSortIcon("updatedAt")}
                  </button>
                </th>
                <th className="text-right px-4 py-3.5"><span className="text-xs font-semibold text-content-secondary uppercase tracking-wider">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-20">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/30 mb-4">
                        <BookCopy className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                      </div>
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
                  <tr key={course.id} className="border-b border-border/40 hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-content">{course.title || "Untitled"}</p>
                      <p className="text-xs text-content-tertiary mt-0.5 line-clamp-1 max-w-xs">{course.description}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <Badge variant="secondary" size="sm">{getCategoryName(course.categoryId)}</Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-content-tertiary" />
                        <span className="text-sm text-content-secondary">{course.instructor || "\u2014"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold", DIFFICULTY_COLORS[course.difficulty])}>
                        {DIFFICULTY_LABELS[course.difficulty]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-content-tertiary" />
                        <span className="text-sm text-content-secondary">{formatDuration(course.estimatedDuration)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={course.status}
                        onChange={(e) => handleStatusChange(course, e.target.value as CourseStatus)}
                        className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer appearance-none outline-none transition-all", COURSE_STATUS_COLORS[course.status])}
                      >
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-content-tertiary">{formatDate(course.updatedAt)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewCourse(course)}
                          className="rounded-xl p-2 text-content-tertiary hover:text-content hover:bg-surface-hover transition-all"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingCourse(course); setShowBuilder(true); }}
                          className="rounded-xl p-2 text-content-tertiary hover:text-content hover:bg-surface-hover transition-all"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(course)}
                          className="rounded-xl p-2 text-content-tertiary hover:text-danger hover:bg-danger/5 transition-all"
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

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/50 bg-surface-secondary/30">
            <p className="text-xs text-content-tertiary">
              Showing {currentPage * pageSize + 1}&ndash;{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                    i === currentPage
                      ? "bg-primary-600 text-white shadow-sm"
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
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-content-secondary hover:text-content hover:bg-surface-hover disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Builder Modal */}
      {showBuilder && (
        <CourseBuilder
          initialData={editingCourse || undefined}
          onClose={() => { setShowBuilder(false); setEditingCourse(null); setRefreshKey((k) => k + 1); }}
        />
      )}

      {/* Preview Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 bg-surface overflow-y-auto animate-fade-in">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-surface/80 backdrop-blur-2xl px-4 lg:px-6 h-16">
            <h2 className="text-lg font-semibold text-content">Course Preview</h2>
            <button
              type="button"
              onClick={() => setPreviewCourse(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/50 px-4 py-2 text-sm font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
          <div className="p-4 lg:p-6 max-w-5xl mx-auto w-full">
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
