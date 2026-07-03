"use client";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Trophy, Star, Zap, Target, Award, Flame, BookOpen, CheckCircle,
  TrendingUp, Crown,
} from "lucide-react";

const ACHIEVEMENTS = [
  { icon: BookOpen, title: "First Course Completed", description: "Complete your first course", unlocked: false, color: "from-blue-400 to-blue-600" },
  { icon: Star, title: "5 Courses Completed", description: "Complete 5 courses", unlocked: false, color: "from-amber-400 to-amber-600" },
  { icon: Crown, title: "Programme Graduate", description: "Complete a full training programme", unlocked: false, color: "from-purple-400 to-purple-600" },
  { icon: CheckCircle, title: "Perfect Score", description: "Score 100% on any assignment", unlocked: false, color: "from-emerald-400 to-emerald-600" },
  { icon: Flame, title: "7-Day Streak", description: "Learn for 7 days in a row", unlocked: false, color: "from-orange-400 to-orange-600" },
  { icon: Zap, title: "Fast Learner", description: "Complete a course in under a day", unlocked: false, color: "from-yellow-400 to-yellow-600" },
  { icon: TrendingUp, title: "Top Performer", description: "Score above 90% on all assignments", unlocked: false, color: "from-rose-400 to-rose-600" },
  { icon: Award, title: "5 Certificates Earned", description: "Earn 5 certificates", unlocked: false, color: "from-indigo-400 to-indigo-600" },
];

export default function LearnerAchievementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Achievements & Badges"
        description="Track your accomplishments, badges, and learning milestones."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((achievement) => (
          <Card
            key={achievement.title}
            variant="default"
            padding="lg"
            className={cn(
              "relative overflow-hidden text-center group transition-all duration-300",
              !achievement.unlocked && "opacity-60 grayscale hover:opacity-80 hover:grayscale-0",
              achievement.unlocked && "card-hover",
            )}
          >
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br mx-auto mb-3 transition-transform duration-300 group-hover:scale-110",
              achievement.color,
              !achievement.unlocked && "opacity-50",
            )}>
              <achievement.icon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-content">{achievement.title}</h3>
            <p className="text-xs text-content-tertiary mt-1">{achievement.description}</p>
            <Badge
              variant={achievement.unlocked ? "success" : "soft"}
              size="sm"
              className="mt-3"
            >
              {achievement.unlocked ? "Unlocked" : "Locked"}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
