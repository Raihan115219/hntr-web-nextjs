"use client";

import { getAccount, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "./wagmi";
import { erc20Abi, TOKEN_ADDRESSES } from "./contracts";
import { api } from "./api";
import { ensureAuth } from "./auth";

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

/**
 * Full purchase/upgrade flow:
 *  1. Ensure the wallet is connected and authenticated with the backend.
 *  2. Fetch a live quote (price + whether an ERC20 approval is still needed).
 *  3. If needed, prompt the user's own wallet to `approve()` the membership
 *     contract (the one on-chain step the user pays gas for themselves).
 *  4. Ask the backend to relay the actual purchaseMembership/upgradeMembership
 *     call through the burner wallet.
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
      `You need ${quote.amountDueFormatted} ${quote.tokenSymbol} to ${quote.isUpgrade ? "upgrade to" : "purchase"} ${tierName}.`,
    );
  }

  if (quote.needsApproval) {
    const tokenAddress = quote.tokenAddress || TOKEN_ADDRESSES[tokenSymbol];
    progress?.onAwaitingWallet?.();
    const approveHash = await writeContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [quote.contractAddress, BigInt(quote.amountDueRaw)],
    });
    progress?.onWalletAccepted?.();
    await waitForTransactionReceipt(config, { hash: approveHash });
  } else {
    progress?.onWalletAccepted?.();
  }

  const endpoint = quote.isUpgrade ? "/api/membership/upgrade" : "/api/membership/purchase";
  const result = await api.post<{ txHash: string }>(endpoint, { tier: tierName, token: tokenSymbol }, { auth: true });

  if (!result.txHash) {
    throw new MembershipFlowError(
      "PURCHASE_FAILED",
      "Membership purchase could not be completed. Please try again.",
    );
  }

  return {
    txHash: result.txHash,
    tier: tierName,
    isUpgrade: quote.isUpgrade,
    amountLabel: `${quote.amountDueFormatted} ${quote.tokenSymbol}`,
  };
}

const TIER_COPY: Record<string, { uni: string; pool: string }> = {
  Scout: { uni: "3 Levels", pool: "All Strategy Pools" },
  Tracker: { uni: "6 Levels", pool: "All Strategy Pools" },
  Ranger: { uni: "9 Levels", pool: "All Strategy Pools" },
  Hunter: { uni: "12 Levels", pool: "All Strategy Pools" },
  Apex: { uni: "12 Levels", pool: "All Strategy Pools" },
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
