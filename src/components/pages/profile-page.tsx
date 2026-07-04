"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { updateProfile, updatePassword } from "@/lib/auth";
import { usePersistentData } from "@/hooks/use-persistent-data";
import Image from "next/image";
import { Camera, Loader2, Save, Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, User } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/constants";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const apiPath = useMemo(() => user?.role === "admin" ? "/api/admin/data" : "/api/trainer/data", [user?.role]);
  const { data: profileData, save: saveProfileData } = usePersistentData(apiPath);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    bio: user?.bio ?? "",
    phone: user?.phone ?? "",
    officeAddress: user?.officeAddress ?? "",
    homeAddress: user?.homeAddress ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile as Record<string, string | undefined>;
      setForm((prev) => ({
        name: p.name ?? prev.name,
        bio: p.bio ?? prev.bio,
        phone: p.phone ?? prev.phone,
        officeAddress: p.officeAddress ?? prev.officeAddress,
        homeAddress: p.homeAddress ?? prev.homeAddress,
      }));
    }
  }, [profileData?.profile]);

  const initials = useMemo(() => {
    if (!user) return "?";
    return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }, [user]);

  if (!user) return null;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = updateProfile(user.id, form);
      if (!result.success) {
        setError(result.error || "Failed to update profile");
        return;
      }
      refreshUser();
      await saveProfileData({
        profile: form as unknown as Record<string, unknown>,
      });
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("All password fields are required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const result = updatePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      if (!result.success) {
        setError(result.error || "Failed to change password");
        return;
      }
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Password changed successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Profile</h1>
        <p className="text-sm text-content-secondary/80 mt-1">Manage your personal information and password</p>
      </div>

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 p-4 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Personal Information */}
      <Card variant="default" padding="none">
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary-600" />
            <CardTitle>Personal Information</CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 mb-6 border-b border-border/50">
            <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
              <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-md shadow-primary-600/20">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="text-center sm:text-left">
              <p className="text-base font-semibold text-content">{user.name}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Badge variant="default" size="sm">{ROLE_LABELS[user.role]}</Badge>
                <Badge variant={user.status === "active" ? "success" : "danger"} size="sm">
                  {user.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-content-tertiary mt-2">Click avatar to upload a photo</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              variant="filled"
              inputSize="lg"
              floating
            />
            <Input
              label="Email"
              type="email"
              value={user.email}
              disabled
              variant="filled"
              inputSize="lg"
              floating
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              variant="filled"
              inputSize="lg"
              floating
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="Role"
              value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              disabled
              variant="filled"
              inputSize="lg"
              floating
            />
            <div className="sm:col-span-2">
              <Input
                label="Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                variant="filled"
                placeholder="Tell us about yourself..."
                floating
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Office Address"
                value={form.officeAddress}
                onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                variant="filled"
                floating
                placeholder="123 Business Ave"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Home Address"
                value={form.homeAddress}
                onChange={(e) => setForm({ ...form, homeAddress: e.target.value })}
                variant="filled"
                floating
                placeholder="456 Home St"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleProfileSave} disabled={saving} variant="primary" size="lg">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card variant="default" padding="none">
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary-600" />
            <CardTitle>Change Password</CardTitle>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              variant="filled"
              floating
              rightIcon={
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-content-tertiary hover:text-content-secondary">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="New Password"
              type={showNew ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              variant="filled"
              floating
              placeholder="Min. 6 characters"
              rightIcon={
                <button type="button" onClick={() => setShowNew(!showNew)} className="text-content-tertiary hover:text-content-secondary">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              variant="filled"
              floating
              rightIcon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-content-tertiary hover:text-content-secondary">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              onClick={handlePasswordChange}
              disabled={savingPassword}
              variant="secondary"
              size="lg"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {savingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Extend Input to support rightIcon
