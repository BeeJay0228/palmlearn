"use client";

import { useMemo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GlobalSearch } from "@/components/ui/global-search";
import { MotionDiv } from "@/components/shared/motion-div";
import { getTrainerLearners } from "@/lib/learner-analytics";
import { cn } from "@/lib/utils";
import {
  Search, BarChart3, Users, ChevronLeft, ChevronRight,
  GraduationCap, Award, Clock, TrendingUp, Star, CheckCircle2,
  Mail, Phone, MapPin, BookOpen, Target, Sparkles,
} from "lucide-react";

export default function TrainerMyLearnersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const learners = useMemo(() => {
    if (!user) return [];
    return getTrainerLearners(user.id);
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return learners;
    const q = search.toLowerCase();
    return learners.filter(
      (l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q),
    );
  }, [learners, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  if (!user) return null;

  return (
    <AuthGuard requiredRole="trainer">
      <div className="flex flex-col gap-6 animate-fade-in">
        <PageHeader
          title="My Learners"
          description="View and manage all learners assigned to you."
          breadcrumb={[
            { label: "Dashboard", href: "/trainer/dashboard" },
            { label: "My Learners" },
          ]}
          action={
            <GlobalSearch
              placeholder="Search learners..."
              value={search}
              onChange={handleSearch}
              className="w-72"
              suggestions={
                filtered.length > 0
                  ? filtered.slice(0, 5).map((l) => ({
                      label: l.name,
                      description: l.email,
                      onSelect: () => setSearch(l.name),
                    }))
                  : []
              }
            />
          }
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-content-secondary">
            <Users className="h-4 w-4" />
            <span>
              <strong className="text-content">{filtered.length}</strong> learner
              {filtered.length !== 1 ? "s" : ""} assigned
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              <CheckCircle2 className="h-3 w-3" />
              {learners.filter((l) => l.status === "active").length} Active
            </Badge>
            <Badge variant="neutral" size="sm">
              {learners.filter((l) => l.status !== "active").length} Inactive
            </Badge>
          </div>
        </div>

        {paged.length === 0 ? (
          <Card variant="bordered" className="py-20">
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-secondary border border-border/50 mb-4">
                  <Users className="h-8 w-8 text-content-tertiary" />
                </div>
                <h3 className="text-lg font-semibold text-content">
                  {search ? "No learners match your search" : "No learners assigned"}
                </h3>
                <p className="text-sm text-content-secondary mt-1.5 max-w-sm">
                  {search
                    ? "Try a different search term or check for typos."
                    : "You have no learners assigned to you yet. Learners will appear here once they are assigned to your programmes."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paged.map((learner, idx) => (
              <MotionDiv
                key={learner.id}
                variant="fade-in-up"
                delay={idx * 0.05}
                className="group"
              >
                <Card
                  variant="interactive"
                  padding="none"
                  className="h-full overflow-hidden"
                >
                  <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 px-5 pt-5 pb-16">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white text-lg font-bold shadow-lg">
                        {learner.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-white truncate drop-shadow-sm">
                          {learner.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3 text-white/70" />
                          <p className="text-xs text-white/80 truncate">
                            {learner.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative -mt-10 px-5 pb-5">
                    <div className="rounded-2xl bg-surface border border-border/50 shadow-sm p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant={learner.status === "active" ? "success" : "danger"}
                          size="sm"
                        >
                          {learner.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        {learner.categoryId && (
                          <Badge variant="soft" size="sm" className="truncate max-w-[120px]">
                            {learner.categoryId}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          { icon: GraduationCap, label: "Progress", value: "—" },
                          { icon: Award, label: "Score", value: "—" },
                          { icon: Clock, label: "Last Active", value: "—" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className="flex justify-center mb-1">
                              <stat.icon className="h-3.5 w-3.5 text-content-tertiary" />
                            </div>
                            <p className="text-xs font-semibold text-content">
                              {stat.value}
                            </p>
                            <p className="text-[10px] text-content-tertiary">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Separator className="mb-3" />

                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full h-9 text-xs"
                        asChild
                      >
                        <a href={`/trainer/learners/${learner.id}/profile`}>
                          <BarChart3 className="h-3.5 w-3.5" />
                          View Performance
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2 border-t border-border/50">
            <p className="text-xs text-content-tertiary">
              Page {page} of {totalPages} &middot; {filtered.length} total learners
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
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
                      "flex h-8 min-w-[32px] items-center justify-center rounded-lg text-xs font-medium transition-all",
                      p === page
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-content-secondary hover:bg-surface-secondary",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
