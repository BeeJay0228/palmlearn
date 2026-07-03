"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTrainerLearners } from "@/lib/learner-analytics";
import { cn } from "@/lib/utils";
import { Search, BarChart3, Users, ChevronLeft, ChevronRight } from "lucide-react";

export default function TrainerMyLearnersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const learners = useMemo(() => {
    if (!user) return [];
    return getTrainerLearners(user.id);
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return learners;
    const q = search.toLowerCase();
    return learners.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
  }, [learners, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (!user) return null;

  return (
    <AuthGuard requiredRole="trainer">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-content">My Learners</h2>
            <p className="text-sm text-content-tertiary">{filtered.length} learner{filtered.length !== 1 ? "s" : ""} assigned to you</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="Search learners..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-64 rounded-xl border border-border/50 bg-surface pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Learner Cards */}
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-content-tertiary/40 mb-4" />
            <p className="text-lg font-semibold text-content">No learners found</p>
            <p className="text-sm text-content-tertiary mt-1">
              {search ? "Try a different search term." : "You have no learners assigned to you yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paged.map((learner) => (
              <Card key={learner.id}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                      {learner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-content truncate">{learner.name}</p>
                      <p className="text-xs text-content-tertiary truncate">{learner.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-content-tertiary mb-4">
                    <Badge variant={learner.status === "active" ? "success" : "danger"} size="sm">
                      {learner.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                    {learner.categoryId && <span className="truncate">Dept: {learner.categoryId}</span>}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <Button variant="primary" size="sm" className="flex-1 h-8 text-xs" asChild>
                      <a href={`/trainer/learners/${learner.id}/profile`}>
                        <BarChart3 className="h-3.5 w-3.5 mr-1" /> View Performance
                      </a>
                    </Button>
                  </div>
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
    </AuthGuard>
  );
}
