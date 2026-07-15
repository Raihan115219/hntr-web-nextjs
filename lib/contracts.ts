import { parseAbi } from "viem";

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as `0x${string}`;
export const USDT_ADDRESS = (process.env.NEXT_PUBLIC_USDT_ADDRESS || "") as `0x${string}`;
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || "") as `0x${string}`;

export const TOKEN_ADDRESSES: Record<"USDT" | "USDC", `0x${string}`> = {
  USDT: USDT_ADDRESS,
  USDC: USDC_ADDRESS,
};

/**
 * Kept in lockstep with hntr-backend/src/services/contract.service.ts and
 * hntr/src/IHNTRMembership.sol. Only the pieces the frontend actually calls
 * directly (ERC20 approve/allowance/balance) live here - the membership
 * writes themselves are always relayed through the backend burner wallet.
 */
export const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

export const TIERS = [
  { name: "Scout", priceUsd: 50, levels: 3, maxDeposit: "$400" },
  { name: "Tracker", priceUsd: 250, levels: 6, maxDeposit: "$1,500" },
  { name: "Ranger", priceUsd: 750, levels: 9, maxDeposit: "$4,000" },
  { name: "Hunter", priceUsd: 1500, levels: 12, maxDeposit: "$8,000" },
  { name: "Apex", priceUsd: 2500, levels: 12, maxDeposit: "$25,000" },
] as const;

export type TierName = (typeof TIERS)[number]["name"];
