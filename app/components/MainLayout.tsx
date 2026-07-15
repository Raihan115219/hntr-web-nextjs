"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { formatEther } from "viem";
import SignupOverlays from "./SignupOverlays";
import SignupCard from "./SignupCard";
import NotificationSystem from "./NotificationSystem";
import DepositModal from "./DepositModal";
import { ApiError, clearStoredAuth } from "../../lib/api";
import { useDashboardData, useClaimCommissions } from "../../lib/rewards";
import type { StandardToastData } from "../../lib/notification-data";

const MOBILE_MQ = "(max-width: 900px)";

function buildNavBarPath(width: number, notchX: number, hasNotch: boolean) {
  const h = 64;
  const cr = 0;
  if (!hasNotch || width <= 0) {
    return `M 0 0 L ${width} 0 L ${width} ${h} L 0 ${h} Z`;
  }

  const nw = 40;
  const nd = 32;
  const cx = Math.max(nw + 12, Math.min(width - nw - 12, notchX));

  return [
    `M 0 ${cr}`,
    `L ${cx - nw - 6} 0`,
    `C ${cx - nw + 4} 0 ${cx - nw * 0.55} 3 ${cx - nw * 0.35} ${nd * 0.45}`,
    `C ${cx - 14} ${nd * 0.95} ${cx - 5} ${nd} ${cx} ${nd}`,
    `C ${cx + 5} ${nd} ${cx + 14} ${nd * 0.95} ${cx + nw * 0.35} ${nd * 0.45}`,
    `C ${cx + nw * 0.55} 3 ${cx + nw - 4} 0 ${cx + nw + 6} 0`,
    `L ${width} 0`,
    `L ${width} ${h}`,
    `L 0 ${h}`,
    "Z",
  ].join(" ");
}

declare global {
  interface Window {
    showToast?: (data: StandardToastData) => void;
    openDepositModal?: (assetName?: string, floorEth?: string) => void;
    closeDepositModal?: () => void;
  }
}

