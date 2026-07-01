import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  full: "max-w-full",
};

export function ContentContainer({
  children,
  className,
  maxWidth = "lg",
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6",
        maxWidthMap[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  );
}
