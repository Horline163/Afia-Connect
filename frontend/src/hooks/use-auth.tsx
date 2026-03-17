import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiData, apiRequest } from "@/lib/api";
import { clearStoredAuth, getStoredAuth, setStoredAuth, type AuthUser } from "@/lib/auth";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{
        token: string;
        userId: string;
        username: string;
        role: string;
        firstName?: string;
        lastName?: string;
      }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const nextAuth = {
        token: response.data.token,
        user: {
          userId: response.data.userId,
          username: response.data.username,
          role: response.data.role,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email,
        },
      };

      setAuth(nextAuth);
      setStoredAuth(nextAuth);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    clearStoredAuth();
    queryClient.clear();
  }, [queryClient]);

  const refresh = useCallback(async () => {
    if (!auth?.token) return;
    setIsLoading(true);
    try {
      const me = await apiData<User>("/auth/me");
      setAuth((prev) => {
        if (!prev?.token) return prev;
        const nextAuth = {
          token: prev.token,
          user: {
            ...(prev.user ?? {}),
            ...me,
          },
        };
        setStoredAuth(nextAuth);
        return nextAuth;
      });
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token, logout]);

  useEffect(() => {
    if (!auth?.token) return;
    refresh().catch(() => undefined);
  }, [auth?.token, refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isLoading,
      login,
      logout,
      refresh,
    }),
    [auth, isLoading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
