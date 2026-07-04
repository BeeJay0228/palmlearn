"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTrainerData } from "@/hooks/use-trainer-data";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sun, Moon, Globe, Bell, Shield, Lock, Monitor, Laptop, CheckCircle2 } from "lucide-react";

type SettingsTab = "appearance" | "language" | "notifications" | "privacy" | "security";

const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "security", label: "Security", icon: Lock },
];

const NOTIFICATION_ITEMS = [
  { key: "courseUpdates", label: "Course Updates", desc: "When course content is updated or modified" },
  { key: "assignmentReminders", label: "Assignment Reminders", desc: "Upcoming assignment deadlines and due dates" },
  { key: "achievementAlerts", label: "Achievement Alerts", desc: "When you earn badges or certificates" },
  { key: "systemAnnouncements", label: "System Announcements", desc: "Platform updates and maintenance notices" },
] as const;

const PRIVACY_ITEMS = [
  { key: "profileVisibility", label: "Profile Visibility", desc: "Allow other users to see your learning progress" },
  { key: "activityStatus", label: "Activity Status", desc: "Show when you're actively learning" },
  { key: "emailNotifications", label: "Email Notifications", desc: "Receive learning digest emails" },
] as const;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const { theme, setTheme } = useTheme();
  const { data: trainerData, save: saveTrainerData } = useTrainerData();
  const [saved, setSaved] = useState(false);

  const settings = (trainerData?.settings as Record<string, unknown>) || {};
  const notificationPrefs = (settings.notifications as Record<string, boolean>) || {};
  const privacyPrefs = (settings.privacy as Record<string, boolean>) || {};

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    await saveTrainerData({
      settings: { ...settings, theme: newTheme },
    });
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    const updated = { ...notificationPrefs, [key]: value };
    await saveTrainerData({
      settings: { ...settings, notifications: updated },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePrivacyToggle = async (key: string, value: boolean) => {
    const updated = { ...privacyPrefs, [key]: value };
    await saveTrainerData({
      settings: { ...settings, privacy: updated },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await saveTrainerData({
      settings: { ...settings, language: e.target.value },
    });
  };

  const handleTimezoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await saveTrainerData({
      settings: { ...settings, timezone: e.target.value },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Settings</h1>
          <p className="text-sm text-content-secondary/80 mt-1">Manage your application preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400 animate-slide-up">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400 shadow-sm"
                    : "text-content-secondary hover:text-content hover:bg-surface-hover",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "appearance" && (
            <Card variant="default" padding="none">
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary-600" />
                  <CardTitle>Appearance</CardTitle>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-content-secondary mb-6">Customize the look and feel of the application</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(["light", "dark", "system"] as const).map((mode) => {
                    const isActive = theme === mode;
                    const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Laptop;
                    return (
                      <label
                        key={mode}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all",
                          isActive
                            ? "border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm"
                            : "border-border bg-surface-secondary hover:bg-surface-hover",
                        )}
                      >
                        <input type="radio" name="theme" className="sr-only" checked={isActive} onChange={() => handleThemeChange(mode)} />
                        <Icon className={cn("h-8 w-8", mode === "light" ? "text-amber-500" : mode === "dark" ? "text-indigo-500" : "text-content-secondary")} />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-content capitalize">{mode} Mode</p>
                          <p className="text-xs text-content-tertiary mt-1">{mode === "light" ? "Clean and bright" : mode === "dark" ? "Easy on the eyes" : "Follow device"}</p>
                        </div>
                        {isActive && <span className="h-2 w-2 rounded-full bg-primary-600" />}
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "language" && (
            <Card variant="default" padding="none">
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary-600" />
                  <CardTitle>Language & Region</CardTitle>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-content">Language</label>
                    <select value={(settings.language as string) || "en-US"} onChange={handleLanguageChange} className="h-12 rounded-xl border border-border bg-surface-secondary px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all">
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-content">Time Zone</label>
                    <select value={(settings.timezone as string) || "UTC+1"} onChange={handleTimezoneChange} className="h-12 rounded-xl border border-border bg-surface-secondary px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all">
                      <option value="UTC+1">UTC+1 (West Africa Time)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card variant="default" padding="none">
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary-600" />
                  <CardTitle>Notifications</CardTitle>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {NOTIFICATION_ITEMS.map((n) => (
                    <label key={n.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50 hover:bg-surface-hover transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-content">{n.label}</p>
                        <p className="text-xs text-content-tertiary mt-0.5">{n.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs[n.key] ?? true}
                        onChange={(e) => handleNotificationToggle(n.key, e.target.checked)}
                        className="h-5 w-5 rounded-lg accent-primary-600 rounded-lg border-border"
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "privacy" && (
            <Card variant="default" padding="none">
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <CardTitle>Privacy</CardTitle>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {PRIVACY_ITEMS.map((p) => (
                    <label key={p.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50 hover:bg-surface-hover transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-content">{p.label}</p>
                        <p className="text-xs text-content-tertiary mt-0.5">{p.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyPrefs[p.key] ?? true}
                        onChange={(e) => handlePrivacyToggle(p.key, e.target.checked)}
                        className="h-5 w-5 rounded-lg accent-primary-600 rounded-lg border-border"
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card variant="default" padding="none">
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary-600" />
                  <CardTitle>Security</CardTitle>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-content">Two-Factor Authentication</p>
                      <p className="text-xs text-content-tertiary mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <span className="text-xs font-medium text-primary-600">Coming soon</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-content">Active Sessions</p>
                      <p className="text-xs text-content-tertiary mt-0.5">Manage devices where you&apos;re logged in</p>
                    </div>
                    <span className="text-xs font-medium text-content-secondary">1 session</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-content">Login History</p>
                      <p className="text-xs text-content-tertiary mt-0.5">Review recent login activity</p>
                    </div>
                    <button className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">View</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
