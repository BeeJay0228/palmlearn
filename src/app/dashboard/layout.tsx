"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LayoutDashboard, Users, Settings, Building2, FolderTree, FolderOpen, MapPin, Globe } from "lucide-react";
import type { NavItem } from "@/types";
import type { ReactNode } from "react";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Organization", href: "", icon: Building2, isSection: true },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Categories", href: "/dashboard/admin/categories", icon: FolderTree },
  { label: "Sub-Categories", href: "/dashboard/admin/sub-categories", icon: FolderOpen },
  { label: "Regions", href: "/dashboard/admin/regions", icon: MapPin },
  { label: "States", href: "/dashboard/admin/states", icon: Globe },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const trainerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/trainer/courses", icon: FolderOpen, disabled: true },
  { label: "Schedule", href: "/dashboard/trainer/schedule", icon: FolderTree, disabled: true },
  { label: "Learners", href: "/dashboard/trainer/learners", icon: Users, disabled: true },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const learnerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Learning", href: "/dashboard/learner/courses", icon: FolderOpen, disabled: true },
  { label: "Calendar", href: "/dashboard/learner/calendar", icon: FolderTree, disabled: true },
  { label: "Achievements", href: "/dashboard/learner/achievements", icon: Building2, disabled: true },
];

const navMap: Record<string, NavItem[]> = {
  admin: adminNav,
  trainer: trainerNav,
  learner: learnerNav,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navItems = user ? navMap[user.role] || learnerNav : learnerNav;

  return (
    <AuthGuard>
      <AppShell sidebarItems={navItems}>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
