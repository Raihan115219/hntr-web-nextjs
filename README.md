# HNTR — Next-Generation NFT Ecosystem

HNTR is a community-driven NFT investment platform that combines a powerful network marketing compensation plan with unique on-chain investment opportunities.

## 🌟 Overview (The Layman's Guide)

Imagine a club where you not only get access to high-end NFT investments but also get rewarded for growing the community. That's HNTR.

### How it Works
1.  **Memberships**: You join by choosing a membership tier (ranging from $50 to $2,500). Each tier unlocks different levels of investment opportunities and rewards.
2.  **Rewards (The 75% Rule)**: HNTR is built for the community. For every membership sale, 75% of the revenue is distributed directly back to the members through commissions and bonuses.
3.  **Investment Pools**: Members can "co-invest" in high-value (blue-chip) NFTs. Instead of needing thousands of dollars to buy a top-tier NFT, you can contribute a smaller amount to a pool. The platform automatically buys the NFT, sells it for a profit, and shares that profit back with you.
4.  **Growth Rewards**: As you invite others and they invite their friends, you build a "network." You earn commissions from sales up to 12 levels deep in your network. The more your network grows, the higher your "Rank" (from Scout to Legend Hunter), unlocking even bigger bonuses.

### Key Benefits
*   **Education**: Learn everything about NFTs and market trends.
*   **Transparency**: Everything is handled by "smart contracts" on the blockchain, meaning it's secure, fair, and automated.
*   **Accessibility**: Start small and grow your portfolio through community-powered investing.

---

## 🛠 Technical Architecture

HNTR is a high-performance Web3 application built with a modern, scalable stack.

### Tech Stack
*   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router) with [TypeScript](https://www.typescriptlang.org/).
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a reactive, modern UI.
*   **Web3 Integration**: 
    *   [ConnectKit](https://docs.family.co/connectkit) for wallet management.
    *   [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/) for Ethereum interactions.
*   **Data Fetching**: [React Query](https://tanstack.com/query/latest) for real-time state management and caching.
*   **Database**: [PlanetScale](https://planetscale.com/) (MySQL) used to mirror on-chain state and manage complex referral trees.

### Core Functionality

#### 1. Membership & Compensation Engine
The core logic resides in the `HNTRMembership.sol` smart contract (currently deployed on Sepolia). 
*   **Tier Enforcement**: Gated access to platform features (Pools, OTC, Lending) based on the user's NFT membership tier.
*   **Unilevel Commissions**: A 12-level deep referral system. While the tree is tracked off-chain in the database for performance, payouts and eligibility are verified and executed on-chain.
*   **80/20 Rule**: Commissions are split automatically: 80% is claimable in USDT/USDC, and 20% is redirected into the first available investment pool to ensure continuous ecosystem growth.

#### 2. Strategy Pools
A transparent, contract-managed co-investment system:
*   Users deposit ETH into specific strategy pools.
*   Once a target is reached, the contract triggers an NFT purchase.
*   The system automates the listing and sale of the NFT at a 10% premium.
*   Proceeds are distributed proportionally to participants' deposits.

#### 3. Network & Topology Matrix
The `Network` dashboard provides a sophisticated visualization of the referral tree:
*   **Plexus Visualization**: A custom canvas-based "Topology Matrix" that renders the user's downline.
*   **Rank Tracking**: Real-time calculation of "Team Volume" and progress towards ranks (Scout → Legend Hunter).
*   **Balanced Leg Rules**: Implementation of the 40/40/20 rule for volume qualification to ensure healthy network growth.

#### 4. The Vault
A centralized asset management interface where users can:
*   Track total rewards and claimable commissions.
*   Manage accumulated HNTR points.
*   View detailed transaction history across both on-chain and off-chain events.

---

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env.local` file with your Web3 providers, database credentials, and contract addresses.
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 📁 Project Structure

*   `app/`: Next.js App Router pages and layouts.
*   `components/`: Reusable React components (UI, Web3, Network visualizations).
*   `hooks/`: Custom React hooks for data fetching and contract interaction.
*   `lib/`: Core utilities, API clients, and constants.
*   `contracts/`: Solidity smart contracts (for reference or local development).
*   `public/`: Static assets and icons.
