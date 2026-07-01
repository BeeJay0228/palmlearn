"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Resource, ResourceType } from "@/types";
import { getResources, deleteResource, createResource } from "@/lib/resources";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Search, Upload, Trash2, FileText, Video, FileImage, File, Link, Download, ExternalLink, X, FolderOpen } from "lucide-react";

const RESOURCE_CONFIG: Record<ResourceType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  video: { icon: Video, label: "Video", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400" },
  pdf: { icon: FileText, label: "PDF", color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400" },
  image: { icon: FileImage, label: "Image", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" },
  ppt: { icon: File, label: "PowerPoint", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400" },
  doc: { icon: FileText, label: "Document", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400" },
  link: { icon: Link, label: "Link", color: "text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400" },
  zip: { icon: File, label: "Archive", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400" },
  template: { icon: FileText, label: "Template", color: "text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400" },
};

export function ResourceLibraryPage() {
  const allResources = useMemo(() => getResources(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<Resource | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", description: "", type: "pdf" as ResourceType, url: "", size: "", tags: "" });

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
    }
  };

  const handleUpload = () => {
    if (!uploadForm.name) return;
    createResource({
      name: uploadForm.name,
      description: uploadForm.description,
      type: uploadForm.type,
      url: uploadForm.url,
      size: uploadForm.size || "—",
      tags: uploadForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      uploadedBy: "current-user",
    });
    setUploadForm({ name: "", description: "", type: "pdf", url: "", size: "", tags: "" });
    setShowUpload(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resource Library"
        description="Upload, manage, and organize learning resources"
        action={
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload Resource
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-content placeholder:text-content-tertiary outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all"
            placeholder="Search resources..."
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ResourceType | "all")}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Types</option>
          {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <p className="text-xs text-content-tertiary whitespace-nowrap">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border bg-surface-secondary/50">
          <FolderOpen className="h-12 w-12 text-content-tertiary mb-4" />
          <p className="text-sm font-medium text-content-secondary">
            {searchQuery || typeFilter !== "all" ? "No resources match your search" : "No resources yet"}
          </p>
          <p className="text-xs text-content-tertiary mt-1">
            {searchQuery || typeFilter !== "all" ? "Try adjusting your search or filters" : "Upload your first resource to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((resource) => {
            const config = RESOURCE_CONFIG[resource.type];
            const Icon = config?.icon || FileText;
            const colorClass = config?.color || "text-content-secondary bg-surface-secondary";
            return (
              <div key={resource.id} className="rounded-xl border border-border bg-surface hover:shadow-md transition-all group">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClass)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(resource)}
                      className="rounded-lg p-1.5 text-content-tertiary opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger/5 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content truncate">{resource.name}</p>
                    <p className="text-xs text-content-tertiary mt-1 line-clamp-2">{resource.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-content-tertiary bg-surface-secondary px-2 py-0.5 rounded-md">{resource.type.toUpperCase()}</span>
                      <span className="text-[11px] text-content-tertiary">{resource.size}</span>
                    </div>
                    {resource.type === "link" ? (
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <button type="button" className="rounded-lg p-1.5 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors">
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

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-content">Upload Resource</h3>
              <button type="button" onClick={() => setShowUpload(false)} className="rounded-lg p-1.5 text-content-tertiary hover:text-content hover:bg-surface-hover transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Resource Name *</label>
                <input type="text" value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all" placeholder="e.g., Employee Handbook" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Type</label>
                <select value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as ResourceType })} className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all appearance-none cursor-pointer">
                  {Object.entries(RESOURCE_CONFIG).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">URL</label>
                <input type="text" value={uploadForm.url} onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })} className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all" placeholder="https://example.com/resource" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">File Size (optional)</label>
                <input type="text" value={uploadForm.size} onChange={(e) => setUploadForm({ ...uploadForm, size: e.target.value })} className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all" placeholder="e.g., 2.4 MB" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Description</label>
                <textarea value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} rows={2} className="rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all resize-none" placeholder="Brief description..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-content-secondary">Tags (comma-separated)</label>
                <input type="text" value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} className="h-10 rounded-lg border border-border bg-surface-secondary px-3 text-sm text-content outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 transition-all" placeholder="training, handbook, policies" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
              <button type="button" onClick={() => setShowUpload(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary hover:text-content hover:bg-surface-hover transition-colors">Cancel</button>
              <button type="button" onClick={handleUpload} disabled={!uploadForm.name} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-all">
                <Upload className="h-4 w-4 inline mr-1.5" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
