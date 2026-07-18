"use client";

import { ApiError } from "./api";
import type { StandardToastData } from "./notification-data";

export type ResolvedAppError = {
  title: string;
  sub: string;
  code?: string;
  /** Hint for callers that should open the signup flow. */
  openSignup?: boolean;
};

declare global {
  interface Window {
    showToast?: (data: StandardToastData) => void;
    handleAppError?: (error: unknown, fallbackTitle?: string) => ResolvedAppError;
  }
}

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) return error.code;
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" || typeof code === "number") return String(code);
  }
  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const anyErr = error as {
      shortMessage?: string;
      details?: string;
      cause?: { shortMessage?: string; reason?: string; message?: string };
      message?: string;
    };
    return (
      anyErr.shortMessage ||
      anyErr.cause?.shortMessage ||
      anyErr.cause?.reason ||
      anyErr.details ||
      anyErr.cause?.message ||
      anyErr.message ||
      "Please try again."
    );
  }
  return "Please try again.";
}

function isUserRejected(message: string, code?: string): boolean {
  if (code === "4001" || code === "ACTION_REJECTED" || code === "USER_REJECTED") return true;
  const msg = message.toLowerCase();
  return (
    msg.includes("user rejected") ||
    msg.includes("user denied") ||
    msg.includes("rejected the request") ||
    msg.includes("request rejected") ||
    msg.includes("user cancelled") ||
    msg.includes("user canceled")
  );
}

function isInsufficientFunds(message: string, code?: string): boolean {
  if (code === "INSUFFICIENT_BALANCE" || code === "INSUFFICIENT_FUNDS") return true;
  const msg = message.toLowerCase();
  return (
    msg.includes("insufficient funds") ||
    msg.includes("insufficient balance") ||
    msg.includes("exceeds the balance") ||
    msg.includes("transfer amount exceeds balance") ||
    msg.includes("erc20: transfer amount exceeds balance")
  );
}

/**
 * Normalize API / wallet / membership errors into a toast-friendly title + message.
 */
export function resolveAppError(
  error: unknown,
  fallbackTitle = "Something went wrong",
): ResolvedAppError {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  if (isUserRejected(message, code)) {
    return {
      title: "Transaction cancelled",
      sub: "You rejected the request in your wallet.",
      code: "USER_REJECTED",
    };
  }

  if (isInsufficientFunds(message, code)) {
    return {
      title: "Insufficient funds",
      sub: message || "Add more tokens to your wallet and try again.",
      code: code || "INSUFFICIENT_BALANCE",
    };
  }

  switch (code) {
    case "USER_NOT_REGISTERED":
      return {
        title: "Complete sign up first",
        sub: message || "Finish registration, then pick a tier.",
        code,
        openSignup: true,
      };
    case "CONNECT_WALLET":
    case "NOT_AUTHENTICATED":
      return {
        title: "Wallet required",
        sub: message || "Connect your wallet to continue.",
        code,
      };
    case "INVALID_UPGRADE":
      return {
        title: "Cannot downgrade",
        sub: message || "You can only upgrade to a higher membership tier.",
        code,
      };
    case "ALREADY_MEMBER":
      return {
        title: "Already a member",
        sub: message || "Use upgrade to move to a higher tier.",
        code,
      };
    case "NOT_A_MEMBER":
      return {
        title: "No membership yet",
        sub: message || "Purchase a membership tier first.",
        code,
      };
    case "NEEDS_APPROVAL":
      return {
        title: "Approval required",
        sub: message || "Approve the token spend in your wallet, then try again.",
        code,
      };
    case "RELAY_IN_PROGRESS":
      return {
        title: "Transaction in progress",
        sub: message || "Wait for the pending purchase to confirm, then try again.",
        code,
      };
    case "INVALID_TIER":
      return {
        title: "Invalid package",
        sub: message || "That membership package is not available.",
        code,
      };
    case "UNSUPPORTED_TOKEN":
      return {
        title: "Unsupported token",
        sub: message || "Choose USDT or USDC and try again.",
        code,
      };
    case "SIMULATION_FAILED":
    case "INVALID_PREPARED_TX":
    case "WALLET_ERROR":
      return {
        title: "Cannot complete purchase",
        sub: message || "The transaction would fail. Please try again.",
        code,
      };
    case "USER_REJECTED":
      return {
        title: "Transaction cancelled",
        sub: message || "You rejected the request in your wallet.",
        code,
      };
    case "RPC_ERROR":
      return {
        title: "Network error",
        sub: message || "Could not reach the blockchain. Try again in a moment.",
        code,
      };
    case "NO_CLAIMABLE":
      return {
        title: "Nothing to claim",
        sub: message || "You have no withdrawable commissions right now.",
        code,
      };
    default:
      break;
  }

  // Heuristics for common wallet / contract failures without a typed code.
  const lower = message.toLowerCase();
  if (lower.includes("downgrade") || lower.includes("strictly higher")) {
    return { title: "Cannot downgrade", sub: message, code };
  }
  if (lower.includes("gas") && (lower.includes("required exceeds") || lower.includes("too low"))) {
    return {
      title: "Not enough ETH for gas",
      sub: "Your wallet needs a small amount of ETH to pay network fees.",
      code,
    };
  }
  if (lower.includes("network") || lower.includes("rpc") || lower.includes("fetch failed")) {
    return {
      title: "Network error",
      sub: message || "Check your connection and try again.",
      code,
    };
  }

  return {
    title: fallbackTitle,
    sub: message || "Please try again.",
    code,
  };
}

/**
 * Show a toast for any app/wallet/API error. Returns the resolved payload
 * so callers can react (e.g. open signup).
 */
export function handleAppError(
  error: unknown,
  fallbackTitle = "Something went wrong",
): ResolvedAppError {
  const resolved = resolveAppError(error, fallbackTitle);
  if (typeof window !== "undefined") {
    window.showToast?.({
      title: resolved.title,
      sub: resolved.sub,
      link: "",
    });
  }
  return resolved;
}

/** Attach `window.handleAppError` for imperative / legacy call sites. */
export function installGlobalErrorHandler() {
  if (typeof window === "undefined") return;
  window.handleAppError = handleAppError;
}
