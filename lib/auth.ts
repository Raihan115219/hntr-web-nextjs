"use client";

import { getAccount, signMessage } from "wagmi/actions";
import { config } from "./wagmi";
import { api, getStoredAuth, setStoredAuth, clearStoredAuth, type StoredAuth } from "./api";

function decodeJwtExpiryMs(token: string): number {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof json.exp === "number") return json.exp * 1000;
  } catch {
    // fall through to default below
  }
  return Date.now() + 60 * 60 * 1000; // fallback: assume 1h if we can't decode
}

/**
 * Ensures we hold a valid backend session bound to the currently connected wallet.
 * If the stored token is missing/expired, or belongs to a different address than
 * the one currently connected, runs the SIWE-style nonce -> sign -> verify flow.
 */
export async function ensureAuth(): Promise<StoredAuth> {
  const account = getAccount(config);
  if (!account.address) {
    throw new Error("Connect your wallet first.");
  }
  const address = account.address.toLowerCase();

  const existing = getStoredAuth();
  if (existing && existing.walletAddress.toLowerCase() === address) {
    return existing;
  }
  if (existing) clearStoredAuth();

  const { nonce, message } = await api.get<{ nonce: string; message: string }>(
    `/api/auth/nonce?walletAddress=${address}`,
  );
  void nonce;

  const signature = await signMessage(config, { message });
  const result = await api.post<{ token: string; walletAddress: string }>("/api/auth/verify", {
    walletAddress: address,
    signature,
  });

  const auth: StoredAuth = {
    token: result.token,
    walletAddress: result.walletAddress,
    expiresAt: decodeJwtExpiryMs(result.token),
  };
  setStoredAuth(auth);
  return auth;
}

export function signOut() {
  clearStoredAuth();
}
