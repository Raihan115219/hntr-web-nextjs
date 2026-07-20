"use client";

const ADMIN_TOKEN_KEY = "hntr_admin_auth";

export interface StoredAdminAuth {
  token: string;
  expiresAt: number;
  role: "admin";
}

export function getStoredAdminAuth(): StoredAdminAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAdminAuth;
    if (!parsed.token || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAdminAuth(auth: StoredAdminAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_KEY, JSON.stringify(auth));
}

export function clearStoredAdminAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}
