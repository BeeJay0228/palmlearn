"use client";

import { createContext, useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { User, LoginCredentials } from "@/types";
import * as authLib from "@/lib/auth";

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

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = authLib.login(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    authLib.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    localStorage.setItem("palmlearn-auth", JSON.stringify(updated));
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
