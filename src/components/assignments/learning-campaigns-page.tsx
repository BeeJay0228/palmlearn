"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CampaignBuilder } from "./campaign-builder";
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from "@/lib/campaigns";
import { getCourses } from "@/lib/courses";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS, type Campaign } from "@/types";
import { Plus, Trash2, Edit, BookOpen, CheckCircle2, Send, Archive } from "lucide-react";

export function LearningCampaignsPage() {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Campaign | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const items = useMemo(() => getCampaigns(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const courses = useMemo(() => getCourses(), []);

  function handleSave(data: Omit<Campaign, "id" | "createdAt" | "updatedAt">) {
    if (editCampaign) {
      updateCampaign(editCampaign.id, data);
      showSuccess("Campaign updated successfully.");
    } else {
      createCampaign(data);
      showSuccess("Campaign created successfully.");
    }
    setBuilderOpen(false);
    setEditCampaign(undefined);
    setRefreshKey((k) => k + 1);
  }

  function handleStatusChange(campaign: Campaign, status: "active" | "completed" | "archived") {
    updateCampaign(campaign.id, { status });
    setRefreshKey((k) => k + 1);
    showSuccess(`Campaign ${status === "active" ? "published" : status} successfully.`);
  }

  function handleDelete() {
    if (!deleteConfirm) return;
    deleteCampaign(deleteConfirm.id);
    setDeleteConfirm(undefined);
    setRefreshKey((k) => k + 1);
    showSuccess("Campaign deleted successfully.");
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <PageHeader
        title="Learning Campaigns"
        description="Bundle courses into campaigns for streamlined assignment."
        action={
          <Button onClick={() => { setEditCampaign(undefined); setBuilderOpen(true); }}>
            <Plus className="h-4 w-4" /> New Campaign
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
            <EmptyState title="No campaigns yet" description="Create your first learning campaign." action={<Button onClick={() => setBuilderOpen(true)}><Plus className="h-4 w-4" /> New Campaign</Button>} />
          </div>
        ) : (
          items.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-2xl border border-border/50 bg-surface shadow-sm transition-all card-hover p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-content truncate">{campaign.name}</h3>
                  <p className="text-xs text-content-tertiary line-clamp-2">{campaign.description}</p>
                </div>
                <Badge variant="secondary" className={CAMPAIGN_STATUS_COLORS[campaign.status]}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-content-secondary mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{campaign.courseIds.length} course(s)</span>
              </div>

              {campaign.courseIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {campaign.courseIds.map((cid) => {
                    const course = courses.find((c) => c.id === cid);
                    return course ? (
                      <Badge key={cid} variant="secondary" size="sm">{course.title}</Badge>
                    ) : null;
                  })}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-[11px] text-content-tertiary">Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  {campaign.status === "draft" && (
                    <button
                      onClick={() => handleStatusChange(campaign, "active")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Publish"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {campaign.status === "active" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(campaign, "completed")}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Complete"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(campaign, "archived")}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {campaign.status === "completed" && (
                    <button
                      onClick={() => handleStatusChange(campaign, "archived")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                      title="Archive"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => { setEditCampaign(campaign); setBuilderOpen(true); }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(campaign)}
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

      <CampaignBuilder open={builderOpen} onClose={() => { setBuilderOpen(false); setEditCampaign(undefined); }} onSave={handleSave} editCampaign={editCampaign} />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(undefined)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
