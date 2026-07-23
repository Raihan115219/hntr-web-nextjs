"use client";

import MainLayout from "../components/MainLayout";
import CollectionHeroBanner from "../components/CollectionHeroBanner";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  formatFloorPrice,
  formatUsd,
  OPENSEA_COLLECTION_SLUGS,
  useOpenSeaCollections,
} from "@/lib/opensea";

const RING_CIRC = 201.06;
const LISTING_SRC_LOGOS = [
  "/assets/hntr-src/logo-opensea.png",
  "/assets/hntr-src/logo-blur.png",
] as const;

type CoOwnedNft = {
  id: number;
  name: string;
  tokenId: string;
  img: string;
  pool: string;
  sharePct: number;
  listedPrice: string;
  listedUsd: string;
  myShare: string;
  myShareUsd: string;
  profit: string;
  status: string;
  delay: string;
};

type PosView = "listed" | "sold" | "progress";

type ListedRow = {
  src: string;
  coll: string;
  token: string;
  price: string;
  priceUsd: string;
  apr: string;
  profit: string;
  profitUsd: string;
};

type SoldRow = ListedRow & {
  bought: string;
  boughtUsd: string;
  sold: string;
  soldUsd: string;
  neg?: boolean;
};

type ProgressRow = {
  src: string;
  coll: string;
  token: string;
  target: string;
  targetUsd: string;
  raised: string;
  raisedUsd: string;
  pct: number;
  apr: string;
  dep: string;
  depUsd: string;
};

const CO_OWNED_NFTS: CoOwnedNft[] = [
  {
    id: 1,
    name: "Bored Ape Yacht Club",
    tokenId: "#6722",
    img: "/assets/images/coll-nc-1.jpg",
    pool: "POOL #842",
    sharePct: 22,
    listedPrice: "33.54",
    listedUsd: "$74,794",
    myShare: "2.9",
    myShareUsd: "$6,467",
    profit: "10%",
    status: "Listed",
    delay: "0.00s",
  },
  {
    id: 2,
    name: "Bored Ape Yacht Club",
    tokenId: "#6722",
    img: "/assets/images/coll-nc-2.jpg",
    pool: "POOL #842",
    sharePct: 10,
    listedPrice: "57.69",
    listedUsd: "$128,649",
    myShare: "3.64",
    myShareUsd: "$8,117",
    profit: "10%",
    status: "Listed",
    delay: "0.04s",
  },
  {
    id: 3,
    name: "Bored Ape Yacht Club",
    tokenId: "#6722",
    img: "/assets/images/coll-nc-1.jpg",
    pool: "POOL #842",
    sharePct: 82,
    listedPrice: "40.9",
    listedUsd: "$91,207",
    myShare: "5.23",
    myShareUsd: "$11,663",
    profit: "10%",
    status: "Listed",
    delay: "0.08s",
  },
  {
    id: 4,
    name: "Bored Ape Yacht Club",
    tokenId: "#6722",
    img: "/assets/images/coll-nc-3.jpg",
    pool: "POOL #842",
    sharePct: 29,
    listedPrice: "27.85",
    listedUsd: "$62,106",
    myShare: "2.23",
    myShareUsd: "$4,973",
    profit: "10%",
    status: "Listed",
    delay: "0.12s",
  },
  {
    id: 5,
    name: "Bored Ape Yacht Club",
    tokenId: "#6723",
    img: "/assets/images/coll-nc-4.jpg",
    pool: "POOL #842",
    sharePct: 5,
    listedPrice: "36.57",
    listedUsd: "$81,551",
    myShare: "0.94",
    myShareUsd: "$2,096",
    profit: "10%",
    status: "Listed",
    delay: "0.16s",
  },
  {
    id: 6,
    name: "Bored Ape Yacht Club",
    tokenId: "#6723",
    img: "/assets/images/coll-nc-5.jpg",
    pool: "POOL #842",
    sharePct: 15,
    listedPrice: "17.28",
    listedUsd: "$38,534",
    myShare: "5.46",
    myShareUsd: "$12,176",
    profit: "10%",
    status: "Listed",
    delay: "0.20s",
  },
  {
    id: 7,
    name: "Bored Ape Yacht Club",
    tokenId: "#6723",
    img: "/assets/images/coll-nc-1.jpg",
    pool: "POOL #842",
    sharePct: 31,
    listedPrice: "45.17",
    listedUsd: "$100,729",
    myShare: "1.31",
    myShareUsd: "$2,921",
    profit: "10%",
    status: "Listed",
    delay: "0.24s",
  },
  {
    id: 8,
    name: "Bored Ape Yacht Club",
    tokenId: "#6723",
    img: "/assets/images/coll-nc-2.jpg",
    pool: "POOL #842",
    sharePct: 44,
    listedPrice: "43.49",
    listedUsd: "$96,983",
    myShare: "4.32",
    myShareUsd: "$9,634",
    profit: "10%",
    status: "Listed",
    delay: "0.28s",
  },
];

