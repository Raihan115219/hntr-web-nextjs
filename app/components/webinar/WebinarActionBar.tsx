"use client";

import { useState } from "react";
import WebinarShareSheet from "./WebinarShareSheet";

export default function WebinarActionBar() {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="web-actbar">
        <button type="button" className="web-act" onClick={() => setShareOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.8 7l4.4-2.5M5.8 9l4.4 2.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Share Access
        </button>
        <div className="web-act-sep" />
        <div className="web-act">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M2 8h12M8 2c1.8 1.6 2.8 3.7 2.8 6S9.8 12.4 8 14C6.2 12.4 5.2 10.3 5.2 8S6.2 3.6 8 2z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
          English (US)
        </div>
        <div className="web-act-sep" />
        <div className="web-act">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M4 7.5h2M4 10h5M9 7.5h3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Subtitles ON
        </div>
        <button type="button" className="web-deck">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2v8M5 7l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          PRESENTATION DECK
        </button>
      </div>

      <WebinarShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
