"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MotionDiv } from "@/components/shared/motion-div";
import {
  Sparkles,
  ArrowRight,
  Activity,
  PlayCircle,
} from "lucide-react";
import { ROLE_LABELS } from "@/constants";

interface DashboardWelcomeProps {
  subtitle: string;
  action?: {
    label: string;
    href: string;
  };
  metrics?: {
    label: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  className?: string;
}

export function DashboardWelcome({
  subtitle,
  action,
  metrics,
  className,
}: DashboardWelcomeProps) {
  const { user } = useAuth();
  const router = useRouter();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  }, []);

  const motivationalMessage = useMemo(() => {
    const msgs: Record<string, string> = {
      admin: "Keep driving excellence across your organization.",
      trainer: "You're shaping the next generation of leaders.",
      learner: "Every lesson brings you closer to mastery.",
    };
    return msgs[user?.role || "learner"];
  }, [user?.role]);

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <MotionDiv variant="fade-in-up" className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900", className)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-white/20 animate-float" style={{ animationDelay: "-1s" }} />
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 rounded-full bg-white/10 animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
      </div>

      <div className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-200" />
              <span className="text-xs font-medium text-primary-200/80 uppercase tracking-wider">
                {ROLE_LABELS[user?.role || "learner"]} Dashboard
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-sm text-primary-100/80 leading-relaxed max-w-lg">
              {subtitle}
            </p>
            <p className="text-sm text-primary-200/60 italic">
              &ldquo;{motivationalMessage}&rdquo;
            </p>
            {action && (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="glass-primary"
                  size="lg"
                  className="text-white border-white/20 hover:bg-white/15"
                  onClick={() => router.push(action.href)}
                >
                  {user?.role === "learner" ? <PlayCircle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {metrics && metrics.length > 0 && (
            <div className="flex items-center gap-6">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-primary-200/70 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MotionDiv>
  );
}
