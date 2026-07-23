"use client";

import {
  getAccount,
  writeContract,
  waitForTransactionReceipt,
  simulateContract,
  getPublicClient,
} from "wagmi/actions";
import { config } from "./wagmi";
import { erc20Abi, hntrMembershipAbi, TOKEN_ADDRESSES, TIERS, type TierName } from "./contracts";
import { api } from "./api";
import { ensureAuth } from "./auth";
import { getAddress } from "viem";

export type { TierName };

/** Tier ladder index (0 = none / unknown). Matches on-chain enum order. */
export function getTierIndex(tierName: string | null | undefined): number {
  if (!tierName || tierName === "None" || tierName === "NONE") return 0;
  const idx = TIERS.findIndex((t) => t.name.toLowerCase() === tierName.toLowerCase());
  return idx >= 0 ? idx + 1 : 0;
}

export function getTierPriceUsd(tierName: string | null | undefined): number {
  const tier = TIERS.find((t) => t.name.toLowerCase() === (tierName || "").toLowerCase());
  return tier?.priceUsd ?? 0;
}

/**
 * USD the user still owes to reach `targetTier` from `currentTier`.
 * Full price if they have no membership; difference if upgrading; 0 if same/lower.
 */
export function getAmountDueUsd(
  targetTier: string,
  currentTier: string | null | undefined,
): number {
  const targetPrice = getTierPriceUsd(targetTier);
  const currentIdx = getTierIndex(currentTier);
  if (currentIdx === 0) return targetPrice;
  const currentPrice = getTierPriceUsd(currentTier);
  if (getTierIndex(targetTier) <= currentIdx) return 0;
  return Math.max(0, targetPrice - currentPrice);
}

export function canPurchaseOrUpgradeTier(
  targetTier: string,
  currentTier: string | null | undefined,
): boolean {
  return getTierIndex(targetTier) > getTierIndex(currentTier);
}

export class MembershipFlowError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export interface MembershipQuote {
  tier: string;
  isUpgrade: boolean;
  currentTier: string;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  decimals: number;
  amountDueRaw: string;
  amountDueFormatted: string;
  contractAddress: `0x${string}`;
  needsApproval: boolean;
  insufficientBalance: boolean;
}

export async function getMembershipQuote(tierName: string, tokenSymbol: "USDT" | "USDC" = "USDT"): Promise<MembershipQuote> {
  await ensureAuth();
  return api.get<MembershipQuote>(`/api/membership/quote?tier=${encodeURIComponent(tierName)}&token=${tokenSymbol}`, {
    auth: true,
  });
}

export interface PurchaseResult {
  txHash: string;
  tier: string;
  isUpgrade: boolean;
  amountLabel: string;
}

export type PurchaseProgressHandlers = {
  /** Fired immediately before the wallet approval prompt opens. */
  onAwaitingWallet?: () => void;
  /** Fired once the wallet request is signed (or before backend purchase when no approval is needed). */
  onWalletAccepted?: () => void;
};

export interface PreparedMembershipTx {
  operation: "PURCHASE" | "UPGRADE";
  walletAddress: string;
  tierIndex: number;
  uplines: string[];
  ranks: number[];
  tokenAddress: string;
  tokenSymbol: string;
  amountDueRaw: string;
  contractAddress: `0x${string}`;
  deadline: number;
  signature: `0x${string}`;
  pendingTransactionId: string;
  status: "PENDING";
}

/**
 * Full purchase/upgrade flow:
 *  1. Ensure the wallet is connected and authenticated with the backend.
 *  2. Fetch a live quote (price + whether an ERC20 approval is still needed).
 *  3. If needed, prompt the user's own wallet to `approve()` the membership contract.
 *  4. Ask the backend to prepare signed uplines + ranks (commission auth).
 *  5. Prompt the user's own wallet to call `purchaseMembership`/`upgradeMembership`
 *     directly on the contract (the user pays the gas).
 */
