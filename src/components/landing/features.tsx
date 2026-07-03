"use client";

import { FEATURES } from "@/constants";
import { MotionDiv } from "@/components/shared/motion-div";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Map,
  BarChart3,
  Shield,
  Key,
} from "lucide-react";

const featureIcons = [
  BookOpen,
  Brain,
  Map,
  BarChart3,
  Shield,
  Key,
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-primary-500/5 dark:bg-primary-500/10 blur-3xl" />
      </div>

      <div className="container-site">
        <div className="flex flex-col items-center text-center mb-16 lg:mb-20">
          <MotionDiv variant="slide-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                train your teams
              </span>
            </h2>
          </MotionDiv>
          <MotionDiv variant="slide-up" delay={0.1}>
            <p className="text-lg text-content-secondary max-w-2xl">
              From course creation to certification, PalmLearn provides all the tools 
              to build a world-class learning program.
            </p>
          </MotionDiv>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <MotionDiv
                key={feature.title}
                variant="slide-up"
                delay={0.1 + index * 0.1}
              >
                <Card
                  variant="elevated"
                  padding="lg"
                  className="group h-full hover:-translate-y-1 transition-all duration-300"
                >
                  <CardContent className="flex flex-col gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-content group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-content-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
}
