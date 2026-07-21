"use client";

import MainLayout from "../components/MainLayout";
import PoolsHeroBanner from "../components/PoolsHeroBanner";
import { openDepositModal } from "../../lib/deposit-modal";
import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

type ActivityRow = {
  id: string;
  wallet: string;
  amount: string;
  collection: string;
  color: string;
  pct: number;
  isNew?: boolean;
};

const ACT_WALLETS = ["0x71C...492", "0x3A8...12D", "0x9FE...88A", "0x12C...55B", "0xB4D...F31"];
const ACT_COLLECTIONS = [
  { name: "Bored Ape Yacht Club", color: "var(--olive)" },
  { name: "CryptoPunks", color: "var(--sage)" },
  { name: "Pudgy Penguins", color: "#c8b99a" },
  { name: "Azuki", color: "#9e7a6a" },
  { name: "Doodles", color: "#8a9e82" },
];
const ACT_AMOUNTS = ["0.50 ETH", "0.85 ETH", "1.25 ETH", "2.10 ETH", "3.40 ETH"];
const ACT_PERCENTS = [35, 40, 55, 62, 75, 80, 88];

const INITIAL_ACTIVITY: ActivityRow[] = [
  { id: "1", wallet: "0x3A8...12D", amount: "3.40 ETH", collection: "Bored Ape Yacht Club", color: "var(--olive)", pct: 55 },
  { id: "2", wallet: "0x12C...55B", amount: "3.40 ETH", collection: "Bored Ape Yacht Club", color: "var(--olive)", pct: 75 },
  { id: "3", wallet: "0x71C...492", amount: "2.10 ETH", collection: "Bored Ape Yacht Club", color: "var(--olive)", pct: 35 },
  { id: "4", wallet: "0x9FE...88A", amount: "3.40 ETH", collection: "CryptoPunks", color: "var(--sage)", pct: 62 },
  { id: "5", wallet: "0xB4D...F31", amount: "2.10 ETH", collection: "Bored Ape Yacht Club", color: "var(--olive)", pct: 55 },
  { id: "6", wallet: "0xB4D...F31", amount: "0.85 ETH", collection: "Doodles", color: "#8a9e82", pct: 40 },
];

function makeActivityRow(isNew = false): ActivityRow {
  const collection = ACT_COLLECTIONS[Math.floor(Math.random() * ACT_COLLECTIONS.length)];
  return {
    id: `${Date.now()}-${Math.random()}`,
    wallet: ACT_WALLETS[Math.floor(Math.random() * ACT_WALLETS.length)],
    amount: ACT_AMOUNTS[Math.floor(Math.random() * ACT_AMOUNTS.length)],
    collection: collection.name,
    color: collection.color,
    pct: ACT_PERCENTS[Math.floor(Math.random() * ACT_PERCENTS.length)],
    isNew,
  };
}

