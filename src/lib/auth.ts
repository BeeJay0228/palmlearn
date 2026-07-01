import type { User, LoginCredentials, UserStatus, Gender } from "@/types";
import { AUTH_STORAGE_KEY, USERS_STORAGE_KEY, DEFAULT_ADMIN } from "@/constants";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "trainer" | "learner";
  avatar?: string;
  bio?: string;
  phone?: string;
  officeAddress?: string;
  homeAddress?: string;
  mustChangePassword: boolean;
  password: string;
  createdAt: string;
  gender?: Gender;
  categoryId?: string;
  subCategoryId?: string;
  regionId?: string;
  stateId?: string;
  status?: UserStatus;
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "hashed_" + Math.abs(hash).toString(36);
}

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    seedDefaultAdmin();
    return getUsers();
  }
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function seedDefaultAdmin(): void {
  const users: StoredUser[] = [
    {
      id: "admin_001",
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: DEFAULT_ADMIN.role,
      mustChangePassword: DEFAULT_ADMIN.mustChangePassword,
      password: hashPassword(DEFAULT_ADMIN.password),
      createdAt: new Date().toISOString(),
    },
  ];
  saveUsers(users);
}

function toUser(stored: StoredUser): User {
  return {
    id: stored.id,
    email: stored.email,
    name: stored.name,
    role: stored.role,
    avatar: stored.avatar,
    bio: stored.bio,
    phone: stored.phone,
    officeAddress: stored.officeAddress,
    homeAddress: stored.homeAddress,
    mustChangePassword: stored.mustChangePassword,
    createdAt: stored.createdAt,
    gender: stored.gender,
    categoryId: stored.categoryId,
    subCategoryId: stored.subCategoryId,
    regionId: stored.regionId,
    stateId: stored.stateId,
    status: stored.status,
  };
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function login(credentials: LoginCredentials): {
  success: boolean;
  user?: User;
  error?: string;
} {
  const users = getUsers();
  const inputEmail = credentials.email.trim().toLowerCase();
  const found = users.find((u) => u.email.trim().toLowerCase() === inputEmail);

  if (!found) {
    return { success: false, error: "No account found with this email address." };
  }

  if (found.status === "inactive") {
    return { success: false, error: "Your account has been deactivated. Please contact an administrator." };
  }

  const hashed = hashPassword(credentials.password);
  if (found.password !== hashed) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  const user = toUser(found);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function updatePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: "User not found." };

  const hashedCurrent = hashPassword(currentPassword);
  if (users[index].password !== hashedCurrent) {
    return { success: false, error: "Current password is incorrect." };
  }

  users[index].password = hashPassword(newPassword);
  users[index].mustChangePassword = false;
  saveUsers(users);

  const storedUser = getStoredUser();
  if (storedUser && storedUser.id === userId) {
    storedUser.mustChangePassword = false;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedUser));
  }

  return { success: true };
}

export function updateProfile(userId: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: "User not found." };

  if (updates.name !== undefined) users[index].name = updates.name;
  if (updates.bio !== undefined) users[index].bio = updates.bio;
  if (updates.phone !== undefined) users[index].phone = updates.phone;
  if (updates.officeAddress !== undefined) users[index].officeAddress = updates.officeAddress;
  if (updates.homeAddress !== undefined) users[index].homeAddress = updates.homeAddress;
  if (updates.avatar !== undefined) users[index].avatar = updates.avatar;

  saveUsers(users);

  const user = toUser(users[index]);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function getAllUsers(): User[] {
  return getUsers().map(toUser);
}

export function hashMockPassword(password: string): string {
  return hashPassword(password);
}

export function saveUsersToStore(users: StoredUser[]): void {
  saveUsers(users);
}

export function getRawUsers(): StoredUser[] {
  return getUsers();
}
