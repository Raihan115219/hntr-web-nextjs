"use client";

import { useEffect } from "react";

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

function closeSignupFlow() {
  window.closeSignup?.();
  setModalBodyLock(false);
}

function closeMembershipFlow() {
  window.closeMembership?.();
  setModalBodyLock(false);
}

declare global {
  interface Window {
    openSignup?: () => void;
    closeSignup?: () => void;
    closeMembership?: () => void;
    reconnectWallet?: () => void;
    startSignupFx?: (canvas: HTMLCanvasElement | null) => void;
    initSuTiers?: () => void;
    suGoto?: (n: number) => void;
    suSelectTier?: (name: string) => void;
    msCopyRef?: (btn: HTMLButtonElement) => void;
  }
}

export default function SignupOverlays() {
  useEffect(() => {
    const scriptId = "signup-flow-script";
    document.getElementById(scriptId)?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `/assets/js/script-8.js?${Date.now()}`;
    script.async = true;
    script.onload = () => {
      window.initSuTiers?.();
      const nativeClose = window.closeSignup;
      if (nativeClose) {
        window.closeSignup = () => {
          nativeClose();
          if (!document.getElementById("msOverlay")?.classList.contains("open")) {
            setModalBodyLock(false);
          }
        };
      }
    };
    document.body.appendChild(script);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSignupFlow();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      script.remove();
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <div
        id="signupOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSignupFlow();
        }}
      >
        <div className="su-modal" id="suModal" role="dialog" aria-modal="true" aria-label="Sign up">
          <div className="su-step on" id="suStep1">
            <div className="su-head">
              <div className="su-eyebrow">
                Sign up: Step 1 of 3
                <div className="su-prog">
                  <i className="on"></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
              <button className="su-x" type="button" onClick={() => closeSignupFlow()} aria-label="Close">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="su1-body">
              <div className="su1-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 10h18" />
                  <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <div className="su1-title">Connect Wallet</div>
              <div className="su1-sub">
                Access requires a verified cryptographic signature. Connect your wallet to continue.
              </div>
              <button className="su-primary" type="button" onClick={() => window.suGoto?.(2)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M9 1L2 9h5l-1 6 7-8H8l1-6z" fill="currentColor" />
                </svg>
                Connect Wallet
              </button>
            </div>
            <div className="su-foot">
              <span className="lock">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4.5 6V4.3a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Encrypted End-to-End
              </span>
              <span>ID: AUTH_NODE_492</span>
            </div>
          </div>

          <div className="su-step" id="suStep2">
            <div className="su-head">
              <div className="su-eyebrow">
                Sign up: Step 2 of 3
                <div className="su-prog">
                  <i className="on"></i>
                  <i className="on"></i>
                  <i></i>
                </div>
              </div>
              <button className="su-x" type="button" onClick={() => closeSignupFlow()} aria-label="Close">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="su2-body">
              <div className="su2-title">Step 2 of 3: User Information</div>
              <div className="su2-sub">Complete your profile to access the terminal.</div>
              <div className="su-field">
                <label className="su-lbl">Sponsor</label>
                <input className="su-input" defaultValue="@username" disabled />
              </div>
              <div className="su-field">
                <label className="su-lbl">Username / Referral ID</label>
                <input className="su-input" id="suUsername" placeholder="e.g. ALPHA" />
              </div>
              <div className="su-field">
                <label className="su-lbl">Full Name</label>
                <input className="su-input" placeholder="Enter as shown on identification" />
              </div>
              <div className="su-field su-row">
                <div>
                  <label className="su-lbl">Nationality</label>
                  <select className="su-select" defaultValue="">
                    <option value="">Select Region</option>
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>Latin America</option>
                    <option>Middle East</option>
                    <option>Africa</option>
                  </select>
                </div>
                <div>
                  <label className="su-lbl">Phone Number</label>
                  <input className="su-input" placeholder="+00 0000 0000" />
                </div>
              </div>
              <div className="su-field">
                <label className="su-lbl">Email Address</label>
                <input className="su-input" type="email" placeholder="institutional@gmail.com" />
              </div>
              <button className="su-primary" type="button" onClick={() => window.suGoto?.(3)}>
                Continue&nbsp;&nbsp;→
              </button>
            </div>
            <div className="su-foot">
              <span>Encrypted Session ID: 0X8A2…FF01</span>
              <span>End-to-End Security Active</span>
            </div>
          </div>

          <div className="su-step" id="suStep3">
            <div className="su-head">
              <div className="su-eyebrow">
                Sign up: Step 3 of 3
                <div className="su-prog">
                  <i className="on"></i>
                  <i className="on"></i>
                  <i className="on"></i>
                </div>
              </div>
              <button className="su-x" type="button" onClick={() => closeSignupFlow()} aria-label="Close">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="su3-body">
              <div className="su3-intro">
                Choose a Membership tier that aligns with your capital deployment requirements and network expansion
                objectives. All tiers include full terminal access.
              </div>
              <div className="su-tiers" id="suTiers" />
            </div>
            <div className="su-foot" style={{ padding: "16px 30px" }}>
              <button
                className="su-back"
                type="button"
                onClick={() => window.suGoto?.(2)}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Previous Step
              </button>
              <span className="su-status">
                Current Status<b>Onboarding</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        id="msOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMembershipFlow();
        }}
      >
        <div className="ms-modal" role="dialog" aria-modal="true" aria-label="Membership acquired">
          <canvas id="msConfetti" />
          <div className="ms-head">
            <div className="ms-check">
              <div className="dot">
                <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 8.5l2.8 2.8L12.5 5"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="ms-title">MEMBERSHIP ACQUIRED</div>
            <div className="ms-status" id="msStatus">
              RANGER STATUS ACTIVATED
            </div>
          </div>
          <div className="ms-body">
            <div className="ms-pkg-row">
              <span className="ms-pkg-lbl">Package</span>
              <span className="ms-pkg-val" id="msPkg">
                RANGER
              </span>
            </div>
            <div className="ms-grid">
              <div className="ms-cell">
                <div className="ms-cell-lbl">Unilevel</div>
                <div className="ms-cell-val" id="msUni">
                  All Levels Unlocked
                </div>
              </div>
              <div className="ms-cell">
                <div className="ms-cell-lbl">Pool Deposits</div>
                <div className="ms-cell-val" id="msPool">
                  Max Capacity
                </div>
              </div>
            </div>
            <div className="ms-line">
              <span className="ms-line-lbl">Payment Amount</span>
              <span className="ms-line-val" id="msAmt">
                2,500 USDT
              </span>
            </div>
            <div className="ms-line">
              <span className="ms-line-lbl">Status</span>
              <span className="ms-line-val ok">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.3" />
                  <path
                    d="M5.3 8.2l1.8 1.8L11 6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Confirmed
              </span>
            </div>
            <div className="ms-ref">
              <div className="ms-ref-lbl">Your Referral Link</div>
              <div className="ms-ref-box">
                <input id="msRef" readOnly defaultValue="https://hntr.art/join/RANGER" />
                <button
                  className="ms-ref-copy"
                  id="msRefCopy"
                  type="button"
                  onClick={(e) => window.msCopyRef?.(e.currentTarget)}
                >
                  COPY
                </button>
              </div>
            </div>
            <button className="ms-explorer" type="button">
              View Transaction on Explorer
            </button>
          </div>
          <div className="ms-foot">
            <button className="ms-done" type="button" onClick={() => closeMembershipFlow()}>
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
