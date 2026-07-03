"use client";

import { createContext, useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { User, LoginCredentials } from "@/types";
import * as authLib from "@/lib/auth";
import { AUTH_STORAGE_KEY } from "@/constants";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    return authLib.getStoredUser();
  });
  const [isLoading] = useState(false);

  const setAuthCookie = useCallback((user: User | null) => {
    if (typeof document === "undefined") return;
    if (user) {
      const data = btoa(JSON.stringify({ role: user.role, id: user.id }));
      document.cookie = `palmlearn-auth=${data};path=/;max-age=86400;samesite=lax`;
    } else {
      document.cookie = "palmlearn-auth=;path=/;max-age=0";
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = authLib.login(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      setAuthCookie(result.user);
    }
    return { success: result.success, error: result.error };
  }, [setAuthCookie]);

  const logout = useCallback(() => {
    authLib.logout();
    setUser(null);
    setAuthCookie(null);
  }, [setAuthCookie]);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const refreshUser = useCallback(() => {
    const stored = authLib.getStoredUser();
    setUser(stored);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