const POS_HEADS: Record<PosView, string[]> = {
  listed: ["Source", "Collection", "Price Listed", "APR", "My Profit", "Action", "View NFT"],
  sold: ["Source", "Collection", "Bought Price", "Sold Price", "My Profit", "Action", "View NFT"],
  progress: ["Source", "Collection", "ETH Target", "Raised", "APR", "My Deposit", "View NFT"],
};

const POS_DATA: {
  listed: ListedRow[];
  sold: SoldRow[];
  progress: ProgressRow[];
} = {
  listed: [
    {
      src: "OpenSea",
      coll: "Bored Ape Yacht Club",
      token: "#6722",
      price: "42.50 ETH",
      priceUsd: "$61,750",
      apr: "12.4%",
      profit: "+5.30 ETH",
      profitUsd: "+$7,700",
    },
    {
      src: "Blur",
      coll: "CryptoPunks",
      token: "#3100",
      price: "58.20 ETH",
      priceUsd: "$84,540",
      apr: "9.8%",
      profit: "+5.70 ETH",
      profitUsd: "+$8,280",
    },
    {
      src: "OpenSea",
      coll: "Azuki",
      token: "#4412",
      price: "6.40 ETH",
      priceUsd: "$9,300",
      apr: "18.2%",
      profit: "+1.16 ETH",
      profitUsd: "+$1,685",
    },
    {
      src: "LooksRare",
      coll: "Pudgy Penguins",
      token: "#1845",
      price: "12.10 ETH",
      priceUsd: "$17,580",
      apr: "14.6%",
      profit: "+1.77 ETH",
      profitUsd: "+$2,570",
    },
    {
      src: "OpenSea",
      coll: "Doodles",
      token: "#9021",
      price: "4.85 ETH",
      priceUsd: "$7,045",
      apr: "21.0%",
      profit: "+1.02 ETH",
      profitUsd: "+$1,480",
    },
  ],
  sold: [
    {
      src: "OpenSea",
      coll: "Bored Ape Yacht Club",
      token: "#5821",
      price: "",
      priceUsd: "",
      apr: "",
      bought: "38.00 ETH",
      boughtUsd: "$55,200",
      sold: "44.20 ETH",
      soldUsd: "$64,220",
      profit: "+6.20 ETH",
      profitUsd: "+$9,020",
    },
    {
      src: "Blur",
      coll: "CryptoPunks",
      token: "#2204",
      price: "",
      priceUsd: "",
      apr: "",
      bought: "52.00 ETH",
      boughtUsd: "$75,560",
      sold: "58.20 ETH",
      soldUsd: "$84,540",
      profit: "+6.20 ETH",
      profitUsd: "+$8,980",
    },
    {
      src: "OpenSea",
      coll: "Azuki",
      token: "#3318",
      price: "",
      priceUsd: "",
      apr: "",
      bought: "7.10 ETH",
      boughtUsd: "$10,315",
      sold: "6.40 ETH",
      soldUsd: "$9,300",
      profit: "-0.70 ETH",
      profitUsd: "-$1,015",
      neg: true,
    },
    {
      src: "LooksRare",
      coll: "Moonbirds",
      token: "#7740",
      price: "",
      priceUsd: "",
      apr: "",
      bought: "9.50 ETH",
      boughtUsd: "$13,800",
      sold: "11.80 ETH",
      soldUsd: "$17,145",
      profit: "+2.30 ETH",
      profitUsd: "+$3,345",
    },
    {
      src: "OpenSea",
      coll: "Pudgy Penguins",
      token: "#1102",
      price: "",
      priceUsd: "",
      apr: "",
      bought: "10.00 ETH",
      boughtUsd: "$14,530",
      sold: "12.10 ETH",
      soldUsd: "$17,580",
      profit: "+2.10 ETH",
      profitUsd: "+$3,050",
    },
  ],
  progress: [
    {
      src: "POOL-0481",
      coll: "Bored Ape Yacht Club",
      token: "#6722",
      target: "50.00 ETH",
      targetUsd: "$72,650",
      raised: "42.50 ETH",
      raisedUsd: "$61,750",
      pct: 85,
      apr: "12.4%",
      dep: "5.00 ETH",
      depUsd: "$7,265",
    },
    {
      src: "POOL-0477",
      coll: "CryptoPunks",
      token: "#3100",
      target: "60.00 ETH",
      targetUsd: "$87,180",
      raised: "33.00 ETH",
      raisedUsd: "$47,950",
      pct: 55,
      apr: "9.8%",
      dep: "8.20 ETH",
      depUsd: "$11,915",
    },
    {
      src: "POOL-0492",
      coll: "Azuki",
      token: "#4412",
      target: "8.00 ETH",
      targetUsd: "$11,624",
      raised: "7.20 ETH",
      raisedUsd: "$10,460",
      pct: 90,
      apr: "18.2%",
      dep: "1.50 ETH",
      depUsd: "$2,180",
    },
    {
      src: "POOL-0468",
      coll: "Doodles",
      token: "#9021",
      target: "6.00 ETH",
      targetUsd: "$8,718",
      raised: "2.40 ETH",
      raisedUsd: "$3,487",
      pct: 40,
      apr: "21.0%",
      dep: "0.60 ETH",
      depUsd: "$872",
    },
    {
      src: "POOL-0455",
      coll: "Pudgy Penguins",
      token: "#1845",
      target: "15.00 ETH",
      targetUsd: "$21,795",
      raised: "10.90 ETH",
      raisedUsd: "$15,838",
      pct: 73,
      apr: "14.6%",
      dep: "3.00 ETH",
      depUsd: "$4,359",
    },
  ],
};

