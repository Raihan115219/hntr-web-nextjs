"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import {
  SALE_TOASTS,
  SALE_TOAST_DURATION_MS,
  STANDARD_TOAST_DURATION_MS,
  type SaleToastData,
  type StandardToastData,
} from "../../lib/notification-data";
import {
  formatRelativeTime,
  useMarkNotificationsRead,
  useNotifications,
  type BackendNotification,
} from "../../lib/notifications";

const CHECK_ICON = (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path
      d="M2.5 7l3 3 6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type ActiveToast =
  | { id: string; kind: "standard"; data: StandardToastData; dismissing: boolean }
  | { id: string; kind: "sale"; data: SaleToastData; dismissing: boolean };

function canShowToast() {
  if (typeof document === "undefined") return false;
  if (document.body.classList.contains("intro-active")) return false;
  if (document.body.classList.contains("modal-open")) return false;
  const learnOverlay = document.getElementById("learnOverlay");
  if (learnOverlay && (learnOverlay as HTMLElement).style.display === "block") return false;
  return true;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function toPanelItem(n: BackendNotification) {
  return {
    id: n._id,
    title: n.title,
    sub: n.sub,
    time: formatRelativeTime(n.createdAt),
    read: n.read,
  };
}

function notificationToToast(n: BackendNotification): StandardToastData {
  return {
    title: n.title,
    sub: n.sub,
    link: n.link || "VIEW",
  };
}

type NotificationSystemProps = {
  panelOpen: boolean;
};

export default function NotificationSystem({ panelOpen }: NotificationSystemProps) {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useNotifications(50);
  const markRead = useMarkNotificationsRead();

  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const toastTimers = useRef<Map<string, number>>(new Map());
  const seenIdsRef = useRef<Set<string>>(new Set());
  const hydratedRef = useRef(false);

  const notifications = (data?.notifications || []).map(toPanelItem);
  const unreadCount = data?.unreadCount ?? notifications.filter((item) => !item.read).length;

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }

    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, dismissing: true } : toast))
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 380);
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, durationMs: number) => {
      const existing = toastTimers.current.get(id);
      if (existing) clearTimeout(existing);

      const timer = window.setTimeout(() => dismissToast(id), durationMs);
      toastTimers.current.set(id, timer);
    },
    [dismissToast]
  );

  const pushToast = useCallback(
    (toast: ActiveToast) => {
      if (!canShowToast()) return;

      const entry: ActiveToast = { ...toast, dismissing: false };
      setToasts((current) => [...current, entry]);

      const duration = toast.kind === "sale" ? SALE_TOAST_DURATION_MS : STANDARD_TOAST_DURATION_MS;
      scheduleDismiss(entry.id, duration);
    },
    [scheduleDismiss]
  );

  const showStandardToast = useCallback(
    (data: StandardToastData) => {
      pushToast({
        id: `standard-${Date.now()}-${Math.random()}`,
        kind: "standard",
        data,
        dismissing: false,
      });
    },
    [pushToast]
  );

  const showSaleToast = useCallback(
    (data: SaleToastData) => {
      pushToast({
        id: `sale-${Date.now()}-${Math.random()}`,
        kind: "sale",
        data,
        dismissing: false,
      });
    },
    [pushToast]
  );

  // Toast new backend notifications as they arrive (skip initial hydrate).
  useEffect(() => {
    const list = data?.notifications || [];
    if (!list.length) {
      if (data && !hydratedRef.current) hydratedRef.current = true;
      return;
    }

    if (!hydratedRef.current) {
      list.forEach((n) => seenIdsRef.current.add(n._id));
      hydratedRef.current = true;
      return;
    }

    const fresh = list.filter((n) => !seenIdsRef.current.has(n._id) && !n.read);
    fresh.forEach((n) => {
      seenIdsRef.current.add(n._id);
      if (canShowToast()) showStandardToast(notificationToToast(n));
    });
  }, [data, showStandardToast]);

  // Reset hydrate state when wallet disconnects / changes.
  useEffect(() => {
    hydratedRef.current = false;
    seenIdsRef.current.clear();
  }, [address, isConnected]);

  // Keep demo NFT sale toasts only; standard fake toasts are replaced by backend events.
  useEffect(() => {
    let saleTimer: number | undefined;

    const scheduleSaleToast = () => {
      const delay = 28000 + Math.random() * 20000;
      saleTimer = window.setTimeout(() => {
        if (canShowToast()) showSaleToast(pickRandom(SALE_TOASTS));
        scheduleSaleToast();
      }, delay);
    };

    const firstSale = window.setTimeout(() => {
      if (canShowToast()) showSaleToast(SALE_TOASTS[0]);
      scheduleSaleToast();
    }, 14000 + Math.random() * 6000);

    return () => {
      clearTimeout(firstSale);
      if (saleTimer) clearTimeout(saleTimer);
      toastTimers.current.forEach((timer) => clearTimeout(timer));
      toastTimers.current.clear();
    };
  }, [showSaleToast]);

  useEffect(() => {
    window.showToast = (toastData: StandardToastData) => showStandardToast(toastData);
    return () => {
      delete window.showToast;
    };
  }, [showStandardToast]);

  useEffect(() => {
    document.querySelectorAll(".notif-badge").forEach((badge) => {
      (badge as HTMLElement).style.display = unreadCount > 0 ? "block" : "none";
    });
  }, [unreadCount]);

  const clearNotifications = () => {
    if (!isConnected) return;
    markRead.mutate(undefined);
  };

  const pauseDismiss = (id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  };

  const resumeDismiss = (id: string, kind: ActiveToast["kind"]) => {
    const duration = kind === "sale" ? SALE_TOAST_DURATION_MS : STANDARD_TOAST_DURATION_MS;
    scheduleDismiss(id, duration > 1000 ? 1500 : 800);
  };

  return (
    <>
      <div id="toast-container">
        {toasts.map((toast) =>
          toast.kind === "standard" ? (
            <div
              key={toast.id}
              className={`toast${toast.dismissing ? " out" : ""}`}
              style={{ ["--dur" as string]: `${STANDARD_TOAST_DURATION_MS / 1000}s` }}
              onMouseEnter={() => pauseDismiss(toast.id)}
              onMouseLeave={() => resumeDismiss(toast.id, toast.kind)}
            >
              <div className="toast-icon">{CHECK_ICON}</div>
              <div className="toast-body">
                <div className="toast-title">{toast.data.title}</div>
                <div className="toast-sub">{toast.data.sub}</div>
                <span className="toast-link">{toast.data.link}</span>
              </div>
              <button
                className="toast-close"
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
              >
                ×
              </button>
            </div>
          ) : (
            <div
              key={toast.id}
              className={`toast-sale${toast.dismissing ? " toast-out" : ""}`}
              style={{ ["--toast-dur" as string]: `${SALE_TOAST_DURATION_MS / 1000}s` }}
              onMouseEnter={() => pauseDismiss(toast.id)}
              onMouseLeave={() => resumeDismiss(toast.id, toast.kind)}
            >
              <div className="ts-header">
                <div className="ts-header-title">NFT SUCCESSFULLY SOLD</div>
                <button
                  className="ts-close"
                  type="button"
                  aria-label="Dismiss sale notification"
                  onClick={() => dismissToast(toast.id)}
                >
                  ×
                </button>
              </div>
              <div className="ts-body">
                <img className="ts-nft-img" src={toast.data.img} alt="NFT" />
                <div className="ts-content">
                  <div className="ts-desc">
                    <strong>{toast.data.nft}</strong> has been sold for {toast.data.eth} ETH.
                  </div>
                  <div className="ts-profit">
                    Profit: +{toast.data.profitEth} ETH (~${toast.data.profitUsd})
                  </div>
                </div>
              </div>
              <div className="ts-footer">
                <a className="ts-view-link" href="https://opensea.io" target="_blank" rel="noreferrer">
                  View Sale{" "}
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11h6A1.5 1.5 0 0 0 10 9.5V7M7 1h4m0 0v4m0-4L5.5 6.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          )
        )}
      </div>

      <div className={`notif-panel${panelOpen ? " open" : ""}`} id="notifPanel">
        <div className="notif-panel-hdr">
          <div className="notif-panel-title">Notifications</div>
          <button
            className="notif-clear-btn"
            type="button"
            onClick={clearNotifications}
            disabled={!isConnected || unreadCount === 0 || markRead.isPending}
          >
            Mark all read
          </button>
        </div>
        <div className="notif-list" id="notifList">
          {!isConnected ? (
            <div style={{ textAlign: "center", padding: "24px", fontSize: "11px", color: "var(--t0)" }}>
              Connect your wallet to see notifications
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: "center", padding: "24px", fontSize: "11px", color: "var(--t0)" }}>
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", fontSize: "11px", color: "var(--t0)" }}>
              No notifications
            </div>
          ) : (
            notifications.map((item) => (
              <div className="notif-item" key={item.id}>
                <div className={`notif-dot${item.read ? " read" : ""}`} />
                <div className="notif-item-content">
                  <div className="notif-item-title">{item.title}</div>
                  <div className="notif-item-sub">{item.sub}</div>
                  <div className="notif-item-time">{item.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
