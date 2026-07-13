"use client";

import MainLayout from "../components/MainLayout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

type PlexusCanvas = HTMLCanvasElement & { __plexus?: boolean };

declare global {
  interface Window {
    drawNetworkTree?: () => void;
    drawQR?: () => void;
  }
}

export default function NetworkPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileFlipped, setProfileFlipped] = useState(false);

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

  const copyRef = () => {
    navigator.clipboard.writeText("hntr.net/ref/0x71c...492");
  };

  const transactions = [
    {
      date: "2024-07-11 14:22:31",
      type: "Referral Commission",
      source: "@alphawhale",
      amount: "+$142.50",
      status: "Confirmed",
    },
    {
      date: "2024-07-11 09:15:02",
      type: "Pool Reward",
      source: "BAYC Strategy Pool",
      amount: "+$87.20",
      status: "Confirmed",
    },
    {
      date: "2024-07-10 19:48:11",
      type: "Leadership Bonus",
      source: "Global Pool",
      amount: "+$234.80",
      status: "Confirmed",
    },
    {
      date: "2024-07-10 13:22:55",
      type: "Referral Commission",
      source: "@cryptomaster",
      amount: "+$95.00",
      status: "Pending",
    },
  ];

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
                      <div className="net-username">masteraccount</div>
                      <div className="net-rank">
                        Rank: <span>Elite Hunter</span>
                      </div>
                    </div>
                  </div>
                  <div className="net-divider"></div>
                  <div className="net-progress-wrap">
                    <div className="net-prog-row">
                      <span className="net-prog-lbl">Current Progress</span>
                      <span className="net-prog-pct">74%</span>
                    </div>
                    <div className="net-prog-bar">
                      <div className="net-prog-fill" style={{ width: "74%" }}></div>
                    </div>
                    <div className="net-prog-labels">
                      <span>Hunter Elite</span>
                      <span style={{ fontWeight: 600, color: "var(--t4)" }}>Hunter Legend</span>
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
                      <div className="net-perf-user">masteraccount</div>
                      <div className="net-rank">
                        Rank: <span>Elite Hunter</span>
                      </div>
                    </div>
                    <div className="net-perf-rule">
                      RULE <b>40</b> / <b>40</b> / <b>40</b>
                    </div>
                  </div>
                  <div className="net-divider"></div>
                  <div className="net-perf-grid">
                    <div className="net-perf-col">
                      <div className="net-perf-name">COMPETITIVE</div>
                      <div className="net-perf-valrow">
                        <div className="net-perf-val">
                          10K<b>/10K</b>
                        </div>
                        <div className="net-perf-pct">
                          <span className="net-perf-badge">
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
                          100%
                        </div>
                      </div>
                      <div className="net-perf-bar">
                        <div className="net-perf-fill" style={{ "--w": "100%" } as React.CSSProperties}></div>
                      </div>
                      <div className="net-perf-team">
                        Referring Team<b>Vanguard</b>
                      </div>
                    </div>
                    <div className="net-perf-col">
                      <div className="net-perf-name">COMPETITVE</div>
                      <div className="net-perf-valrow">
                        <div className="net-perf-val">
                          10K<b>/10K</b>
                        </div>
                        <div className="net-perf-pct">
                          <span className="net-perf-badge">
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
                          100%
                        </div>
                      </div>
                      <div className="net-perf-bar">
                        <div className="net-perf-fill" style={{ "--w": "100%" } as React.CSSProperties}></div>
                      </div>
                      <div className="net-perf-team">
                        Referring Team<b>Frontier</b>
                      </div>
                    </div>
                    <div className="net-perf-col">
                      <div className="net-perf-name">WEAKEST</div>
                      <div className="net-perf-valrow">
                        <div className="net-perf-val">
                          1.1K<b>/4K</b>
                        </div>
                        <div className="net-perf-pct">
                          <span className="net-perf-badge muted">
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
                          33%
                        </div>
                      </div>
                      <div className="net-perf-bar">
                        <div className="net-perf-fill" style={{ "--w": "33%" } as React.CSSProperties}></div>
                      </div>
                      <div className="net-perf-team">
                        Referring Team<b>Outpost</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="net-stats-grid">
              <div className="net-stat">
                <div className="net-stat-lbl">Total Rewarded</div>
                <div className="net-stat-val">$11,955.14</div>
                <div className="net-stat-chg pos">↗ +4.2% This Month</div>
              </div>
              <div className="net-stat">
                <div className="net-stat-lbl">HNTR Points</div>
                <div className="net-stat-val">6,913,586</div>
              </div>
              <div className="net-stat" style={{ position: "relative" }}>
                <div className="net-stat-lbl">Membership</div>
                <div className="net-stat-val" style={{ fontSize: "22px", fontFamily: "var(--fd)" }}>
                  RANGER
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
                <div className="net-stat-val">12,482</div>
                <div className="net-stat-chg pos">↗ +1.8% Growth</div>
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
                desc: "Cumulative earnings from direct network institutional volume.",
                amount: "$4,230.12",
                delay: ".05s",
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
                tag: "DAILY",
                name: "Leadership Bonus",
                desc: "Daily proportional distribution from global liquidity pools.",
                amount: "$1,844.80",
                delay: ".10s",
              },
              {
                icon: (
                  <>
                    <rect x="3" y="11" width="3.4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"></rect>
                    <rect x="8.3" y="7" width="3.4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"></rect>
                    <rect x="13.6" y="3" width="3.4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"></rect>
                  </>
                ),
                tag: "ONE-TIME",
                name: "Rank Bonus",
                desc: "Bonus calculated based on organization performance metrics.",
                amount: "$31,005.00",
                delay: ".15s",
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
                tag: "EVENT",
                name: "NFT Strategy Rewards",
                desc: "One-time milestone incentives for achieving new Hunter tiers.",
                amount: "$25,000.00",
                delay: ".20s",
              },
              {
                icon: (
                  <>
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"></circle>
                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"></circle>
                  </>
                ),
                tag: "MONTHLY",
                name: "OTC Desk",
                desc: "Recurring monthly stipend for active Hunter Elite status holders.",
                amount: "$2,500.00",
                delay: ".25s",
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
                tag: "SPECIAL",
                name: "Liquidity Provider",
                desc: "Variable rewards for beta testing and governance participation.",
                amount: "$302.52",
                delay: ".30s",
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
                  <button className="net-claim-btn">CLAIM</button>
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
                <div className="ref-link-box">hntr.net/ref/0x71c...492</div>
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
                  {transactions.map((tx, i) => (
                    <tr key={i}>
                      <td>{tx.date}</td>
                      <td>{tx.type}</td>
                      <td>{tx.source}</td>
                      <td style={{ textAlign: "right", color: "var(--green)", fontWeight: 600 }}>{tx.amount}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`txh-status ${tx.status === "Confirmed" ? "confirmed" : "pending"}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="txh-footer">
              <div className="txh-count" id="txhCount">
                Showing 1-4 of 1,244 entries
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
