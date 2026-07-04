"use client";

import { useState, useMemo, useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminData } from "@/hooks/use-admin-data";
import { getRegions, getStates, createState, renameState, deleteState } from "@/lib/organization";
import { Plus, Pencil, Trash2, Globe, Check, X, Loader2 } from "lucide-react";
import type { StateEntity, Region } from "@/types";

export default function AdminStatesPage() {
  const { save: saveAdminData } = useAdminData();
  const [regions] = useState<Region[]>(() => getRegions());
  const [states, setStates] = useState<StateEntity[]>(() => getStates());
  const [selectedRegion, setSelectedRegion] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [newRegionId, setNewRegionId] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StateEntity | null>(null);

  function refresh() {
    setStates(getStates());
  }

  const filtered = useMemo(() => {
    if (!selectedRegion) return states;
    return states.filter((s) => s.regionId === selectedRegion);
  }, [states, selectedRegion]);

  function handleCreate() {
    if (!newName.trim() || !newRegionId) return;
    setSaving(true);
    createState(newName.trim(), newRegionId);
    setNewName(""); setNewRegionId(""); setShowNew(false); setSaving(false);
    refresh();
    saveAdminData({
      workflowState: { lastAction: "create_state", name: newName.trim(), timestamp: new Date().toISOString() },
    });
  }

  function handleRename(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    renameState(id, editName.trim());
    setEditingId(null); setSaving(false);
    refresh();
    saveAdminData({
      workflowState: { lastAction: "rename_state", stateId: id, timestamp: new Date().toISOString() },
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteState(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    saveAdminData({
      workflowState: { lastAction: "delete_state", stateId: deleteTarget.id, timestamp: new Date().toISOString() },
    });
  }

  function getRegionName(regionId: string) {
    return regions.find((r) => r.id === regionId)?.name || "Unknown";
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="States"
          description="Manage states within each region."
          action={
            <Button onClick={() => { setShowNew(!showNew); setNewRegionId(regions[0]?.id || ""); }}>
              <Plus className="h-4 w-4" /> Create State
            </Button>
          }
        />

        <div className="flex items-center gap-4">
          <Select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} options={[{ value: "", label: "All Regions" }, ...regions.map((r) => ({ value: r.id, label: r.name }))]} className="w-64" />
        </div>

        {showNew && (
          <Card variant="default" padding="md">
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="flex items-center gap-3">
                <Select value={newRegionId} onChange={(e) => setNewRegionId(e.target.value)} options={regions.map((r) => ({ value: r.id, label: r.name }))} placeholder="Select region" className="w-56" />
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="State name..." variant="filled" inputSize="lg" autoFocus className="flex-1" />
                <Button type="submit" disabled={saving || !newName.trim() || !newRegionId}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Create</Button>
                <Button variant="tertiary" type="button" onClick={() => { setShowNew(false); setNewName(""); }}><X className="h-4 w-4" /></Button>
              </form>
            </CardContent>
          </Card>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon={Globe} title="No states" description={selectedRegion ? "This region has no states yet." : "Create your first state."} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((state) => (
              <Card key={state.id} variant="default" padding="md" className="group">
                <CardContent>
                  {editingId === state.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleRename(state.id); }} className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} variant="filled" autoFocus className="flex-1" />
                      <button type="submit" disabled={saving} className="flex h-8 w-8 items-center justify-center rounded-lg text-success hover:bg-success/10 transition-colors"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"><X className="h-4 w-4" /></button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white"><Globe className="h-5 w-5" /></div>
                        <div>
                          <p className="font-medium text-content">{state.name}</p>
                          <p className="text-xs text-content-tertiary">{getRegionName(state.regionId)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(state.id); setEditName(state.name); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteTarget(state)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-danger hover:bg-danger/5 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete State" message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`} confirmLabel="Delete" variant="danger" />
    </AuthGuard>
  );
}