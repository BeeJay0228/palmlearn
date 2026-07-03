"use client";

import { getAllUsers } from "./auth";
import { getProgrammes, getProgrammeProgress, getProgrammeLearnerIds } from "./programmes";
import { getCourses } from "./courses";
import { getAssignments } from "./assignments";
import { getAssignmentsForLearnerAll, getAssignmentsForProgramme } from "./learner-assignments";
import { getTrainerLearnerIds, getTrainerProgrammes } from "./trainer-analytics-utils";
import type { User } from "@/types";

export type ReportType = "platform" | "programme" | "learner" | "trainer" | "course" | "assignment";

export interface ReportFilter {
  dateRange: "all" | "today" | "week" | "month" | "year";
  programmeId: string;
  trainerId: string;
  learnerId: string;
  courseId: string;
  assignmentId: string;
  status: string;
  department: string;
  search: string;
}

export interface PlatformSummary {
  totalLearners: number;
  activeLearners: number;
  inactiveLearners: number;
  totalProgrammes: number;
  totalCourses: number;
  totalAssignments: number;
  completionRate: number;
  averageAssignmentScore: number;
  averageLearnerProgress: number;
}

export interface TrainingProgrammeRow {
  name: string;
  createdBy: string;
  publishedDate: string | null;
  assignedLearners: number;
  startedLearners: number;
  completedLearners: number;
  completionRate: number;
  averageProgress: number;
  averageScore: number;
}

export interface LearnerReportRow {
  name: string;
  email: string;
  department: string;
  programmesAssigned: number;
  programmesCompleted: number;
  coursesCompleted: number;
  assignmentsSubmitted: number;
  assignmentsOverdue: number;
  averageScore: number;
  progress: number;
}

export interface TrainerReportRow {
  name: string;
  email: string;
  programmesManaged: number;
  learnersAssigned: number;
  learnersCompleted: number;
  programmeCompletionPercent: number;
  averageLearnerProgress: number;
  averageAssignmentScore: number;
}

export interface CourseReportRow {
  title: string;
  programme: string;
  started: number;
  completed: number;
  completionPercent: number;
  averageTimeSpent: number;
}

export interface AssignmentReportRow {
  name: string;
  programme: string;
  submissions: number;
  pending: number;
  overdue: number;
  averageScore: number;
  passRate: number;
}

export interface SavedReport {
  id: string;
  name: string;
  type: ReportType;
  filters: ReportFilter;
  createdAt: string;
  isFavorite: boolean;
}

export interface ReportHistoryItem {
  id: string;
  reportName: string;
  type: ReportType;
  generatedBy: string;
  generatedDate: string;
  format: string;
}

const HISTORY_KEY = "palmlearn-report-history";
const SAVED_KEY = "palmlearn-saved-reports";

export const DEFAULT_FILTER: ReportFilter = {
  dateRange: "all",
  programmeId: "",
  trainerId: "",
  learnerId: "",
  courseId: "",
  assignmentId: "",
  status: "",
  department: "",
  search: "",
};

function filteredProgrammes(filter: ReportFilter, userId?: string): ReturnType<typeof getProgrammes> {
  let prog = getProgrammes();
  if (userId) {
    const trainerProgs = getTrainerProgrammes(userId);
    prog = prog.filter((p) => trainerProgs.some((tp) => tp.id === p.id));
  }
  if (filter.programmeId) prog = prog.filter((p) => p.id === filter.programmeId);
  if (filter.dateRange && filter.dateRange !== "all") {
    const now = Date.now();
    const limits: Record<string, number> = { today: 86400000, week: 604800000, month: 2592000000, year: 31536000000 };
    const limit = limits[filter.dateRange] || 0;
    prog = prog.filter((p) => now - new Date(p.createdAt).getTime() < limit);
  }
  if (filter.status) prog = prog.filter((p) => p.status === filter.status);
  return prog;
}

