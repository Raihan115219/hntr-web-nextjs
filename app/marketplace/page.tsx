"use client";

import { useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import {
  formatUsd,
  OPENSEA_COLLECTION_SLUGS,
  useOpenSeaCollections,
  useOpenSeaMarketplaceListings,
} from "@/lib/opensea";

function getListingUrl(source: string) {
  return source === "Blur" ? "https://blur.io" : "https://opensea.io";
}

const HARDCODED_NFTS = [
  {
    name: "Pudgy Penguin #6142",
    img: "/assets/images/image-2.png",
    boughtPrice: "8.20",
    sellPrice: "11.40",
    profit: "+9.2%",
    source: "Blur",
    sourceImg: "/assets/images/image-13.png",
    openseaUrl: "https://opensea.io",
    fallback: false,
  },
  {
    name: "Azuki #4471",
    img: "/assets/images/image-11.jpg",
    boughtPrice: "5.10",
    sellPrice: "6.85",
    profit: "+7.4%",
    source: "OpenSea",
    sourceImg: "/assets/images/image-1.png",
    openseaUrl: "https://opensea.io",
    fallback: false,
  },
  {
    name: "CryptoPunk #7804",
    img: "/assets/images/image-12.png",
    boughtPrice: "41.00",
    sellPrice: "52.50",
    profit: "+12.1%",
    source: "OpenSea",
    sourceImg: "/assets/images/image-1.png",
    openseaUrl: "https://opensea.io",
    fallback: false,
  },
  {
    name: "Bored Ape #3362",
    img: "/assets/images/image-6.jpg",
    boughtPrice: "12.30",
    sellPrice: "14.90",
    profit: "+8.5%",
    source: "Blur",
    sourceImg: "/assets/images/image-13.png",
    openseaUrl: "https://blur.io",
    fallback: false,
  },
  {
    name: "Doodles #5234",
    img: "/assets/images/image-9.jpg",
    boughtPrice: "3.20",
    sellPrice: "4.10",
    profit: "+6.8%",
    source: "OpenSea",
    sourceImg: "/assets/images/image-1.png",
    openseaUrl: "https://opensea.io",
    fallback: false,
  },
  {
    name: "CloneX #9841",
    img: "/assets/images/image-5.jpg",
    boughtPrice: "7.50",
    sellPrice: "9.20",
    profit: "+10.3%",
    source: "Blur",
    sourceImg: "/assets/images/image-13.png",
    openseaUrl: "https://blur.io",
    fallback: false,
  },
];

const HARDCODED_COLLECTIONS = [
  { name: "CryptoPunks", count: 24 },
  { name: "Bored Ape Yacht Club", count: 12 },
  { name: "Azuki", count: 48 },
  { name: "Fidenza", count: 8 },
];

export default function MarketplacePage() {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [checkedCollections, setCheckedCollections] = useState<Record<string, boolean>>({
    CryptoPunks: true,
    "Bored Ape Yacht Club": true,
    Azuki: false,
    Fidenza: false,
  });

  const {
    data: openSeaCollections,
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useOpenSeaCollections();
  const {
    data: openSeaListings,
    isLoading: isLoadingListings,
    error: listingsError,
  } = useOpenSeaMarketplaceListings(4);

  const collections = useMemo(() => {
    if (!openSeaCollections) return HARDCODED_COLLECTIONS;
    return HARDCODED_COLLECTIONS.map((c) => {
      const slug = OPENSEA_COLLECTION_SLUGS[c.name as keyof typeof OPENSEA_COLLECTION_SLUGS];
      const stats = openSeaCollections[slug]?.stats;
      return { ...c, count: stats?.nftCount || c.count };
    });
  }, [openSeaCollections]);

  const nfts = useMemo(() => {
    if (!openSeaListings?.length) return HARDCODED_NFTS;

    return openSeaListings.map((listing) => {
      const priceEth = listing.priceEth || 0;
      // Fabricate a "bought" price around 80% of the listing price for demo UI
      const boughtEth = priceEth > 0 ? Number((priceEth * 0.8).toFixed(2)) : 0;
      const profitPct = boughtEth > 0 ? ((priceEth - boughtEth) / boughtEth) * 100 : 0;

      return {
        name: listing.name,
        img: listing.imageUrl || "",
        boughtPrice: boughtEth.toFixed(2),
        sellPrice: priceEth.toFixed(2),
        profit: `${profitPct >= 0 ? "+" : ""}${profitPct.toFixed(1)}%`,
        source: "OpenSea",
        sourceImg: "/assets/images/image-1.png",
        openseaUrl: listing.openseaUrl,
        fallback: !listing.imageUrl,
      };
    });
  }, [openSeaListings]);

  const totalFloorValue = useMemo(() => {
    if (!openSeaCollections) return 24_800_000;
    const eth = Object.values(openSeaCollections).reduce(
      (sum, c) => sum + (c.stats.floorPrice || 0),
      0,
    );
    return eth * 2900;
  }, [openSeaCollections]);

  const totalNfts = useMemo(() => {
    if (!openSeaCollections) return 1_420;
    return Object.values(openSeaCollections).reduce((sum, c) => sum + (c.stats.nftCount || 0), 0);
  }, [openSeaCollections]);

  const toggleCollection = (name: string) => {
    setCheckedCollections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const openListing = (nft: (typeof nfts)[number]) => {
    const url = (nft as any).openseaUrl || getListingUrl(nft.source);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isLoading = isLoadingCollections || isLoadingListings;

  return (
    <MainLayout>
      <div className="feed" id="feed-marketplace">
        <div className="vault-hero">
          <div className="vh-nftgrid">
            {[
              "/assets/images/image-2.png",
              "/assets/images/image-11.jpg",
              "/assets/images/image-12.png",
              "/assets/images/image-6.jpg",
              "/assets/images/image-9.jpg",
              "/assets/images/image-5.jpg",
              "/assets/images/image-7.jpg",
              "/assets/images/image-3.jpg",
              "/assets/images/image-4.jpg",
              "/assets/images/image-8.jpg",
              "/assets/images/image-10.jpg",
              "/assets/images/image-12.png",
              "/assets/images/image-11.jpg",
              "/assets/images/image-6.jpg",
              "/assets/images/image-5.jpg",
            ].map((img, i) => (
              <div key={i} className="vh-nft">
                <img src={img} alt="" />
              </div>
            ))}
          </div>
          <div className="vault-hero-shade"></div>
          <div className="vault-title">HNTR MARKETPLACE</div>
          <div className="vault-sub">Browse, collect & trade blue-chip NFTs</div>
        </div>

        <div className="proto-stats">
          <div className="ps">
            <div className="ps-lbl">Total Protocol Value</div>
            <div className="ps-val">
              ${(totalFloorValue / 1_000_000).toFixed(1)}
              <span className="ps-unit">M</span>
            </div>
            <div className="ps-chg">↑+4.2%</div>
          </div>
          <div className="ps">
            <div className="ps-lbl">Total NFTs Owned</div>
            <div className="ps-val">{totalNfts.toLocaleString()}</div>
            <div className="ps-chg">↑+12 This Month</div>
          </div>
          <div className="ps">
            <div className="ps-lbl">Avg. Vault Yield</div>
            <div className="ps-val">
              12.4<span className="ps-unit">%</span>
            </div>
            <div className="ps-chg" style={{ color: "var(--t0)" }}>
              APY — 30D avg
            </div>
          </div>
          <div className="ps">
            <div className="ps-lbl">Total Users</div>
            <div className="ps-val">48,217</div>
            <div className="ps-chg" style={{ color: "var(--t0)" }}>
              active
            </div>
          </div>
        </div>

        <div className="vault-body">
          <div className="vault-left">
            <div className={`panel panel-collections${collectionsOpen ? "" : " collapsed"}`}>
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
                {collections.map((c) => (
                  <div
                    key={c.name}
                    className="coll-row"
                    onClick={() => toggleCollection(c.name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCollection(c.name);
                      }
                    }}
                  >
                    <div className={`coll-check${checkedCollections[c.name] ? " checked" : ""}`} />
                    <span className="coll-name">{c.name}</span>
                    <span className="coll-count">
                      {isLoadingCollections && c.count === 0 ? "..." : c.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">Portfolio Distribution</div>
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

          <div className="vault-right">
            <div className="grid-toolbar">
              <div className="sort-lbl">
                Sort: <span className="sort-val">Floor High to Low</span>
              </div>
              {isLoading && (
                <div className="sort-lbl" style={{ marginLeft: "auto" }}>
                  Loading OpenSea…
                </div>
              )}
              {!isLoading && (collectionsError || listingsError) && (
                <div className="sort-lbl" style={{ marginLeft: "auto", color: "#ff6b6b" }}>
                  OpenSea unavailable — fallback data
                </div>
              )}
              {!isLoading && !collectionsError && !listingsError && openSeaListings && openSeaListings.length > 0 && (
                <div className="sort-lbl" style={{ marginLeft: "auto", color: "var(--sage)" }}>
                  Live OpenSea data
                </div>
              )}
              <div className="grid-icons">
                <button className="gi active">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="1" width="4" height="4" rx=".8" fill="currentColor"></rect>
                    <rect x="7" y="1" width="4" height="4" rx=".8" fill="currentColor"></rect>
                    <rect x="1" y="7" width="4" height="4" rx=".8" fill="currentColor"></rect>
                    <rect x="7" y="7" width="4" height="4" rx=".8" fill="currentColor"></rect>
                  </svg>
                </button>
                <button className="gi">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 3h10M1 6h10M1 9h10"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="vault-grid">
              {nfts.map((nft, i) => (
                <div key={i} className="vc">
                  <div className="vc-img-wrap">
                    {nft.img ? (
                      <img className="vc-img" src={nft.img} alt={nft.name} />
                    ) : (
                      <div
                        className="vc-img"
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
                        {nft.fallback ? "OpenSea image unavailable" : "No image"}
                      </div>
                    )}
                    <span className="src-logo" title={nft.source}>
                      <img src={nft.sourceImg} alt={nft.source} />
                    </span>
                    <button
                      type="button"
                      className="vc-overlay"
                      aria-label={`View ${nft.name} listing on ${nft.source}`}
                      onClick={() => openListing(nft)}
                    >
                      <span className="vc-badge">VIEW</span>
                    </button>
                  </div>
                  <div className="vc-body">
                    <div className="vc-name">{nft.name}</div>
                    <div className="vc-row">
                      <span className="vc-k">Bought Price</span>
                      <span className="vc-v">
                        {nft.boughtPrice} <span className="eth-ic"></span>
                      </span>
                    </div>
                    <div className="vc-row">
                      <span className="vc-k">Sell Price</span>
                      <span className="vc-v">
                        {nft.sellPrice} <span className="eth-ic"></span>
                      </span>
                    </div>
                    <div className="vc-row">
                      <span className="vc-k">Gross Profit</span>
                      <span className="vc-g">{nft.profit}</span>
                    </div>
                    <button className="lcbtn" onClick={() => openListing(nft)}>
                      View Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="show-more-wrap">
              <button className="show-more-btn">SHOW MORE</button>
            </div>

            <div className="net-act">
              <div className="net-act-hdr">
                <div className="net-act-title">NETWORK ACTIVITY</div>
                <div className="net-act-link">View All Activity →</div>
              </div>
              <div className="net-table-scroll table-scroll">
                <table className="net-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Event</th>
                      <th>Price</th>
                      <th>Source</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody id="netTable">
                    <tr>
                      <td className="td-asset">Pudgy Penguin #6523</td>
                      <td>
                        <span className="td-event ev-purchase">PURCHASE</span>
                      </td>
                      <td className="td-price">4.85 <span style={{ fontSize: "11px", color: "var(--t2)" }}>ETH</span></td>
                      <td className="td-source">Blur.io</td>
                      <td className="td-time">2m ago</td>
                    </tr>
                    <tr>
                      <td className="td-asset">Bayc #3295</td>
                      <td>
                        <span className="td-event ev-sale">SALE</span>
                      </td>
                      <td className="td-price">2.30 <span style={{ fontSize: "11px", color: "var(--t2)" }}>ETH</span></td>
                      <td className="td-source">OpenSea</td>
                      <td className="td-time">15m ago</td>
                    </tr>
                    <tr>
                      <td className="td-asset">Azuki #3295</td>
                      <td>
                        <span className="td-event ev-sale">SALE</span>
                      </td>
                      <td className="td-price">2.30 <span style={{ fontSize: "11px", color: "var(--t2)" }}>ETH</span></td>
                      <td className="td-source">OpenSea</td>
                      <td className="td-time">15m ago</td>
                    </tr>
                    <tr>
                      <td className="td-asset">CryptoPunks #3295</td>
                      <td>
                        <span className="td-event ev-sale">SALE</span>
                      </td>
                      <td className="td-price">2.30 <span style={{ fontSize: "11px", color: "var(--t2)" }}>ETH</span></td>
                      <td className="td-source">OpenSea</td>
                      <td className="td-time">15m ago</td>
                    </tr>
                    <tr>
                      <td className="td-asset">Normie #3295</td>
                      <td>
                        <span className="td-event ev-sale">SALE</span>
                      </td>
                      <td className="td-price">2.30 <span style={{ fontSize: "11px", color: "var(--t2)" }}>ETH</span></td>
                      <td className="td-source">OpenSea</td>
                      <td className="td-time">15m ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
