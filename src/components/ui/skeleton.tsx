import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "table" | "avatar";
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
        variant === "table" && "h-10 w-full rounded-xl",
        variant === "avatar" && "h-10 w-10 rounded-xl",
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

function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
      <div className="p-5 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-10 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable rows={4} columns={5} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonPage };
