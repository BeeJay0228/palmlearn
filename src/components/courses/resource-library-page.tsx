"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Resource, ResourceType } from "@/types";
import { getResources, deleteResource, createResource } from "@/lib/resources";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { Search, Upload, Trash2, FileText, Video, FileImage, File, Link, Download, ExternalLink, X, FolderOpen, Plus, CheckCircle2 } from "lucide-react";

const RESOURCE_CONFIG: Record<ResourceType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bgColor: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  pdf: { icon: FileText, label: "PDF", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30" },
  image: { icon: FileImage, label: "Image", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
  ppt: { icon: File, label: "PowerPoint", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
  doc: { icon: FileText, label: "Document", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30" },
  link: { icon: Link, label: "Link", color: "text-sky-600", bgColor: "bg-sky-50 dark:bg-sky-950/30" },
  zip: { icon: File, label: "Archive", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
  template: { icon: FileText, label: "Template", color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-950/30" },
};

export function ResourceLibraryPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const allResources = useMemo(() => getResources(), [refreshKey]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<Resource | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", description: "", type: "pdf" as ResourceType, url: "", size: "", tags: "" });
  const [successMsg, setSuccessMsg] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const filtered = useMemo(() => {
    let result = [...allResources];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") result = result.filter((r) => r.type === typeFilter);
    return result;
  }, [allResources, searchQuery, typeFilter]);

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteResource(deleteConfirm.id);
      setDeleteConfirm(null);
      setRefreshKey((k) => k + 1);
      showSuccess("Resource deleted successfully.");
    }
  };

  const handleDownload = (resource: Resource) => {
    if (resource.type === "link") {
      window.open(resource.url, "_blank", "noopener");
    } else {
      showSuccess(`Downloading "${resource.name}"...`);
    }
  };

  const handleUpload = () => {
    if (!uploadForm.name) return;
    createResource({
      name: uploadForm.name,
      description: uploadForm.description,
      type: uploadForm.type,
      url: uploadForm.url,
      size: uploadForm.size || "\u2014",
      tags: uploadForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      uploadedBy: user?.name || "Unknown User",
    });
    setUploadForm({ name: "", description: "", type: "pdf", url: "", size: "", tags: "" });
    setShowUpload(false);
    setRefreshKey((k) => k + 1);
    showSuccess("Resource uploaded successfully.");
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        title="Resource Library"
        description="Upload, manage, and organize learning resources"
        action={
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4" />
            Upload Resource
          </Button>
        }
      />

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 p-4 text-sm text-emerald-700 dark:text-emerald-400 animate-slide-up">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <Card variant="default" padding="md">
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface-secondary/50 pl-10 pr-4 text-sm text-content placeholder:text-content-tertiary/60 outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all"
                placeholder="Search resources..."
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ResourceType | "all")}
              className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <span className="text-xs text-content-tertiary whitespace-nowrap">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </CardContent>
      </Card>

      {/* Grid / Empty */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={searchQuery || typeFilter !== "all" ? "No resources match your search" : "No resources yet"}
          description={searchQuery || typeFilter !== "all" ? "Try adjusting your search or filters" : "Upload your first resource to get started"}
          action={
            !searchQuery && typeFilter === "all" ? (
              <Button onClick={() => setShowUpload(true)} variant="primary" size="lg">
                <Plus className="h-4 w-4" />
                Upload Resource
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((resource) => {
            const config = RESOURCE_CONFIG[resource.type];
            const Icon = config?.icon || FileText;
            return (
              <div
                key={resource.id}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-surface transition-all duration-300 card-hover"
              >
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", config?.bgColor || "bg-surface-secondary")}>
                      <Icon className={cn("h-6 w-6", config?.color || "text-content-secondary")} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(resource)}
                      className="rounded-xl p-1.5 text-content-tertiary opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger/5 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-content truncate">{resource.name}</p>
                    <p className="text-xs text-content-tertiary mt-1 line-clamp-2 leading-relaxed">{resource.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">{resource.type.toUpperCase()}</Badge>
                      <span className="text-[11px] text-content-tertiary">{resource.size}</span>
                    </div>
                    {resource.type === "link" ? (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button type="button" onClick={() => handleDownload(resource)} className="rounded-xl p-2 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 backdrop-blur-sm p-4 py-8 animate-fade-in" onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-lg my-auto rounded-2xl border border-border/50 bg-surface shadow-2xl animate-scale-in-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h3 className="text-base font-semibold text-content">Upload Resource</h3>
              <button type="button" onClick={() => setShowUpload(false)} className="rounded-xl p-2 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Resource Name *</label>
                <input type="text" value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all" placeholder="e.g., Employee Handbook" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Type</label>
                <select value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as ResourceType })} className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all appearance-none cursor-pointer">
                  {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">URL</label>
                <input type="text" value={uploadForm.url} onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })} className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all" placeholder="https://example.com/resource" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">File Size (optional)</label>
                <input type="text" value={uploadForm.size} onChange={(e) => setUploadForm({ ...uploadForm, size: e.target.value })} className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all" placeholder="e.g., 2.4 MB" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Description</label>
                <textarea value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} rows={2} className="rounded-xl border border-border bg-surface-secondary/50 px-4 py-3 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all resize-none" placeholder="Brief description..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Tags (comma-separated)</label>
                <input type="text" value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} className="h-11 rounded-xl border border-border bg-surface-secondary/50 px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)] transition-all" placeholder="training, handbook, policies" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50">
              <Button variant="tertiary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={!uploadForm.name}>
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
