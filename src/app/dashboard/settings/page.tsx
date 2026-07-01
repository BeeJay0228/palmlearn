"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(`/${user.role}/settings`);
    } else if (!isLoading) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return null;
}
