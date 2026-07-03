"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  getPlatformSummary,
  getProgrammeReportData,
  getLearnerReportData,
  getTrainerReportData,
  getCourseReportData,
  getAssignmentReportData,
  exportToCsv,
  exportToExcel,
  exportToPdf,
  saveReport,
  deleteSavedReport,
  toggleFavorite,
  getSavedReports,
  getReportHistory,
  addReportHistory,
  DEFAULT_FILTER,
  type ReportType,
  type ReportFilter,
  type SavedReport,
} from "@/lib/reports";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, Search, Download,
  FileText, BookOpen, Users, GraduationCap, BarChart3,
  CheckCircle, AlertTriangle, Star, Trash2, Save,
  History, Bookmark, X, Printer,
} from "lucide-react";

type ColumnDef<T> = { key: string; label: string; render: (row: T) => React.ReactNode; sortable?: boolean };

const REPORT_TABS: { type: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "platform", label: "Platform Summary", icon: BarChart3 },
  { type: "programme", label: "Training Programme", icon: BookOpen },
  { type: "learner", label: "Learner Performance", icon: Users },
  { type: "trainer", label: "Trainer Performance", icon: GraduationCap },
  { type: "course", label: "Course Report", icon: BookOpen },
  { type: "assignment", label: "Assignment Report", icon: FileText },
];

function renderValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-content-tertiary">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        ><ChevronLeft className="h-3.5 w-3.5" /></button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4));
          const p = start + i;
          if (p > totalPages) return null;
          return (
            <button key={p} onClick={() => onChange(p)}
              className={cn("flex h-7 min-w-[28px] items-center justify-center rounded-lg text-xs font-medium transition-colors",
                p === page ? "bg-primary-600 text-white" : "text-content-secondary hover:bg-surface-secondary"
              )}>{p}</button>
          );
        })}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        ><ChevronRight className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

