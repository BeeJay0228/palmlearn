"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/types";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Bell,
  Library,
  Map,
  Globe,
} from "lucide-react";

const trainerNavItems: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "My Learners", href: "/trainer/my-learners", icon: Users },
  { label: "Assignments", href: "/trainer/assignments", icon: ClipboardList },
  { label: "Events", href: "/trainer/events", icon: CalendarDays },
  { label: "Reports", href: "/trainer/reports", icon: BarChart3 },
  { label: "Notifications", href: "/trainer/notifications", icon: Bell },
  { label: "Learning Library", href: "", isSection: true },
  { label: "Courses", href: "/trainer/courses", icon: Library },
  { label: "Learning Paths", href: "/trainer/learning-paths", icon: Map },
  { label: "Resource Library", href: "/trainer/resource-library", icon: Globe },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="trainer">
      <AppShell sidebarItems={trainerNavItems}>{children}</AppShell>
    </AuthGuard>
  );
}