function filteredLearners(filter: ReportFilter, userId?: string): User[] {
  let allUsers = getAllUsers().filter((u) => u.role === "learner");
  if (userId) {
    const trainerLIds = getTrainerLearnerIds(userId);
    allUsers = allUsers.filter((u) => trainerLIds.has(u.id));
  }
  if (filter.learnerId) allUsers = allUsers.filter((u) => u.id === filter.learnerId);
  if (filter.department) allUsers = allUsers.filter((u) => u.categoryId === filter.department);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    allUsers = allUsers.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  return allUsers;
}

export function getPlatformSummary(filter: ReportFilter, userId?: string): PlatformSummary {
  const programmes = filteredProgrammes(filter, userId);
  const learners = filteredLearners(filter, userId);
  const allCourses = getCourses();
  const allAssignments = getAssignments();
  let totalProgress = 0;
  let totalWithProgress = 0;
  let totalCompleted = 0;
  for (const p of programmes) {
    for (const lid of getProgrammeLearnerIds(p)) {
      const pp = getProgrammeProgress(lid, p);
      totalProgress += pp.progress;
      totalWithProgress++;
      if (pp.progress >= 100) totalCompleted++;
    }
  }
  return {
    totalLearners: learners.length,
    activeLearners: learners.filter((u) => u.status === "active" || !u.status).length,
    inactiveLearners: learners.filter((u) => u.status === "inactive").length,
    totalProgrammes: programmes.length,
    totalCourses: allCourses.length,
    totalAssignments: allAssignments.length,
    completionRate: totalWithProgress > 0 ? Math.round((totalCompleted / totalWithProgress) * 100) : 0,
    averageAssignmentScore: 0,
    averageLearnerProgress: totalWithProgress > 0 ? Math.round(totalProgress / totalWithProgress) : 0,
  };
}

export function getProgrammeReportData(filter: ReportFilter, userId?: string): TrainingProgrammeRow[] {
  const programmes = filteredProgrammes(filter, userId);
  const allUsers = getAllUsers();
  return programmes.map((p) => {
    const learnerIds = getProgrammeLearnerIds(p);
    let started = 0, completed = 0, totalProg = 0;
    for (const lid of learnerIds) {
      const records = getAssignmentsForProgramme(p.id).filter((la) => la.learnerId === lid);
      if (records.some((r) => r.status !== "not_started" && r.status !== "locked")) started++;
      const allDone = p.courseIds.length > 0 && p.courseIds.every((cid) =>
        records.some((r) => r.courseId === cid && r.status === "completed")
      );
      if (allDone) completed++;
      const pp = getProgrammeProgress(lid, p);
      totalProg += pp.progress;
    }
    return {
      name: p.name,
      createdBy: allUsers.find((u) => u.id === p.createdBy)?.name || p.createdBy || "—",
      publishedDate: p.publishedAt || null,
      assignedLearners: learnerIds.length,
      startedLearners: started,
      completedLearners: completed,
      completionRate: learnerIds.length > 0 ? Math.round((completed / learnerIds.length) * 100) : 0,
      averageProgress: learnerIds.length > 0 ? Math.round(totalProg / learnerIds.length) : 0,
      averageScore: 0,
    };
  });
}

