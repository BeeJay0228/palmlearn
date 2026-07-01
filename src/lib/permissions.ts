export type Permission =
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "users:manage"
  | "organization:manage"
  | "organization:view"
  | "courses:manage"
  | "courses:assign"
  | "courses:view"
  | "events:manage"
  | "events:create"
  | "events:view"
  | "reports:view"
  | "reports:manage"
  | "learning:view"
  | "assignments:view"
  | "certificates:view"
  | "certificates:download"
  | "achievements:view"
  | "profile:edit"
  | "settings:view"
  | "notifications:view";

export type UserRole = "admin" | "trainer" | "learner";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "users:manage",
    "organization:manage",
    "organization:view",
    "courses:manage",
    "courses:assign",
    "courses:view",
    "events:manage",
    "events:create",
    "events:view",
    "reports:manage",
    "reports:view",
    "learning:view",
    "assignments:view",
    "certificates:view",
    "certificates:download",
    "achievements:view",
    "profile:edit",
    "settings:view",
    "notifications:view",
  ],
  trainer: [
    "users:read",
    "organization:view",
    "courses:assign",
    "courses:view",
    "events:create",
    "events:view",
    "reports:view",
    "learning:view",
    "assignments:view",
    "certificates:view",
    "achievements:view",
    "profile:edit",
    "settings:view",
    "notifications:view",
  ],
  learner: [
    "courses:view",
    "events:view",
    "learning:view",
    "certificates:view",
    "certificates:download",
    "achievements:view",
    "profile:edit",
    "settings:view",
    "notifications:view",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getRolePermissions(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}
