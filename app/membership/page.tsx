"use client";

import MainLayout from "../components/MainLayout";
import PageHeroBanner from "../components/PageHeroBanner";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "nextjs-toploader/app";
import { ensureAuth } from "../../lib/auth";
import { handleAppError } from "../../lib/errors";
import { useConnectWallet } from "../../lib/useConnectWallet";
import {
  purchaseOrUpgradeTier,
  getAmountDueUsd,
  getTierIndex,
  canPurchaseOrUpgradeTier,
} from "../../lib/membership";
import { useDashboardData } from "../../lib/rewards";
import { COMMISSION_LEVELS, TIERS } from "../../lib/contracts";
import { api, ApiError } from "../../lib/api";

declare global {
  interface Window {
    __resources?: Record<string, string>;
    openSignup?: () => void;
    suGoto?: (n: number) => void;
    showToast?: (data: { title: string; sub: string; link: string }) => void;
  }
}

function openSignupModal(step = 1) {
  if (typeof window.openSignup === "function") {
    window.openSignup();
  } else {
    document.getElementById("signupOverlay")?.classList.add("open");
    for (let s = 1; s <= 3; s += 1) {
      document.getElementById(`suStep${s}`)?.classList.toggle("on", s === step);
    }
    document.getElementById("suModal")?.classList.remove("wide");
  }
  document.body.classList.add("modal-open");
  if (step !== 1) window.suGoto?.(step);
}

type TierPurchasePhase = "wallet" | "loading";

