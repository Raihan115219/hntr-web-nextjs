import { api } from "../api";

export interface AdminMetrics {
  totalUsers: number;
  totalVolume: number;
  totalCommissions: number;
  activePools: number;
  pendingWithdrawals: number;
}

export interface AdminUser {
  id: string;
  walletAddress: string;
  username: string;
  tier: string;
  rank: string;
  teamVolume: number;
  isBlocked: boolean;
  joinedAt: string;
}

export interface AdminPool {
  id: string;
  slug: string;
  name: string;
  targetEth: number;
  raisedEth: number;
  status: "OPEN" | "CLOSED" | "COMPLETED";
  imageUrl: string;
}

export interface AdminWalletBalance {
  name: string;
  symbol: string;
  balance: number;
  address: string;
}

export interface AdminTransaction {
  id: string;
  walletAddress: string;
  type: string;
  amount: number;
  token: string;
  timestamp: string;
  txHash: string;
}

export const adminApi = {
  getMetrics: () => api.get<AdminMetrics>("/api/admin/metrics", { auth: true }),
  getUsers: (search?: string) => api.get<AdminUser[]>(`/api/admin/users?search=${search || ""}`, { auth: true }),
  blockUser: (userId: string) => api.post(`/api/admin/users/${userId}/block`, {}, { auth: true }),
  upgradeUserMembership: (userId: string, tier: string) => 
    api.post(`/api/admin/users/${userId}/upgrade`, { tier }, { auth: true }),
  getPools: () => api.get<AdminPool[]>("/api/admin/pools", { auth: true }),
  createPool: (pool: Partial<AdminPool>) => api.post("/api/admin/pools", pool, { auth: true }),
  updatePool: (poolId: string, pool: Partial<AdminPool>) => api.post(`/api/admin/pools/${poolId}`, pool, { auth: true }),
  deletePool: (poolId: string) => api.post(`/api/admin/pools/${poolId}/delete`, {}, { auth: true }),
  getWalletBalances: () => api.get<AdminWalletBalance[]>("/api/admin/wallets", { auth: true }),
  getTransactions: (type?: string) => api.get<AdminTransaction[]>(`/api/admin/transactions?type=${type || ""}`, { auth: true }),
};