function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-3)}`;
}

const PRIVACY_EYE_ON = (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path
      d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const PRIVACY_EYE_OFF = (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path
      d="M2 10S5 4.5 10 4.5c1.3 0 2.5.3 3.6.9M18 10s-3 5.5-8 5.5c-1.3 0-2.5-.3-3.6-.9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M8.2 8.2a2.5 2.5 0 0 0 3.6 3.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.5 3.5l13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

interface MainLayoutProps {
  children: React.ReactNode;
  sbTransY?: number;
  sbOpacity?: number;
  railTransX?: number;
  railOpacity?: number;
}

export default function MainLayout({ 
  children, 
  sbTransY = 0, 
  sbOpacity = 1, 
  railTransX = 0, 
  railOpacity = 1 
}: MainLayoutProps) {
  const pathname = usePathname();
  const { address, isConnected: walletConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const WALLET_ADDRESS = shortenAddress(address);
  const { summary, refetchSummary } = useDashboardData();
  const claimCommissions = useClaimCommissions();
  const [claimBusy, setClaimBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isDark, setIsDark] = useState(true);
  const [walletPanelOpen, setWalletPanelOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAssetName, setDepositAssetName] = useState("Pool Asset");
  const [depositFloorEth, setDepositFloorEth] = useState("0.00");
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const profileSlotRef = useRef<HTMLDivElement | null>(null);
  const bottomNavRef = useRef<HTMLDivElement | null>(null);
  const navBarPathRef = useRef<SVGPathElement | null>(null);
  
  // Determine current page from pathname
  const currentPage =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/pool/")
        ? "pooldetail"
        : pathname.slice(1);
  const hideRightRail = currentPage === "network";
  const showMobileProfile = currentPage === "home" && walletConnected && !hideRightRail;

  const maskBalance = (value: string) => (balancesHidden ? "••••••" : value);

  const closeRail = useCallback(() => setRailOpen(false), []);
  const triggerNavHaptic = useCallback(() => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(12);
      }
    } catch {
      // Haptics unavailable or blocked in this environment.
    }
  }, []);
  const onBottomNavClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest(".si")) {
        triggerNavHaptic();
      }
    },
    [triggerNavHaptic],
  );
  const toggleRail = useCallback(() => {
    setWalletPanelOpen(false);
    setNotifPanelOpen(false);
    setRailOpen((open) => !open);
  }, []);

  // Load theme and privacy preference from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("hntrTheme");
      if (savedTheme === "light") setIsDark(false);
      else if (savedTheme === "dark") setIsDark(true);
      if (localStorage.getItem("hntrBalHidden") === "1") setBalancesHidden(true);
    } catch (e) {
      console.error("Failed to load theme:", e);
    }
  }, []);

  useEffect(() => {
    setPortalMounted(true);
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      setIsMobileView(mq.matches);
      if (!mq.matches) setRailOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Close rail drawer when leaving mobile breakpoint or changing page
  useEffect(() => {
    setRailOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateActiveNotch = () => {
      const nav = bottomNavRef.current;
      const path = navBarPathRef.current;
      if (!nav || !path || !window.matchMedia(MOBILE_MQ).matches) return;

      const barWidth = nav.clientWidth;
      const active = nav.querySelector<HTMLElement>(".mobile-nav-track .si.active");
      const svg = nav.querySelector<SVGSVGElement>(".mobile-nav-shape");

      if (svg && barWidth > 0) {
        svg.setAttribute("viewBox", `0 0 ${barWidth} 64`);
      }

      if (!active) {
        nav.style.removeProperty("--nav-notch-x");
        path.setAttribute("d", buildNavBarPath(barWidth, barWidth / 2, false));
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const x = activeRect.left + activeRect.width / 2 - navRect.left;
      nav.style.setProperty("--nav-notch-x", `${x}px`);
      path.setAttribute("d", buildNavBarPath(barWidth, x, true));
    };

    updateActiveNotch();
    window.addEventListener("resize", updateActiveNotch);
    const mq = window.matchMedia(MOBILE_MQ);
    mq.addEventListener("change", updateActiveNotch);

    return () => {
      window.removeEventListener("resize", updateActiveNotch);
      mq.removeEventListener("change", updateActiveNotch);
    };
  }, [pathname, currentPage]);

  // Mount mobile profile card after home banner only
  useEffect(() => {
    if (!showMobileProfile) {
      setProfileAnchor(null);
      profileSlotRef.current?.remove();
      profileSlotRef.current = null;
      document.querySelectorAll(".mobile-profile-slot").forEach((el) => {
        if (!el.closest("#panel-home")) el.remove();
      });
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const place = () => {
      if (cancelled) return;
      const panel = document.getElementById("panel-home");
      const hero = panel?.querySelector(".hero") as HTMLElement | null;
      if (!hero) {
        if (attempts++ < 20) {
          timer = setTimeout(place, 50);
        } else {
          setProfileAnchor(null);
        }
        return;
      }

      let slot = profileSlotRef.current;
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "mobile-profile-slot";
        profileSlotRef.current = slot;
      }

      if (slot.previousElementSibling !== hero) {
        hero.insertAdjacentElement("afterend", slot);
      }
      setProfileAnchor(slot);
    };

    place();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [showMobileProfile]);

  useEffect(() => {
    return () => {
      profileSlotRef.current?.remove();
      profileSlotRef.current = null;
    };
  }, []);

  // Escape closes rail drawer
  useEffect(() => {
    if (!railOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRailOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [railOpen]);

  // Update body classes
  useEffect(() => {
    document.body.dataset.page = currentPage;
    document.body.classList.toggle("wallet-connected", walletConnected);
    document.body.classList.toggle("balances-hidden", balancesHidden);
    document.body.classList.toggle("rail-drawer-open", railOpen);
    
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark, currentPage, walletConnected, balancesHidden, railOpen]);

  // Close wallet / notification panels when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#walletPanel") && !target.closest(".conn-pill")) {
        setWalletPanelOpen(false);
      }
      if (!target.closest("#notifPanel") && !target.closest('[data-btn="notif"]')) {
        setNotifPanelOpen(false);
      }
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  const openSignup = useCallback(() => {
    if (typeof window.openSignup === "function") {
      window.openSignup();
    } else {
      document.getElementById("signupOverlay")?.classList.add("open");
      for (let step = 1; step <= 3; step += 1) {
        document.getElementById(`suStep${step}`)?.classList.toggle("on", step === 1);
      }
      document.getElementById("suModal")?.classList.remove("wide");
    }
    document.body.classList.add("modal-open");
  }, []);

  const closeDepositModal = useCallback(() => {
    setDepositOpen(false);
  }, []);

  const openDepositModal = useCallback((assetName = "Pool Asset", floorEth = "0.00") => {
    setDepositAssetName(assetName);
    setDepositFloorEth(floorEth);
    setDepositOpen(true);
    setWalletPanelOpen(false);
    setNotifPanelOpen(false);
    setRailOpen(false);
  }, []);

  useEffect(() => {
    window.openDepositModal = openDepositModal;
    window.closeDepositModal = closeDepositModal;
    return () => {
      delete window.openDepositModal;
      delete window.closeDepositModal;
    };
  }, [openDepositModal, closeDepositModal]);

  const toggleWalletPanel = () => {
    if (!walletConnected) {
      setWalletPanelOpen(false);
      setNotifPanelOpen(false);
      setRailOpen(false);
      openSignup();
      return;
    }
    setNotifPanelOpen(false);
    setRailOpen(false);
    setWalletPanelOpen((open) => !open);
  };

  const disconnectWallet = () => {
    setWalletPanelOpen(false);
    const disconnectedLabel = WALLET_ADDRESS;
    clearStoredAuth();
    disconnect();
    window.showToast?.({
      title: "Wallet disconnected",
      sub: `${disconnectedLabel} has been disconnected`,
      link: "",
    });
  };

  const toggleNotifPanel = () => {
    setWalletPanelOpen(false);
    setRailOpen(false);
    setNotifPanelOpen((open) => !open);
  };

  const togglePrivacy = () => {
    setBalancesHidden((hidden) => {
      const next = !hidden;
      try {
        localStorage.setItem("hntrBalHidden", next ? "1" : "0");
      } catch (e) {
        console.error("Failed to save privacy preference:", e);
      }
      return next;
    });
  };

  // Legacy script-8.js calls window.reconnectWallet() after closing the membership
  // success modal. With a real wallet connection the wallet was never disconnected
  // during purchase, so this is now a no-op kept only for backward compatibility.
  const reconnectWallet = useCallback(() => {}, []);

  useEffect(() => {
    window.reconnectWallet = reconnectWallet;
    return () => {
      delete window.reconnectWallet;
    };
  }, [reconnectWallet]);

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

  const lockedNavClick = (e: React.MouseEvent) => {
    if (!walletConnected) {
      e.preventDefault();
      openSignup();
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      localStorage.setItem("hntrTheme", newIsDark ? "dark" : "light");
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  };

  const renderProfileCard = () => {
    const progress = summary?.progress;
    const progressPct = progress?.percent ?? 0;
    return (
      <div className="r-div rail-profile-block">
        <div className="rp">
          <div className="rav">👤</div>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="rn">{summary?.username || "Unregistered"}</div>
            </div>
            <div className="rt">{summary?.rank || "None"}</div>
          </div>
          <button
            className={`privacy-eye${balancesHidden ? " off" : ""}`}
            type="button"
            onClick={togglePrivacy}
            aria-label={balancesHidden ? "Show balances" : "Hide balances"}
            title={balancesHidden ? "Show balances" : "Hide balances"}
          >
            {balancesHidden ? PRIVACY_EYE_OFF : PRIVACY_EYE_ON}
          </button>
        </div>
        <div className="rpb-wrap">
          <div className="rph">
            <div className="rpl">Current Progress</div>
            <div className="rpp">{progressPct}%</div>
          </div>
          <div className="rpb">
            <div className="rpf" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="rpls">
            <span>{progress?.currentRank || "None"}</span>
            <span>{progress?.nextRank || "Max Rank"}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRightRail = () => (
    <div
      id="app-right-rail"
      className={`rail${railOpen ? " rail-open" : ""}${isMobileView ? " mobile-rail-drawer" : ""}`}
      style={
        isMobileView
          ? undefined
          : {
              transform: railOpen ? undefined : `translateX(${railTransX}%)`,
              opacity: railOpacity,
            }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {!walletConnected ? (
        <SignupCard />
      ) : (
        <>
          {renderProfileCard()}

          <div className="r-div">
            <div className="rs2">
              <div className="rsb">
                <div className="rsbl">Total Rewarded</div>
                <div className="rsbv">
                  {maskBalance(`$${(summary?.totalRewarded ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
                </div>
                <div className="rsbc">{summary?.networkSize ?? 0} network members</div>
              </div>
              <div className="rsb">
                <div className="rsbl" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  HNTR Points
                  <span className="info-i" data-tip="HNTR POINTS COMING SOON">
                    i
                  </span>
                </div>
                <div className="rsbv">{maskBalance("0")}</div>
                <div className="rsbg">— Lifetime</div>
              </div>
            </div>
          </div>

          <div className="rrtl">Active Rewards Tiers</div>
          <div className="rrc" style={{ marginBottom: "8px" }}>
            <div className="rrct">
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="#8a9e82" strokeWidth="1.2" />
                  <path
                    d="M4 6l1.5 1.5L8 4"
                    stroke="#8a9e82"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="rrctype">Referral Commission</div>
              </div>
            </div>
            <div className="rrcd">Claimable now from your direct referral network</div>
            <div className="rrcb">
              <div className="rrcv">{maskBalance(`$${(summary?.claimableNow ?? 0).toFixed(2)}`)}</div>
              <button
                className="cbtn"
                disabled={claimBusy || !(summary?.claimableNow && summary.claimableNow > 0)}
                onClick={handleClaimCommissions}
                title={
                  claimBusy
                    ? "Claim in progress…"
                    : summary?.claimableNow && summary.claimableNow > 0
                    ? "Claim your commissions now"
                    : "Nothing to claim yet — commissions appear here as your network purchases memberships."
                }
              >
                {claimBusy ? "CLAIMING…" : "CLAIM"}
              </button>
            </div>
          </div>
          <div className="rrc r-div">
            <div className="rrct">
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="4" width="9" height="7" rx="1" stroke="#8a9e82" strokeWidth="1.2" />
                  <path d="M4 4V3a2 2 0 0 1 4 0v1" stroke="#8a9e82" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <div className="rrctype">Locked Commission</div>
              </div>
            </div>
            <div className="rrcd">Vested balance released as your team volume grows</div>
            <div className="rrcb">
              <div className="rrcv">{maskBalance(`$${(summary?.lockedRemaining ?? 0).toFixed(2)}`)}</div>
              <button className="cbtn" disabled title="Locked commissions unlock automatically on-chain">
                LOCKED
              </button>
            </div>
          </div>
        </>
      )}

      <div className="ratl">Platform Activity</div>
      <div className="atabs">
        <div className={`at ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
          All Feeds
        </div>
        <div className={`at ${activeTab === "bids" ? "active" : ""}`} onClick={() => setActiveTab("bids")}>
          Bids
        </div>
        <div className={`at ${activeTab === "sales" ? "active" : ""}`} onClick={() => setActiveTab("sales")}>
          Sales
        </div>
      </div>
      <div id="activityFeed">
        <div className="arow arow-new">
          <div className="adot">🎨</div>
          <div className="ainf">
            <div className="an">Bored Ape Yacht Club #3362</div>
            <div className="aa" style={{ color: "var(--green)" }}>
              BID PLACED · 2.5 ETH
            </div>
          </div>
          <div className="atm">2m</div>
        </div>
        <div className="arow">
          <div className="adot">💎</div>
          <div className="ainf">
            <div className="an">Pudgy Penguins #8721</div>
            <div className="aa" style={{ color: "var(--green)" }}>
              SALE · 4.2 ETH
            </div>
          </div>
          <div className="atm">5m</div>
        </div>
        <div className="arow">
          <div className="adot">🔥</div>
          <div className="ainf">
            <div className="an">Azuki #5234</div>
            <div className="aa" style={{ color: "var(--red)" }}>
              BID DECLINED · 3.1 ETH
            </div>
          </div>
          <div className="atm">12m</div>
        </div>
        <div className="arow">
          <div className="adot">⚡</div>
          <div className="ainf">
            <div className="an">Doodles #1523</div>
            <div className="aa" style={{ color: "var(--green)" }}>
              POOL FUNDED · 1.8 ETH
            </div>
          </div>
          <div className="atm">18m</div>
        </div>
        <div className="arow">
          <div className="adot">🎯</div>
          <div className="ainf">
            <div className="an">CloneX #9841</div>
            <div className="aa" style={{ color: "var(--green)" }}>
              BID PLACED · 5.5 ETH
            </div>
          </div>
          <div className="atm">25m</div>
        </div>
        <div className="arow">
          <div className="adot">💫</div>
          <div className="ainf">
            <div className="an">Moonbirds #2341</div>
            <div className="aa" style={{ color: "var(--green)" }}>
              SALE · 6.7 ETH
            </div>
          </div>
          <div className="atm">32m</div>
        </div>
      </div>
      <a className="vact">View Activity</a>
    </div>
  );

  return (
    <div className="app-shell-root">
      {/* Navigation Bar */}
      <div className="nav">
        <div
          className="nav-brand"
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer"
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#0c0c0e",
              boxShadow: "0 1px 2px rgba(0,0,0,.18)"
            }}
          >
            <img
              src="/assets/images/logoMark.png"
              alt="HNTR"
              style={{
                width: "15px",
                height: "auto",
                display: "block"
              }}
            />
          </span>
          <span
            style={{
              marginLeft: "9px",
              fontFamily: "var(--fd)",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: ".2em"
            }}
          >
            HNTR
          </span>
        </div>
        <div className="nav-r">
          <div className="nav-btn" id="navThemeToggle" title="Light / Dark" onClick={toggleTheme} style={{ cursor: "pointer" }}>
            <svg id="themeIcon" width="14" height="14" viewBox="0 0 16 16" fill="none">
              {isDark ? (
                <path
                  d="M13 10.5A5.5 5.5 0 0 1 6.5 4a5.5 5.5 0 0 0 0 8.5A5.5 5.5 0 0 0 13 10.5z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>
          {!hideRightRail && (
            <div
              className={`nav-btn rail-toggle-btn${railOpen ? " active" : ""}`}
              title={railOpen ? "Close panel" : "Open panel"}
              onClick={toggleRail}
              role="button"
              tabIndex={0}
              aria-expanded={railOpen}
              aria-controls="app-right-rail"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleRail();
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                {railOpen ? (
                  <path
                    d="M4 4l8 8M12 4L4 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <>
                    <rect x="2" y="2.5" width="5" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10 4.5h4M10 8h4M10 11.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </div>
          )}
          <div
            className="nav-btn"
            data-btn="notif"
            onClick={toggleNotifPanel}
            style={{ cursor: "pointer", position: "relative" }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleNotifPanel();
              }
            }}
          >
            <div className="notif-badge" />
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2a3.5 3.5 0 0 1 3.5 3.5c0 3.5 1.5 4.5 1.5 4.5H3s1.5-1 1.5-4.5A3.5 3.5 0 0 1 8 2z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M6.5 12.5a1.5 1.5 0 0 0 3 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div
            className={`conn-pill${walletConnected ? "" : " disconnected"}`}
            id="connPill"
            onClick={toggleWalletPanel}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleWalletPanel();
              }
            }}
          >
            <div className={`conn-dot${walletConnected ? "" : " red"}`} id="connDot" />
            <span id="connLabel">{walletConnected ? WALLET_ADDRESS : "CONNECT"}</span>
          </div>
        </div>
      </div>

      <div className={`wallet-panel${walletPanelOpen ? " open" : ""}`} id="walletPanel">
        <div className="wallet-panel-top">
          <div className="wallet-panel-lbl">Connected Wallet</div>
          <div className="wallet-address-row">
            <div className="wallet-dot" />
            <div className="wallet-address">{WALLET_ADDRESS}</div>
          </div>
        </div>
        <div className="wallet-panel-balance">
          <div className="wallet-balance-lbl">Total Balance</div>
          <div className="wallet-balance-val">
            {balanceData ? Number(formatEther(balanceData.value)).toFixed(4) : "0.0000"}{" "}
            <span style={{ fontSize: "14px", color: "var(--t2)" }}>{balanceData?.symbol || "ETH"}</span>
          </div>
          <div className="wallet-balance-usd">Sepolia testnet balance</div>
        </div>
        <div className="wallet-panel-footer">
          <button className="wallet-disconnect-btn" type="button" onClick={disconnectWallet}>
            DISCONNECT
          </button>
        </div>
      </div>

      <NotificationSystem panelOpen={notifPanelOpen} />

      {!hideRightRail && !isMobileView && (
        <div
          className={`rail-backdrop${railOpen ? " open" : ""}`}
          onClick={closeRail}
          aria-hidden={!railOpen}
        />
      )}

      {/* Main Shell */}
      <div className="shell">
        {/* Left Sidebar */}
        <div
          ref={bottomNavRef}
          className="sb mobile-bottom-nav"
          role="navigation"
          aria-label="Main navigation"
          onClick={onBottomNavClick}
          style={{
            transform: `translateY(${sbTransY}%)`,
            opacity: sbOpacity,
          }}
        >
          <div className="mobile-nav-bar" aria-hidden="true">
            <svg className="mobile-nav-shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true">
              <path ref={navBarPathRef} d={buildNavBarPath(360, 180, false)} />
            </svg>
          </div>
          <div className="mobile-nav-track">
          <Link href="/" className={`si ${currentPage === "home" ? "active" : ""}`} data-page="home">
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 6.5L8 2l6 4.5V14H10v-3H6v3H2V6.5z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="si-label">Home</span>
          </Link>
          
          <Link href="/marketplace" className={`si ${currentPage === "marketplace" ? "active" : ""}`} data-page="marketplace">
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 6.5h12M3.5 6.5V13h9V6.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.5 4l1 2.5h11l1-2.5H1.5z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 6.5V13M9.5 6.5V13"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="si-label">Marketplace</span>
          </Link>
          
          <Link href="/pools" className={`si ${currentPage === "pools" ? "active" : ""}`} data-page="pools">
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <polyline
                  points="2,11 5,7.5 8,9 11,5.5 14,3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="2" y="12" width="2.5" height="2" rx=".5" fill="currentColor" opacity=".5" />
                <rect x="5.5" y="10" width="2.5" height="4" rx=".5" fill="currentColor" opacity=".5" />
                <rect x="9" y="7" width="2.5" height="7" rx=".5" fill="currentColor" opacity=".5" />
                <rect x="12.5" y="5" width="2" height="9" rx=".5" fill="currentColor" opacity=".5" />
              </svg>
            </div>
            <span className="si-label">NFT Strategies</span>
          </Link>
          
          <Link
            href="/collection"
            className={`si ${currentPage === "collection" ? "active" : ""}${!walletConnected ? " locked" : ""}`}
            data-page="collection"
            onClick={lockedNavClick}
            aria-disabled={!walletConnected}
          >
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
                <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".4" />
                <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".4" />
                <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".4" />
              </svg>
            </div>
            <span className="si-label">MY NFTs</span>
            {!walletConnected && (
              <span className="si-lock">
                <svg viewBox="0 0 14 14" fill="none">
                  <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.5 6V4.3a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </span>
            )}
          </Link>
          
          <Link href="/membership" className={`si ${currentPage === "membership" ? "active" : ""}`} data-page="membership">
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1.5 7.5h13" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4.5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="11.5" cy="10.5" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="si-label">Membership</span>
          </Link>
          
          <Link
            href="/network"
            className={`si ${currentPage === "network" ? "active" : ""}${!walletConnected ? " locked" : ""}`}
            data-page="network"
            onClick={lockedNavClick}
            aria-disabled={!walletConnected}
          >
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M2.5 14c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="si-label">Network</span>
            {!walletConnected && (
              <span className="si-lock">
                <svg viewBox="0 0 14 14" fill="none">
                  <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.5 6V4.3a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </span>
            )}
          </Link>
          
          <Link href="/learn" className={`si ${currentPage === "learn" ? "active" : ""}`} data-page="learn">
            <div className="si-icon">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3.2C6.7 2.3 4.9 2 2.8 2.1c-.4 0-.8.4-.8.8v8.3c0 .5.4.9.9.8 2-.1 3.6.2 4.7 1 .3.2.5.2.8 0 1.1-.8 2.7-1.1 4.7-1 .5.1.9-.3.9-.8V2.9c0-.4-.4-.8-.8-.8-2.1-.1-3.9.2-5.2 1.1z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path d="M8 3.4v9.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="si-label">Learn</span>
          </Link>
          
          <div className="si-bot">
            <div className="si-sep" />
            <div className="si">
              <div className="si-icon">
                <svg viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M8 10.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path
                    d="M8 5.5a2 2 0 0 1 2 2c0 1.2-2 2-2 2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="si-label">Support</span>
            </div>
          </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content">
          <div className="page-panel active" id={`panel-${currentPage}`}>
            {children}

            {/* Right Rail — desktop inline; mobile portaled to body */}
            {!hideRightRail && !isMobileView && renderRightRail()}
          </div>
        </div>
      </div>

      {profileAnchor &&
        showMobileProfile &&
        createPortal(
          <div className="mobile-profile-card">{renderProfileCard()}</div>,
          profileAnchor
        )}

      <SignupOverlays />

      {portalMounted &&
        isMobileView &&
        !hideRightRail &&
        createPortal(
          <>
            <div
              className={`rail-backdrop${railOpen ? " open" : ""}`}
              onClick={closeRail}
              aria-hidden={!railOpen}
            />
            {renderRightRail()}
          </>,
          document.body
        )}

      <DepositModal
        open={depositOpen}
        assetName={depositAssetName}
        floorEth={depositFloorEth}
        onClose={closeDepositModal}
      />
      
      {/* Footer */}
      <div className="vault-footer">
        <div>© 2024 HNTR . ART .</div>
        <div style={{ color: "var(--green)", display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green)" }} />
          ● TERMINAL STATUS: OPTIMAL
        </div>
        <div className="footer-links">
          <span className="footer-link">TERMS OF SERVICE</span>
          <span className="footer-link">PRIVACY POLICY</span>
          <span className="footer-link">RISK DISCLOSURE</span>
        </div>
      </div>
    </div>
  );
}
