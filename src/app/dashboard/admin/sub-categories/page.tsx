"use client";

import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories, getSubCategories, createSubCategory, renameSubCategory, deleteSubCategory } from "@/lib/organization";
import { Plus, Pencil, Trash2, FolderOpen, Check, X, Loader2 } from "lucide-react";
import type { SubCategory, Category } from "@/types";

export default function AdminSubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [subs, setSubs] = useState<SubCategory[]>(() => getSubCategories());
  const [selectedCat, setSelectedCat] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [newCatId, setNewCatId] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubCategory | null>(null);

  function refresh() {
    setSubs(getSubCategories());
    setCategories(getCategories());
  }

  const filtered = useMemo(() => {
    if (!selectedCat) return subs;
    return subs.filter((s) => s.categoryId === selectedCat);
  }, [subs, selectedCat]);

  function handleCreate() {
    if (!newName.trim() || !newCatId) return;
    setSaving(true);
    createSubCategory(newName.trim(), newCatId);
    setNewName(""); setNewCatId(""); setShowNew(false); setSaving(false);
    refresh();
  }

  function handleRename(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    renameSubCategory(id, editName.trim());
    setEditingId(null); setSaving(false);
    refresh();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteSubCategory(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  }

  function getCatName(catId: string) {
    return categories.find((c) => c.id === catId)?.name || "Unknown";
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Sub-Categories"
          description="Manage sub-categories within each category."
          action={
            <Button onClick={() => { setShowNew(!showNew); setNewCatId(categories[0]?.id || ""); }}>
              <Plus className="h-4 w-4" /> Create Sub-Category
            </Button>
          }
        />

        <div className="flex items-center gap-4">
          <Select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} options={[{ value: "", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} className="w-64" />
        </div>

        {showNew && (
          <Card variant="default" padding="md">
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="flex items-center gap-3">
                <Select value={newCatId} onChange={(e) => setNewCatId(e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select category" className="w-56" />
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Sub-category name..." variant="filled" inputSize="lg" autoFocus className="flex-1" />
                <Button type="submit" disabled={saving || !newName.trim() || !newCatId}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Create</Button>
                <Button variant="tertiary" type="button" onClick={() => { setShowNew(false); setNewName(""); }}><X className="h-4 w-4" /></Button>
              </form>
            </CardContent>
          </Card>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No sub-categories" description={selectedCat ? "This category has no sub-categories yet." : "Create your first sub-category."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((sub) => (
              <Card key={sub.id} variant="default" padding="md" className="group">
                <CardContent>
                  {editingId === sub.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleRename(sub.id); }} className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} variant="filled" autoFocus className="flex-1" />
                      <button type="submit" disabled={saving} className="flex h-8 w-8 items-center justify-center rounded-lg text-success hover:bg-success/10 transition-colors"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"><X className="h-4 w-4" /></button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><FolderOpen className="h-5 w-5" /></div>
                        <div>
                          <p className="font-medium text-content">{sub.name}</p>
                          <p className="text-xs text-content-tertiary">{getCatName(sub.categoryId)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(sub.id); setEditName(sub.name); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(sub)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-danger hover:bg-danger/5 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Sub-Category" message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`} confirmLabel="Delete" variant="danger" />
    </AuthGuard>
  );
}