const POS_TOTALS: Record<PosView, string> = {
  listed: "847",
  sold: "312",
  progress: "85",
};

const COLLECTIONS = Object.entries(OPENSEA_COLLECTION_SLUGS).map(
  ([name]) => ({ name, count: 0, checked: true })
);

function PosVal({ eth, usd }: { eth: string; usd: string }) {
  return (
    <>
      <div className="pos-val">{eth}</div>
      <div className="pos-val-sub">{usd}</div>
    </>
  );
}

type PosMobileCell = { k: string; v: string; color: string };

function getPosMobileMeta(row: ListedRow | SoldRow | ProgressRow, view: PosView) {
  if (view === "listed") {
    const r = row as ListedRow;
    return {
      src: r.src,
      coll: r.coll,
      token: r.token,
      statusDot: "#ec7a2c",
      cells: [
        { k: "Price Listed", v: r.price, color: "var(--t4)" },
        { k: "APR", v: r.apr, color: "var(--green)" },
        { k: "My Profit", v: r.profit, color: "var(--green)" },
      ] as PosMobileCell[],
      hasBar: false,
      pct: "",
    };
  }

  if (view === "sold") {
    const r = row as SoldRow;
    return {
      src: r.src,
      coll: r.coll,
      token: r.token,
      statusDot: "var(--red)",
      cells: [
        { k: "Bought", v: r.bought, color: "var(--t4)" },
        { k: "Sold", v: r.sold, color: "var(--t4)" },
        { k: "My Profit", v: r.profit, color: r.neg ? "var(--red)" : "var(--green)" },
      ] as PosMobileCell[],
      hasBar: false,
      pct: "",
    };
  }

  const r = row as ProgressRow;
  return {
    src: r.src,
    coll: r.coll,
    token: r.token,
    statusDot: "#ec7a2c",
    cells: [
      { k: "ETH Target", v: r.target, color: "var(--t4)" },
      { k: "Raised", v: r.raised, color: "var(--t4)" },
      { k: "APR", v: r.apr, color: "var(--green)" },
      { k: "My Deposit", v: r.dep, color: "var(--t4)" },
    ] as PosMobileCell[],
    hasBar: true,
    pct: `${r.pct}%`,
  };
}

