"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/types";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  BarChart3,
  Bell,
  Building2,
  BookMarked,
  MapPin,
  GitBranch,
  Library,
  Map,
  Globe,
} from "lucide-react";

const adminNavItems: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Learning", href: "/admin/learning", icon: BookOpen },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Learning Library", href: "", isSection: true },
  { label: "Courses", href: "/admin/courses", icon: Library },
  { label: "Learning Paths", href: "/admin/learning-paths", icon: Map },
  { label: "Resource Library", href: "/admin/resource-library", icon: Globe },
  { label: "Organization", href: "", isSection: true },
  { label: "Categories", href: "/admin/categories", icon: BookMarked },
  { label: "Sub-Categories", href: "/admin/sub-categories", icon: GitBranch },
  { label: "Regions", href: "/admin/regions", icon: MapPin },
  { label: "States", href: "/admin/states", icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <AppShell sidebarItems={adminNavItems}>{children}</AppShell>
    </AuthGuard>
  );
}
