import {
  login as libLogin,
  logout as libLogout,
  getStoredUser,
  getAllUsers as libGetAllUsers,
  updatePassword as libUpdatePassword,
  updateProfile as libUpdateProfile,
} from "@/lib/auth";
import type { User, LoginCredentials } from "@/types";

export const authService = {
  login: (credentials: LoginCredentials) => libLogin(credentials),
  logout: () => libLogout(),
  getCurrentUser: (): User | null => getStoredUser(),
  getAllUsers: (): User[] => libGetAllUsers(),
  updatePassword: (userId: string, currentPassword: string, newPassword: string) =>
    libUpdatePassword(userId, currentPassword, newPassword),
  updateProfile: (userId: string, updates: Partial<User>) =>
    libUpdateProfile(userId, updates),
};
