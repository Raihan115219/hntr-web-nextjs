"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_STORAGE_KEY = "hntr_auth";

export interface StoredAuth {
  token: string;
  walletAddress: string;
  expiresAt: number; // epoch ms
}

export class ApiError extends Error {
  code?: string;
  statusCode: number;
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.token || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T = any>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const stored = getStoredAuth();
    if (!stored) {
      throw new ApiError("Not signed in. Connect your wallet first.", 401, "NOT_AUTHENTICATED");
    }
    headers.Authorization = `Bearer ${stored.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok || json?.success === false) {
    const message = json?.message || res.statusText || "Request failed";
    const code = json?.errors?.code;
    throw new ApiError(message, res.status, code);
  }

  return json?.data as T;
}

export const api = {
  get: <T = any>(path: string, opts?: { auth?: boolean }) => request<T>(path, { method: "GET", auth: opts?.auth }),
  post: <T = any>(path: string, body?: any, opts?: { auth?: boolean }) =>
    request<T>(path, { method: "POST", body, auth: opts?.auth }),
};
