"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import type { NavItem } from "@/types";
import {
  LayoutDashboard,
  PlayCircle,
  BookOpen,
  Award,
  CalendarDays,
  Trophy,
  Bell,
} from "lucide-react";

const learnerNavItems: NavItem[] = [
  { label: "Main", href: "", isSection: true },
  { label: "Dashboard", href: "/learner/dashboard", icon: LayoutDashboard },
  { label: "Continue Learning", href: "/learner/continue-learning", icon: PlayCircle },
  { label: "My Courses", href: "/learner/my-courses", icon: BookOpen },
  { label: "Certificates", href: "/learner/certificates", icon: Award },
  { label: "Events", href: "/learner/events", icon: CalendarDays },
  { label: "Achievements", href: "/learner/achievements", icon: Trophy },
  { label: "Notifications", href: "/learner/notifications", icon: Bell },
];

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="learner">
      <AppShell sidebarItems={learnerNavItems}>{children}</AppShell>
    </AuthGuard>
  );
}
