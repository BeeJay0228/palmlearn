"use client";

import { useAuth } from "./use-auth";
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAny,
  hasAllPermissions as checkAll,
  getRolePermissions,
  type Permission,
} from "@/lib/permissions";

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role ?? undefined;

  return {
    can: (permission: Permission) => checkPermission(role, permission),
    canAny: (...permissions: Permission[]) => checkAny(role, permissions),
    canAll: (...permissions: Permission[]) => checkAll(role, permissions),
    permissions: () => getRolePermissions(role),
    isAdmin: role === "admin",
    isTrainer: role === "trainer",
    isLearner: role === "learner",
  };
}
