"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllTrainerStats } from "@/lib/trainer-analytics";
import { cn } from "@/lib/utils";
import { Search, Users, ChevronLeft, ChevronRight, Eye, GraduationCap, BookOpen, TrendingUp } from "lucide-react";

export function TrainerAnalyticsList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const trainers = useMemo(() => getAllTrainerStats(), []);

  const filtered = useMemo(() => {
    if (!search) return trainers;
    const q = search.toLowerCase();
    return trainers.filter((t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
  }, [trainers, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-content">Trainer Analytics</h2>
          <p className="text-sm text-content-tertiary">{filtered.length} trainer{filtered.length !== 1 ? "s" : ""} in your organization</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search trainers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-64 rounded-xl border border-border/50 bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Trainer Cards */}
      {paged.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-content-tertiary/40 mb-4" />
          <p className="text-lg font-semibold text-content">No trainers found</p>
          <p className="text-sm text-content-tertiary mt-1">
            {search ? "Try a different search term." : "No trainers have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((t) => (
            <Card key={t.id}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                    {t.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-content truncate">{t.name}</p>
                    <p className="text-xs text-content-tertiary truncate">{t.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-content-tertiary mb-3">
                  <Badge variant={t.status === "active" ? "success" : "danger"} size="sm">
                    {t.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                  <span>Joined {new Date(t.dateJoined).toLocaleDateString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary/20">
                    <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-content">{t.activeProgrammes}</p>
                      <p className="text-[10px] text-content-tertiary">Active Programmes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary/20">
                    <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-content">{t.assignedLearners}</p>
                      <p className="text-[10px] text-content-tertiary">Learners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary/20">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-content">{t.completedLearners}</p>
                      <p className="text-[10px] text-content-tertiary">Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary/20">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-content">{t.programmeCompletionRate}%</p>
                      <p className="text-[10px] text-content-tertiary">Compl. Rate</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-content-tertiary mb-4">
                  <span>Avg Progress: <strong className="text-content-secondary">{t.averageProgress}%</strong></span>
                  <span className="mx-1">·</span>
                  <span>Assignments: <strong className="text-content-secondary">{t.assignmentCompletionRate}%</strong></span>
                </div>

                <Button variant="primary" size="sm" className="w-full h-8 text-xs" onClick={() => router.push(`/admin/trainer-analytics/${t.id}`)}>
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-content-tertiary">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "flex h-7 min-w-[28px] items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    p === page ? "bg-primary-600 text-white" : "text-content-secondary hover:bg-surface-secondary"
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
