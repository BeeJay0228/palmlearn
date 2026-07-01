"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/constants";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email: email.trim(), password, rememberMe });
      if (result.success) {
        const { getStoredUser } = await import("@/lib/auth");
        const user = getStoredUser();
        if (user?.mustChangePassword) {
          router.push("/dashboard/profile?changePassword=true");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-600/20 mb-2">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-content">
          Welcome back
        </h1>
        <p className="text-sm text-content-secondary">
          Sign in to your {APP_NAME} account
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3.5 text-sm text-danger animate-slide-up">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          variant="filled"
          inputSize="lg"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-content" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="flex h-12 w-full rounded-xl border border-transparent bg-surface-secondary px-4 pr-11 text-sm text-content placeholder:text-content-tertiary transition-all duration-200 hover:bg-surface-tertiary focus:bg-surface focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-secondary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer h-4 w-4 appearance-none rounded-md border border-border bg-surface checked:bg-primary-600 checked:border-primary-600 transition-all duration-200 focus-ring cursor-pointer"
              />
              <svg
                className="absolute inset-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 8 7 12 13 4" />
              </svg>
            </div>
            <span className="text-sm text-content-secondary group-hover:text-content transition-colors select-none">
              Remember me
            </span>
          </label>
          <button
            type="button"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors focus-ring rounded px-1"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button type="submit" size="xl" className="w-full rounded-xl" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
