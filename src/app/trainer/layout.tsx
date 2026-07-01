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
  Megaphone,
  History,
  List,
  UserCheck,
  LineChart,
  Calendar,
} from "lucide-react";

const trainerNavItems: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "My Learners", href: "/trainer/my-learners", icon: Users },
  { label: "Reports", href: "/trainer/reports", icon: BarChart3 },
  { label: "Notifications", href: "/trainer/notifications", icon: Bell },
  { label: "Training Events", href: "", isSection: true },
  { label: "Events Calendar", href: "/trainer/events/calendar", icon: Calendar },
  { label: "All Events", href: "/trainer/events", icon: List },
  { label: "My Events", href: "/trainer/events/my-events", icon: CalendarDays },
  { label: "Attendance", href: "/trainer/events/attendance", icon: UserCheck },
  { label: "Event Analytics", href: "/trainer/events/analytics", icon: LineChart },
  { label: "Learning Delivery", href: "", isSection: true },
  { label: "Assignments", href: "/trainer/assignments", icon: ClipboardList },
  { label: "Learning Campaigns", href: "/trainer/learning-campaigns", icon: Megaphone },
  { label: "Assignment History", href: "/trainer/assignments/history", icon: History },
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