export default function MembershipPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();
  const { summary, refetchSummary } = useDashboardData();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [purchasePhase, setPurchasePhase] = useState<TierPurchasePhase | null>(null);

  const currentTier = summary?.tier && summary.tier !== "None" ? summary.tier : null;
  const currentTierIndex = getTierIndex(currentTier);

  useEffect(() => {
    setSelectedTier(null);
  }, [currentTier]);

  const tierButtonLabel = (
    tierName: string,
    opts: { isCurrent: boolean; isLower: boolean; isUpgrade: boolean; isSelected: boolean },
  ) => {
    if (opts.isCurrent) return "CURRENT";
    if (opts.isLower) return "LOCKED";
    if (pendingTier === tierName) {
      if (purchasePhase === "loading") return "LOADING...";
      if (purchasePhase === "wallet") return "CONFIRM IN WALLET";
    }
    if (opts.isSelected) return opts.isUpgrade ? "UPGRADE" : "PURCHASE";
    return "SELECT";
  };

  useEffect(() => {
    window.__resources = {
      ...(window.__resources || {}),
      logoMark: "/assets/images/logoMark.png",
    };
  }, []);

  const ensureReadyToPurchase = async (walletAddress: string): Promise<boolean> => {
    try {
      await ensureAuth();
      await api.get<{ profile: { username: string; tier: string } }>(
        `/api/users/wallet/${walletAddress.toLowerCase()}`,
        { auth: true },
      );
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        openSignupModal(2);
        return false;
      }
      throw error;
    }
  };

  const purchaseTier = async (tierName: string) => {
    if (pendingTier) return;
    if (selectedTier !== tierName) return;
    if (!canPurchaseOrUpgradeTier(tierName, currentTier)) {
      window.showToast?.({
        title: currentTierIndex > 0 ? "Cannot downgrade" : "Unavailable",
        sub:
          currentTierIndex > 0
            ? `You already hold ${currentTier}. Only higher tiers can be purchased.`
            : "This package is not available.",
        link: "",
      });
      return;
    }

    let walletAddress = address;
    if (!isConnected || !walletAddress) {
      try {
        walletAddress = await connectWallet();
      } catch {
        window.showToast?.({
          title: "Wallet required",
          sub: "Connect your wallet to purchase a membership tier.",
          link: "",
        });
        return;
      }
    }

    setPendingTier(tierName);
    setPurchasePhase(null);
    try {
      const ready = await ensureReadyToPurchase(walletAddress);
      if (!ready) return;

      const result = await purchaseOrUpgradeTier(tierName, "USDT", {
        onAwaitingWallet: () => setPurchasePhase("wallet"),
        onWalletAccepted: () => setPurchasePhase("loading"),
      });

      window.showToast?.({
        title: result.isUpgrade ? "Membership upgraded" : "Membership activated",
        sub: `${result.tier} tier confirmed — paid ${result.amountLabel}.`,
        link: "",
      });
      await refetchSummary();
      setSelectedTier(null);
      router.push("/network");
    } catch (error) {
      const resolved = handleAppError(error, "Purchase failed");
      if (resolved.openSignup) openSignupModal(2);
    } finally {
      setPendingTier(null);
      setPurchasePhase(null);
    }
  };

  const handleTierAction = (tierName: string) => {
    if (pendingTier) return;
    if (!canPurchaseOrUpgradeTier(tierName, currentTier)) {
      window.showToast?.({
        title: currentTierIndex > 0 ? "Cannot downgrade" : "Unavailable",
        sub:
          currentTierIndex > 0
            ? `You already hold ${currentTier}. Only higher tiers can be purchased.`
            : "This package is not available.",
        link: "",
      });
      return;
    }

    if (selectedTier === tierName) {
      void purchaseTier(tierName);
      return;
    }

    setSelectedTier(tierName);
  };

  return (
    <MainLayout>
      <div className="feed" id="feed-membership">
        <div className="page-body">
          <PageHeroBanner
            canvasId="memBannerCv"
            animationKind="membership"
            shadeClassName="mem-banner-shade"
            mosaicId="heroMosaic"
          >
            <div className="hero-title">Membership Packages</div>
            <div className="hero-sub">
              {currentTier
                ? `You hold ${currentTier}. Upgrade prices show only the difference you still owe — downgrades are not available.`
                : "Select a tier to unlock platform features. Deeper unilevel commissions also require the matching network rank."}
            </div>
          </PageHeroBanner>

          {/* TIER CARDS */}
          <div className="tiers-grid">
            {TIERS.map((tier, idx) => {
              const tierIndex = idx + 1;
              const isCurrent = currentTierIndex > 0 && tierIndex === currentTierIndex;
              const isLower = currentTierIndex > 0 && tierIndex < currentTierIndex;
              const isUpgrade = currentTierIndex > 0 && tierIndex > currentTierIndex;
              const isSelected = selectedTier === tier.name;
              const isPending = pendingTier === tier.name;
              const isHighlighted = isSelected;
              const amountDue = getAmountDueUsd(tier.name, currentTier);
              const disabled = !!pendingTier || isCurrent || isLower;
              const hasExtra = tier.name === "Diamond";
              const buttonLabel = tierButtonLabel(tier.name, {
                isCurrent,
                isLower,
                isUpgrade,
                isSelected,
              });

              return (
                <div
                  className={`tier-card${isHighlighted ? " recommended" : ""}${isCurrent ? " current" : ""}${isLower ? " locked" : ""}`}
                  key={tier.name}
                  style={isLower || isCurrent ? { opacity: isCurrent ? 0.92 : 0.55 } : undefined}
                >
                  {isHighlighted && !isCurrent && (
                    <div className="recommended-badge">
                      {isUpgrade ? "UPGRADE" : "SELECTED"}
                    </div>
                  )}
                  {isCurrent && (
                    <div className="recommended-badge" style={{ background: "var(--green, #5E6B55)" }}>
                      YOUR PLAN
                    </div>
                  )}
                  <div className="tier-label">Tier 0{idx + 1}</div>
                  <div className="tier-name">{tier.name}</div>
                  <div className="tier-price">
                    ${(isUpgrade ? amountDue : tier.priceUsd).toLocaleString()}
                    <span className="tier-price-unit">USD</span>
                  </div>
                  {isUpgrade && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--t0)",
                        marginTop: "-6px",
                        marginBottom: "8px",
                      }}
                    >
                      Upgrade from {currentTier} · full price ${tier.priceUsd.toLocaleString()}
                    </div>
                  )}
                  <div className="tier-divider"></div>
                  <div className="tier-features">
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">{tier.levels} Unilevel Levels</span>
                    </div>
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">All Strategy Pools</span>
                    </div>
                    <div className="tier-feature">
                      <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke={isHighlighted ? "rgba(242,239,234,.7)" : "currentColor"} strokeWidth="1.2"></circle>
                        <path d="M3.5 6l1.5 1.5L8.5 4" stroke={isHighlighted ? "rgba(242,239,234,.9)" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      <span className="tier-feature-text">{tier.maxDeposit} Max Deposit</span>
                    </div>
                    {hasExtra && (
                      <div className="tier-feature">
                        <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                          <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <span className="tier-feature-text">OTC Desk & NFT Lending</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`tier-btn${isSelected || isPending ? " purchase" : ""}`}
                    onClick={() => handleTierAction(tier.name)}
                    disabled={disabled}
                    title={
                      isLower
                        ? "Downgrades are not allowed"
                        : isCurrent
                        ? "This is your current membership"
                        : undefined
                    }
                  >
                    {buttonLabel}
                  </button>
                </div>
              );
            })}
          </div>

          {/* COMMISSION STRUCTURE */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Commission Structure</div>
              <div className="cmp-sub">
                Each downline level pays the listed rate. Levels 4–12 require both the membership tier and the network rank.
              </div>
            </div>
            <div className="table-scroll">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th style={{ width: "12%" }}>Level</th>
                    <th style={{ width: "18%" }}>Commission %</th>
                    <th style={{ width: "35%" }}>Required Membership</th>
                    <th style={{ width: "35%" }}>Required Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_LEVELS.map((row, idx) => (
                    <tr key={row.level} className={idx % 2 === 0 ? "highlight-row" : ""}>
                      <td>{row.level}</td>
                      <td>{row.percent}%</td>
                      <td>{row.requiredMembership}</td>
                      <td>{row.requiredRank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="comparison">
            <div className="cmp-hdr">
              <div className="cmp-title">Membership Comparison</div>
              <div className="cmp-sub">Detailed feature breakdown across all membership tiers.</div>
            </div>
            <div className="table-scroll">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th style={{ width: "28%" }}>Feature</th>
                    {TIERS.map((tier) => (
                      <th key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="highlight-row">
                    <td>Unilevel Levels</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {tier.levels} Levels
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Strategy Pool Access</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        All Pools
                      </td>
                    ))}
                  </tr>
                  <tr className="highlight-row">
                    <td>Max Strategy Deposit</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {tier.maxDeposit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Tailor OTC Desk & NFT Lending Platform</td>
                    {TIERS.map((tier) => (
                      <td key={tier.name} className={tier.name === "Diamond" ? "apex-col" : ""}>
                        {tier.name === "Diamond" || tier.name === "Platinum" ? (
                          <span className="check">✓</span>
                        ) : (
                          <span className="cross">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* INFO CARDS */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-hdr">
                <div className="info-icon">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1a5 5 0 1 1 0 10A5 5 0 0 1 6 1z" stroke="var(--olive)" strokeWidth="1.2"></path>
                    <path d="M6 5v3M6 3.5v.5" stroke="var(--olive)" strokeWidth="1.2" strokeLinecap="round"></path>
                  </svg>
                </div>
                <div className="info-title">Institutional Assurance</div>
              </div>
              <div className="info-text">
                All membership funds are securely locked in smart contracts, ensuring the integrity of the
                unilevel commission structure and lending liquidity pools.
              </div>
            </div>
            <div className="info-card">
              <div className="info-card-hdr">
                <div className="info-icon">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z"
                      stroke="var(--olive)"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <div className="info-title">Compliance Ready</div>
              </div>
              <div className="info-text">
                Our platform adheres to strict institutional standards, offering full transparency and real-time
                auditing for all financial transactions and staking activities.
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
