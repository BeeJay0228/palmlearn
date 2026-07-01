"use client";

import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  getManagedUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  toggleUserStatus,
  resetUserPassword,
  getCategories,
  getSubCategories,
  getRegions,
  getStates,
  type CreateUserData,
} from "@/lib/organization";
import { UserPlus, Eye, Pencil, Trash2, Power, KeyRound, Loader2 } from "lucide-react";
import type { User, TableColumn, UserRole } from "@/types";
import { ROLE_LABELS } from "@/constants";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(() => getManagedUsers());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [createdUserName, setCreatedUserName] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateUserData>({
    name: "", email: "", role: "learner",
    phone: "", officeAddress: "", homeAddress: "", bio: "",
    categoryId: "", subCategoryId: "", regionId: "", stateId: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const categories = useMemo(() => getCategories(), []);
  const subCategories = useMemo(() => getSubCategories(form.categoryId), [form.categoryId]);
  const regions = useMemo(() => getRegions(), []);
  const states = useMemo(() => getStates(form.regionId), [form.regionId]);

  function loadUsers() {
    const all = getManagedUsers();
    setUsers(all);
  }

  function openCreate() {
    setEditingUser(null);
    setForm({ name: "", email: "", role: "learner", phone: "", officeAddress: "", homeAddress: "", bio: "", categoryId: "", subCategoryId: "", regionId: "", stateId: "" });
    setFormErrors({});
    setDrawerOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      officeAddress: user.officeAddress || "",
      homeAddress: user.homeAddress || "",
      bio: user.bio || "",
      categoryId: user.categoryId || "",
      subCategoryId: user.subCategoryId || "",
      regionId: user.regionId || "",
      stateId: user.stateId || "",
    });
    setFormErrors({});
    setDrawerOpen(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.role) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingUser) {
        await updateManagedUser(editingUser.id, form);
        setDrawerOpen(false);
        loadUsers();
      } else {
        const result = createManagedUser(form);
        if (result.success && result.password) {
          setCreatedPassword(result.password);
          setCreatedUserName(form.name);
        }
        setDrawerOpen(false);
        loadUsers();
      }
    } catch {
      // Silently handle
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteManagedUser(deleteTarget.id);
    setDeleteTarget(null);
    loadUsers();
  }

  function handleToggleStatus(user: User) {
    toggleUserStatus(user.id);
    loadUsers();
  }

  function handleResetPassword() {
    if (!resetTarget) return;
    const result = resetUserPassword(resetTarget.id);
    if (result.success && result.password) {
      setResetPasswordValue(result.password);
    }
  }

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
            {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-content">{u.name}</p>
            <p className="text-xs text-content-tertiary">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge variant={u.role === "admin" ? "default" : u.role === "trainer" ? "info" : "success"} size="sm">
          {ROLE_LABELS[u.role]}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={u.status === "active" ? "success" : "danger"} size="sm">
          {u.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date Created",
      render: (u) => <span className="text-content-secondary">{new Date(u.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setViewingUser(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors" title="View">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => openEdit(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors" title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => handleToggleStatus(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors" title={u.status === "active" ? "Deactivate" : "Activate"}>
            <Power className={u.status === "active" ? "h-4 w-4 text-danger" : "h-4 w-4 text-success"} />
          </button>
          <button onClick={() => { setResetTarget(u); setResetPasswordValue(""); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-content hover:bg-surface-hover transition-colors" title="Reset Password">
            <KeyRound className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-content-secondary hover:text-danger hover:bg-danger/5 transition-colors" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRole="admin">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="User Management"
          description="Create and manage trainers and learners across your organization."
          action={
            <Button onClick={openCreate}>
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          }
        />

        <DataTable
          data={users}
          columns={columns}
          keyExtractor={(u) => u.id}
          searchPlaceholder="Search users by name, email or role..."
          searchKeys={["name", "email", "role"]}
          emptyMessage="No users found. Create your first user to get started."
          onRowClick={(u) => setViewingUser(u)}
        />
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingUser ? "Edit User" : "Create User"}>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col gap-5">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} variant="filled" inputSize="lg" placeholder="John Doe" />
          <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} variant="filled" inputSize="lg" placeholder="john@company.com" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content">Gender</label>
            <div className="flex gap-3">
              {(["male", "female", "other"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({ ...form, gender: form.gender === g ? undefined : g })}
                  className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-all ${
                    form.gender === g
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300"
                      : "border-border bg-surface-secondary text-content-secondary hover:bg-surface-hover"
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Input label="Phone Number" type="tel" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} variant="filled" inputSize="lg" placeholder="+1 (555) 000-0000" />
          <Input label="Office Address" value={form.officeAddress || ""} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} variant="filled" inputSize="lg" placeholder="123 Business Ave" />
          <Input label="Home Address" value={form.homeAddress || ""} onChange={(e) => setForm({ ...form, homeAddress: e.target.value })} variant="filled" inputSize="lg" placeholder="456 Home St" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content">Role</label>
            <div className="flex gap-3">
              {(["trainer", "learner"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 h-12 rounded-xl border text-sm font-medium transition-all ${
                    form.role === r
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300"
                      : "border-border bg-surface-secondary text-content-secondary hover:bg-surface-hover"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            {formErrors.role && <p className="text-xs text-danger">{formErrors.role}</p>}
          </div>

          <Select label="Category" value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subCategoryId: "" })} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select category" />
          <Select label="Sub-Category" value={form.subCategoryId || ""} onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })} options={subCategories.map((s) => ({ value: s.id, label: s.name }))} placeholder="Select sub-category" />
          <Select label="Region" value={form.regionId || ""} onChange={(e) => setForm({ ...form, regionId: e.target.value, stateId: "" })} options={regions.map((r) => ({ value: r.id, label: r.name }))} placeholder="Select region" />
          <Select label="State" value={form.stateId || ""} onChange={(e) => setForm({ ...form, stateId: e.target.value })} options={states.map((s) => ({ value: s.id, label: s.name }))} placeholder="Select state" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content">Bio</label>
            <textarea value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about this user..." className="flex w-full rounded-xl border border-transparent bg-surface-secondary px-4 py-3 text-sm text-content placeholder:text-content-tertiary transition-all duration-200 hover:bg-surface-tertiary focus:bg-surface focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)] outline-none resize-none" />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button variant="tertiary" type="button" onClick={() => setDrawerOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : editingUser ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Drawer>

      <Drawer open={!!viewingUser} onClose={() => setViewingUser(null)} title="User Details">
        {viewingUser && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white text-xl font-bold">
                {viewingUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-content">{viewingUser.name}</h3>
                <p className="text-sm text-content-secondary">{viewingUser.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={viewingUser.role === "admin" ? "default" : viewingUser.role === "trainer" ? "info" : "success"}>{ROLE_LABELS[viewingUser.role]}</Badge>
                <Badge variant={viewingUser.status === "active" ? "success" : "danger"}>{viewingUser.status === "active" ? "Active" : "Inactive"}</Badge>
              </div>
            </div>

            <Card variant="default" padding="md">
              <CardContent className="flex flex-col gap-3">
                {[
                  { label: "Phone", value: viewingUser.phone || "—" },
                  { label: "Gender", value: viewingUser.gender ? viewingUser.gender.charAt(0).toUpperCase() + viewingUser.gender.slice(1) : "—" },
                  { label: "Office Address", value: viewingUser.officeAddress || "—" },
                  { label: "Home Address", value: viewingUser.homeAddress || "—" },
                  { label: "Bio", value: viewingUser.bio || "—" },
                  { label: "Date Created", value: new Date(viewingUser.createdAt).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-sm text-content-secondary">{item.label}</span>
                    <span className="text-sm text-content font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setViewingUser(null); openEdit(viewingUser); }}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button variant={viewingUser.status === "active" ? "danger" : "primary"} className="flex-1" onClick={() => { handleToggleStatus(viewingUser); setViewingUser(null); }}>
                <Power className="h-4 w-4" /> {viewingUser.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete User" message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`} confirmLabel="Delete" variant="danger" />

      <ConfirmDialog open={!!resetTarget} onClose={() => { setResetTarget(null); setResetPasswordValue(""); }} onConfirm={handleResetPassword} title="Reset Password" message={`Generate a new temporary password for ${resetTarget?.name}?`} confirmLabel="Generate Password" variant="warning" />

      {resetPasswordValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setResetTarget(null); setResetPasswordValue(""); }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 animate-scale-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-content">Password Reset Successful</h3>
                <p className="text-sm text-content-secondary mt-1">Share this temporary password with {resetTarget?.name}. They will be required to change it on next login.</p>
              </div>
              <div className="w-full rounded-xl bg-surface-secondary border border-border p-4">
                <p className="text-lg font-mono font-bold text-primary-600 text-center tracking-wider select-all">{resetPasswordValue}</p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={() => { setResetTarget(null); setResetPasswordValue(""); }}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {createdPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCreatedPassword(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 animate-scale-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-content">User Created Successfully</h3>
                <p className="text-sm text-content-secondary mt-1">Temporary password for <strong>{createdUserName}</strong>. They will be required to change it on next login.</p>
              </div>
              <div className="w-full rounded-xl bg-surface-secondary border border-border p-4">
                <p className="text-lg font-mono font-bold text-primary-600 text-center tracking-wider select-all">{createdPassword}</p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCreatedPassword(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
