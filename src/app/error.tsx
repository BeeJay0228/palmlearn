"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20">
        <span className="text-4xl font-bold text-danger">!</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-content">
        Page Load Error
      </h1>
      <p className="text-content-secondary max-w-md text-balance">
        {error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <p className="text-xs text-content-tertiary max-w-sm">
        If the problem persists, try refreshing the page or contact support.
      </p>
      <button
        onClick={reset}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-6 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
