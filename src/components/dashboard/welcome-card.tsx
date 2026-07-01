"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface WelcomeCardProps {
  user: User;
  className?: string;
}

export function WelcomeCard({ user, className }: WelcomeCardProps) {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <Card variant="default" padding="lg" className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-primary-800/5" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/5 blur-3xl" />
      <CardContent className="relative">
        <h2 className="text-2xl font-bold text-content">
          {greeting}, {user.name.split(" ")[0]}!
        </h2>
        <p className="text-content-secondary mt-1">
          Welcome to your learning dashboard. Here&apos;s what&apos;s happening today.
        </p>
      </CardContent>
    </Card>
  );
}
