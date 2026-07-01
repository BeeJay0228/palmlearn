"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/constants";
import { updateProfile, updatePassword } from "@/lib/auth";
import { Camera, Eye, EyeOff, Loader2, Save, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showChangePassword = searchParams.get("changePassword") === "true";

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [officeAddress, setOfficeAddress] = useState(user?.officeAddress || "");
  const [homeAddress, setHomeAddress] = useState(user?.homeAddress || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileMessage("");

    try {
      const result = updateProfile(user.id, { name, bio, phone, officeAddress, homeAddress });
      if (result.success && result.user) {
        updateUser(result.user);
        setProfileMessage("Profile updated successfully.");
      } else {
        setProfileMessage(result.error || "Failed to update profile.");
      }
    } catch {
      setProfileMessage("An unexpected error occurred.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const result = updatePassword(user.id, currentPassword, newPassword);
      if (result.success) {
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (user.mustChangePassword) {
          updateUser({ ...user, mustChangePassword: false });
          router.push("/dashboard");
        }
      } else {
        setPasswordError(result.error || "Failed to change password.");
      }
    } catch {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {showChangePassword && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-content">
            <span className="font-semibold">First-time login:</span> You must change your password before accessing the dashboard.
          </div>
        )}

        <Card variant="default" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white text-xl font-bold">
                  {initials}
                </div>
                <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {user?.name}
                  <Badge variant={user?.role === "admin" ? "default" : user?.role === "trainer" ? "info" : "success"} size="sm">
                    {user ? ROLE_LABELS[user.role] : ""}
                  </Badge>
                </CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-content">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="flex w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-content placeholder:text-content-tertiary transition-all duration-200 focus-ring hover:border-border-strong resize-none"
                />
              </div>
              <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              <Input label="Office Address" value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} placeholder="123 Business Ave, Suite 100" />
              <Input label="Home Address" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} placeholder="456 Home St, Apt 2B" />

              {profileMessage && (
                <p className={`text-sm ${profileMessage.includes("successfully") ? "text-success" : "text-danger"}`}>
                  {profileMessage}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card variant="default" padding="lg" id="change-password">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Ensure your account is secure with a strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-content" htmlFor="current-password">Current Password</label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm text-content placeholder:text-content-tertiary transition-all duration-200 focus-ring hover:border-border-strong"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-content" htmlFor="new-password">New Password</label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm text-content placeholder:text-content-tertiary transition-all duration-200 focus-ring hover:border-border-strong"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-success">{passwordSuccess}</p>}

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={passwordSaving}>
                  {passwordSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Changing...</>
                  ) : (
                    <><Shield className="h-4 w-4" /> Change Password</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
