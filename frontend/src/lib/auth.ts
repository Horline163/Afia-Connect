import type { User } from "@/lib/types";

export type AuthUser = Partial<User> & {
  userId: string;
  username: string;
  role: string;
};

export type StoredAuth = {
  token: string;
  user: AuthUser;
};

const STORAGE_KEY = "afia_auth";

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch (error) {
    console.warn("Failed to parse auth storage", error);
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return getStoredAuth()?.token ?? null;
}
