import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-tertiary border border-border">
        <span className="text-4xl font-bold text-content-tertiary">404</span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-content">
        Page not found
      </h1>
      <p className="text-content-secondary max-w-md text-balance">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-6 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
