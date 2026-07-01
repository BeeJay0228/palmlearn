import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <Skeleton variant="card" className="w-full max-w-md" />
      <SkeletonText lines={4} className="w-full max-w-md" />
    </div>
  );
}
