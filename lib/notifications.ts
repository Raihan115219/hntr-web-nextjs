"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { api } from "./api";

export type BackendNotificationType =
  | "COMMISSION_EARNED"
  | "COMMISSION_CLAIMED"
  | "MEMBERSHIP_PURCHASED"
  | "MEMBERSHIP_UPGRADED"
  | "LEADERSHIP_PAYOUT"
  | "ACHIEVEMENT_PAYOUT"
  | "RANK_UP"
  | "GENERAL";

export interface BackendNotification {
  _id: string;
  walletAddress: string;
  type: BackendNotificationType;
  title: string;
  sub: string;
  link?: string;
  meta?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: BackendNotification[];
  unreadCount: number;
}

export function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function useNotifications(limit = 50) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["notifications", address, limit],
    queryFn: () =>
      api.get<NotificationsResponse>(`/api/network/${address}/notifications?limit=${limit}`),
    enabled: isConnected && !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) =>
      api.post<{ modified: number }>(`/api/network/${address}/notifications/read`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", address] });
    },
  });
}
