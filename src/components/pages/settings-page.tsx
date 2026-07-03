"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sun, Moon, Globe, Bell, Shield, Lock, Monitor, Laptop } from "lucide-react";

type SettingsTab = "appearance" | "language" | "notifications" | "privacy" | "security";

const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "security", label: "Security", icon: Lock },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Settings</h1>
        <p className="text-sm text-content-secondary/80 mt-1">Manage your application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
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

        {/* Content */}
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
                  <label className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all",
                    theme === "light"
                      ? "border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm"
                      : "border-border bg-surface-secondary hover:bg-surface-hover",
                  )}>
                    <input type="radio" name="theme" className="sr-only" checked={theme === "light"} onChange={() => handleThemeChange("light")} />
                    <Sun className="h-8 w-8 text-amber-500" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-content">Light Mode</p>
                      <p className="text-xs text-content-tertiary mt-1">Clean and bright</p>
                    </div>
                    {theme === "light" && (
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                    )}
                  </label>
                  <label className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all",
                    theme === "dark"
                      ? "border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm"
                      : "border-border bg-surface-secondary hover:bg-surface-hover",
                  )}>
                    <input type="radio" name="theme" className="sr-only" checked={theme === "dark"} onChange={() => handleThemeChange("dark")} />
                    <Moon className="h-8 w-8 text-indigo-500" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-content">Dark Mode</p>
                      <p className="text-xs text-content-tertiary mt-1">Easy on the eyes</p>
                    </div>
                    {theme === "dark" && (
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                    )}
                  </label>
                  <label className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all",
                    theme === "system"
                      ? "border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm"
                      : "border-border bg-surface-secondary hover:bg-surface-hover",
                  )}>
                    <input type="radio" name="theme" className="sr-only" checked={theme === "system"} onChange={() => handleThemeChange("system")} />
                    <Laptop className="h-8 w-8 text-content-secondary" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-content">System</p>
                      <p className="text-xs text-content-tertiary mt-1">Follow device</p>
                    </div>
                    {theme === "system" && (
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                    )}
                  </label>
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
                    <select className="h-12 rounded-xl border border-border bg-surface-secondary px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>French</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-content">Time Zone</label>
                    <select className="h-12 rounded-xl border border-border bg-surface-secondary px-4 text-sm text-content outline-none focus:border-primary-500/50 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all">
                      <option>UTC+1 (West Africa Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC-5 (Eastern Time)</option>
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
                  {[
                    { label: "Course Updates", desc: "When course content is updated or modified" },
                    { label: "Assignment Reminders", desc: "Upcoming assignment deadlines and due dates" },
                    { label: "Achievement Alerts", desc: "When you earn badges or certificates" },
                    { label: "System Announcements", desc: "Platform updates and maintenance notices" },
                  ].map((n) => (
                    <label key={n.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50 hover:bg-surface-hover transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-content">{n.label}</p>
                        <p className="text-xs text-content-tertiary mt-0.5">{n.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg accent-primary-600 rounded-lg border-border" />
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
                  {[
                    { label: "Profile Visibility", desc: "Allow other users to see your learning progress" },
                    { label: "Activity Status", desc: "Show when you&apos;re actively learning" },
                    { label: "Email Notifications", desc: "Receive learning digest emails" },
                  ].map((p) => (
                    <label key={p.label} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary/50 border border-border/50 hover:bg-surface-hover transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-content">{p.label}</p>
                        <p className="text-xs text-content-tertiary mt-0.5">{p.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg accent-primary-600 rounded-lg border-border" />
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
