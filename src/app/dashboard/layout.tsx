"use client";

import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/types";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Users, BookOpen, BookMarked, GitBranch, MapPin, Globe,
  ClipboardList, PlayCircle,
} from "lucide-react";

const adminNav: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Learning", href: "/admin/learning", icon: BookOpen },
  { label: "Organization", href: "", isSection: true },
  { label: "Categories", href: "/admin/categories", icon: BookMarked },
  { label: "Sub-Categories", href: "/admin/sub-categories", icon: GitBranch },
  { label: "Regions", href: "/admin/regions", icon: MapPin },
  { label: "States", href: "/admin/states", icon: Globe },
];

const trainerNav: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "My Learners", href: "/trainer/my-learners", icon: Users },
  { label: "Learning", href: "/trainer/learning", icon: BookOpen },
  { label: "Assignments", href: "/trainer/assignments", icon: ClipboardList },
];

const learnerNav: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/learner/dashboard", icon: LayoutDashboard },
  { label: "Continue Learning", href: "/learner/continue-learning", icon: PlayCircle },
  { label: "My Courses", href: "/learner/my-courses", icon: BookOpen },
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
