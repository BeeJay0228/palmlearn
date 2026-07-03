"use client";

import { GraduationCap, BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { APP_NAME } from "@/constants";

const floatingCards = [
  { icon: BookOpen, label: "Active Courses", value: "1,200+", gradient: "from-blue-500/30 to-blue-600/30" },
  { icon: Users, label: "Active Learners", value: "50K+", gradient: "from-emerald-500/30 to-emerald-600/30" },
  { icon: Award, label: "Certifications", value: "10K+", gradient: "from-amber-500/30 to-amber-600/30" },
  { icon: TrendingUp, label: "Completion Rate", value: "94%", gradient: "from-violet-500/30 to-violet-600/30" },
];

export function LoginBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-emerald-950">
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-400/15 blur-[140px]" />
        <div className="absolute top-[35%] right-[15%] h-[300px] w-[300px] rounded-full bg-primary-400/10 blur-[100px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex w-full flex-col p-12 xl:p-16 2xl:p-20">
        <div
          className="flex items-center gap-3 animate-fade-in"
          style={{ animationDuration: "0.5s" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">{APP_NAME}</span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div
            className="animate-fade-in-up"
            style={{ animationDuration: "0.6s", animationDelay: "0.2s" }}
          >
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-[1.1]">
              Enterprise Learning
            </h1>
            <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold bg-gradient-to-r from-primary-300 via-emerald-300 to-primary-200 bg-clip-text text-transparent mt-3 leading-[1.1]">
              Reimagined
            </h2>
            <p className="text-base xl:text-lg text-primary-200/70 max-w-md mt-6 leading-relaxed">
              Empower your workforce with a premium learning experience. Create, deliver, and track training at scale with PalmLearn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-14 max-w-sm">
            {floatingCards.map((card, i) => (
              <div
                key={card.label}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.06] backdrop-blur-sm p-4 hover:bg-white/[0.10] hover:border-white/[0.12] transition-all duration-300 animate-fade-in-up"
                style={{ animationDuration: "0.5s", animationDelay: `${0.4 + i * 0.12}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient}`}>
                    <card.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white tracking-tight">{card.value}</p>
                    <p className="text-[11px] font-medium text-primary-200/50 uppercase tracking-wider">{card.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-sm text-primary-200/30 animate-fade-in"
          style={{ animationDuration: "0.5s", animationDelay: "1.0s" }}
        >
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
