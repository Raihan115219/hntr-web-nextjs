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
 * hntr/src/IHNTRMembership.sol. The frontend now calls the membership writes
 * directly from the user's wallet (the contract requires msg.sender == user),
 * so both the ERC20 ABI and the HNTRMembership write ABI live here.
 */
export const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

export const hntrMembershipAbi = parseAbi([
  "function purchaseMembership(address user, uint8 tier, address[] uplines, uint8[] ranks, address token, uint256 deadline, bytes signature)",
  "function upgradeMembership(address user, uint8 newTier, address[] uplines, uint8[] ranks, address token, uint256 deadline, bytes signature)",
  "function withdrawCommissions(address user, address token)",
  "function tierPrices(uint8 tier) view returns (uint256)",
  "function getUser(address user) view returns (uint8 tier, uint256 joinedAt)",
  "event MembershipPurchased(address indexed user, uint8 tier, uint256 amount, address token)",
  "event MembershipUpgraded(address indexed user, uint8 oldTier, uint8 newTier, uint256 amountPaid, address token)",
  "event CommissionWithdrawn(address indexed user, uint256 amount, address token)",
]);

export const TIERS = [
  { name: "Bronze", priceUsd: 50, levels: 4, maxDeposit: "$400" },
  { name: "Silver", priceUsd: 250, levels: 6, maxDeposit: "$1,500" },
  { name: "Gold", priceUsd: 750, levels: 10, maxDeposit: "$4,000" },
  { name: "Platinum", priceUsd: 1500, levels: 12, maxDeposit: "$8,000" },
  { name: "Diamond", priceUsd: 2500, levels: 12, maxDeposit: "$25,000" },
] as const;

export type TierName = (typeof TIERS)[number]["name"];

/**
 * Unilevel commission structure — mirrors HNTRMembership.sol gates.
 * Deeper levels require both the listed membership tier and rank.
 */
export const COMMISSION_LEVELS = [
  { level: 1, percent: 15, requiredMembership: "Any", requiredRank: "Default" },
  { level: 2, percent: 15, requiredMembership: "Any", requiredRank: "Default" },
  { level: 3, percent: 8, requiredMembership: "Any", requiredRank: "Default" },
  { level: 4, percent: 5, requiredMembership: "Bronze ($50)", requiredRank: "Scout (1k)" },
  { level: 5, percent: 4, requiredMembership: "Silver ($250)", requiredRank: "Tracker (10k)" },
  { level: 6, percent: 4, requiredMembership: "Silver ($250)", requiredRank: "Tracker (10k)" },
  { level: 7, percent: 4, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 8, percent: 2, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 9, percent: 2, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 10, percent: 2, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 11, percent: 2, requiredMembership: "Platinum ($1,500)", requiredRank: "Hunter (250k)" },
  { level: 12, percent: 2, requiredMembership: "Platinum ($1,500)", requiredRank: "Hunter (250k)" },
] as const;
