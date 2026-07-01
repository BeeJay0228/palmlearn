import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
}

function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer-bg rounded-lg",
        variant === "circular" && "rounded-full",
        variant === "card" && "rounded-2xl h-48",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "rectangular" && "h-24 rounded-xl",
        className,
      )}
      {...props}
    />
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <Skeleton className="w-3/4 h-5" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 2 ? "w-1/2" : "w-full"} />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border p-6 flex flex-col gap-4", className)}>
      <Skeleton variant="circular" className="h-12 w-12" />
      <SkeletonText lines={3} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };
