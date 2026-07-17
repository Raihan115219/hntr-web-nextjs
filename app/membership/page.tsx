"use client";

import MainLayout from "../components/MainLayout";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "nextjs-toploader/app";
import { ApiError } from "../../lib/api";
import { ensureAuth } from "../../lib/auth";
import { purchaseOrUpgradeTier, MembershipFlowError } from "../../lib/membership";
import { useConnectWallet } from "../../lib/useConnectWallet";

declare global {
  interface Window {
    __resources?: Record<string, string>;
    openSignup?: () => void;
    showToast?: (data: { title: string; sub: string; link: string }) => void;
  }
}

type MosaicCanvas = HTMLCanvasElement & { __mosaic?: boolean };

type TierPurchasePhase = "wallet" | "loading";

export default function MembershipPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connectWallet } = useConnectWallet();
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const [purchasePhase, setPurchasePhase] = useState<TierPurchasePhase | null>(null);

  const tierButtonLabel = (tierName: string, defaultLabel: string) => {
    if (pendingTier !== tierName) return defaultLabel;
    if (purchasePhase === "loading") return "LOADING...";
    if (purchasePhase === "wallet") return "CONFIRM IN WALLET";
    return defaultLabel;
  };

  useEffect(() => {
    window.__resources = {
      ...(window.__resources || {}),
      logoMark: "/assets/images/logoMark.png",
    };

    const canvas = canvasRef.current as MosaicCanvas | null;
    if (canvas) {
      delete canvas.__mosaic;
    }

    const scriptId = "mem-banner-script";
    document.getElementById(scriptId)?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `/assets/js/script-4.js?${Date.now()}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      if (canvas) delete canvas.__mosaic;
    };
  }, []);

  const selectTier = async (tierName: string) => {
    if (pendingTier) return;
    setPendingTier(tierName);
    setPurchasePhase(null);
    try {
      let account = address;
      if (!isConnected || !account) {
        account = await connectWallet();
      }
      if (!account) throw new Error("No wallet account available.");

      await ensureAuth();

      const result = await purchaseOrUpgradeTier(tierName, "USDT", {
        onAwaitingWallet: () => setPurchasePhase("wallet"),
        onWalletAccepted: () => setPurchasePhase("loading"),
      });

      window.showToast?.({
        title: "Membership activated",
        sub: `${result.tier} tier confirmed — welcome to your network.`,
        link: "",
      });
      router.push("/network");
    } catch (error) {
      if (error instanceof ApiError && error.code === "USER_NOT_REGISTERED") {
        window.showToast?.({ title: "Complete sign up first", sub: "Finish registration, then pick a tier.", link: "" });
        window.openSignup?.();
      } else {
        const message =
          error instanceof ApiError || error instanceof MembershipFlowError || error instanceof Error
            ? error.message
            : "Please try again.";
        window.showToast?.({ title: "Purchase failed", sub: message, link: "" });
      }
    } finally {
      setPendingTier(null);
      setPurchasePhase(null);
    }
  };

  return (
    <MainLayout>
      <div className="feed" id="feed-membership">
        <div className="page-body">
          {/* HERO */}
          <div className="hero">
            <canvas ref={canvasRef} id="memBannerCv"></canvas>
            <div className="mem-banner-shade"></div>
            <div className="hero-mosaic" id="heroMosaic"></div>
            <div className="hero-content">
              <div className="hero-title">Membership Packages</div>
              <div className="hero-sub">
                Select a tier to unlock all platform strategies features and network commissions.
              </div>
            </div>
          </div>

          {/* TIER CARDS */}
          <div className="tiers-grid">
            {/* SCOUT */}
            <div className="tier-card">
              <div className="tier-label">Tier 01</div>
              <div className="tier-name">Scout</div>
              <div className="tier-price">
                $50<span className="tier-price-unit">USD</span>
              </div>
              <div className="tier-divider"></div>
              <div className="tier-features">
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">3 Unilevel Levels</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">All Strategy Pools</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">$400 Max Deposit</span>
                </div>
              </div>
              <button className="tier-btn" onClick={() => selectTier("Scout")} disabled={!!pendingTier}>
                {tierButtonLabel("Scout", "SELECT")}
              </button>
            </div>

            {/* TRACKER */}
            <div className="tier-card">
              <div className="tier-label">Tier 02</div>
              <div className="tier-name">Tracker</div>
              <div className="tier-price">
                $250<span className="tier-price-unit">USD</span>
              </div>
              <div className="tier-divider"></div>
              <div className="tier-features">
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">6 Unilevel Levels</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">All Strategy Pools</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">$1,500 Max Deposit</span>
                </div>
              </div>
              <button className="tier-btn" onClick={() => selectTier("Tracker")} disabled={!!pendingTier}>
                {tierButtonLabel("Tracker", "SELECT")}
              </button>
            </div>

            {/* RANGER - RECOMMENDED */}
            <div className="tier-card recommended">
              <div className="recommended-badge">RECOMMENDED</div>
              <div className="tier-label">Tier 03</div>
              <div className="tier-name">Ranger</div>
              <div className="tier-price">
                $750<span className="tier-price-unit">USD</span>
              </div>
              <div className="tier-divider"></div>
              <div className="tier-features">
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="rgba(242,239,234,.7)" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="rgba(242,239,234,.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">9 Unilevel Levels</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="rgba(242,239,234,.7)" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="rgba(242,239,234,.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">All Strategy Pools</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="rgba(242,239,234,.7)" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="rgba(242,239,234,.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">$4,000 Max Deposit</span>
                </div>
              </div>
              <button className="tier-btn purchase" onClick={() => selectTier("Ranger")} disabled={!!pendingTier}>
                {tierButtonLabel("Ranger", "PURCHASE")}
              </button>
            </div>

            {/* HUNTER */}
            <div className="tier-card">
              <div className="tier-label">Tier 04</div>
              <div className="tier-name">Hunter</div>
              <div className="tier-price">
                $1,500<span className="tier-price-unit">USD</span>
              </div>
              <div className="tier-divider"></div>
              <div className="tier-features">
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">12 Unilevel Levels</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">All Strategy Pools</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">$8,000 Max Deposit</span>
                </div>
              </div>
              <button className="tier-btn" onClick={() => selectTier("Hunter")} disabled={!!pendingTier}>
                {tierButtonLabel("Hunter", "SELECT")}
              </button>
            </div>

            {/* APEX */}
            <div className="tier-card">
              <div className="tier-label">Tier 05</div>
              <div className="tier-name">Apex</div>
              <div className="tier-price">
                $2,500<span className="tier-price-unit">USD</span>
              </div>
              <div className="tier-divider"></div>
              <div className="tier-features">
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">12 Unilevel Levels</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">All Strategy Pools</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">$25,000 Max Deposit</span>
                </div>
                <div className="tier-feature">
                  <svg className="tier-feature-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"></circle>
                    <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  <span className="tier-feature-text">OTC Desk & NFT Lending</span>
                </div>
              </div>
              <button className="tier-btn" onClick={() => selectTier("Apex")} disabled={!!pendingTier}>
                {tierButtonLabel("Apex", "SELECT")}
              </button>
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
                  <th>Scout</th>
                  <th>Tracker</th>
                  <th className="current-tier-col" style={{ position: "relative" }}>
                    Ranger
                  </th>
                  <th>Hunter</th>
                  <th className="apex-col">Apex</th>
                </tr>
              </thead>
              <tbody>
                <tr className="highlight-row">
                  <td>Unilevel Levels</td>
                  <td>3 Levels</td>
                  <td>6 Levels</td>
                  <td>9 Levels</td>
                  <td>12 Levels</td>
                  <td className="apex-col">12 Levels</td>
                </tr>
                <tr>
                  <td>Strategy Pool Access</td>
                  <td>All Pools</td>
                  <td>All Pools</td>
                  <td>All Pools</td>
                  <td>All Pools</td>
                  <td className="apex-col">All Pools</td>
                </tr>
                <tr className="highlight-row">
                  <td>Max Strategy Deposit</td>
                  <td>$400</td>
                  <td>$1,500</td>
                  <td>$4,000</td>
                  <td>$10,000</td>
                  <td className="apex-col">$25,000</td>
                </tr>
                <tr>
                  <td>Tailor OTC Desk & NFT Lending Platform</td>
                  <td>
                    <span className="cross">✕</span>
                  </td>
                  <td>
                    <span className="cross">✕</span>
                  </td>
                  <td>
                    <span className="cross">✕</span>
                  </td>
                  <td>
                    <span className="check">✓</span>
                  </td>
                  <td className="apex-col">
                    <span className="check">✓</span>
                  </td>
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
