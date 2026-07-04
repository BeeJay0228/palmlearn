"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminData } from "@/hooks/use-admin-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories, createCategory, renameCategory, deleteCategory } from "@/lib/organization";
import { Plus, Pencil, Trash2, FolderTree, Check, X, Loader2 } from "lucide-react";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const { save: saveAdminData } = useAdminData();
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function refresh() {
    setCategories(getCategories());
  }

  function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    createCategory(newName.trim());
    setNewName("");
    setShowNew(false);
    setSaving(false);
    refresh();
    saveAdminData({
      workflowState: { lastAction: "create_category", name: newName.trim(), timestamp: new Date().toISOString() },
    });
  }

  function handleRename(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    renameCategory(id, editName.trim());
    setEditingId(null);
    setSaving(false);
    refresh();
    saveAdminData({
      workflowState: { lastAction: "rename_category", categoryId: id, timestamp: new Date().toISOString() },
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    saveAdminData({
      workflowState: { lastAction: "delete_category", categoryId: deleteTarget.id, timestamp: new Date().toISOString() },
    });
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Categories"
          description="Manage learning categories for your organization."
          action={
            <Button onClick={() => setShowNew(!showNew)}>
              <Plus className="h-4 w-4" /> Create Category
            </Button>
          }
        />

        {showNew && (
          <Card variant="default" padding="md">
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="flex items-center gap-3">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter category name..." variant="filled" inputSize="lg" autoFocus className="flex-1" />
                <Button type="submit" disabled={saving || !newName.trim()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Create
                </Button>
                <Button variant="tertiary" type="button" onClick={() => { setShowNew(false); setNewName(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {categories.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories yet" description="Create your first category to organize learning content." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} variant="default" padding="md" className="group">
                <CardContent>
                  {editingId === cat.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleRename(cat.id); }} className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} variant="filled" autoFocus className="flex-1" />
                      <button type="submit" disabled={saving} className="flex h-8 w-8 items-center justify-center rounded-lg text-success hover:bg-success/10 transition-colors"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"><X className="h-4 w-4" /></button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                          <FolderTree className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-content">{cat.name}</p>
                          <p className="text-xs text-content-tertiary">Created {new Date(cat.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-danger hover:bg-danger/5 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Category" message={`Delete "${deleteTarget?.name}"? All sub-categories within this category will also be removed.`} confirmLabel="Delete" variant="danger" />
    </AuthGuard>
  );
}