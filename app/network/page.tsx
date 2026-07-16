"use client";

import MainLayout from "../components/MainLayout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ApiError } from "../../lib/api";
import {
  useClaimCommissions,
  useDashboardData,
  useTransactionHistory,
  useNetworkTree,
  useLeadershipPayouts,
  formatTokenAmount,
  formatVolume,
  type TransactionEntry,
  type NetworkTreeNode,
} from "../../lib/rewards";

type PlexusCanvas = HTMLCanvasElement & { __plexus?: boolean };

declare global {
  interface Window {
    drawNetworkTree?: () => void;
    drawQR?: () => void;
    __networkTreeData?: NetworkTreeNode | null;
  }
}

const TX_TYPE_LABEL: Record<TransactionEntry["type"], string> = {
  CommissionEarned: "Referral Commission",
  COMMISSION_EARNED: "Referral Commission",
  CommissionWithdrawn: "Commission Claimed",
  COMMISSION_WITHDRAWN: "Commission Claimed",
  MembershipPurchased: "Membership Purchase",
  PURCHASE: "Membership Purchase",
  MembershipUpgraded: "Membership Upgrade",
  UPGRADE: "Membership Upgrade",
  COMMISSION_CLAIM: "Commission Claimed",
};

function formatTxDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NetworkPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileFlipped, setProfileFlipped] = useState(false);
  const { summary, refetchSummary, isFetching } = useDashboardData();
  const { data: txData } = useTransactionHistory(15);
  const { data: treeData } = useNetworkTree(summary?.username);
  const { data: leadershipPayouts } = useLeadershipPayouts();
  const claimCommissions = useClaimCommissions();
  const [claimBusy, setClaimBusy] = useState(false);
  const transactions = txData?.transactions || [];
  const hasClaimableCommissions = !!(summary?.claimableNow && summary.claimableNow > 0);
  const claimDisabledReason = claimBusy
    ? "Claim in progress…"
    : !summary
    ? "Connect your wallet to check your balance."
    : !hasClaimableCommissions
    ? "Nothing to claim yet — commissions appear here as your network purchases memberships."
    : "";
  const totalLeadershipReceived = (leadershipPayouts || [])
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountUSDC, 0);
  const hasLeadershipHistory = (leadershipPayouts || []).length > 0;

  useEffect(() => {
    const canvas = canvasRef.current as PlexusCanvas | null;
    if (canvas) delete canvas.__plexus;

    const bannerScriptId = "net-banner-script";
    document.getElementById(bannerScriptId)?.remove();

    const bannerScript = document.createElement("script");
    bannerScript.id = bannerScriptId;
    bannerScript.src = `/assets/js/script-5.js?${Date.now()}`;
    bannerScript.async = true;
    document.body.appendChild(bannerScript);

    return () => {
      bannerScript.remove();
      if (canvas) delete canvas.__plexus;
    };
  }, []);

  useEffect(() => {
    const topoScriptId = "net-topo-script";
    document.getElementById(topoScriptId)?.remove();

    const topoScript = document.createElement("script");
    topoScript.id = topoScriptId;
    topoScript.src = `/assets/js/network-topo.js?${Date.now()}`;
    topoScript.async = true;
    topoScript.onload = () => {
      setTimeout(() => {
        window.drawNetworkTree?.();
        window.drawQR?.();
      }, 120);
    };
    document.body.appendChild(topoScript);

    const onResize = () => window.drawNetworkTree?.();
    window.addEventListener("resize", onResize);

    const onTopoClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(".topo-vbtn");
      if (!btn) return;
      btn.closest(".topo-view-btns")?.querySelectorAll(".topo-vbtn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      window.drawNetworkTree?.();
    };
    document.addEventListener("click", onTopoClick);

    return () => {
      topoScript.remove();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onTopoClick);
    };
  }, []);

  // Feed the real downline tree to the (vanilla-JS) topology renderer whenever it
  // changes, and redraw. Set to null while there's no username yet so the canvas
  // shows a "loading" placeholder instead of stale/synthetic data.
  useEffect(() => {
    window.__networkTreeData = treeData ?? null;
    window.drawNetworkTree?.();
  }, [treeData]);

  const referralLink =
    typeof window !== "undefined" && summary?.username
      ? `${window.location.origin}/?ref=${summary.username}`
      : "Connect your wallet to get your link";

  const copyRef = () => {
    if (!summary?.username) {
      window.showToast?.({ title: "No referral link yet", sub: "Finish signing up to get your link.", link: "" });
      return;
    }
    navigator.clipboard.writeText(referralLink);
    window.showToast?.({ title: "Referral link copied", sub: referralLink, link: "" });
  };

  const handleClaimCommissions = async () => {
    if (claimBusy) return;
    setClaimBusy(true);
    try {
      const results = await claimCommissions(summary?.tokens || []);
      await refetchSummary();
      window.showToast?.({
        title: "Commissions claimed",
        sub: `${results.length} token${results.length > 1 ? "s" : ""} sent to your wallet.`,
        link: "",
      });
    } catch (error) {
      window.showToast?.({
        title: "Claim failed",
        sub: error instanceof ApiError ? error.message : (error as Error)?.message || "Please try again.",
        link: "",
      });
    } finally {
      setClaimBusy(false);
    }
  };

  return (
    <MainLayout>
      <div className="feed" id="feed-network">
        <div className="page-body">
          <div className="hero">
            <canvas ref={canvasRef} id="netBannerCv"></canvas>
            <div className="net-banner-shade"></div>
            <div className="hero-mosaic" id="networkMosaic"></div>
            <div className="hero-content">
              <div className="hero-title">MY NETWORK</div>
              <div className="hero-sub">HNTR REWARDS DASHBOARD & NETWORK COMMISSIONS</div>
              <button
                className="net-refresh-btn"
                onClick={() => refetchSummary()}
                disabled={isFetching}
                title="Refresh rewards data"
                style={{
                  marginTop: "12px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontFamily: "var(--fd)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--t4)",
                  background: "transparent",
                  border: "1px solid var(--t4)",
                  borderRadius: "4px",
                  cursor: isFetching ? "wait" : "pointer",
                  opacity: isFetching ? 0.6 : 1,
                }}
              >
                {isFetching ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="net-top-grid">
            <div
              className={`net-profile-card${profileFlipped ? " is-flipped" : ""}`}
              onClick={() => setProfileFlipped((flipped) => !flipped)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setProfileFlipped((flipped) => !flipped);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={profileFlipped}
            >
              <div className="net-flip-inner">
                <div className="net-flip-face net-flip-front">
                  <div className="net-flip-cue">
                    <span className="net-flip-cue-desktop">HOVER ⇆</span>
                    <span className="net-flip-cue-mobile">TAP ⇆</span>
                  </div>
                  <div className="net-profile-row">
                    <div className="net-avatar">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="10" r="5" stroke="var(--t2)" strokeWidth="1.5"></circle>
                        <path
                          d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10"
                          stroke="var(--t2)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                      </svg>
                    </div>
                    <div className="net-profile-info">
                      <div className="net-username">{summary?.username || "Unregistered"}</div>
                      <div className="net-rank">
                        Rank: <span>{summary?.rank || "None"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="net-divider"></div>
                  <div className="net-progress-wrap">
                    <div className="net-prog-row">
                      <span className="net-prog-lbl">Current Progress</span>
                      <span className="net-prog-pct">{summary?.progress.percent ?? 0}%</span>
                    </div>
                    <div className="net-prog-bar">
                      <div className="net-prog-fill" style={{ width: `${summary?.progress.percent ?? 0}%` }}></div>
                    </div>
                    <div className="net-prog-labels">
                      <span>{summary?.progress.currentRank || "None"}</span>
                      <span style={{ fontWeight: 600, color: "var(--t4)" }}>{summary?.progress.nextRank || "Max Rank"}</span>
                    </div>
                  </div>
                </div>

                <div className="net-flip-face net-flip-back">
                  <div className="net-perf-head">
                    <div className="net-avatar net-perf-av">
                      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="10" r="5" stroke="var(--t2)" strokeWidth="1.5"></circle>
                        <path
                          d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10"
                          stroke="var(--t2)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <div className="net-perf-user">{summary?.username || "Unregistered"}</div>
                      <div className="net-rank">
                        Rank: <span>{summary?.rank || "None"}</span>
                      </div>
                    </div>
                    <div className="net-perf-rule">
                      TEAM VOLUME <b>{(summary?.teamVolume ?? 0).toLocaleString()}</b>
                    </div>
                  </div>
                  <div className="net-divider"></div>
                  <div className="net-perf-grid">
                    {[
                      { name: "COMPETITIVE", leg: summary?.legs.competitive[0] },
                      { name: "COMPETITIVE", leg: summary?.legs.competitive[1] },
                      { name: "WEAKEST", leg: summary?.legs.weakest, muted: true },
                    ].map((col, i) => {
                      const pct = col.leg?.percent ?? 0;
                      return (
                        <div className="net-perf-col" key={i}>
                          <div className="net-perf-name">{col.name}</div>
                          <div className="net-perf-valrow">
                            <div className="net-perf-val">
                              {formatVolume(col.leg?.volume ?? 0)}
                              <b>/{formatVolume(col.leg?.cap ?? 0)}</b>
                            </div>
                            <div className="net-perf-pct">
                              <span className={`net-perf-badge${col.muted ? " muted" : ""}`}>
                                <svg viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M2.5 6.2l2.3 2.3L9.5 3.5"
                                    stroke="#fff"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  ></path>
                                </svg>
                              </span>
                              {pct}%
                            </div>
                          </div>
                          <div className="net-perf-bar">
                            <div className="net-perf-fill" style={{ "--w": `${pct}%` } as React.CSSProperties}></div>
                          </div>
                          <div className="net-perf-team">
                            Referring Team<b>{col.leg?.label || "—"}</b>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="net-stats-grid">
              <div className="net-stat">
                <div className="net-stat-lbl">Total Rewarded</div>
                <div className="net-stat-val">
                  ${(summary?.totalRewarded ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="net-stat-chg pos">
                  ${(summary?.claimableNow ?? 0).toFixed(2)} claimable now
                </div>
              </div>
              <div className="net-stat">
                <div className="net-stat-lbl" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Locked in Pool
                  <span className="info-i" data-tip="20% of every referral commission is locked in the pool wallet per the HNTR tokenomics.">
                    i
                  </span>
                </div>
                <div className="net-stat-val">
                  ${(summary?.lockedRemaining ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="net-stat-chg">
                  20% of referral commissions
                </div>
              </div>
              <div className="net-stat" style={{ position: "relative" }}>
                <div className="net-stat-lbl">Membership</div>
                <div className="net-stat-val" style={{ fontSize: "22px", fontFamily: "var(--fd)" }}>
                  {(summary?.tier || "NONE").toUpperCase()}
                </div>
                <button
                  className="upgrade-btn"
                  style={{ position: "absolute", top: "12px", right: "12px", margin: 0 }}
                  onClick={() => router.push("/membership")}
                >
                  UPGRADE
                </button>
              </div>
              <div className="net-stat">
                <div className="net-stat-lbl">Total Network Users</div>
                <div className="net-stat-val">{(summary?.networkSize ?? 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="net-section-hdr">
            <div className="net-section-title">Active Rewards Tiers</div>
            <a className="net-section-link">View Detailed Breakdown →</a>
          </div>

          <div className="net-rewards-grid">
            {[
              {
                icon: (
                  <>
                    <circle cx="4" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
                    <circle cx="16" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
                    <circle cx="10" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"></circle>
                    <path
                      d="M5.6 6.5l3.2 7M14.4 6.5l-3.2 7M6 5h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>
                  </>
                ),
                tag: "REAL-TIME",
                name: "Referral Commissions",
                desc: `80% claimable now ($${(summary?.claimableNow ?? 0).toFixed(2)}) + 20% locked in pool ($${(summary?.lockedRemaining ?? 0).toFixed(2)}) from your direct and indirect network volume.`,
                amount: `$${(summary?.claimableNow ?? 0).toFixed(2)}`,
                delay: ".05s",
                claimable: true,
                note: "CLAIM",
              },
              {
                icon: (
                  <>
                    <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"></circle>
                    <path
                      d="M4 17c0-3 2.7-5 6-5s6 2 6 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>
                    <path
                      d="M6.5 3.6l1.6 1.5L10 3l1.9 2.1 1.6-1.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </>
                ),
                tag: hasLeadershipHistory ? "AUTO-DEPOSITED" : "MONTHLY",
                name: "Leadership Bonus",
                desc: "Automatically deposited to your wallet on the 1st of each month, based on your leadership rank's share of the pool.",
                amount: `$${totalLeadershipReceived.toFixed(2)}`,
                delay: ".10s",
                claimable: false,
                note: hasLeadershipHistory ? "PAID" : "SOON",
              },
              {
                icon: (
                  <>
                    <rect x="3" y="11" width="3.4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"></rect>
                    <rect x="8.3" y="7" width="3.4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"></rect>
                    <rect x="13.6" y="3" width="3.4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"></rect>
                  </>
                ),
                tag: "COMING SOON",
                name: "Rank Bonus",
                desc: "Bonus calculated based on organization performance metrics.",
                amount: "$0.00",
                delay: ".15s",
                claimable: false,
                note: "SOON",
              },
              {
                icon: (
                  <>
                    <path
                      d="M6 3h8v4a4 4 0 0 1-8 0V3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M6 4.5H3.5V6A2.5 2.5 0 0 0 6 8.5M14 4.5h2.5V6A2.5 2.5 0 0 1 14 8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>
                    <path
                      d="M8.2 13.5h3.6L12 17H8l.2-3.5zM10 11v2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </>
                ),
                tag: "COMING SOON",
                name: "NFT Strategy Rewards",
                desc: "One-time milestone incentives for achieving new Hunter tiers.",
                amount: "$0.00",
                delay: ".20s",
                claimable: false,
                note: "SOON",
              },
              {
                icon: (
                  <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"></circle>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"></circle>
                  </>
                ),
                tag: "COMING SOON",
                name: "OTC Desk",
                desc: "Recurring monthly stipend for active Hunter Elite status holders.",
                amount: "$0.00",
                delay: ".25s",
                claimable: false,
                note: "SOON",
              },
              {
                icon: (
                  <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"></circle>
                    <path
                      d="M10 6v4l3 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </>
                ),
                tag: "COMING SOON",
                name: "Liquidity Provider",
                desc: "Variable rewards for beta testing and governance participation.",
                amount: "$0.00",
                delay: ".30s",
                claimable: false,
                note: "SOON",
              },
            ].map((reward, i) => (
              <div className="net-reward-card" style={{ "--delay": reward.delay } as React.CSSProperties} key={i}>
                <div className="net-rc-top">
                  <div className="net-rc-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      {reward.icon}
                    </svg>
                  </div>
                  <div className="net-rc-tag">{reward.tag}</div>
                </div>
                <div className="net-rc-name">{reward.name}</div>
                <div className="net-rc-desc">{reward.desc}</div>
                <div className="net-rc-footer">
                  <div className="net-rc-amount">{reward.amount}</div>
                  <button
                    className="net-claim-btn"
                    disabled={!reward.claimable || claimBusy || !hasClaimableCommissions}
                    onClick={reward.claimable ? handleClaimCommissions : undefined}
                    title={reward.claimable ? claimDisabledReason || "Claim your commissions now" : reward.desc}
                  >
                    {reward.claimable ? (claimBusy ? "CLAIMING…" : "CLAIM") : reward.note}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="topo-outer">
            <div className="topo-card">
              <div className="topo-hdr">
                <div className="topo-hdr-title">Topology Matrix Mapping</div>
                <div className="topo-view-btns">
                  <button className="topo-vbtn active">2D Plane</button>
                  <button className="topo-vbtn">Node View</button>
                </div>
              </div>
              <div className="topo-canvas" id="topoCanvas">
                <svg id="topoSvg" width="100%" height="100%"></svg>
                <div className="topo-status">
                  <span>
                    System Status: <strong>Mapping Active</strong>
                  </span>
                  <span>
                    Latency: <strong id="topoLatency">14ms</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="ref-card">
              <div className="ref-title">Referral Link</div>
              <div className="ref-link-row">
                <div className="ref-link-box" title={referralLink}>
                  {referralLink}
                </div>
                <button className="ref-copy-btn" onClick={copyRef}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"></rect>
                    <path
                      d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="ref-qr-wrap">
                <canvas id="qrCanvas" width="160" height="160"></canvas>
              </div>
            </div>
          </div>

          <div className="txh-card">
            <div className="txh-hdr">
              <div className="txh-title">Transaction History</div>
              <div className="txh-controls">
                <div className="txh-search">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4"></circle>
                    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"></path>
                  </svg>
                  <input className="txh-input" placeholder="Filter..." />
                </div>
                <button className="txh-filter-btn">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 3h10M3 6h6M5 9h2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    ></path>
                  </svg>{" "}
                  Filter
                </button>
              </div>
            </div>
            <div className="table-scroll">
              <table className="txh-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Type</th>
                    <th>Source</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody id="txhTable">
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--t2)", padding: "24px 0" }}>
                        No on-chain activity yet.
                      </td>
                    </tr>
                  )}
                  {transactions.map((tx, i) => {
                    const isOutgoing = tx.type === "MembershipPurchased" || tx.type === "MembershipUpgraded" || tx.type === "PURCHASE" || tx.type === "UPGRADE";
                    const isCommissionEarned = tx.type === "CommissionEarned" || tx.type === "COMMISSION_EARNED";
                    const hasLocked = isCommissionEarned && !!tx.lockedAmount && Number(tx.lockedAmount) > 0;
                    const statusClass = tx.status === "PENDING" ? "pending" : tx.status === "FAILED" ? "failed" : "confirmed";
                    const statusLabel = tx.status === "PENDING" ? "Pending" : tx.status === "FAILED" ? "Failed" : "Confirmed";
                    return (
                      <tr key={`${tx.txHash || tx.type}-${i}`}>
                        <td>{formatTxDate(tx.timestamp)}</td>
                        <td>{TX_TYPE_LABEL[tx.type] || tx.type}</td>
                        <td>{tx.tier ? `${tx.tier} tier` : tx.level ? `Level ${tx.level}` : "—"}</td>
                        <td
                          style={{
                            textAlign: "right",
                            color: isOutgoing ? "var(--t2)" : "var(--green)",
                            fontWeight: 600,
                          }}
                        >
                          <div>{isOutgoing ? "-" : "+"}{formatTokenAmount(tx.amount)}</div>
                          {hasLocked && (
                            <div style={{ fontSize: "11px", color: "var(--t2)", fontWeight: 400, marginTop: "2px" }}>
                              + {formatTokenAmount(tx.lockedAmount)} locked (20%)
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`txh-status ${statusClass}`}>{statusLabel}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="txh-footer">
              <div className="txh-count" id="txhCount">
                Showing {transactions.length} of {transactions.length} recent entries
              </div>
              <div className="txh-pages">
                <button className="txh-pg">‹</button>
                <button className="txh-pg active">1</button>
                <button className="txh-pg">2</button>
                <button className="txh-pg">3</button>
                <button className="txh-pg">›</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
