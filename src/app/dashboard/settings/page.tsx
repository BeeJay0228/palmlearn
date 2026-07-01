"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMounted } from "@/hooks/use-mounted";
import { Sun, Moon, Bell, Globe, Shield, Eye } from "lucide-react";

const settingsSections = [
  {
    id: "theme",
    title: "Theme",
    description: "Customize your appearance preferences.",
    icon: Sun,
  },
  {
    id: "language",
    title: "Language & Region",
    description: "Manage your language and regional settings.",
    icon: Globe,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure how you receive notifications.",
    icon: Bell,
  },
  {
    id: "privacy",
    title: "Privacy",
    description: "Control your privacy settings.",
    icon: Eye,
  },
  {
    id: "security",
    title: "Security",
    description: "Manage your account security preferences.",
    icon: Shield,
  },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [activeSection, setActiveSection] = useState("theme");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <nav className="sm:w-48 shrink-0 flex flex-col gap-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                      : "text-content-secondary hover:text-content hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {section.title}
                </button>
              );
            })}
          </nav>

          <div className="flex-1 flex flex-col gap-6">
            {activeSection === "theme" && (
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Customize your appearance preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <p className="text-sm font-medium text-content">Interface Theme</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-32 ${
                          theme === "light" || (!mounted)
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-950/50"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <Sun className="h-6 w-6 text-content" />
                        <span className="text-sm font-medium text-content">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-32 ${
                          theme === "dark"
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-950/50"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <Moon className="h-6 w-6 text-content" />
                        <span className="text-sm font-medium text-content">Dark</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saved}>
                      {saved ? "Saved!" : "Save Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "language" && (
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>Manage your language and regional settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary border border-border">
                      <div>
                        <p className="text-sm font-medium text-content">Language</p>
                        <p className="text-xs text-content-tertiary">English (United States)</p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary border border-border">
                      <div>
                        <p className="text-sm font-medium text-content">Time Zone</p>
                        <p className="text-xs text-content-tertiary">UTC (Coordinated Universal Time)</p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary border border-border">
                      <div>
                        <p className="text-sm font-medium text-content">Date Format</p>
                        <p className="text-xs text-content-tertiary">MM/DD/YYYY</p>
                      </div>
                      <Badge variant="secondary">Current</Badge>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="secondary" disabled>Coming Soon</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {["Email Notifications", "Push Notifications", "Course Updates", "Assignment Reminders", "Certificate Alerts"].map((item) => (
                      <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm text-content">{item}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-content-tertiary">Coming soon</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="secondary" disabled>Coming Soon</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "privacy" && (
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>Control your privacy settings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {["Profile Visibility", "Activity Status", "Show Email to Others", "Data Export"].map((item) => (
                      <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm text-content">{item}</span>
                        <span className="text-xs text-content-tertiary">Coming soon</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="secondary" disabled>Coming Soon</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your account security preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    {["Two-Factor Authentication", "Active Sessions", "Login History", "App Passwords"].map((item) => (
                      <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <span className="text-sm text-content">{item}</span>
                        <span className="text-xs text-content-tertiary">Coming soon</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="secondary" disabled>Coming Soon</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
