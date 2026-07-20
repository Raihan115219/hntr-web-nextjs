"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { getStoredAdminAuth, setStoredAdminAuth, clearStoredAdminAuth, StoredAdminAuth } from "./auth";

export class AdminApiError extends Error {
  code?: string;
  statusCode: number;
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminMetricCard {
  title: string;
  value: string | number;
  subValue?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalVolume: number;
  totalCommissions: number;
  treasuryBalance: number;
  soldMemberships: number;
  activePools: number;
  pendingWithdrawals: number;
  cards: AdminMetricCard[];
}

export interface AdminUser {
  id: string;
  username: string;
  walletAddress: string;
  tier: string;
  rank: string;
  teamVolume: number;
  directs: number;
  downlines: number;
  status: string;
  isBlocked: boolean;
  actualTier?: string;
  actualRank?: string;
}

export interface AdminPool {
  id: string;
  slug: string;
  name: string;
  targetEth: number;
  raisedEth: number;
  progress: number;
  status: "OPEN" | "CLOSED" | "COMPLETED";
  imageUrl: string;
  depositsPaused: boolean;
  collectionName?: string;
}

export interface AdminWalletBalance {
  name: string;
  key: string;
  symbol: string;
  balance: number;
  tokens: { symbol: string; balance: number }[];
  address: string;
}

export interface AdminTransaction {
  id: string;
  date: string;
  user: string;
  walletAddress: string;
  type: string;
  amount: number;
  token: string;
  hntrPoints: number | null;
  txHash: string | null;
  status: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  user: string;
  walletAddress: string;
  amount: number;
  token: string;
  status: string;
  timestamp: string;
}

export interface LeadershipPreview {
  poolBalanceUSD: number;
  poolTokens: { symbol: string; balance: number }[];
  leadershipWallet?: string;
  eligibleCount: number;
  eligibleUsers: {
    username: string;
    rank: string;
    shares: number;
    walletAddress?: string;
    estimatedPayoutUSD?: number;
  }[];
  totalShares: number;
}

export interface AdminWalletLedgerEntry {
  id: string;
  direction: "IN" | "OUT";
  type: string;
  amount: number;
  token: string;
  counterparty?: string;
  timestamp: string;
  txHash: string;
  blockNumber?: number;
}

export interface AdminWalletLedger {
  walletKey: string;
  walletAddress: string;
  source: "blockchain" | "database";
  totals: { inflow: number; outflow: number };
  items: AdminWalletLedgerEntry[];
  pagination: PaginationMeta;
}

export interface OverdueWallet {
  walletAddress: string;
  username: string;
  unclaimedUSD: number;
  claimStatus?: "never" | "overdue_30d";
  lastClaimedAt?: string | null;
  daysSinceClaim?: number | null;
  gracePeriodDays?: number;
}

export type OverdueClaimFilter = "all" | "never" | "overdue_30d";

async function adminRequest<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const stored = getStoredAdminAuth();
    if (!stored) {
      clearStoredAdminAuth();
      throw new AdminApiError("Admin session expired. Please sign in again.", 401);
    }
    headers.Authorization = `Bearer ${stored.token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: { success?: boolean; message?: string; data?: T; errors?: { code?: string } } | null = null;
  try {
    json = await res.json();
  } catch {
    // no body
  }

  if (!res.ok || json?.success === false) {
    if (res.status === 401 && auth) clearStoredAdminAuth();
    const message = json?.message || res.statusText || "Request failed";
    throw new AdminApiError(message, res.status, json?.errors?.code);
  }

  return json?.data as T;
}

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  login: async (password: string): Promise<StoredAdminAuth> => {
    const data = await adminRequest<{ token: string; expiresAt: number; role: "admin" }>(
      "/api/admin/auth/login",
      { method: "POST", body: { password }, auth: false },
    );
    const auth: StoredAdminAuth = { token: data.token, expiresAt: data.expiresAt, role: "admin" };
    setStoredAdminAuth(auth);
    return auth;
  },

  logout: () => clearStoredAdminAuth(),

  getMetrics: () => adminRequest<AdminMetrics>("/api/admin/metrics"),

  getActivity: (page = 1, limit = 10) =>
    adminRequest<PaginatedResult<AdminActivity>>(`/api/admin/activity${qs({ page, limit })}`),

  getUsers: (params: { search?: string; page?: number; limit?: number; status?: string } = {}) =>
    adminRequest<PaginatedResult<AdminUser>>(`/api/admin/users${qs(params)}`),

  blockUser: (username: string, reason?: string) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(username)}/block`, { method: "POST", body: { reason } }),

  unblockUser: (username: string) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(username)}/unblock`, { method: "POST", body: {} }),

  overrideUser: (username: string, tier?: string, rank?: string) =>
    adminRequest(`/api/admin/users/${encodeURIComponent(username)}/override`, {
      method: "POST",
      body: { tier, rank },
    }),

  getTransactions: (params: { type?: string; page?: number; limit?: number; search?: string } = {}) =>
    adminRequest<PaginatedResult<AdminTransaction>>(`/api/admin/transactions${qs(params)}`),

  getWalletBalances: () => adminRequest<AdminWalletBalance[]>("/api/admin/wallets"),

  getWalletLedger: (walletKey: string, page = 1, limit = 20) =>
    adminRequest<AdminWalletLedger>(`/api/admin/wallets/${walletKey}/ledger${qs({ page, limit })}`),

  getLeadershipPreview: () => adminRequest<LeadershipPreview>("/api/admin/leadership/preview"),

  distributeLeadership: () =>
    adminRequest("/api/admin/leadership/distribute", { method: "POST", body: {} }),

  distributeAchievement: () =>
    adminRequest("/api/admin/achievement/distribute", { method: "POST", body: {} }),

  getOverdueCommissions: (token = "USDT", page = 1, limit = 10, filter: OverdueClaimFilter = "all") =>
    adminRequest<
      PaginatedResult<OverdueWallet> & {
        totalUnclaimedUSD: number;
        configured?: boolean;
        filter?: OverdueClaimFilter;
        counts?: { all: number; never: number; overdue_30d: number };
      }
    >(`/api/admin/commissions/overdue${qs({ token, page, limit, filter })}`),

  claimCommissions: (walletAddresses: string[], token = "USDT") =>
    adminRequest("/api/admin/commissions/claim", { method: "POST", body: { walletAddresses, token } }),

  getPools: (page = 1, limit = 50) =>
    adminRequest<PaginatedResult<AdminPool>>(`/api/admin/pools${qs({ page, limit })}`),

  createPool: (pool: { name: string; targetEth: number; slug?: string; imageUrl?: string; collectionName?: string }) =>
    adminRequest<AdminPool>("/api/admin/pools", { method: "POST", body: pool }),

  updatePool: (poolId: string, pool: Partial<AdminPool & { depositsPaused: boolean }>) =>
    adminRequest<AdminPool>(`/api/admin/pools/${poolId}`, { method: "PUT", body: pool }),

  deletePool: (poolId: string) =>
    adminRequest(`/api/admin/pools/${poolId}`, { method: "DELETE" }),

  getMaintenance: () =>
    adminRequest<{ maintenanceMode: boolean; maintenanceMessage: string }>("/api/admin/maintenance"),

  setMaintenance: (maintenanceMode: boolean, maintenanceMessage?: string) =>
    adminRequest("/api/admin/maintenance", { method: "POST", body: { maintenanceMode, maintenanceMessage } }),

  recalculateVolumes: (username: string) =>
    adminRequest("/api/admin/volumes/recalculate", { method: "POST", body: { username } }),
};

export function formatUsd(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  return `$${amount.toFixed(2)}`;
}
