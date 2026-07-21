"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getWebinarShareUrl,
  openShareWindow,
  WEBINAR_SHARE_TITLE,
  type SharePlatform,
} from "../../../lib/webinar-share";

type WebinarShareSheetProps = {
  open: boolean;
  onClose: () => void;
};

const SHARE_OPTIONS: {
  id: SharePlatform | "native" | "copy";
  label: string;
  color: string;
  icon: string;
}[] = [
  { id: "whatsapp", label: "WhatsApp", color: "#25D366", icon: "WA" },
  { id: "facebook", label: "Facebook", color: "#1877F2", icon: "f" },
  { id: "x", label: "X", color: "#0f0f0f", icon: "𝕏" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", icon: "in" },
  { id: "telegram", label: "Telegram", color: "#229ED9", icon: "TG" },
  { id: "copy", label: "Copy Link", color: "#ef6a26", icon: "⎘" },
];

function setModalBodyLock(locked: boolean) {
  document.body.classList.toggle("modal-open", locked);
}

export default function WebinarShareSheet({ open, onClose }: WebinarShareSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState("https://hntr.art/webinar");
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (open) {
      setShareUrl(getWebinarShareUrl());
      setCopied(false);
      setModalBodyLock(true);
      return () => setModalBodyLock(false);
    }
    setModalBodyLock(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleShare = async (id: (typeof SHARE_OPTIONS)[number]["id"]) => {
    if (id === "copy") {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt("Copy this link:", shareUrl);
      }
      return;
    }

    if (id === "native" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: WEBINAR_SHARE_TITLE,
          text: shareUrl,
          url: shareUrl,
        });
        onClose();
      } catch {
        // User cancelled or share unavailable.
      }
      return;
    }

    if (id === "native") return;

    openShareWindow(id, shareUrl);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`web-share-overlay${open ? " open" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-hidden={!open}
    >
      <div className="web-share-sheet" role="dialog" aria-modal="true" aria-label="Share webinar access">
        <div className="web-share-head">
          <div>
            <div className="web-share-title">Share Access</div>
            <div className="web-share-sub">Invite others to join the live HNTR webinar</div>
          </div>
          <button type="button" className="web-share-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="web-share-grid">
          {hasNativeShare ? (
            <button type="button" className="web-share-opt" onClick={() => handleShare("native")}>
              <span className="web-share-icon" style={{ background: "#ef6a26" }}>
                ↗
              </span>
              <span>More Options</span>
            </button>
          ) : null}
          {SHARE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="web-share-opt"
              onClick={() => handleShare(option.id)}
            >
              <span className="web-share-icon" style={{ background: option.color }}>
                {option.id === "copy" && copied ? "✓" : option.icon}
              </span>
              <span>{option.id === "copy" && copied ? "Copied!" : option.label}</span>
            </button>
          ))}
        </div>

        <div className="web-share-link-box">
          <input readOnly value={shareUrl} aria-label="Webinar share link" />
          <button type="button" onClick={() => handleShare("copy")}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="web-share-preview">
          <span className="web-share-preview-lbl">Preview link</span>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