export function getLearnerReportData(filter: ReportFilter, userId?: string): LearnerReportRow[] {
  const learners = filteredLearners(filter, userId);
  const programmes = getProgrammes();
  return learners.map((l) => {
    const assignedProgs = programmes.filter((p) => getProgrammeLearnerIds(p).includes(l.id));
    const completedProgs = assignedProgs.filter((p) => {
      const records = getAssignmentsForProgramme(p.id).filter((la) => la.learnerId === l.id);
      return p.courseIds.length > 0 && p.courseIds.every((cid) =>
        records.some((r) => r.courseId === cid && r.status === "completed")
      );
    });
    const allRecords = getAssignmentsForLearnerAll(l.id);
    const coursesCompleted = allRecords.filter((r) => r.courseId && r.status === "completed").length;
    const asgnSubmitted = allRecords.filter((r) => r.assignmentId && r.status === "completed").length;
    const asgnOverdue = allRecords.filter((r) => r.status === "overdue").length;
    const totalProg = assignedProgs.length > 0
      ? Math.round(assignedProgs.reduce((s, p) => s + getProgrammeProgress(l.id, p).progress, 0) / assignedProgs.length)
      : 0;

    return {
      name: l.name,
      email: l.email,
      department: l.categoryId || "—",
      programmesAssigned: assignedProgs.length,
      programmesCompleted: completedProgs.length,
      coursesCompleted,
      assignmentsSubmitted: asgnSubmitted,
      assignmentsOverdue: asgnOverdue,
      averageScore: 0,
      progress: totalProg,
    };
  });
}

