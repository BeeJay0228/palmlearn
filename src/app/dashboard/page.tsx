"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.mustChangePassword) {
      router.replace("/dashboard/profile?changePassword=true");
      return;
    }

    switch (user.role) {
      case "admin":
        router.replace("/admin/dashboard");
        break;
      case "trainer":
        router.replace("/trainer/dashboard");
        break;
      case "learner":
        router.replace("/learner/dashboard");
        break;
      default:
        router.replace("/learner/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        <p className="text-sm text-content-secondary">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
