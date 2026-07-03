import { cn } from "@/lib/utils";
import { SkeletonCard, SkeletonTable, SkeletonChart } from "@/components/ui/skeleton";

interface LoadingFallbackProps {
  type?: "card" | "table" | "chart" | "page";
  count?: number;
  className?: string;
}

export function LoadingFallback({ type = "card", count = 1, className }: LoadingFallbackProps) {
  const Skeleton = {
    card: SkeletonCard,
    table: SkeletonTable,
    chart: SkeletonChart,
    page: () => (
      <div className="flex flex-col gap-6">
        <SkeletonCard />
        <SkeletonTable rows={8} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    ),
  }[type];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} />)}
    </div>
  );
}
