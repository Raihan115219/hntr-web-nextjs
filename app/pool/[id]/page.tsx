"use client";

import MainLayout from "../../components/MainLayout";
import { getPoolById, OTHER_POOLS, type PoolDetail } from "../../../lib/pools-data";
import { DEPOSIT_CTA_LABEL } from "../../../lib/deposit-modal";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

type TxRow = {
  id: string;
  wallet: string;
  date: string;
  amount: string;
  isNew?: boolean;
};

const WALLETS = ["0x71C...492", "0x3A8...12D", "0x9FE...88A", "0x12C...55B", "0xB4D...F31"];
const AMOUNTS = ["0.50 ETH", "0.85 ETH", "1.25 ETH", "2.10 ETH", "3.40 ETH"];
const DATES = ["Jun 14, 2026", "Jun 12, 2026", "Jun 10, 2026", "Jun 08, 2026"];

function makeTxRow(isNew = false): TxRow {
  return {
    id: `${Date.now()}-${Math.random()}`,
    wallet: WALLETS[Math.floor(Math.random() * WALLETS.length)],
    date: DATES[Math.floor(Math.random() * DATES.length)],
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    isNew,
  };
}

function PoolDetailView({ pool }: { pool: PoolDetail }) {
  const router = useRouter();
  const [shareCopied, setShareCopied] = useState(false);
  const [txRows, setTxRows] = useState<TxRow[]>(() => Array.from({ length: 4 }, () => makeTxRow()));
  const [txCount, setTxCount] = useState(1244);

  useEffect(() => {
    document.body.dataset.page = "pooldetail";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTxRows((rows) => {
        const next = [makeTxRow(true), ...rows].slice(0, 4);
        return next;
      });
      setTxCount((count) => count + 1);
    }, 2500 + Math.random() * 2000);

    return () => clearInterval(timer);
  }, []);


  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/pools");
  };

  const copyShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = url;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      } catch {
        return;
      }
    }
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1000);
  };

  return (
    <MainLayout>
      <div className="pool-detail-page">
      <div className="feed pool-detail-scroll" id="feed-pooldetail">
        <div className="breadcrumb">
          <div className="bc-head">
            <button className="bc-back" type="button" onClick={goBack} aria-label="Back to pools">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 3.5 5.5 8l4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="bc-title">Pools Details</div>
          </div>
          <div className="bc-sub">
            Item: <span>{pool.name} Details</span>
          </div>
        </div>

        <div className="detail-card">
          <div className="pool-detail-top">
            <img className="pool-detail-img" src={pool.img} alt="Pool NFT" />
            <div className="pool-detail-info">
              <div className="pool-meta-row">
                <span className="pool-meta-id">ID: {pool.metaId}</span>
                <div className="pool-meta-links">
                  <span className="pool-meta-link">{pool.shortName}</span>
                  <span style={{ color: "var(--t0)" }}>|</span>
                  <span className="pool-meta-link">{pool.series}</span>
                </div>
                <div className="pool-share-btns">
                  <button
                    className="share-btn"
                    type="button"
                    aria-label="Copy pool link"
                    onClick={copyShareLink}
                    style={shareCopied ? { color: "var(--green)" } : undefined}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M5.8 7.1l4.4-2.2M5.8 8.9l4.4 2.2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button className="share-btn" type="button" aria-label="Open external">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 8h8M8 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="pool-name">{pool.name}</div>
              <div className="pool-stats-pair">
                <div className="psp">
                  <div className="psp-lbl">Target Price</div>
                  <div className="psp-val">
                    {pool.target} <span className="eth-ic"></span>
                  </div>
                </div>
                <div className="psp">
                  <div className="psp-lbl">Community Raised</div>
                  <div className="psp-val">
                    {pool.raised} <span className="eth-ic"></span>
                  </div>
                </div>
              </div>
              <div className="progress-wrap">
                <div className="progress-header">
                  <span className="progress-label">Community Raised</span>
                  <span className="progress-val">
                    {pool.raised} / {pool.target} ETH ({pool.progress}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pool.progress}%` }}></div>
                </div>
              </div>
              <button className="deposit-btn pool-detail-deposit-inline" type="button" disabled>
                {DEPOSIT_CTA_LABEL}
              </button>
              <div className="deposit-note pool-detail-deposit-note">
                Liquidity locked until pool target or timeout ({pool.daysRemaining}d remaining)
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-strip">
          <div className="metric">
            <div className="metric-lbl">GP (Gross Profit)</div>
            <div className="metric-val">{pool.gpProfit}</div>
            <div className="metric-chg">{pool.gpChange}</div>
          </div>
          <div className="metric">
            <div className="metric-lbl">ETH Profit</div>
            <div className="metric-val">{pool.ethProfit}</div>
            <div className="metric-chg pos">{pool.ethChange}</div>
          </div>
          <div className="metric">
            <div className="metric-lbl">USDT Profit</div>
            <div className="metric-val">{pool.usdtProfit}</div>
            <div className="metric-chg" style={{ color: "var(--t0)" }}>
              {pool.usdtNote}
            </div>
          </div>
          <div className="metric">
            <div className="metric-lbl">Participants</div>
            <div className="metric-val">{pool.participants}</div>
            <div className="participants-wrap">
              {[0, 1, 2].map((i) => (
                <div className="p-avatar" key={i}>
                  <img src={pool.avatarImg} alt="" />
                </div>
              ))}
              <span className="p-more">+{pool.participants - 3}</span>
            </div>
          </div>
        </div>

        <div className="section-hdr">
          <div className="section-title">Transaction Activity</div>
          <div className="section-actions">
            <button className="act-btn" type="button">
              Export CSV
            </button>
            <button className="act-btn" type="button">
              Filters
            </button>
          </div>
        </div>
        <div className="tx-table-wrap table-scroll">
          <table className="tx-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="txTable">
              {txRows.map((row) => (
                <tr key={row.id} className={row.isNew ? "row-new" : undefined}>
                  <td className="td-wallet">{row.wallet}</td>
                  <td>
                    <span className="td-badge">POOL_DEPOSIT</span>
                  </td>
                  <td className="td-date">{row.date}</td>
                  <td className="td-amount">{row.amount}</td>
                  <td>
                    <span className="td-action">View Transaction</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <div className="pg-info" id="pgInfo">
              Showing 1-4 of {txCount.toLocaleString()} entries
            </div>
            <div className="pg-btns">
              <button className="pg-btn pg-arrow" type="button" aria-label="Previous page">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline
                    points="7,2 3,5 7,8"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="pg-btn active" type="button">
                1
              </button>
              <button className="pg-btn" type="button">
                2
              </button>
              <button className="pg-btn" type="button">
                3
              </button>
              <button className="pg-btn pg-arrow" type="button" aria-label="Next page">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline
                    points="3,2 7,5 3,8"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="section-hdr" style={{ marginTop: "16px" }}>
          <div className="section-title">Other Available Pools</div>
        </div>
        <div className="carousel-outer">
          <div className="carousel-track" id="carouselTrack">
            {[...OTHER_POOLS, ...OTHER_POOLS].map((item, i) => (
              <div className="pool-thumb" key={`${item.name}-${i}`}>
                <div className="pool-thumb-art">{item.emoji}</div>
                <div className="pool-thumb-info">
                  <div className="pt-name">{item.name}</div>
                  <div className="pt-activity">Activity: {item.activity}</div>
                  <div className="pt-view" onClick={() => router.push("/pool/54587")} role="link" tabIndex={0}>
                    View →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pool-detail-deposit-bar">
        <button className="deposit-btn pool-detail-deposit-fixed" type="button" disabled>
          {DEPOSIT_CTA_LABEL}
        </button>
      </div>
      </div>
    </MainLayout>
  );
}

export default function PoolDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "54587";
  const pool = getPoolById(id);

  return <PoolDetailView pool={pool} key={pool.id} />;
}
