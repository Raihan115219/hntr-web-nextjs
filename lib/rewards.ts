"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { api } from "./api";
import { ensureAuth } from "./auth";
import { config } from "./wagmi";
import { hntrMembershipAbi, CONTRACT_ADDRESS } from "./contracts";

export interface RankProgress {
  percent: number;
  currentRank: string;
  nextRank: string | null;
  currentThreshold: number;
  nextThreshold: number | null;
}

export interface TokenBalance {
  symbol: "USDT" | "USDC";
  address: string;
  claimable: number;
  locked: number;
}

export interface LegProgress {
  label: string;
  volume: number;
  cap: number;
  percent: number;
}

export interface LegBreakdown {
  competitive: LegProgress[];
  weakest: LegProgress;
}

export interface RewardsSummary {
  walletAddress: string;
  username: string | null;
  rank: string;
  tier: string;
  joinedAt: string | null;
  teamVolume: number;
  networkSize: number;
  progress: RankProgress;
  legs: LegBreakdown;
  claimableNow: number;
  lockedRemaining: number;
  totalRewarded: number;
  tokens: TokenBalance[];
}

/** Compact number formatting for leg volumes, e.g. 12500 -> "12.5K". */
export function formatVolume(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export interface NetworkTreeNode {
  username: string;
  walletAddress: string;
  tier: string;
  rank: string;
  personalVolume: number;
  children: NetworkTreeNode[];
}

export interface LeadershipPayoutBreakdownEntry {
  symbol: string;
  tokenAddress: string;
  amount: number;
  txHash?: string;
  status: "PAID" | "FAILED";
}

export interface LeadershipPayout {
  _id: string;
  walletAddress: string;
  username: string;
  rank: string;
  amountUSDC: number;
  shares: number;
  txHash?: string;
  breakdown: LeadershipPayoutBreakdownEntry[];
  month: string;
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
}

export interface PointsLedgerEntry {
  _id: string;
  walletAddress: string;
  amount: number;
  source: "MEMBERSHIP_PURCHASE" | "MEMBERSHIP_UPGRADE" | "COMMISSION_EARNED" | "POOL_DEPOSIT";
  usdValue: number;
  txHash?: string;
  timestamp: string;
}

export interface PointsSummary {
  hntrPoints: number;
  ledger: PointsLedgerEntry[];
}

export interface TransactionEntry {
  type: "CommissionEarned" | "CommissionWithdrawn" | "MembershipPurchased" | "MembershipUpgraded" | "COMMISSION_EARNED" | "COMMISSION_WITHDRAWN" | "COMMISSION_CLAIM" | "PURCHASE" | "UPGRADE" | "COMPANY_WALLET_WITHDRAWN";
  txHash?: string;
  blockNumber: number;
  timestamp: string | null;
  amount: string | null;
  lockedAmount?: string | null;
  token: string | null;
  tier?: string;
  level?: number;
  status?: "PENDING" | "CONFIRMED" | "FAILED";
}

/**
 * Single source of truth for the dashboard right rail (MainLayout.tsx) and the
 * network page - both render the same rewards summary so they can never disagree.
 */
export function useDashboardData() {
  const { address, isConnected } = useAccount();

  const summaryQuery = useQuery({
    queryKey: ["rewards-summary", address],
    queryFn: () => api.get<RewardsSummary>(`/api/network/${address}/rewards-summary`),
    enabled: isConnected && !!address,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  return {
    address,
    isConnected,
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    isFetching: summaryQuery.isFetching,
    isError: summaryQuery.isError,
    refetchSummary: summaryQuery.refetch,
  };
}

export function useTransactionHistory(limit = 10) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["transactions", address, limit],
    queryFn: () =>
      api.get<{ transactions: TransactionEntry[] }>(`/api/network/transactions/${address}?limit=${limit}`),
    enabled: isConnected && !!address,
    staleTime: 15_000,
  });
}

/**
 * Leadership Bonus is auto-deposited straight to the user's wallet by the monthly
 * cron job (see hntr-backend/src/jobs/leadership-cron.ts) rather than accrued as a
 * claimable contract balance, so this just surfaces the payout history for display
 * - there's no "claim" action for it, unlike referral commissions.
 */
export function useLeadershipPayouts() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["leadership-payouts", address],
    queryFn: () => api.get<{ payouts: LeadershipPayout[] }>(`/api/network/${address}/leadership-payouts`),
    enabled: isConnected && !!address,
    staleTime: 30_000,
    select: (data) => data.payouts,
  });
}

export function usePointsSummary() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["points-summary", address],
    queryFn: () => api.get<PointsSummary>(`/api/network/${address}/points`),
    enabled: isConnected && !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Real downline tree (up to `depth` levels) for the Topology Matrix Mapping visualization. */
export function useNetworkTree(username: string | null | undefined, depth = 3) {
  return useQuery({
    queryKey: ["network-tree", username, depth],
    queryFn: () => api.get<{ tree: NetworkTreeNode }>(`/api/network/${username}/tree?depth=${depth}`),
    enabled: !!username,
    staleTime: 30_000,
    select: (data) => data.tree,
  });
}

/** Formats a dollar amount string returned by the backend as a USD display string. */
export function formatTokenAmount(value: string | null | undefined): string {
  if (!value) return "$0.00";
  const num = Number(value);
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface PreparedCommissionClaim {
  operation: "COMMISSION_CLAIM";
  walletAddress: string;
  tokenAddress: string;
  contractAddress: `0x${string}`;
  pendingTransactionId: string;
  status: "PENDING";
}

/**
 * Claims every token the user currently has a withdrawable balance in. The user
 * now signs and submits `withdrawCommissions()` directly from their own wallet
 * (the contract requires msg.sender == user). The backend only prepares the call
 * and tracks it via the blockchain listener.
 */
export function useClaimCommissions() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return async function claimAll(claimableTokens: TokenBalance[]) {
    const toClaim = claimableTokens.filter((t) => t.claimable > 0);
    if (toClaim.length === 0) {
      throw new Error("Nothing to claim right now.");
    }

    await ensureAuth();
    const results: { symbol: string; txHash: string }[] = [];
    for (const token of toClaim) {
      const prepared = await api.post<PreparedCommissionClaim>(
        "/api/network/claim",
        { token: token.address },
        { auth: true },
      );

      const txHash = await writeContract(config, {
        address: prepared.contractAddress,
        abi: hntrMembershipAbi,
        functionName: "withdrawCommissions",
        args: [prepared.walletAddress as `0x${string}`, prepared.tokenAddress as `0x${string}`],
      });
      await waitForTransactionReceipt(config, { hash: txHash });

      results.push({ symbol: token.symbol, txHash });
    }

    await queryClient.invalidateQueries({ queryKey: ["rewards-summary", address] });
    await queryClient.invalidateQueries({ queryKey: ["transactions", address] });
    return results;
  };
}
