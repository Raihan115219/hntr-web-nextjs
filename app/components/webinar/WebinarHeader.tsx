"use client";

import { useEffect, useState } from "react";
import { WEBINAR_BASE_VIEWERS } from "../../../lib/webinar-data";
import WebinarLanguageSelector from "./WebinarLanguageSelector";

function formatClock(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDayYear = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", { hour12: false });
  return `${weekday}, ${monthDayYear} · ${time}`;
}

export default function WebinarHeader() {
  const [viewerCount, setViewerCount] = useState(WEBINAR_BASE_VIEWERS);
  const [clock, setClock] = useState("—");

  useEffect(() => {
    const updateClock = () => setClock(formatClock(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setViewerCount((count) => count + Math.floor(Math.random() * 60 - 25));
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="wv-head">
      <div className="wv-head-left">
        <div className="wv-headbrand">
          HNTR <span>| LIVE WEBINAR</span>
        </div>
        <div className="wv-head-l">
          <span className="wv-live">
            <span className="wv-live-dot" />
            LIVE
          </span>
          <span className="wv-vpill" id="wvViewers">
            <span className="wv-vdot" />
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path
                d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <b id="wvVcount">{viewerCount.toLocaleString()}</b> watching
          </span>
          <span className="wv-timer">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 4.6V8l2.4 1.6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span id="wvClock">{clock}</span>
          </span>
        </div>
      </div>
      <WebinarLanguageSelector />
    </div>
  );
}