export function ReportCenter({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportType>("platform");
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [sidebarTab, setSidebarTab] = useState<"saved" | "history" | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const perPage = 10;

  const userId = useMemo(() => {
    if (isSuperAdmin) return undefined;
    return user?.id;
  }, [isSuperAdmin, user?.id]);

  const refreshSaved = useCallback(() => setSavedReports(getSavedReports()), []);

  const platformData = useMemo(() => reportType === "platform" ? getPlatformSummary(filter, userId) : null, [reportType, filter, userId]);
  const programmeData = useMemo(() => reportType === "programme" ? getProgrammeReportData(filter, userId) : [], [reportType, filter, userId]);
  const learnerData = useMemo(() => reportType === "learner" ? getLearnerReportData(filter, userId) : [], [reportType, filter, userId]);
  const trainerData = useMemo(() => reportType === "trainer" ? getTrainerReportData(filter, userId) : [], [reportType, filter, userId]);
  const courseData = useMemo(() => reportType === "course" ? getCourseReportData(filter, userId) : [], [reportType, filter, userId]);
  const assignmentData = useMemo(() => reportType === "assignment" ? getAssignmentReportData(filter, userId) : [], [reportType, filter, userId]);

  const allData = useMemo<Record<ReportType, Record<string, unknown>[]>>(() => ({
    platform: platformData ? [platformData as unknown as Record<string, unknown>] : [],
    programme: programmeData as unknown as Record<string, unknown>[],
    learner: learnerData as unknown as Record<string, unknown>[],
    trainer: trainerData as unknown as Record<string, unknown>[],
    course: courseData as unknown as Record<string, unknown>[],
    assignment: assignmentData as unknown as Record<string, unknown>[],
  }), [platformData, programmeData, learnerData, trainerData, courseData, assignmentData]);

  const historyItems = useMemo(() => getReportHistory(), []);

  function updateFilter(key: keyof ReportFilter, value: string) {
    setFilter((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  const sortedData = useMemo(() => {
    const data = [...(allData[reportType] || [])] as Record<string, unknown>[];
    if (sortKey && data.length > 0) {
      data.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [allData, reportType, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / perPage));
  const pagedData = sortedData.slice((page - 1) * perPage, page * perPage);

  function handleSort(key: string) {
    if (sortKey === key) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); }
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  const getColumns = (): ColumnDef<Record<string, unknown>>[] => {
    switch (reportType) {
      case "platform":
        return [
          { key: "totalLearners", label: "Total Learners", render: (r) => renderValue(r.totalLearners) },
          { key: "activeLearners", label: "Active", render: (r) => renderValue(r.activeLearners) },
          { key: "inactiveLearners", label: "Inactive", render: (r) => renderValue(r.inactiveLearners) },
          { key: "totalProgrammes", label: "Programmes", render: (r) => renderValue(r.totalProgrammes) },
          { key: "totalCourses", label: "Courses", render: (r) => renderValue(r.totalCourses) },
          { key: "totalAssignments", label: "Assignments", render: (r) => renderValue(r.totalAssignments) },
          { key: "completionRate", label: "Completion Rate", render: (r) => `${r.completionRate}%` },
          { key: "averageLearnerProgress", label: "Avg Progress", render: (r) => `${r.averageLearnerProgress}%` },
        ];
      case "programme":
        return [
          { key: "name", label: "Programme", render: (r) => renderValue(r.name), sortable: true },
          { key: "createdBy", label: "Created By", render: (r) => renderValue(r.createdBy) },
          { key: "assignedLearners", label: "Assigned", render: (r) => renderValue(r.assignedLearners), sortable: true },
          { key: "startedLearners", label: "Started", render: (r) => renderValue(r.startedLearners), sortable: true },
          { key: "completedLearners", label: "Completed", render: (r) => renderValue(r.completedLearners), sortable: true },
          { key: "completionRate", label: "Compl. %", render: (r) => `${r.completionRate}%`, sortable: true },
          { key: "averageProgress", label: "Avg Progress", render: (r) => `${r.averageProgress}%`, sortable: true },
        ];
      case "learner":
        return [
          { key: "name", label: "Learner", render: (r) => renderValue(r.name), sortable: true },
          { key: "email", label: "Email", render: (r) => renderValue(r.email) },
          { key: "department", label: "Department", render: (r) => renderValue(r.department) },
          { key: "programmesAssigned", label: "Progs Assigned", render: (r) => renderValue(r.programmesAssigned), sortable: true },
          { key: "programmesCompleted", label: "Progs Completed", render: (r) => renderValue(r.programmesCompleted), sortable: true },
          { key: "coursesCompleted", label: "Courses Done", render: (r) => renderValue(r.coursesCompleted), sortable: true },
          { key: "assignmentsSubmitted", label: "Assignments Submitted", render: (r) => renderValue(r.assignmentsSubmitted), sortable: true },
          { key: "assignmentsOverdue", label: "Overdue", render: (r) => renderValue(r.assignmentsOverdue), sortable: true },
          { key: "progress", label: "Progress %", render: (r) => `${r.progress}%`, sortable: true },
        ];
      case "trainer":
        return [
          { key: "name", label: "Trainer", render: (r) => renderValue(r.name), sortable: true },
          { key: "email", label: "Email", render: (r) => renderValue(r.email) },
          { key: "programmesManaged", label: "Programmes", render: (r) => renderValue(r.programmesManaged), sortable: true },
          { key: "learnersAssigned", label: "Learners", render: (r) => renderValue(r.learnersAssigned), sortable: true },
          { key: "learnersCompleted", label: "Completed", render: (r) => renderValue(r.learnersCompleted), sortable: true },
          { key: "programmeCompletionPercent", label: "Compl. %", render: (r) => `${r.programmeCompletionPercent}%`, sortable: true },
          { key: "averageLearnerProgress", label: "Avg Progress", render: (r) => `${r.averageLearnerProgress}%`, sortable: true },
        ];
      case "course":
        return [
          { key: "title", label: "Course", render: (r) => renderValue(r.title), sortable: true },
          { key: "programme", label: "Programme", render: (r) => renderValue(r.programme) },
          { key: "started", label: "Started", render: (r) => renderValue(r.started), sortable: true },
          { key: "completed", label: "Completed", render: (r) => renderValue(r.completed), sortable: true },
          { key: "completionPercent", label: "Compl. %", render: (r) => `${r.completionPercent}%`, sortable: true },
          { key: "averageTimeSpent", label: "Avg Time (min)", render: (r) => renderValue(r.averageTimeSpent), sortable: true },
        ];
      case "assignment":
        return [
          { key: "name", label: "Assignment", render: (r) => renderValue(r.name), sortable: true },
          { key: "programme", label: "Programme", render: (r) => renderValue(r.programme) },
          { key: "submissions", label: "Submissions", render: (r) => renderValue(r.submissions), sortable: true },
          { key: "pending", label: "Pending", render: (r) => renderValue(r.pending), sortable: true },
          { key: "overdue", label: "Overdue", render: (r) => renderValue(r.overdue), sortable: true },
          { key: "passRate", label: "Pass Rate", render: (r) => `${r.passRate}%`, sortable: true },
        ];
    }
  };

  const columns = getColumns();

  function getHeaderRow(): string[] {
    return columns.map((c) => c.label);
  }

  function getDataRows(): string[][] {
    return sortedData.map((row) => columns.map((c) => String(c.render(row as Record<string, unknown>) ?? "—")));
  }

  function handleExportCsv() {
    const name = REPORT_TABS.find((t) => t.type === reportType)?.label || reportType;
    exportToCsv(name, getHeaderRow(), getDataRows());
    addReportHistory({ reportName: name, type: reportType, generatedBy: user?.name || "Unknown", format: "CSV" });
  }

  function handleExportExcel() {
    const name = REPORT_TABS.find((t) => t.type === reportType)?.label || reportType;
    exportToExcel(name, name, getHeaderRow(), getDataRows());
    addReportHistory({ reportName: name, type: reportType, generatedBy: user?.name || "Unknown", format: "Excel" });
  }

  function handleExportPdf() {
    const name = REPORT_TABS.find((t) => t.type === reportType)?.label || reportType;
    exportToPdf(name, previewRef.current);
    addReportHistory({ reportName: name, type: reportType, generatedBy: user?.name || "Unknown", format: "PDF" });
  }

  function handlePrint() {
    window.print();
  }

  function handleSaveReport() {
    if (!saveName.trim()) return;
    const saved = saveReport({ name: saveName, type: reportType, filters: filter });
    setSavedReports((prev) => [saved, ...prev]);
    setShowSaveDialog(false);
    setSaveName("");
  }

  function handleLoadSaved(saved: SavedReport) {
    setReportType(saved.type);
    setFilter(saved.filters);
    setSidebarTab(null);
    setPage(1);
  }

  const reportLabel = REPORT_TABS.find((t) => t.type === reportType)?.label || "Report";

  return (
    <div className="flex flex-col gap-6">
      {/* Report Type Tabs */}
      <div className="flex items-center gap-1 flex-wrap border-b border-border/50 pb-1">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => { setReportType(tab.type); setPage(1); setSortKey(null); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all",
              reportType === tab.type
                ? "border-primary-600 text-primary-600 bg-primary-50/50 dark:bg-primary-950/20"
                : "border-transparent text-content-tertiary hover:text-content hover:bg-surface-secondary/50"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filter & Actions Bar */}
          <Card>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowFilters(!showFilters)}>
                    <BarChart3 className="h-3 w-3 mr-1" /> Filters
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-content-tertiary pointer-events-none" />
                    <input
                      type="text" placeholder="Search..." value={filter.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="h-7 w-40 rounded-lg border border-border/50 bg-surface px-2.5 pl-7 text-xs text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                  <select value={filter.dateRange} onChange={(e) => updateFilter("dateRange", e.target.value)}
                    className="h-7 rounded-lg border border-border/50 bg-surface px-2 text-xs text-content focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleExportCsv}>
                    <Download className="h-3 w-3 mr-1" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleExportExcel}>
                    <Download className="h-3 w-3 mr-1" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleExportPdf}>
                    <FileText className="h-3 w-3 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={handlePrint}>
                    <Printer className="h-3 w-3 mr-1" /> Print
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowSaveDialog(true)}>
                    <Save className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSidebarTab(sidebarTab === "saved" ? null : "saved")}>
                    <Bookmark className="h-3 w-3 mr-1" /> Saved
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSidebarTab(sidebarTab === "history" ? null : "history")}>
                    <History className="h-3 w-3 mr-1" /> History
                  </Button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
                  <select value={filter.programmeId} onChange={(e) => updateFilter("programmeId", e.target.value)}
                    className="h-7 rounded-lg border border-border/50 bg-surface px-2 text-xs text-content">
                    <option value="">All Programmes</option>
                    {getProgrammeReportData(filter, userId).map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <select value={filter.status} onChange={(e) => updateFilter("status", e.target.value)}
                    className="h-7 rounded-lg border border-border/50 bg-surface px-2 text-xs text-content">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="not_started">Not Started</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  {isSuperAdmin && (
                    <input type="text" placeholder="Trainer ID filter..."
                      value={filter.trainerId} onChange={(e) => updateFilter("trainerId", e.target.value)}
                      className="h-7 rounded-lg border border-border/50 bg-surface px-2.5 text-xs text-content placeholder:text-content-tertiary/50"
                    />
                  )}
                  <button onClick={() => { setFilter(DEFAULT_FILTER); setPage(1); }}
                    className="h-7 rounded-lg border border-border/50 bg-surface px-2.5 text-xs text-content-tertiary hover:text-content transition-colors">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Platform Summary KPI Row */}
          {reportType === "platform" && platformData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PlatformKPI label="Total Learners" value={platformData.totalLearners} icon={Users} color="text-blue-600" bg="bg-blue-50" />
              <PlatformKPI label="Active" value={platformData.activeLearners} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
              <PlatformKPI label="Inactive" value={platformData.inactiveLearners} icon={AlertTriangle} color="text-gray-600" bg="bg-gray-50" />
              <PlatformKPI label="Programmes" value={platformData.totalProgrammes} icon={BookOpen} color="text-indigo-600" bg="bg-indigo-50" />
              <PlatformKPI label="Courses" value={platformData.totalCourses} icon={BookOpen} color="text-purple-600" bg="bg-purple-50" />
              <PlatformKPI label="Assignments" value={platformData.totalAssignments} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
              <PlatformKPI label="Completion Rate" value={`${platformData.completionRate}%`} icon={BarChart3} color="text-emerald-600" bg="bg-emerald-50" />
              <PlatformKPI label="Avg Progress" value={`${platformData.averageLearnerProgress}%`} icon={BarChart3} color="text-primary-600" bg="bg-primary-50" />
            </div>
          )}

          {/* Report Preview Table */}
          <Card>
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-content">{reportLabel}</h3>
                <p className="text-xs text-content-tertiary">{sortedData.length} records</p>
              </div>
            </div>
            <div className="overflow-x-auto" ref={previewRef}>
              {pagedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-8 w-8 text-content-tertiary/40 mb-2" />
                  <p className="text-sm text-content-tertiary">No data found for this report.</p>
                  <p className="text-xs text-content-tertiary/60 mt-1">Try adjusting your filters.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-surface-secondary/30">
                      {columns.map((col) => (
                        <th key={col.key}
                          className={cn("text-left px-4 py-2.5 text-xs font-semibold text-content-tertiary uppercase tracking-wider whitespace-nowrap",
                            col.sortable && "cursor-pointer hover:text-content select-none"
                          )}
                          onClick={() => col.sortable && handleSort(col.key)}
                        >
                          {col.label}
                          {col.sortable && sortKey === col.key && (
                            <span className="ml-1 text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {pagedData.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-secondary/20 transition-colors">
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-2.5 text-sm text-content whitespace-nowrap">
                            {col.render(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </Card>
        </div>

        {/* Sidebar: Saved Reports / History */}
        {sidebarTab && (
          <div className="w-72 shrink-0 space-y-3">
            <Card>
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-content uppercase tracking-wider">
                  {sidebarTab === "saved" ? "Saved Reports" : "Report History"}
                </h3>
                <button onClick={() => setSidebarTab(null)} className="text-content-tertiary hover:text-content transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {sidebarTab === "saved" ? (
                  savedReports.length === 0 ? (
                    <div className="p-4 text-center text-xs text-content-tertiary">No saved reports yet.</div>
                  ) : (
                    savedReports.map((sr) => {
                      const tab = REPORT_TABS.find((t) => t.type === sr.type);
                      return (
                        <div key={sr.id} className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30 last:border-0 hover:bg-surface-secondary/20 transition-colors group">
                          <button onClick={() => handleLoadSaved(sr)} className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-medium text-content truncate">{sr.name}</p>
                            <p className="text-[10px] text-content-tertiary">{tab?.label || sr.type} · {new Date(sr.createdAt).toLocaleDateString()}</p>
                          </button>
                          <button onClick={() => { toggleFavorite(sr.id); refreshSaved(); }}
                            className={cn("shrink-0 transition-colors", sr.isFavorite ? "text-amber-500" : "text-content-tertiary/40 hover:text-amber-500")}>
                            <Star className={cn("h-3 w-3", sr.isFavorite && "fill-amber-500")} />
                          </button>
                          <button onClick={() => { deleteSavedReport(sr.id); refreshSaved(); }}
                            className="shrink-0 text-content-tertiary/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })
                  )
                ) : (
                  historyItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-content-tertiary">No report history yet.</div>
                  ) : (
                    historyItems.map((h) => (
                      <div key={h.id} className="px-3 py-2.5 border-b border-border/30 last:border-0">
                        <p className="text-xs font-medium text-content truncate">{h.reportName}</p>
                        <p className="text-[10px] text-content-tertiary">{h.format} · {h.generatedBy} · {new Date(h.generatedDate).toLocaleDateString()}</p>
                      </div>
                    ))
                  )
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface shadow-2xl p-6 animate-scale-in">
            <h3 className="text-base font-semibold text-content mb-1">Save Report</h3>
            <p className="text-xs text-content-tertiary mb-4">Save the current report configuration for quick access later.</p>
            <input
              type="text" placeholder="Report name..."
              value={saveName} onChange={(e) => setSaveName(e.target.value)}
              autoFocus
              className="w-full h-9 rounded-xl border border-border/50 bg-surface-secondary px-3 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleSaveReport()}
            />
            <div className="flex items-center gap-2">
              <Button variant="tertiary" size="sm" className="flex-1" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={handleSaveReport}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformKPI({ icon: Icon, label, value, color, bg }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-surface">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bg)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-content truncate">{value}</p>
        <p className="text-[10px] text-content-tertiary truncate">{label}</p>
      </div>
    </div>
  );
}