export default function PoolsPage() {
  const router = useRouter();
  const [expandedPool, setExpandedPool] = useState<number | null>(null);
  const [activityRows, setActivityRows] = useState<ActivityRow[]>(INITIAL_ACTIVITY);
  const [progWidths, setProgWidths] = useState<Record<string, number>>({});

  const goToPool = (poolId: number) => {
    router.push(`/pool/${poolId === 1 ? "54587" : poolId}`);
  };

  const pools = [
    {
      id: 1,
      name: "Bored Ape Yacht Club",
      number: "#0291",
      img: "/assets/images/image-6.jpg",
      tags: ["YUGA LABS", "SERIES 1/10000"],
      target: "10.00",
      raised: "4.52",
      targetUsd: "$21,975.20",
      raisedUsd: "$9,932.79",
      progress: 45.2,
      gpProfit: "2.40%",
      ethProfit: "1.20",
      usdtProfit: "$2,640",
      users: 168,
    },
    {
      id: 2,
      name: "CryptoPunks",
      number: "#7804",
      img: "/assets/images/image-12.png",
      tags: ["LARVA LABS", "SERIES 1/10000"],
      target: "31.00",
      raised: "22.30",
      targetUsd: "$68,123.12",
      raisedUsd: "$49,004.70",
      progress: 71.9,
      gpProfit: "3.10%",
      ethProfit: "2.45",
      usdtProfit: "$5,385",
      users: 245,
    },
    {
      id: 3,
      name: "Pudgy Penguins",
      number: "#0291",
      img: "/assets/images/image-10.jpg",
      tags: ["IGLOO", "SERIES 1/8888"],
      target: "5.45",
      raised: "2.73",
      targetUsd: "$11,976.48",
      raisedUsd: "$5,999.23",
      progress: 50.1,
      gpProfit: "2.40%",
      ethProfit: "1.06",
      usdtProfit: "$2,330",
      users: 211,
    },
    {
      id: 4,
      name: "Azuki",
      number: "#4471",
      img: "/assets/images/image-11.jpg",
      tags: ["CHIRU LABS", "SERIES 1/10000"],
      target: "1.42",
      raised: "0.32",
      targetUsd: "$3,120.48",
      raisedUsd: "$703.21",
      progress: 22.5,
      gpProfit: "2.10%",
      ethProfit: "0.68",
      usdtProfit: "$1,495",
      users: 129,
    },
  ];

  const togglePool = (id: number) => {
    setExpandedPool(expandedPool === id ? null : id);
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    activityRows.forEach((row, i) => {
      timers.push(
        setTimeout(() => {
          setProgWidths((prev) => {
            if (prev[row.id] !== undefined) return prev;
            return { ...prev, [row.id]: row.pct };
          });
        }, row.isNew ? 100 : 200 + i * 100)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [activityRows]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        const newRow = makeActivityRow(true);
        setActivityRows((prev) => [newRow, ...prev].slice(0, 6));
        scheduleNext();
      }, 2500 + Math.random() * 2500);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <MainLayout>
      <div className="feed" id="feed-pools">
        <div className="page-body">
          <PoolsHeroBanner />

          {/* STAT STRIP */}
          <div className="stat-strip">
            <div className="ss">
              <div className="ss-lbl">Total ETH Raised</div>
              <div className="ss-val">
                12.4 <span className="eth-ic"></span>
              </div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                ≈ $28,520
              </div>
            </div>
            <div className="ss">
              <div className="ss-lbl">NFT Strategy Available</div>
              <div className="ss-val">
                14 <span className="ss-unit">Pools</span>
              </div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                —
              </div>
            </div>
            <div className="ss">
              <div className="ss-lbl">Avg. LTV</div>
              <div className="ss-val">
                42.8<span className="ss-unit">%</span>
              </div>
              <div className="ss-chg" style={{ color: "var(--t0)" }}>
                Collateral ratio
              </div>
            </div>
            <div className="ss">
              <div className="ss-lbl">Total Users</div>
              <div className="ss-val">2,193</div>
              <div className="ss-chg" style={{ color: "var(--green)" }}>
                ↑ +2.4%
              </div>
            </div>
          </div>

          {/* RUNNING POOLS */}
          <div className="section-hdr">
            <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              CURRENT LIVE STRATEGIES
              <span
                className="live-dot"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#34d399",
                  boxShadow: "0 0 8px rgba(52,211,153,.8)",
                  flexShrink: 0,
                }}
              ></span>
            </div>
            <div className="manage-link">Manage All</div>
          </div>

          <div className="np-grid">
            {pools.map((pool) => (
              <div key={pool.id} className="npc">
                <div className="npc-row">
                    <div className="npc-art" onClick={() => goToPool(pool.id)} style={{ cursor: "pointer" }}>
                    <img src={pool.img} alt={pool.name} />
                    <div className="npc-pool">POOL #{pool.number}</div>
                  </div>
                  <div className="npc-body">
                    <div className="npc-head">
                      <div>
                        <div className="npc-name">
                          {pool.name} <span>{pool.number}</span>
                        </div>
                        <div className="npc-tags">
                          {pool.tags.map((tag, i) => (
                            <span key={i} className="npc-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="npc-insights"
                        onClick={() => goToPool(pool.id)}
                      >
                        <i></i>VIEW INSIGHTS
                      </button>
                    </div>
                    <div className="npc-stats">
                      <div>
                        <div className="npc-sl">Pool Target</div>
                        <div className="npc-sv">
                          {pool.target}
                          <span className="eth-ic"></span>
                        </div>
                        <div className="npc-su">{pool.targetUsd}</div>
                      </div>
                      <div>
                        <div className="npc-sl">Community Raised</div>
                        <div className="npc-sv raised">
                          {pool.raised}
                          <span className="eth-ic"></span>
                        </div>
                        <div className="npc-su">{pool.raisedUsd}</div>
                      </div>
                    </div>
                    <div className="npc-prog">
                      <div className="npc-pr">
                        <span>POOL PROGRESS</span>
                        <span className="pct">{Math.round(pool.progress)}%</span>
                      </div>
                      <div className="npc-pb">
                        <div className="npc-pf" style={{ width: `${pool.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="npc-act">
                      <button className="npc-btn-d" onClick={() => togglePool(pool.id)}>
                        <span className="car">{expandedPool === pool.id ? "▴" : "▾"}</span>
                        Pool Details
                      </button>
                      <button
                        className="npc-btn-p"
                        type="button"
                        onClick={() => openDepositModal(`${pool.name} ${pool.number}`, pool.target)}
                      >
                        Make a Deposit Now
                      </button>
                    </div>
                  </div>
                </div>
                <div className="npc-detail">
                  <div className="npc-detail-in">
                    <div className="npc-db">
                      <div className="npc-dl">GP Profit</div>
                      <div className="npc-dv">{pool.gpProfit}</div>
                    </div>
                    <div className="npc-db">
                      <div className="npc-dl">ETH Profit</div>
                      <div className="npc-dv">
                        {pool.ethProfit} <span className="eth-ic"></span>
                      </div>
                    </div>
                    <div className="npc-db">
                      <div className="npc-dl">USDT Profit</div>
                      <div className="npc-dv">{pool.usdtProfit}</div>
                    </div>
                    <div className="npc-db">
                      <div className="npc-dl">Users</div>
                      <div className="npc-dv">{pool.users}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* REAL-TIME ACTIVITY */}
          <div className="rt-activity">
            <div className="rta-hdr">
              <div className="rta-title">Real-Time Activity</div>
              <div className="rta-live">
                <div className="rta-dot"></div>Real-Time
              </div>
            </div>
            <div className="table-scroll">
              <table className="act-table">
                <thead>
                  <tr>
                    <th>Wallet</th>
                    <th>Bid Amount</th>
                    <th>Collection</th>
                    <th>Completion</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="actTable">
                  {activityRows.map((row) => (
                    <tr key={row.id} className={row.isNew ? "row-new" : ""}>
                      <td className="td-wallet">{row.wallet}</td>
                      <td className="td-amt">{row.amount}</td>
                      <td>
                        <div className="td-coll">
                          <div className="td-coll-dot" style={{ background: row.color }}></div>
                          <span className="td-coll-name">{row.collection}</span>
                        </div>
                      </td>
                      <td>
                        <div className="td-prog-wrap">
                          <div className="td-prog-bar">
                            <div
                              className="td-prog-fill"
                              style={{ width: `${progWidths[row.id] ?? 0}%` }}
                            ></div>
                          </div>
                          <span className="td-prog-pct">{row.pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="td-action">VIEW TX</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