export function getTrainerReportData(filter: ReportFilter, userId?: string): TrainerReportRow[] {
  const allUsers = getAllUsers();
  let trainers = allUsers.filter((u) => u.role === "trainer");
  if (userId) trainers = trainers.filter((t) => t.id === userId);
  if (filter.trainerId) trainers = trainers.filter((t) => t.id === filter.trainerId);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    trainers = trainers.filter((t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }

  return trainers.map((t) => {
    const programmes = getTrainerProgrammes(t.id);
    const learnerIds = getTrainerLearnerIds(t.id);
    let totalProg = 0, completedCount = 0, totalWithProg = 0;
    for (const lid of learnerIds) {
      let learnerCompletedAll = true;
      let hasRecords = false;
      for (const p of programmes) {
        const pLearnerIds = getProgrammeLearnerIds(p);
        if (!pLearnerIds.includes(lid)) continue;
        const pp = getProgrammeProgress(lid, p);
        totalProg += pp.progress;
        totalWithProg++;
        hasRecords = true;
        if (pp.progress < 100) learnerCompletedAll = false;
      }
      if (hasRecords && learnerCompletedAll) completedCount++;
    }
    const asgnRecords = [];
    for (const lid of learnerIds) {
      asgnRecords.push(...getAssignmentsForLearnerAll(lid).filter((la) =>
        programmes.some((p) => p.id === la.campaignId) && la.assignmentId
      ));
    }
    const completedAsgn = asgnRecords.filter((la) => la.status === "completed").length;
    const totalAsgn = asgnRecords.length;

    return {
      name: t.name,
      email: t.email,
      programmesManaged: programmes.length,
      learnersAssigned: totalWithProg,
      learnersCompleted: completedCount,
      programmeCompletionPercent: totalWithProg > 0 ? Math.round((completedCount / totalWithProg) * 100) : 0,
      averageLearnerProgress: totalWithProg > 0 ? Math.round(totalProg / totalWithProg) : 0,
      averageAssignmentScore: totalAsgn > 0 ? Math.round((completedAsgn / totalAsgn) * 100) : 0,
    };
  });
}

export function getCourseReportData(filter: ReportFilter, userId?: string): CourseReportRow[] {
  const programmes = filteredProgrammes(filter, userId);
  const allCourses = getCourses();
  const allAssignments = getAssignmentsForLearnerAll("");

  return allCourses.map((c) => {
    const prog = programmes.find((p) => p.courseIds.includes(c.id));
    const records = allAssignments.filter((la) => la.courseId === c.id);
    const started = new Set(records.filter((r) => r.status !== "not_started" && r.status !== "locked").map((r) => r.learnerId)).size;
    const completed = new Set(records.filter((r) => r.status === "completed").map((r) => r.learnerId)).size;
    const totalTime = records.reduce((s, r) => s + (r.timeSpent || 0), 0);
    const learnersWithRecords = new Set(records.map((r) => r.learnerId)).size;

    return {
      title: c.title,
      programme: prog?.name || "—",
      started,
      completed,
      completionPercent: learnersWithRecords > 0 ? Math.round((completed / learnersWithRecords) * 100) : 0,
      averageTimeSpent: records.length > 0 ? Math.round(totalTime / records.length) : 0,
    };
  });
}

export function getAssignmentReportData(filter: ReportFilter, userId?: string): AssignmentReportRow[] {
  const programmes = filteredProgrammes(filter, userId);
  const allAssignments = getAssignments();
  const allRecords = getAssignmentsForLearnerAll("");

  return allAssignments.map((a) => {
    const prog = programmes.find((p) => p.assignmentIds.includes(a.id));
    const records = allRecords.filter((la) => la.assignmentId === a.id);
    const submitted = records.filter((r) => r.status === "completed").length;
    const pending = records.filter((r) => r.status === "in_progress" || r.status === "not_started").length;
    const overdue = records.filter((r) => r.status === "overdue").length;
    const total = records.length;

    return {
      name: a.name,
      programme: prog?.name || "—",
      submissions: submitted,
      pending,
      overdue,
      averageScore: 0,
      passRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
    };
  });
}

// Export Utilities
export function exportToCsv(filename: string, headers: string[], rows: string[][]): void {
  const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToExcel(filename: string, sheetName: string, headers: string[], rows: string[][]): void {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${sheetName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>`;
  html += `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  html += rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  html += "</table></body></html>";
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  downloadBlob(blob, `${filename}.xls`);
}

export function exportToPdf(filename: string, contentEl: HTMLElement | null): void {
  if (!contentEl) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const styles = Array.from(document.styleSheets).map((ss) => {
    try {
      return Array.from(ss.cssRules || []).map((r) => r.cssText).join("");
    } catch { return ""; }
  }).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>${styles}</style>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #1a1a2e; }
        @page { size: landscape; margin: 20mm; }
        .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 15px; }
        .print-header h1 { font-size: 22px; margin: 0 0 5px; color: #059669; }
        .print-header p { font-size: 12px; color: #666; margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #059669; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
        td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .print-footer { text-align: center; font-size: 10px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>PalmLearn - ${filename}</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
      ${contentEl.outerHTML}
      <div class="print-footer">
        <p>Report generated by PalmLearn | ${new Date().toLocaleString()}</p>
        <p>Page 1</p>
      </div>
      <script>window.print();window.close();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Saved Reports
function getStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getSavedReports(): SavedReport[] {
  return getStore<SavedReport>(SAVED_KEY);
}

export function saveReport(report: Omit<SavedReport, "id" | "createdAt" | "isFavorite">): SavedReport {
  const saved = getSavedReports();
  const newReport: SavedReport = {
    ...report,
    id: `saved_${Date.now()}`,
    createdAt: new Date().toISOString(),
    isFavorite: false,
  };
  saved.unshift(newReport);
  setStore(SAVED_KEY, saved);
  return newReport;
}

export function deleteSavedReport(id: string): void {
  setStore(SAVED_KEY, getSavedReports().filter((r) => r.id !== id));
}

export function toggleFavorite(id: string): SavedReport | null {
  const saved = getSavedReports();
  const idx = saved.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  saved[idx].isFavorite = !saved[idx].isFavorite;
  setStore(SAVED_KEY, saved);
  return saved[idx];
}

export function getFavoriteReports(): SavedReport[] {
  return getSavedReports().filter((r) => r.isFavorite);
}

// Report History
export function getReportHistory(): ReportHistoryItem[] {
  return getStore<ReportHistoryItem>(HISTORY_KEY);
}

export function addReportHistory(item: Omit<ReportHistoryItem, "id" | "generatedDate">): ReportHistoryItem {
  const history = getReportHistory();
  const entry: ReportHistoryItem = {
    ...item,
    id: `hist_${Date.now()}`,
    generatedDate: new Date().toISOString(),
  };
  history.unshift(entry);
  setStore(HISTORY_KEY, history.slice(0, 50));
  return entry;
}