export default function CollectionPage() {
  const router = useRouter();
  const [collections, setCollections] = useState(COLLECTIONS);
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [posView, setPosView] = useState<PosView>("listed");
  const [ringPcts, setRingPcts] = useState<Record<number, number>>({});
  const {
    data: openSeaCollections,
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useOpenSeaCollections();

  const ethUsd = 2900;

  const displayedCollections = useMemo(() => {
    if (!openSeaCollections) return collections;
    return collections.map((c) => {
      const slug = OPENSEA_COLLECTION_SLUGS[c.name as keyof typeof OPENSEA_COLLECTION_SLUGS];
      const stats = openSeaCollections[slug]?.stats;
      return { ...c, count: stats?.nftCount || c.count };
    });
  }, [collections, openSeaCollections]);

  const coOwnedNfts = useMemo<CoOwnedNft[]>(() => {
    if (!openSeaCollections) return CO_OWNED_NFTS;
    const out: CoOwnedNft[] = [];
    for (const [name, slug] of Object.entries(OPENSEA_COLLECTION_SLUGS)) {
      const { stats, nfts } = openSeaCollections[slug] || { stats: null, nfts: [] };
      for (const nft of nfts.slice(0, 2)) {
        const floor = stats?.floorPrice ?? 0;
        const listedEth = floor > 0 ? floor : 0;
        out.push({
          id: out.length + 1,
          name,
          tokenId: `#${nft.tokenId}`,
          img: nft.imageUrl || "",
          pool: "POOL #842",
          sharePct: 22,
          listedPrice: listedEth.toFixed(2),
          listedUsd: formatUsd(listedEth),
          myShare: "2.9",
          myShareUsd: "$6,467",
          profit: "10%",
          status: "Listed",
          delay: `${out.length * 0.04}s`,
        });
      }
    }
    return out.length > 0 ? out : CO_OWNED_NFTS;
  }, [openSeaCollections]);

  useEffect(() => {
    const timers = coOwnedNfts.map((nft, i) =>
      setTimeout(() => {
        setRingPcts((prev) => ({ ...prev, [nft.id]: nft.sharePct }));
      }, 200 + i * 80)
    );
    return () => timers.forEach(clearTimeout);
  }, [coOwnedNfts]);

  const goToPoolDetail = (nftId: number) => {
    router.push(`/pool/${nftId === 1 ? "54587" : nftId}`);
  };

  const toggleCollection = (name: string) => {
    setCollections((prev) =>
      prev.map((c) => (c.name === name ? { ...c, checked: !c.checked } : c))
    );
  };

  const rows = POS_DATA[posView];

  return (
    <MainLayout>
      <div className="feed" id="feed-collection">
        <div className="coll-body">
          <CollectionHeroBanner />

            {/* STAT STRIP */}
            <div className="coll-stats">
              <div className="coll-stat">
                <div className="cs-lbl">NFT Owned</div>
                <div className="cs-val">0</div>
                <div className="cs-sub">NFTs</div>
              </div>
              <div className="coll-stat">
                <div className="cs-lbl">Total Value</div>
                <div className="cs-val">
                  0 <span className="eth-ic"></span>
                </div>
                <div className="cs-sub">$0</div>
              </div>
              <div className="coll-stat">
                <div className="cs-lbl">Unrealized Profit</div>
                <div className="cs-val">
                  0<span className="cs-unit">%</span>
                </div>
                <div className="cs-sub">—</div>
              </div>
              <div className="coll-stat">
                <div className="cs-lbl">Avg. Hold</div>
                <div className="cs-val">0d</div>
                <div className="cs-sub">days</div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="coll-main">
              <div className="vault-left coll-sidebar-panels">
                <div className={`panel panel-collections coll-collections-panel${collectionsOpen ? "" : " collapsed"}`}>
                  <button
                    type="button"
                    className="panel-title panel-title-toggle"
                    onClick={() => setCollectionsOpen((open) => !open)}
                    aria-expanded={collectionsOpen}
                  >
                    Collections
                    <svg
                      className={`panel-chevron${collectionsOpen ? " open" : ""}`}
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <polyline
                        points="2,4 6,8 10,4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></polyline>
                    </svg>
                  </button>
                  <div className="panel-body" hidden={!collectionsOpen}>
                    {displayedCollections.map((coll) => (
                      <div
                        key={coll.name}
                        className="coll-row"
                        onClick={() => toggleCollection(coll.name)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleCollection(coll.name);
                          }
                        }}
                      >
                        <div className={`coll-check${coll.checked ? " checked" : ""}`}></div>
                        <span className="coll-name">{coll.name}</span>
                        <span className="coll-count">
                          {isLoadingCollections && coll.count === 0 ? "..." : coll.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel coll-distribution-panel">
                  <div className="panel-title">My NFT Distribution</div>
                  <div className="dist-bar">
                    <div className="dist-seg" style={{ width: "35%", background: "var(--olive)" }}></div>
                    <div className="dist-seg" style={{ width: "28%", background: "var(--sage)" }}></div>
                    <div className="dist-seg" style={{ width: "37%", background: "var(--beige)" }}></div>
                  </div>
                  <div className="dist-legend">
                    <div className="dist-item">
                      <div className="dist-dot" style={{ background: "var(--olive)" }}></div>
                      PUNKS
                    </div>
                    <div className="dist-item">
                      <div className="dist-dot" style={{ background: "var(--sage)" }}></div>
                      BAYC
                    </div>
                    <div className="dist-item">
                      <div className="dist-dot" style={{ background: "var(--beige)" }}></div>
                      ART
                    </div>
                  </div>
                </div>
              </div>

              <div className="coll-main-right">
                <div className="coll-sh" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div className="coll-sh-title">Current Co-Owned NFTs</div>
                  {isLoadingCollections && <span style={{ color: "var(--t2)", fontSize: "12px" }}>Loading OpenSea…</span>}
                  {collectionsError && (
                    <span style={{ color: "#ff6b6b", fontSize: "12px" }}>
                      OpenSea unavailable — showing fallback data
                    </span>
                  )}
                  {!isLoadingCollections && !collectionsError && openSeaCollections && Object.keys(openSeaCollections).length > 0 && (
                    <span style={{ color: "var(--sage)", fontSize: "12px" }}>Live OpenSea data</span>
                  )}
                </div>

                <div className="nc-grid" id="ncGrid">
                  {isLoadingCollections && coOwnedNfts === CO_OWNED_NFTS && (
                    <div className="nc-loading" style={{ padding: "24px", color: "var(--t2)" }}>
                      Loading live OpenSea data...
                    </div>
                  )}
                  {coOwnedNfts.map((nft, index) => {
                    const animatedPct = ringPcts[nft.id] ?? 0;
                    const ringOffset = RING_CIRC - (animatedPct / 100) * RING_CIRC;

                    return (
                      <div key={nft.id} className="nc" style={{ animationDelay: nft.delay }}>
                        <div className="nc-img-wrap">
                          {nft.img ? (
                            <img className="nc-img" src={nft.img} alt={nft.name} />
                          ) : (
                            <div
                              className="nc-img"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "linear-gradient(135deg, var(--t1) 0%, var(--t2) 100%)",
                                color: "var(--bg)",
                                fontSize: "12px",
                                textAlign: "center",
                                padding: "12px",
                              }}
                            >
                              OpenSea image unavailable
                            </div>
                          )}
                          <div className="nc-pool-tag">{nft.pool}</div>
                          <div className="nc-ring-wrap nc-desktop-only">
                            <svg className="nc-ring-svg" viewBox="0 0 80 80" width="70" height="70">
                              <circle className="nc-ring-bg" cx="40" cy="40" r="32"></circle>
                              <circle
                                className="nc-ring-fill"
                                cx="40"
                                cy="40"
                                r="32"
                                data-pct={nft.sharePct}
                                style={{
                                  strokeDasharray: RING_CIRC,
                                  strokeDashoffset: ringOffset,
                                }}
                              ></circle>
                              <text className="nc-ring-pct" x="40" y="36">
                                {nft.sharePct}%
                              </text>
                              <text className="nc-ring-sub" x="40" y="48">
                                MY SHARE
                              </text>
                            </svg>
                          </div>
                        </div>
                        <div className="nc-body nc-desktop-only">
                          <div className="nc-name">{nft.name}</div>
                          <div className="nc-id">{nft.tokenId}</div>
                          <div className="nc-stats">
                            <div className="nc-stat-col">
                              <div className="nc-sl">Listed Price</div>
                              <div className="nc-sv">
                                {nft.listedPrice} <span className="nc-eth">ETH</span>
                              </div>
                              <div className="nc-sv" style={{ fontSize: "9px", color: "var(--t1)", marginTop: "4px" }}>
                                {nft.listedUsd}
                              </div>
                            </div>
                            <div className="nc-stat-col" style={{ textAlign: "right" }}>
                              <div className="nc-sl">My Share</div>
                              <div className="nc-sv">
                                {nft.myShare} <span className="nc-eth">ETH</span>
                              </div>
                              <div className="nc-sv" style={{ fontSize: "9px", color: "var(--t1)", marginTop: "4px" }}>
                                {nft.myShareUsd}
                              </div>
                            </div>
                          </div>
                          <div className="nc-divider"></div>
                          <div className="nc-footer">
                            <div>
                              <div className="nc-sl">UP PROFIT</div>
                              <div className="nc-profit">{nft.profit}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <div className="nc-status-dot nc-dot-listed"></div>
                              <div className="nc-sl">{nft.status}</div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="nc-view-btn nc-desktop-only"
                          onClick={() => goToPoolDetail(nft.id)}
                        >
                          VIEW DETAILS
                        </button>
                        <div className="nc-mobile-body">
                          <div className="nc-m-name">
                            {nft.name} {nft.tokenId}
                          </div>
                          <div className="nc-m-row">
                            <span className="nc-m-lbl">MY SHARE</span>
                            <span className="nc-m-val">
                              {nft.myShare} ETH
                            </span>
                          </div>
                          <div className="nc-m-bar">
                            <div className="nc-m-fill" style={{ width: `${nft.sharePct}%` }} />
                          </div>
                          <div className="nc-m-row nc-m-owned">
                            <span className="nc-m-lbl">% OWNED</span>
                            <span className="nc-m-pct">{nft.sharePct}%</span>
                          </div>
                          <button
                            type="button"
                            className="nc-m-listing-btn"
                            onClick={() => goToPoolDetail(nft.id)}
                          >
                            <img
                              className="nc-m-listing-icon"
                              src={LISTING_SRC_LOGOS[index % LISTING_SRC_LOGOS.length]}
                              alt=""
                              width={13}
                              height={13}
                            />
                            VIEW LISTING
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="coll-show-more">
                  <button className="coll-show-more-btn">SHOW MORE</button>
                </div>
              </div>
            </div>

            {/* POSITIONS BREAKDOWN */}
            <div className="coll-pos-section">
            <div className="coll-sh coll-sh-positions" style={{ marginTop: "8px" }}>
              <div className="coll-sh-title">All Positions Breakdown</div>
              <div className="pos-toggle">
                <button
                  className={`pos-tab${posView === "listed" ? " active" : ""}`}
                  data-view="listed"
                  onClick={() => setPosView("listed")}
                >
                  <span className="pos-tab-dot"></span>NFTs Listed
                </button>
                <button
                  className={`pos-tab${posView === "sold" ? " active" : ""}`}
                  data-view="sold"
                  onClick={() => setPosView("sold")}
                >
                  <span className="pos-tab-dot"></span>NFTs Sold
                </button>
                <button
                  className={`pos-tab${posView === "progress" ? " active" : ""}`}
                  data-view="progress"
                  onClick={() => setPosView("progress")}
                >
                  <span className="pos-tab-dot"></span>Pools in Progress
                </button>
              </div>
            </div>

            <div className="coll-pos-mobile">
              {rows.map((row) => {
                const meta = getPosMobileMeta(row, posView);
                return (
                  <div key={`${meta.src}-${meta.token}`} className="coll-pos-card">
                    <div className="coll-pos-card-top">
                      <span className="coll-pos-dot" style={{ background: meta.statusDot }} aria-hidden="true" />
                      <div className="coll-pos-main">
                        <div className="coll-pos-name">
                          {meta.coll}{" "}
                          <span className="coll-pos-token">{meta.token}</span>
                        </div>
                      </div>
                      <span className="coll-pos-src">{meta.src}</span>
                      <button type="button" className="coll-pos-view-btn">
                        VIEW
                      </button>
                    </div>
                    <div className="coll-pos-cells">
                      {meta.cells.map((cell) => (
                        <div key={cell.k} className="coll-pos-cell">
                          <span className="coll-pos-cell-k">{cell.k}</span>
                          <span className="coll-pos-cell-v" style={{ color: cell.color }}>
                            {cell.v}
                          </span>
                        </div>
                      ))}
                    </div>
                    {meta.hasBar ? (
                      <div className="coll-pos-bar-row">
                        <div className="coll-pos-bar">
                          <div className="coll-pos-bar-fill" style={{ width: meta.pct }} />
                        </div>
                        <span className="coll-pos-bar-pct">{meta.pct}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <div className="coll-pos-count">
                Showing 1–{rows.length} of {POS_TOTALS[posView]} entries
              </div>
            </div>

            <div className="pos-table-wrap coll-pos-desktop">
              <div className="table-scroll pos-table-scroll">
              <table className="pos-table">
                <thead>
                  <tr id="posHead">
                    {POS_HEADS[posView].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody id="posTable">
                  {posView === "listed" &&
                    POS_DATA.listed.map((r) => (
                      <tr key={`${r.src}-${r.token}`} className="pos-tr">
                        <td className="pos-src">{r.src}</td>
                        <td>
                          <div className="pos-coll">{r.coll}</div>
                          <div className="pos-id">{r.token}</div>
                        </td>
                        <td>
                          <PosVal eth={r.price} usd={r.priceUsd} />
                        </td>
                        <td className="pos-apr">{r.apr}</td>
                        <td className="pos-profit">
                          <div>{r.profit}</div>
                          <div className="pos-val-sub" style={{ color: "inherit", opacity: 0.7 }}>
                            {r.profitUsd}
                          </div>
                        </td>
                        <td>
                          <div className="pos-status">
                            <div className="pos-dot-listed"></div>
                            <span className="pos-status-lbl">LISTED</span>
                          </div>
                        </td>
                        <td>
                          <button className="pos-view-btn">VIEW NFT</button>
                        </td>
                      </tr>
                    ))}

                  {posView === "sold" &&
                    POS_DATA.sold.map((r) => (
                      <tr key={`${r.src}-${r.token}`} className="pos-tr">
                        <td className="pos-src">{r.src}</td>
                        <td>
                          <div className="pos-coll">{r.coll}</div>
                          <div className="pos-id">{r.token}</div>
                        </td>
                        <td>
                          <PosVal eth={r.bought} usd={r.boughtUsd} />
                        </td>
                        <td>
                          <PosVal eth={r.sold} usd={r.soldUsd} />
                        </td>
                        <td className={`pos-profit${r.neg ? " neg" : ""}`}>
                          <div>{r.profit}</div>
                          <div className="pos-val-sub" style={{ color: "inherit", opacity: 0.7 }}>
                            {r.profitUsd}
                          </div>
                        </td>
                        <td>
                          <div className="pos-status">
                            <div className="pos-dot-sold"></div>
                            <span className="pos-status-lbl">SOLD</span>
                          </div>
                        </td>
                        <td>
                          <button className="pos-view-btn">VIEW NFT</button>
                        </td>
                      </tr>
                    ))}

                  {posView === "progress" &&
                    POS_DATA.progress.map((r) => (
                      <tr key={`${r.src}-${r.token}`} className="pos-tr">
                        <td className="pos-src">{r.src}</td>
                        <td>
                          <div className="pos-coll">{r.coll}</div>
                          <div className="pos-id">{r.token}</div>
                        </td>
                        <td>
                          <PosVal eth={r.target} usd={r.targetUsd} />
                        </td>
                        <td className="pos-raised-cell">
                          <PosVal eth={r.raised} usd={r.raisedUsd} />
                          <div className="pos-raised-meta">
                            <span className="pos-raised-pct">{r.pct}% raised</span>
                            <div className="pos-raised-bar">
                              <div className="pos-raised-fill" style={{ width: `${r.pct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="pos-apr">{r.apr}</td>
                        <td>
                          <PosVal eth={r.dep} usd={r.depUsd} />
                        </td>
                        <td>
                          <button className="pos-view-btn">VIEW NFT</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              </div>
              <div className="pos-footer">
                <div className="pos-count" id="posCount">
                  Showing 1-{rows.length} of {POS_TOTALS[posView]} entries
                </div>
                <div className="pos-pages">
                  <button className="pos-pg">‹</button>
                  <button className="pos-pg active">1</button>
                  <button className="pos-pg">2</button>
                  <button className="pos-pg">3</button>
                  <button className="pos-pg">›</button>
                </div>
              </div>
            </div>
            </div>
          </div>
      </div>
    </MainLayout>
  );
}
