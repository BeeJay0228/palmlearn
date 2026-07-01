"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionDiv } from "@/components/shared/motion-div";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/5 dark:bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-400/5 dark:bg-primary-400/10 blur-3xl" />
      </div>

      <div className="container-site">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-8">
          <MotionDiv animation="slideUp" delay={0.1}>
            <Badge variant="default" size="lg" className="mb-4">
              Introducing PalmLearn v1.0
            </Badge>
          </MotionDiv>

          <MotionDiv animation="slideUp" delay={0.2}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance">
              Enterprise Learning{" "}
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
          </MotionDiv>

          <MotionDiv animation="slideUp" delay={0.3}>
            <p className="text-lg sm:text-xl text-content-secondary max-w-2xl text-balance">
              Empower your workforce with a premium learning experience. 
              Create, deliver, and track training at scale with PalmLearn&apos;s 
              intelligent platform.
            </p>
          </MotionDiv>

          <MotionDiv animation="slideUp" delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button variant="primary" size="xl" className="rounded-full">
                Start Learning
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="xl" className="rounded-full">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </MotionDiv>

          <MotionDiv animation="slideUp" delay={0.5}>
            <p className="text-sm text-content-tertiary mt-4">
              Trusted by industry leaders. No credit card required.
            </p>
          </MotionDiv>

          <MotionDiv animation="scaleIn" delay={0.6} className="w-full mt-8">
            <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl border border-border bg-gradient-to-br from-surface-secondary to-surface-tertiary overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/25 hover:bg-primary-700 transition-colors cursor-pointer">
                    <Play className="h-6 w-6 ml-0.5" />
                  </div>
                  <p className="text-sm font-medium text-content-secondary">
                    See PalmLearn in action
                  </p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-danger" />
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <div className="h-2 w-2 rounded-full bg-success" />
                </div>
                <span className="text-xs text-content-tertiary font-mono">
                  palmlearn.io/demo
                </span>
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
