"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "./types";

type HntrShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function HntrShell({ title, subtitle, children }: HntrShellProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("hntrTheme") : null;
    setDark(saved ? saved === "dark" : true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("hntrTheme", dark ? "dark" : "light");
  }, [dark]);

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader-mark">HNTR</div>
      </div>
    );
  }

  return (
    <div className="hntr-app">
      <header className="top-nav">
        <div className="brand">HNTR</div>
        <div className="top-actions">
          <button className="top-btn" onClick={() => setDark((p) => !p)}>
            {dark ? "Dark" : "Light"}
          </button>
          <div className="wallet-pill">0x71C...492</div>
        </div>
      </header>

      <div className="shell-layout">
        <aside className="left-sidebar">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`side-item ${active ? "active" : ""}`}>
                <span className="side-short">{item.short}</span>
                <span className="side-label">{item.label}</span>
              </Link>
            );
          })}
        </aside>

        <main className="main-area">
          <section className="hero">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </section>
          <section className="content-card">{children}</section>
        </main>

        <aside className="right-rail">
          <div className="rail-card">
            <div className="rail-title">masteraccount</div>
            <div className="rail-sub">Elite Hunter</div>
            <div className="prog-row">
              <span>Current Progress</span>
              <span>74%</span>
            </div>
            <div className="prog">
              <div className="prog-fill" style={{ width: "74%" }} />
            </div>
          </div>
          <div className="rail-card">
            <div className="kpi-label">Total Rewarded</div>
            <div className="kpi-value">$11,955.14</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
