"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Bell, Shield, Lock } from "lucide-react";

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
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Settings</h1>
        <p className="text-sm text-content-secondary mt-1">Manage your application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400"
                  : "text-content-secondary hover:text-content hover:bg-surface-secondary"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "appearance" && (
            <section className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-base font-semibold text-content mb-2">Appearance</h2>
              <p className="text-sm text-content-secondary mb-6">Customize the look and feel of the application</p>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface-secondary cursor-pointer hover:bg-surface-hover transition-all has-[:checked]:border-primary-600 has-[:checked]:ring-1 has-[:checked]:ring-primary-600" onClick={() => handleThemeChange("light")}>
                  <input type="radio" name="theme" className="accent-primary-600" checked={theme === "light"} onChange={() => {}} />
                  <Sun className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-content">Light Mode</p>
                    <p className="text-xs text-content-tertiary">Clean, bright interface</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface-secondary cursor-pointer hover:bg-surface-hover transition-all has-[:checked]:border-primary-600 has-[:checked]:ring-1 has-[:checked]:ring-primary-600" onClick={() => handleThemeChange("dark")}>
                  <input type="radio" name="theme" className="accent-primary-600" checked={theme === "dark"} onChange={() => {}} />
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-content">Dark Mode</p>
                    <p className="text-xs text-content-tertiary">Easy on the eyes, perfect for low light</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface-secondary cursor-pointer hover:bg-surface-hover transition-all has-[:checked]:border-primary-600 has-[:checked]:ring-1 has-[:checked]:ring-primary-600" onClick={() => handleThemeChange("system")}>
                  <input type="radio" name="theme" className="accent-primary-600" checked={theme === "system"} onChange={() => {}} />
                  <div className="flex items-center gap-1">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <Moon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">System</p>
                    <p className="text-xs text-content-tertiary">Follows your device preference</p>
                  </div>
                </label>
              </div>
            </section>
          )}

          {activeTab !== "appearance" && (
            <section className="rounded-xl border border-border bg-surface p-6">
              <h2 className="text-base font-semibold text-content mb-2 capitalize">{activeTab}</h2>
              <p className="text-sm text-content-secondary">Coming Soon</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
