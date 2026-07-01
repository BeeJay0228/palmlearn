"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import type { User } from "@/types";

interface WelcomeCardProps {
  user: User;
  className?: string;
}

export function WelcomeCard({ user, className }: WelcomeCardProps) {
  const router = useRouter();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const message = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Start your morning with purpose. Every lesson brings you closer to mastery.";
    if (hour < 17) return "Keep the momentum going. Your learning journey continues to inspire.";
    return "Evenings are perfect for reflection. Review what you've learned today.";
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900", className)}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-primary-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/4 right-1/3 w-4 h-4 rounded-full bg-white/20 animate-float" style={{ animationDelay: "-1s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-white/10 animate-float" style={{ animationDelay: "-2s" }} />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
      </div>

      <div className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-200" />
              <span className="text-xs font-medium text-primary-200/80 uppercase tracking-wider">
                Learning Command Center
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
              {greeting}, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-primary-100/80 leading-relaxed">
              {message}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="glass-primary"
                size="lg"
                className="text-white border-white/20 hover:bg-white/15"
                onClick={() => router.push("/admin/dashboard")}
              >
                <TrendingUp className="h-4 w-4" />
                Continue Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats decoration */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-xs text-primary-200/70 mt-1">Day Streak</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">8</p>
              <p className="text-xs text-primary-200/70 mt-1">Courses</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-xs text-primary-200/70 mt-1">Certificates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