export async function purchaseOrUpgradeTier(
  tierName: string,
  tokenSymbol: "USDT" | "USDC" = "USDT",
  progress?: PurchaseProgressHandlers,
): Promise<PurchaseResult> {
  const account = getAccount(config);
  if (!account.address) {
    throw new MembershipFlowError("CONNECT_WALLET", "Connect your wallet first.");
  }

  const quote = await getMembershipQuote(tierName, tokenSymbol);

  if (quote.insufficientBalance) {
    throw new MembershipFlowError(
      "INSUFFICIENT_BALANCE",
      `You need ${quote.amountDueFormatted} ${quote.tokenSymbol} in your wallet to ${quote.isUpgrade ? "upgrade to" : "purchase"} ${tierName}.`,
    );
  }

  if (quote.needsApproval) {
    const tokenAddress = quote.tokenAddress || TOKEN_ADDRESSES[tokenSymbol];
    progress?.onAwaitingWallet?.();
    try {
      const approveHash = await writeContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [quote.contractAddress, 2n ** 256n - 1n],
      });
      progress?.onWalletAccepted?.();
      await waitForTransactionReceipt(config, { hash: approveHash });
    } catch (err) {
      throw toMembershipWalletError(err, "Token approval failed.");
    }
  }

  // Fetch the signed auth as late as possible (after any approve), so the
  // deadline still has headroom when the wallet opens the purchase prompt.
  const endpoint = quote.isUpgrade ? "/api/membership/upgrade" : "/api/membership/purchase";
  const prepared = await api.post<PreparedMembershipTx>(
    endpoint,
    { tier: tierName, token: tokenSymbol },
    { auth: true },
  );

  if (
    !prepared.signature ||
    !prepared.deadline ||
    !Array.isArray(prepared.uplines) ||
    !Array.isArray(prepared.ranks) ||
    prepared.uplines.length !== prepared.ranks.length
  ) {
    throw new MembershipFlowError(
      "INVALID_PREPARED_TX",
      "Backend returned an incomplete membership authorization. Please try again.",
    );
  }

  const functionName = prepared.operation === "UPGRADE" ? "upgradeMembership" : "purchaseMembership";
  const contractAddress = getAddress(prepared.contractAddress);
  const args = [
    getAddress(prepared.walletAddress),
    prepared.tierIndex,
    prepared.uplines.map((u) => getAddress(u)),
    prepared.ranks.map((r) => Number(r)),
    getAddress(prepared.tokenAddress),
    BigInt(prepared.deadline),
    prepared.signature as `0x${string}`,
  ] as const;

  // Simulate first so we surface "Signature expired" / "Invalid signature"
  // instead of MetaMask's opaque "gas limit too high" fallback.
  try {
    await simulateContract(config, {
      address: contractAddress,
      abi: hntrMembershipAbi,
      functionName,
      args: [...args],
      account: account.address,
    });
  } catch (err: any) {
    const reason =
      err?.shortMessage ||
      err?.cause?.reason ||
      err?.cause?.shortMessage ||
      err?.message ||
      "Membership transaction would revert.";
    throw new MembershipFlowError("SIMULATION_FAILED", reason);
  }

  let gas: bigint | undefined;
  try {
    const publicClient = getPublicClient(config);
    if (publicClient) {
      const estimated = await publicClient.estimateContractGas({
        address: contractAddress,
        abi: hntrMembershipAbi,
        functionName,
        args: [...args],
        account: account.address,
      });
      // Modest buffer — avoid MetaMask substituting the full block gas limit.
      gas = (estimated * BigInt(130)) / BigInt(100);
    }
  } catch {
    // Simulation already passed; fall through and let the wallet estimate.
    gas = undefined;
  }

  progress?.onAwaitingWallet?.();
  let txHash: `0x${string}`;
  try {
    txHash = await writeContract(config, {
      address: contractAddress,
      abi: hntrMembershipAbi,
      functionName,
      args: [...args],
      ...(gas !== undefined ? { gas } : {}),
    });
  } catch (err) {
    throw toMembershipWalletError(err, "Membership purchase failed.");
  }
  progress?.onWalletAccepted?.();
  await waitForTransactionReceipt(config, { hash: txHash });

  return {
    txHash,
    tier: tierName,
    isUpgrade: quote.isUpgrade,
    amountLabel: `${quote.amountDueFormatted} ${quote.tokenSymbol}`,
  };
}

function toMembershipWalletError(err: unknown, fallback: string): MembershipFlowError {
  const anyErr = err as {
    code?: string | number;
    shortMessage?: string;
    message?: string;
    cause?: { shortMessage?: string; reason?: string; message?: string };
  };
  const message =
    anyErr?.shortMessage ||
    anyErr?.cause?.shortMessage ||
    anyErr?.cause?.reason ||
    anyErr?.message ||
    anyErr?.cause?.message ||
    fallback;
  const lower = message.toLowerCase();
  const code = anyErr?.code != null ? String(anyErr.code) : undefined;

  if (
    code === "4001" ||
    code === "ACTION_REJECTED" ||
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request")
  ) {
    return new MembershipFlowError("USER_REJECTED", "You rejected the request in your wallet.");
  }
  if (
    lower.includes("insufficient funds") ||
    lower.includes("insufficient balance") ||
    lower.includes("exceeds the balance")
  ) {
    return new MembershipFlowError("INSUFFICIENT_BALANCE", message);
  }
  return new MembershipFlowError("WALLET_ERROR", message);
}

const TIER_COPY: Record<string, { uni: string; pool: string }> = {
  Bronze: { uni: "4 Levels", pool: "All Strategy Pools" },
  Silver: { uni: "6 Levels", pool: "All Strategy Pools" },
  Gold: { uni: "10 Levels", pool: "All Strategy Pools" },
  Platinum: { uni: "12 Levels", pool: "All Strategy Pools" },
  Diamond: { uni: "12 Levels", pool: "All Strategy Pools" },
};

/**
 * Drives the existing #msOverlay markup (see SignupOverlays.tsx) with real purchase
 * data. Kept as an imperative DOM helper (matching the rest of this codebase's
 * legacy overlay pattern) instead of introducing a parallel React modal.
 */
export function showMembershipSuccessModal(result: PurchaseResult, username: string) {
  if (typeof document === "undefined") return;
  const copy = TIER_COPY[result.tier] || { uni: "—", pool: "—" };
  const handle = (username || result.tier).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "MEMBER";

  const setText = (id: string, value: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("msPkg", result.tier.toUpperCase());
  setText("msStatus", `${result.tier.toUpperCase()} STATUS ${result.isUpgrade ? "UPGRADED" : "ACTIVATED"}`);
  setText("msUni", copy.uni);
  setText("msPool", copy.pool);
  setText("msAmt", result.amountLabel);

  const refInput = document.getElementById("msRef") as HTMLInputElement | null;
  if (refInput) refInput.value = `${window.location.origin}/?ref=${handle}`;

  const explorerBtn = document.querySelector<HTMLButtonElement>(".ms-explorer");
  if (explorerBtn) {
    explorerBtn.onclick = () => window.open(`https://sepolia.etherscan.io/tx/${result.txHash}`, "_blank");
  }

  document.getElementById("signupOverlay")?.classList.remove("open");
  document.getElementById("msOverlay")?.classList.add("open");
}
