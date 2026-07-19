"use client";

import Link from "next/link";
import { Fragment, ReactNode, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import MainLayout from "./components/MainLayout";
import { openDepositModal } from "../lib/deposit-modal";
import { hasSeenIntro, markIntroSeen } from "../lib/intro-state";
import { useRouter } from "nextjs-toploader/app";
import {
  formatChangePct,
  formatUsd,
  MarketTimeFrame,
  useOpenSeaHomeMarket,
  useOpenSeaListings,
  useOpenSeaMarketplaceListings,
  useOpenSeaMarketplaceSales,
} from "@/lib/opensea";

const STRATEGY_POOLS = [
  {
    slug: "boredapeyachtclub",
    name: "Bored Ape Yacht Club",
    img: "/assets/images/image-11.jpg",
    tags: ["YUGA LABS", "SERIES 1/1000"],
    fallbackTokenId: "3362",
    fallbackTargetEth: 10,
    raisedEth: 4.52,
    progress: 45.2,
    gpProfit: "10.00%",
    ethProfit: "1.75",
    usdtProfit: "$4,198",
    users: "132",
  },
  {
    slug: "pudgypenguins",
    name: "Pudgy Penguins",
    img: "/assets/images/image-6.jpg",
    tags: ["PPENGUIN", "SERIES V/500"],
    fallbackTokenId: "3362",
    fallbackTargetEth: 5.45,
    raisedEth: 2.73,
    progress: 50.1,
    gpProfit: "10.00%",
    ethProfit: "1.75",
    usdtProfit: "$4,198",
    users: "132",
  },
  {
    slug: "cryptopunks",
    name: "CryptoPunks",
    img: "/assets/images/image-3.jpg",
    tags: ["LARVA LABS", "SERIES 1/10000"],
    fallbackTokenId: "7804",
    fallbackTargetEth: 31,
    raisedEth: 22.3,
    progress: 71.9,
    gpProfit: "9.20%",
    ethProfit: "2.10",
    usdtProfit: "$5,040",
    users: "88",
  },
  {
    slug: "azuki",
    name: "Azuki",
    img: "/assets/images/image-7.jpg",
    tags: ["AZUKI", "SERIES 2/8888"],
    fallbackTokenId: "4521",
    fallbackTargetEth: 8.5,
    raisedEth: 6.12,
    progress: 72.0,
    gpProfit: "9.80%",
    ethProfit: "1.92",
    usdtProfit: "$4,220",
    users: "104",
  },
] as const;

/** Intro canvas + typewriter only on desktop / larger viewports */
const INTRO_DESKTOP_MQ = "(min-width: 901px)";

declare global {
  interface Window {
    __initReveal?: (cv: HTMLCanvasElement | null) => void;
    __resources?: Record<string, string>;
  }
}

type Segment = { text: string; cls?: string };

const TITLE_SEGMENTS: Segment[] = [
  { text: "STOP WATCHING,\nSTART " },
  { text: "OWNING.", cls: "tw-orange" }
];

const SUB_SEGMENTS: Segment[] = [
  {
    text:
      "HNTR is a perpetual, community-powered machine engineered to accumulate premium NFTs, execute profitable trades, and reward the community.\n\n"
  },
  { text: "Decentralized. Transparent.", cls: "tagline" },
  { text: "Forever in Motion.", cls: "tagline tw-orange" }
];

// Build array of characters with their timing info
function buildTimedChars(segments: Segment[], baseSpeed: number) {
  const chars: { ch: string; seg: number; idx: number; delay: number }[] = [];
  segments.forEach((seg, segIdx) => {
    [...seg.text].forEach((ch, idx) => {
      if (ch === "\n") return;
      let delay = baseSpeed;
      if (ch === " ") delay = baseSpeed * 0.35;
      else if (ch === ",") delay = baseSpeed * 1.4;
      else if (ch === ".") delay = baseSpeed * 2;
      chars.push({ ch, seg: segIdx, idx, delay });
    });
  });
  return chars;
}

function renderTypedSegments(segments: Segment[], count: number, keyBase: string): ReactNode[] {
  let seen = 0;
  return segments.map((seg, segIdx) => {
    const children: ReactNode[] = [];
    [...seg.text].forEach((ch, idx) => {
      if (ch === "\n") {
        children.push(<br key={`${keyBase}-br-${segIdx}-${idx}`} />);
        return;
      }
      const visible = seen < count;
      children.push(
        <span key={`${keyBase}-ch-${segIdx}-${idx}`} style={{ visibility: visible ? "visible" : "hidden" }}>
          {ch}
        </span>
      );
      seen += 1;
    });
    if (seg.cls) return <span key={`${keyBase}-seg-${segIdx}`} className={seg.cls}>{children}</span>;
    return <Fragment key={`${keyBase}-seg-${segIdx}`}>{children}</Fragment>;
  });
}

const FALLBACK_LISTING_CARDS = [
  { img: "/assets/images/image-11.jpg", name: "BAYC #9112", bought: "5.75", sell: "7.15", profit: "+19.3%", soon: false, openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-6.jpg", name: "BAYC #9112", bought: "4.75", sell: "9.75", profit: "+18.8%", soon: false, openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-3.jpg", name: "BAYC #9112", bought: "4.1", sell: "7.9", profit: "+18.8%", soon: false, openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-7.jpg", name: "BAYC #5621", bought: "6.2", sell: "8.5", profit: "+15.4%", soon: false, openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-5.jpg", name: "BAYC #7832", bought: "3.8", sell: "6.2", profit: "+17.5%", soon: false, openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-8.jpg", name: "BAYC #4521", bought: "5.2", sell: "7.8", profit: "+16.2%", soon: false, openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-4.jpg", name: "COMING SOON", bought: "--", sell: "--", profit: "--", soon: true, openseaUrl: "" },
];

const FALLBACK_SALES_CARDS = [
  { img: "/assets/images/image-11.jpg", name: "Bored Ape YC #3425", bought: "7.50", sale: "8.25", profit: "+10%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-6.jpg", name: "Bored Ape YC #7821", bought: "8.64", sale: "9.50", profit: "+9.9%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-3.jpg", name: "CryptoPunks #5421", bought: "29.23", sale: "32.15", profit: "+10%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-7.jpg", name: "Bored Ape YC #9321", bought: "7.09", sale: "7.80", profit: "+10%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-5.jpg", name: "Azuki #1245", bought: "5.14", sale: "5.65", profit: "+9.9%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-8.jpg", name: "Bored Ape YC #4523", bought: "8.09", sale: "8.90", profit: "+10%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-4.jpg", name: "Doodles #2341", bought: "5.73", sale: "6.30", profit: "+9.9%", openseaUrl: "https://opensea.io" },
  { img: "/assets/images/image-9.jpg", name: "Pudgy Penguins #6754", bought: "4.41", sale: "4.85", profit: "+10%", openseaUrl: "https://opensea.io" }
];

const FALLBACK_MARKET = {
  totalVolume: 42819,
  activeCollections: 1204,
  top: [
    { name: "CryptoPunks", floorPrice: 30.19, change: 0.18, thumb: "🧱" },
    { name: "Autoglyphs", floorPrice: 81.0, change: -8.88, thumb: "✒" },
    { name: "Fidenza by Tyler Hobbs", floorPrice: 16.4, change: -0.38, thumb: "🎨" },
    { name: "Bored Ape Yacht Club", floorPrice: 7.7994, change: 2.44, thumb: "🦧" },
    { name: "Pudgy Penguins", floorPrice: 4.3499, change: 6.38, thumb: "🐧" },
  ],
  trending: [
    { name: "Nakamigos", floorPrice: 0.1358, volume: 4881, thumb: "🍜" },
    { name: "NORMIES", floorPrice: 0.0544, volume: 77317, thumb: "🐻" },
    { name: "Kaito Genesis", floorPrice: 1.3589, volume: 34152, thumb: "⚡" },
    { name: "Lil Pudgys", floorPrice: 0.9888, volume: 96610, thumb: "🐸" },
    { name: "Invisible Friends", floorPrice: 0.1244, volume: 27075, thumb: "👻" },
  ],
  topFlyers: [
    { name: "Kaito Genesis", floorPrice: 0.15, change: 41.65, thumb: "⚡" },
    { name: "VoxFriends", floorPrice: 1.039, change: 28.79, thumb: "🌿" },
    { name: "Bored Ape Kennel Club", floorPrice: 0.308, change: 13.48, thumb: "🐕" },
    { name: "Pudgy Rods", floorPrice: 0.125, change: -5.07, thumb: "🐧" },
    { name: "Terraforms by Mathcastles", floorPrice: 0.5001, change: -6.64, thumb: "🌍" },
  ],
};

function collectionThumb(name: string, imageUrl?: string): string {
  if (imageUrl) return imageUrl;
  const n = name.toLowerCase();
  if (n.includes("punk")) return "🧱";
  if (n.includes("glyph")) return "✒";
  if (n.includes("fidenza")) return "🎨";
  if (n.includes("bored ape") || n.includes("bayc")) return "🦧";
  if (n.includes("kennel")) return "🐕";
  if (n.includes("pudgy")) return "🐧";
  if (n.includes("nakamigo")) return "🍜";
  if (n.includes("doodle")) return "🎨";
  if (n.includes("azuki")) return "🎴";
  if (n.includes("invisible")) return "👻";
  if (n.includes("lil")) return "🐸";
  return "◆";
}

function ListingCard({
  img,
  name,
  bought,
  sell,
  profit,
  soon,
  openseaUrl,
}: {
  img: string;
  name: string;
  bought: string;
  sell: string;
  profit: string;
  soon: boolean;
  openseaUrl?: string;
}) {
  const openListing = () => {
    if (soon) return;
    window.open(openseaUrl || "https://opensea.io", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="lc"
      style={{ cursor: soon ? "not-allowed" : "pointer", opacity: soon ? 0.38 : 1 }}
      onClick={openListing}
    >
      <img className="lcimg" src={img} alt={name} />
      <div className="src-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="5" fill={soon ? "#9CA3AF" : "#2081E2"} />
          <path
            d="M16 8.5L8 13v6l8 4.5 8-4.5v-6L16 8.5z"
            fill="white"
            opacity={soon ? ".5" : ".9"}
          />
        </svg>
      </div>
      <div className="lcb">
        <div className="lcn">{name}</div>
        <div className="lcrow">
          <div className="lck">BOUGHT</div>
          <div className="lcv">
            {bought} <span className="eth-ic"></span>
          </div>
        </div>
        <div className="lcrow">
          <div className="lck">SELL</div>
          <div className="lcv">
            {sell} <span className="eth-ic"></span>
          </div>
        </div>
        <div className="lcrow">
          <div className="lck">GROSS PROFIT</div>
          <div className="lcg">{profit}</div>
        </div>
        <button
          className="lcbtn"
          type="button"
          disabled={soon}
          onClick={(e) => {
            e.stopPropagation();
            openListing();
          }}
        >
          {soon ? "Coming Soon" : "View Listing"}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [loaderOut, setLoaderOut] = useState(false);
  const [introEnabled, setIntroEnabled] = useState(false);
  const [intro, setIntro] = useState(true);
  const [typedTitleCount, setTypedTitleCount] = useState(0);
  const [typedSubCount, setTypedSubCount] = useState(0);
  const [btnIn, setBtnIn] = useState(false);
  const [caretDone, setCaretDone] = useState(false);
  const [hideCaret, setHideCaret] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [marketTimeFrame, setMarketTimeFrame] = useState<MarketTimeFrame>("24H");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSlideWidth, setMobileSlideWidth] = useState(0);

  const { data: baycListings } = useOpenSeaListings("boredapeyachtclub", 1);
  const { data: pudgyListings } = useOpenSeaListings("pudgypenguins", 1);
  const { data: punksListings } = useOpenSeaListings("cryptopunks", 1);
  const { data: azukiListings } = useOpenSeaListings("azuki", 1);
  const { data: openSeaListings } = useOpenSeaMarketplaceListings(3);
  const { data: openSeaSales } = useOpenSeaMarketplaceSales(3);
  const { data: openSeaMarket } = useOpenSeaHomeMarket(marketTimeFrame);

  const strategyPools = useMemo(() => {
    const liveBySlug: Record<
      string,
      { tokenId: string; priceEth: number; imageUrl: string; openseaUrl: string } | undefined
    > = {
      boredapeyachtclub: baycListings?.[0]
        ? {
            tokenId: baycListings[0].tokenId,
            priceEth: baycListings[0].priceEth,
            imageUrl: baycListings[0].imageUrl,
            openseaUrl: baycListings[0].openseaUrl,
          }
        : undefined,
      pudgypenguins: pudgyListings?.[0]
        ? {
            tokenId: pudgyListings[0].tokenId,
            priceEth: pudgyListings[0].priceEth,
            imageUrl: pudgyListings[0].imageUrl,
            openseaUrl: pudgyListings[0].openseaUrl,
          }
        : undefined,
      cryptopunks: punksListings?.[0]
        ? {
            tokenId: punksListings[0].tokenId,
            priceEth: punksListings[0].priceEth,
            imageUrl: punksListings[0].imageUrl,
            openseaUrl: punksListings[0].openseaUrl,
          }
        : undefined,
      azuki: azukiListings?.[0]
        ? {
            tokenId: azukiListings[0].tokenId,
            priceEth: azukiListings[0].priceEth,
            imageUrl: azukiListings[0].imageUrl,
            openseaUrl: azukiListings[0].openseaUrl,
          }
        : undefined,
    };

    return STRATEGY_POOLS.map((pool) => {
      const live = liveBySlug[pool.slug];
      const tokenId = live?.tokenId || pool.fallbackTokenId;
      const targetEth = live?.priceEth && live.priceEth > 0 ? live.priceEth : pool.fallbackTargetEth;
      const img = live?.imageUrl || pool.img;
      const progress =
        targetEth > 0 ? Math.min(100, Number(((pool.raisedEth / targetEth) * 100).toFixed(1))) : pool.progress;

      return {
        ...pool,
        img,
        tokenId,
        displayName: pool.name,
        targetEth,
        targetLabel: targetEth.toFixed(2),
        targetUsd: formatUsd(targetEth),
        raisedUsd: formatUsd(pool.raisedEth),
        progress,
        openseaUrl: live?.openseaUrl || `https://opensea.io/collection/${pool.slug}`,
      };
    });
  }, [baycListings, pudgyListings, punksListings, azukiListings]);

  const listingCards = useMemo(() => {
    if (!openSeaListings?.length) return FALLBACK_LISTING_CARDS;

    const live = openSeaListings
      .filter((l) => l.priceEth > 0)
      .slice(0, 12)
      .map((listing) => {
        const sellEth = listing.priceEth;
        const boughtEth = Number((sellEth * 0.8).toFixed(2));
        const profitPct = boughtEth > 0 ? ((sellEth - boughtEth) / boughtEth) * 100 : 0;
        return {
          img: listing.imageUrl || "/assets/images/image-4.jpg",
          name: listing.name,
          bought: boughtEth.toFixed(2),
          sell: sellEth.toFixed(2),
          profit: `${profitPct >= 0 ? "+" : ""}${profitPct.toFixed(1)}%`,
          soon: false,
          openseaUrl: listing.openseaUrl,
        };
      });

    if (!live.length) return FALLBACK_LISTING_CARDS;
    return [
      ...live,
      {
        img: "/assets/images/image-4.jpg",
        name: "COMING SOON",
        bought: "--",
        sell: "--",
        profit: "--",
        soon: true,
        openseaUrl: "",
      },
    ];
  }, [openSeaListings]);

  const salesCards = useMemo(() => {
    if (!openSeaSales?.length) return FALLBACK_SALES_CARDS;

    const live = openSeaSales
      .filter((s) => s.priceEth > 0)
      .slice(0, 16)
      .map((sale) => {
        const saleEth = sale.priceEth;
        const boughtEth = Number((saleEth * 0.9).toFixed(2));
        const profitPct = boughtEth > 0 ? ((saleEth - boughtEth) / boughtEth) * 100 : 0;
        return {
          img: sale.imageUrl || "/assets/images/image-4.jpg",
          name: sale.name,
          bought: boughtEth.toFixed(2),
          sale: saleEth.toFixed(2),
          profit: `${profitPct >= 0 ? "+" : ""}${profitPct.toFixed(1)}%`,
          openseaUrl: sale.openseaUrl,
        };
      });

    return live.length ? live : FALLBACK_SALES_CARDS;
  }, [openSeaSales]);

  const market = useMemo(() => {
    if (!openSeaMarket?.top?.length) return FALLBACK_MARKET;

    const mapRow = (c: (typeof openSeaMarket.top)[number]) => ({
      name: c.name,
      floorPrice: c.floorPrice,
      change: c.change,
      volume: Math.round((c.volume || 0) * 2900),
      thumb: collectionThumb(c.name, c.imageUrl),
      imageUrl: c.imageUrl,
    });

    return {
      totalVolume: openSeaMarket.totalVolume,
      activeCollections: openSeaMarket.activeCollections,
      top: openSeaMarket.top.map(mapRow),
      trending: openSeaMarket.trending.map(mapRow),
      topFlyers: openSeaMarket.topFlyers.map(mapRow),
    };
  }, [openSeaMarket]);
  const cardCount = 4;
  const cardWidth = 468;
  const cardGap = 14;
  const cardStep = cardWidth + cardGap;
  const npViewportRef = useRef<HTMLDivElement | null>(null);
  const salesMarqueeRef = useRef<HTMLDivElement | null>(null);
  const salesTrackRef = useRef<HTMLDivElement | null>(null);
  const contentWidth = cardCount * cardWidth + (cardCount - 1) * cardGap;
  const desktopMaxOffset = Math.max(0, contentWidth - mobileSlideWidth);
  const desktopMaxSlide =
    desktopMaxOffset <= 0 ? 0 : Math.ceil(desktopMaxOffset / cardStep);
  const maxSlide = isMobile ? cardCount - 1 : desktopMaxSlide;
  const slideOffset = isMobile
    ? currentSlide * (mobileSlideWidth || 0)
    : Math.min(currentSlide * cardStep, desktopMaxOffset);
  
  const titleCharsRef = useRef(buildTimedChars(TITLE_SEGMENTS, 22));
  const subCharsRef = useRef(buildTimedChars(SUB_SEGMENTS, 7));
  const targetRef = useRef(0);
  const introSkippedRef = useRef(false);
  const autoPlayRef = useRef(false);
  const autoDirectionRef = useRef(1);
  const canvasFromRef = useRef<DOMRect | null>(null);
  const canvasToRef = useRef<DOMRect | null>(null);
  const heroRadiusRef = useRef(10);
  const introEnabledRef = useRef(false);

  const skipIntroForMobile = () => {
    markIntroSeen();
    setIntroEnabled(false);
    introEnabledRef.current = false;
    setIntro(false);
    setProgress(1);
    targetRef.current = 1;
    autoPlayRef.current = false;
    setLoaderOut(true);
    setTypedTitleCount(titleCharsRef.current.length);
    setTypedSubCount(subCharsRef.current.length);
    setBtnIn(true);
    setHideCaret(true);
    document.body.classList.remove("intro-active");

    const cv = document.getElementById("introRevealCv") as HTMLCanvasElement | null;
    if (cv) {
      cv.removeAttribute("style");
      const wrap = document.querySelector(".intro-imgwrap");
      if (wrap && cv.parentNode !== wrap) wrap.appendChild(cv);
    }
  };

  const skipIntroComplete = () => {
    introSkippedRef.current = true;
    setIntroEnabled(false);
    introEnabledRef.current = false;
    setIntro(false);
    setProgress(1);
    targetRef.current = 1;
    autoPlayRef.current = false;
    setLoaderOut(true);
    setTypedTitleCount(titleCharsRef.current.length);
    setTypedSubCount(subCharsRef.current.length);
    setBtnIn(true);
    setHideCaret(true);
    document.body.classList.remove("intro-active");

    const feed = document.getElementById("feed-home");
    if (feed) {
      feed.style.transform = "";
      feed.style.opacity = "";
    }

    const cv = document.getElementById("introRevealCv") as HTMLCanvasElement | null;
    if (cv) {
      cv.removeAttribute("style");
      cv.style.opacity = "0";
      cv.style.pointerEvents = "none";
      const wrap = document.querySelector(".intro-imgwrap");
      if (wrap && cv.parentNode !== wrap) wrap.appendChild(cv);
    }
  };

  // Decide intro eligibility before paint (avoids mobile flash)
  useLayoutEffect(() => {
    if (hasSeenIntro()) {
      skipIntroComplete();
      return;
    }

    const mq = window.matchMedia(INTRO_DESKTOP_MQ);

    const apply = () => {
      if (hasSeenIntro() || introSkippedRef.current) {
        skipIntroComplete();
        return;
      }
      if (mq.matches) {
        setIntroEnabled(true);
        introEnabledRef.current = true;
        document.body.classList.add("intro-active");
        setIntro(true);
      } else {
        skipIntroForMobile();
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.body.classList.remove("intro-active");
    };
  }, []);

  // Track mobile layout for strategies slider + listings grid
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!npViewportRef.current) return;
      setMobileSlideWidth(npViewportRef.current.clientWidth);
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [isMobile, loaderOut]);

  // Keep slide index in range when viewport/max slides change
  useEffect(() => {
    setCurrentSlide((prev) => Math.min(prev, maxSlide));
  }, [maxSlide]);

  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < maxSlide;

  const goToPrevSlide = () => {
    if (!canGoPrev) return;
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const goToNextSlide = () => {
    if (!canGoNext) return;
    setCurrentSlide((prev) => Math.min(maxSlide, prev + 1));
  };

  // Drag-to-scroll sales marquee (mouse + touch) with infinite autoplay
  useEffect(() => {
    const marquee = salesMarqueeRef.current;
    const track = salesTrackRef.current;
    if (!marquee || !track) return;

    track.classList.add("is-drag-controlled");
    marquee.classList.add("is-drag-enabled");

    let offset = 0;
    let half = 0;
    let paused = false;
    let raf = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    const speed = 0.45;

    const measure = () => {
      half = track.scrollWidth / 2;
    };

    const wrap = (value: number) => {
      if (half <= 0) return 0;
      let x = value % half;
      if (x > 0) x -= half;
      if (x <= -half) x += half;
      return x;
    };

    const apply = () => {
      track.style.transform = `translate3d(${offset}px,0,0)`;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!paused && half > 0) {
        offset = wrap(offset - speed);
        apply();
      }
    };

    let dragging = false;
    let moved = false;
    let pointerId: number | null = null;
    let axis: "x" | "y" | null = null;
    let startX = 0;
    let startY = 0;
    let startOffset = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let coasting = false;

    const clearResume = () => {
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const scheduleResume = (delay = 900) => {
      clearResume();
      resumeTimer = setTimeout(() => {
        paused = false;
        coasting = false;
        marquee.classList.remove("is-dragging");
      }, delay);
    };

    const startDrag = (clientX: number, clientY: number, id: number) => {
      clearResume();
      coasting = false;
      pointerId = id;
      startX = clientX;
      startY = clientY;
      startOffset = offset;
      lastX = clientX;
      lastT = performance.now();
      velocity = 0;
      axis = null;
      moved = false;
      dragging = true;
      paused = true;
    };

    const moveDrag = (clientX: number, clientY: number, e: Event) => {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (axis === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") {
          dragging = false;
          pointerId = null;
          marquee.classList.remove("is-dragging");
          scheduleResume(300);
          return;
        }
        marquee.classList.add("is-dragging");
      }

      if (axis !== "x") return;
      e.preventDefault();
      moved = true;
      const now = performance.now();
      const dt = Math.max(8, now - lastT);
      velocity = (clientX - lastX) / dt;
      lastX = clientX;
      lastT = now;
      offset = wrap(startOffset + dx);
      apply();
    };

    const endDrag = () => {
      if (!dragging && axis !== "x") {
        pointerId = null;
        return;
      }
      dragging = false;
      pointerId = null;

      if (axis === "x" && moved) {
        coasting = true;
        const coast = () => {
          if (!coasting) return;
          velocity *= 0.92;
          if (Math.abs(velocity) > 0.05) {
            offset = wrap(offset + velocity * 16);
            apply();
            requestAnimationFrame(coast);
          } else {
            coasting = false;
            scheduleResume(700);
          }
        };
        requestAnimationFrame(coast);
      } else {
        scheduleResume(300);
      }
      axis = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startDrag(e.clientX, e.clientY, e.pointerId);
      try {
        marquee.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId !== null && e.pointerId !== pointerId) return;
      moveDrag(e.clientX, e.clientY, e);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId !== null && e.pointerId !== pointerId) return;
      try {
        if (pointerId !== null) marquee.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
      endDrag();
    };

    const onMouseEnter = () => {
      if (!dragging) paused = true;
    };
    const onMouseLeave = () => {
      if (!dragging && !coasting) paused = false;
    };

    measure();
    apply();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      measure();
      offset = wrap(offset);
      apply();
    });
    ro.observe(track);

    marquee.addEventListener("pointerdown", onPointerDown);
    marquee.addEventListener("pointermove", onPointerMove);
    marquee.addEventListener("pointerup", onPointerUp);
    marquee.addEventListener("pointercancel", onPointerUp);
    marquee.addEventListener("mouseenter", onMouseEnter);
    marquee.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      clearResume();
      coasting = false;
      ro.disconnect();
      marquee.removeEventListener("pointerdown", onPointerDown);
      marquee.removeEventListener("pointermove", onPointerMove);
      marquee.removeEventListener("pointerup", onPointerUp);
      marquee.removeEventListener("pointercancel", onPointerUp);
      marquee.removeEventListener("mouseenter", onMouseEnter);
      marquee.removeEventListener("mouseleave", onMouseLeave);
      track.classList.remove("is-drag-controlled");
      marquee.classList.remove("is-drag-enabled", "is-dragging");
      track.style.transform = "";
    };
  }, [loaderOut]);

  useEffect(() => {
    if (hasSeenIntro() || introSkippedRef.current) {
      setLoaderOut(true);
      return;
    }
    const t = setTimeout(() => setLoaderOut(true), 1150);
    return () => clearTimeout(t);
  }, []);

  // Always init home banner reveal (desktop + mobile); intro canvas only on desktop
  useEffect(() => {
    window.__resources = {
      ...(window.__resources || {}),
      revealTop: "/assets/images/revealTop.jpg",
      revealBot: "/assets/images/revealBot.png"
    };

    const ensureHomeReveal = (attempt = 0) => {
      const homeCv = document.getElementById("homeRevealCv") as HTMLCanvasElement | null;
      if (homeCv && window.__initReveal) {
        window.__initReveal(homeCv);
        return;
      }
      if (attempt < 30) {
        setTimeout(() => ensureHomeReveal(attempt + 1), 80);
      }
    };

    const existing = document.querySelector(
      'script[src="/assets/js/script-1.js"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.__initReveal) {
        ensureHomeReveal();
      } else {
        existing.addEventListener("load", () => ensureHomeReveal(), { once: true });
      }
    } else {
      const script = document.createElement("script");
      script.src = "/assets/js/script-1.js";
      script.async = true;
      script.onload = () => ensureHomeReveal();
      document.body.appendChild(script);
    }
  }, []);

  // Intro canvas morph setup — desktop only
  useEffect(() => {
    if (!introEnabled) return;

    let cancelled = false;
    let tries = 0;

    const startIntroReveal = () => {
      if (cancelled || !introEnabledRef.current) return;
      if (!window.__initReveal) {
        if (tries++ < 40) setTimeout(startIntroReveal, 50);
        return;
      }

      const cv = document.getElementById("introRevealCv") as HTMLCanvasElement | null;
      if (!cv) {
        if (tries++ < 40) setTimeout(startIntroReveal, 50);
        return;
      }

      window.__initReveal(cv);

      const isLargeScreen = window.innerWidth >= 1440;
      const initDelay = isLargeScreen ? 150 : 80;

      const initMeasure = () => {
        if (cancelled || !introEnabledRef.current) return;
        if (measurePositions()) {
          applyCanvasMorph(0);
        } else {
          setTimeout(initMeasure, 120);
        }
      };

      setTimeout(initMeasure, cv.width > 0 ? initDelay : 200);

      setTimeout(() => {
        if (!canvasFromRef.current) initMeasure();
      }, 1600);

      if (isLargeScreen) {
        setTimeout(() => {
          if (cancelled || !introEnabledRef.current) return;
          measurePositions();
          applyCanvasMorph(0);
        }, 2000);
      }
    };

    startIntroReveal();
    return () => {
      cancelled = true;
    };
  }, [introEnabled]);

  // Measure canvas positions
  const measurePositions = () => {
    if (!introEnabledRef.current) return false;
    const cv = document.getElementById("introRevealCv") as HTMLCanvasElement | null;
    const feed = document.getElementById("feed-home");
    const hero = feed?.querySelector(".hero") as HTMLElement | null;
    const introWrap = document.querySelector(".intro-imgwrap");
    
    if (!cv || !hero || !feed) return false;
    
    // If already pinned, reset to measure properly
    const isPinned = cv.style.position === "fixed";
    if (isPinned) {
      cv.style.position = "";
      cv.style.left = "";
      cv.style.top = "";
      cv.style.width = "";
      cv.style.height = "";
      cv.style.inset = "";
      cv.style.margin = "";
      cv.style.zIndex = "";
      cv.style.borderRadius = "";
      if (cv.parentNode !== introWrap && introWrap) {
        introWrap.appendChild(cv);
      }
    }
    
    // Force reflow to ensure accurate measurements
    void cv.offsetHeight;
    
    // Always measure FROM synchronously before pinning — async measure left the
    // canvas fixed at CSS 100%/100% for a frame (fullscreen flash).
    const fromRect = cv.getBoundingClientRect();
    canvasFromRef.current = fromRect;
    
    // Temporarily show feed to measure hero position
    const savedTransform = feed.style.transform;
    const savedTransition = feed.style.transition;
    const savedOpacity = feed.style.opacity;
    
    feed.style.transition = "none";
    feed.style.transform = "none";
    feed.style.opacity = "1";
    
    // Force reflow
    void feed.offsetHeight;
    
    canvasToRef.current = hero.getBoundingClientRect();
    const styles = getComputedStyle(hero);
    heroRadiusRef.current = parseFloat(styles.borderTopLeftRadius) || 10;
    
    // Calculate scale for hover effect
    (cv as any).__rscale = canvasToRef.current.height / fromRect.height;
    
    feed.style.transform = savedTransform;
    feed.style.transition = savedTransition;
    feed.style.opacity = savedOpacity;
    
    // Pin with FROM dimensions applied immediately so it never flashes fullscreen
    cv.style.position = "fixed";
    cv.style.margin = "0";
    cv.style.inset = "auto";
    cv.style.left = fromRect.left + "px";
    cv.style.top = fromRect.top + "px";
    cv.style.width = fromRect.width + "px";
    cv.style.height = fromRect.height + "px";
    cv.style.borderRadius = "14px 0 0 14px";
    cv.style.zIndex = "940";
    cv.style.opacity = "1";
    
    // Move to body for proper stacking
    if (cv.parentNode !== document.body) {
      document.body.appendChild(cv);
    }
    
    return true;
  };

  // Title typing with variable delays
  useEffect(() => {
    if (!introEnabled || !intro) return;
    let i = 0;
    const chars = titleCharsRef.current;
    function step() {
      if (i >= chars.length) return;
      setTypedTitleCount(i + 1);
      i++;
      if (i < chars.length) {
        setTimeout(step, chars[i - 1].delay);
      }
    }
    step();
  }, [introEnabled, intro]);

  // Subtitle typing with delay and variable speed
  useEffect(() => {
    if (!introEnabled || !intro || typedTitleCount < titleCharsRef.current.length) return;
    setTimeout(() => {
      let i = 0;
      const chars = subCharsRef.current;
      function step() {
        if (i >= chars.length) return;
        setTypedSubCount(i + 1);
        i++;
        if (i < chars.length) {
          setTimeout(step, chars[i - 1].delay);
        }
      }
      step();
    }, 60);
  }, [introEnabled, intro, typedTitleCount]);

  useEffect(() => {
    if (!introEnabled || !intro || typedTitleCount < titleCharsRef.current.length) return;
    const t = setTimeout(() => setBtnIn(true), 180);
    return () => clearTimeout(t);
  }, [introEnabled, intro, typedTitleCount]);

  useEffect(() => {
    if (!introEnabled || !intro || typedSubCount < subCharsRef.current.length) return;
    setCaretDone(true);
    const t = setTimeout(() => setHideCaret(true), 1400);
    return () => clearTimeout(t);
  }, [introEnabled, intro, typedSubCount]);

  // Animation loop
  useEffect(() => {
    if (!introEnabled) return;

    let raf: number;

    function animate() {
      raf = requestAnimationFrame(animate);
      
      // Auto-play logic
      if (autoPlayRef.current) {
        targetRef.current = Math.max(0, Math.min(1, targetRef.current + autoDirectionRef.current * 0.013));
      }

      // Smooth interpolation
      setProgress((current) => {
        const next = current + (targetRef.current - current) * 0.15;
        if (Math.abs(targetRef.current - next) < 0.0008) return targetRef.current;
        
        // Apply canvas morphing
        applyCanvasMorph(next);
        
        return next;
      });
    }

    animate();
    return () => cancelAnimationFrame(raf);
  }, [introEnabled]);

  // Apply canvas morphing animation
  const applyCanvasMorph = (p: number) => {
    if (!introEnabledRef.current) return;
    if (!canvasFromRef.current || !canvasToRef.current) {
      measurePositions();
      return;
    }
    
    const cv = document.getElementById("introRevealCv") as HTMLCanvasElement | null;
    if (!cv) return;
    
    const F = canvasFromRef.current;
    const L = canvasToRef.current;
    const e = ease(p);
    
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    
    // Apply morphing with proper border radius transition
    const targetRadius = heroRadiusRef.current;
    
    // On large screens, use smoother transitions
    const isLargeScreen = window.innerWidth >= 1440;
    const borderEase = isLargeScreen ? ease(e * e) : e;
    
    cv.style.left = lerp(F.left, L.left, e) + "px";
    cv.style.top = lerp(F.top, L.top, e) + "px";
    cv.style.width = lerp(F.width, L.width, e) + "px";
    cv.style.height = lerp(F.height, L.height, e) + "px";
    
    // Interpolate border radius - start from intro wrapper's radius, end at hero radius
    if (p < 0.1) {
      cv.style.borderRadius = "14px 0 0 14px";
    } else {
      const radius = lerp(14, targetRadius, borderEase);
      cv.style.borderRadius = radius + "px";
    }
    
    cv.style.pointerEvents = p < 0.85 ? "auto" : "none";
    cv.style.opacity = String(1 - seg(p, 0.78, 1));
  };

  // Update intro state and body class based on progress
  useEffect(() => {
    if (!introEnabled) return;
    if (progress >= 0.999) {
      markIntroSeen();
      document.body.classList.remove("intro-active");
      setIntro(false);
    } else {
      document.body.classList.add("intro-active");
      setIntro(true);
    }
  }, [introEnabled, progress]);

  // Scroll handler — only while intro is active and not yet completed this session
  useEffect(() => {
    if (!introEnabled || introSkippedRef.current) return;

    const drive = (delta: number) => {
      if (introSkippedRef.current) return;
      autoPlayRef.current = false;
      targetRef.current = Math.max(0, Math.min(1, targetRef.current + delta));
      
      // Auto-play logic: if scrolled past threshold, auto-complete
      if (delta > 0 && targetRef.current > 0.16) {
        autoPlayRef.current = true;
        autoDirectionRef.current = 1;
      } else if (delta < 0 && targetRef.current < 0.84) {
        autoPlayRef.current = true;
        autoDirectionRef.current = -1;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (introSkippedRef.current) return;
      const transitioning = progress < 0.999 || targetRef.current < 0.999;
      if (transitioning) {
        e.preventDefault();
        drive(e.deltaY / 1500);
      }
    };

    let touchY: number | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (introSkippedRef.current) return;
      if (touchY === null) {
        touchY = e.touches[0].clientY;
        return;
      }
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      
      const transitioning = progress < 0.999 || targetRef.current < 0.999;
      if (transitioning) {
        e.preventDefault();
        drive(dy / 520);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [introEnabled, progress]);

  // Button click handler
  const handleEnterApp = () => {
    autoPlayRef.current = true;
    autoDirectionRef.current = 1;
  };

  // Remeasure on resize
  useEffect(() => {
    if (!introEnabled) return;

    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize for better performance
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!introEnabledRef.current) return;
        measurePositions();
        applyCanvasMorph(progress);
        
        // On large screens, do a double measurement for accuracy
        if (window.innerWidth >= 1440) {
          setTimeout(() => {
            if (!introEnabledRef.current) return;
            measurePositions();
            applyCanvasMorph(progress);
          }, 100);
        }
      }, 150);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [introEnabled, progress]);

  const ease = (t: number) => {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const seg = (p: number, a: number, b: number) => {
    const t = (p - a) / (b - a);
    return ease(t < 0 ? 0 : t > 1 ? 1 : t);
  };

  const p = introSkippedRef.current || !introEnabled ? 1 : progress;
  const introOpacity = 1 - seg(p, 0.06, 0.5);
  const leftOpacity = 1 - seg(p, 0, 0.42);
  const leftTransX = -26 * seg(p, 0, 0.42);
  const hintOpacity = p < 0.04 ? 1 : 1 - seg(p, 0.04, 0.32);
  const sbTransY = (1 - seg(p, 0, 0.9)) * 112;
  const sbOpacity = seg(p, 0, 0.9);
  const railTransX = (1 - seg(p, 0.12, 0.97)) * 120;
  const railOpacity = seg(p, 0.12, 0.97);
  const navROpacity = seg(p, 0.12, 0.97);
  const navRTransY = (1 - seg(p, 0.12, 0.97)) * -8;
  const feedTransY = (1 - seg(p, 0.05, 0.95)) * 48;
  const feedOpacity = seg(p, 0.05, 0.95);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className={`page-loader ${loaderOut ? "out" : ""}`} id="loader">
        <div className="loader-inner">
          <span className="ll">H</span>
          <span className="ll">N</span>
          <span className="ll">T</span>
          <span className="ll">R</span>
          <span className="ls">.art</span>
          <span className="loader-cursor" />
        </div>
      </div>

      {introEnabled && (
      <div
        id="introOverlay"
        style={{
          display: p < 0.999 ? "flex" : "none",
          opacity: introOpacity,
          pointerEvents: p > 0.5 ? "none" : "auto"
        }}
      >
        <div className="intro-inner">
          <div
            className="intro-left"
            style={{
              opacity: leftOpacity,
              transform: `translateX(${leftTransX}px)`
            }}
          >
            <h1 className="intro-title">
              {renderTypedSegments(TITLE_SEGMENTS, typedTitleCount, "title")}
              {!hideCaret && typedTitleCount < titleCharsRef.current.length && <span className="tw-caret" />}
            </h1>
            <p className="intro-sub">
              {renderTypedSegments(SUB_SEGMENTS, typedSubCount, "sub")}
              {!hideCaret && typedTitleCount >= titleCharsRef.current.length && (
                <span className={`tw-caret ${caretDone ? "tw-done" : ""}`} />
              )}
            </p>
            <button className={`intro-btn ${btnIn ? "tw-in" : ""}`} onClick={handleEnterApp}>
              EXPLORE NOW
            </button>
          </div>
          <div className="intro-imgwrap">
            <canvas id="introRevealCv" />
          </div>
        </div>
        <div className="intro-scrollhint" style={{ opacity: hintOpacity }}>
          Scroll to explore ↓
        </div>
      </div>
      )}

      <MainLayout
        sbTransY={sbTransY}
        sbOpacity={sbOpacity}
        railTransX={railTransX}
        railOpacity={railOpacity}
      >
        <div
          className="feed"
          id="feed-home"
          style={{
            transform: `translateY(${feedTransY}px)`,
            opacity: feedOpacity
          }}
        >
          <div className="hero">
                <canvas id="homeRevealCv" />
                <div className="home-reveal-shade" />
                <div className="hero-left" style={{ zIndex: 2, pointerEvents: "none", padding: "26px 24px 26px 24px" }}>
                  <div className="hero-title" style={{ textShadow: "0 2px 10px rgba(0,0,0,.7)" }}>HNTR</div>
                  <div className="hero-sub" style={{ color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,.85), 0 0 2px rgba(0,0,0,.6)" }}>Your gateaway to the NFT Universe.</div>
                </div>
                <div className="hero-right">
                  <div className="hero-mosaic" id="mosaic" />
                </div>
              </div>

              <div className="pbar">
                <div className="pbar-lbl">Partners</div>
                <div className="tick-wrap">
                  <div className="tick-track">
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="45" fill="#1a9eff"></circle>
                        <path d="M25 60 Q50 20 75 60" stroke="white" strokeWidth="8" fill="none"></path>
                        <circle cx="50" cy="68" r="10" fill="white"></circle>
                      </svg>
                      Pudgy Penguins
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#2081E2"></circle>
                        <path d="M16 8.5L8 13v6l8 4.5 8-4.5v-6L16 8.5z" fill="white" opacity=".9"></path>
                      </svg>
                      OpenSea
                    </div>
                    <div className="pt" style={{ fontStyle: 'italic', letterSpacing: '.06em' }}>
                      YugaLabs
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#2081E2"></circle>
                        <path d="M16 8.5L8 13v6l8 4.5 8-4.5v-6L16 8.5z" fill="white" opacity=".9"></path>
                      </svg>
                      OpenSea
                    </div>
                    <div className="pt" style={{ letterSpacing: '.08em', fontWeight: 700 }}>
                      BLUR
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#FF007A"></circle>
                        <path d="M10 16 Q16 8 22 16 Q16 24 10 16z" fill="white"></path>
                      </svg>
                      Uniswap
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="45" fill="#1a9eff"></circle>
                        <path d="M25 60 Q50 20 75 60" stroke="white" strokeWidth="8" fill="none"></path>
                        <circle cx="50" cy="68" r="10" fill="white"></circle>
                      </svg>
                      Pudgy Penguins
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#2081E2"></circle>
                        <path d="M16 8.5L8 13v6l8 4.5 8-4.5v-6L16 8.5z" fill="white" opacity=".9"></path>
                      </svg>
                      OpenSea
                    </div>
                    <div className="pt" style={{ fontStyle: 'italic', letterSpacing: '.06em' }}>
                      YugaLabs
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#2081E2"></circle>
                        <path d="M16 8.5L8 13v6l8 4.5 8-4.5v-6L16 8.5z" fill="white" opacity=".9"></path>
                      </svg>
                      OpenSea
                    </div>
                    <div className="pt" style={{ letterSpacing: '.08em', fontWeight: 700 }}>
                      BLUR
                    </div>
                    <div className="pt">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="14" fill="#FF007A"></circle>
                        <path d="M10 16 Q16 8 22 16 Q16 24 10 16z" fill="white"></path>
                      </svg>
                      Uniswap
                    </div>
                  </div>
                </div>
              </div>

              <div className="sh sh-strategies" style={{ position: 'relative' }}>
                <div className="sh-strategies-left">
                  <div className="st" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    HNTR LIVE STRATEGIES
                    <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,.8)', flexShrink: 0 }} />
                  </div>
                  <span className="featured-pill">
                    Featured
                  </span>
                </div>
                <div className="sh-strategies-right">
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={goToPrevSlide}
                      disabled={!canGoPrev}
                      aria-label="Previous strategy"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--bd1)',
                        background: 'var(--e2)',
                        color: 'var(--t3)',
                        cursor: canGoPrev ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        opacity: canGoPrev ? 1 : 0.4,
                        transition: 'all .15s'
                      }}
                      onMouseEnter={(e) => {
                        if (canGoPrev) {
                          e.currentTarget.style.background = 'var(--e3)';
                          e.currentTarget.style.borderColor = 'var(--bd2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--e2)';
                        e.currentTarget.style.borderColor = 'var(--bd1)';
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={goToNextSlide}
                      disabled={!canGoNext}
                      aria-label="Next strategy"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--bd1)',
                        background: 'var(--e2)',
                        color: 'var(--t3)',
                        cursor: canGoNext ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        opacity: canGoNext ? 1 : 0.4,
                        transition: 'all .15s'
                      }}
                      onMouseEnter={(e) => {
                        if (canGoNext) {
                          e.currentTarget.style.background = 'var(--e3)';
                          e.currentTarget.style.borderColor = 'var(--bd2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--e2)';
                        e.currentTarget.style.borderColor = 'var(--bd1)';
                      }}
                    >
                      →
                    </button>
                  </div>
                  <Link href="/pools" className="va" style={{ cursor: "pointer" }}>
                    View All Pools
                  </Link>
                </div>
              </div>

              <div
                ref={npViewportRef}
                className="np-slider-viewport"
                style={{ 
                overflow: 'hidden', 
                marginBottom: '22px',
                position: 'relative',
                width: '100%'
              }}>
                <div 
                  className="np-grid" 
                  style={{ 
                    transform: `translateX(-${slideOffset}px)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'visible',
                    marginBottom: '0',
                    paddingBottom: '0',
                    maskImage: 'none',
                    WebkitMaskImage: 'none'
                  }}
                >
                {strategyPools.map((pool) => (
                  <div className="npc" key={`${pool.slug}-${pool.tokenId}`}>
                    <div className="npc-row">
                      <div className="npc-art" onClick={() => router.push("/pool/54587")} style={{ cursor: "pointer" }}>
                        <img src={pool.img} alt={`${pool.displayName} #${pool.tokenId}`} />
                        <div className="npc-pool">POOL #{pool.tokenId}</div>
                      </div>
                      <div className="npc-body">
                        <div className="npc-head">
                          <div>
                            <div className="npc-name">
                              {pool.displayName} <span>#{pool.tokenId}</span>
                            </div>
                            <div className="npc-tags">
                              {pool.tags.map((tag) => (
                                <span className="npc-tag" key={tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button className="npc-insights" onClick={() => router.push("/pool/54587")}>
                            <i></i>VIEW INSIGHTS
                          </button>
                        </div>
                        <div className="npc-stats">
                          <div>
                            <div className="npc-sl">Pool Target</div>
                            <div className="npc-sv">
                              {pool.targetLabel}
                              <span className="eth-ic"></span>
                            </div>
                            <div className="npc-su">{pool.targetUsd}</div>
                          </div>
                          <div>
                            <div className="npc-sl">Community Raised</div>
                            <div className="npc-sv raised">
                              {pool.raisedEth.toFixed(2)}
                              <span className="eth-ic"></span>
                            </div>
                            <div className="npc-su">{pool.raisedUsd}</div>
                          </div>
                        </div>
                        <div className="npc-prog">
                          <div className="npc-pr">
                            <span>POOL PROGRESS</span>
                            <span className="pct">{pool.progress.toFixed(1)}%</span>
                          </div>
                          <div className="npc-pb">
                            <div className="npc-pf" style={{ width: `${pool.progress}%` }}></div>
                          </div>
                        </div>
                        <div className="npc-act">
                          <button
                            className="npc-btn-d"
                            onClick={(e) => {
                              const npcCard = e.currentTarget.closest(".npc");
                              if (npcCard) {
                                npcCard.classList.toggle("open");
                                const caret = e.currentTarget.querySelector(".car");
                                if (caret) caret.textContent = npcCard.classList.contains("open") ? "▴" : "▾";
                              }
                            }}
                          >
                            <span className="car">▾</span>Pool Details
                          </button>
                          <button
                            className="npc-btn-p"
                            type="button"
                            onClick={() =>
                              openDepositModal(`${pool.name} #${pool.tokenId}`, pool.targetLabel)
                            }
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
              </div>

              <div className="sh">
                <div>
                  <div className="st">HNTR'S LISTINGS</div>
                  <div className="sub">All NFTs currently for sell</div>
                </div>
                <a className="va" style={{ cursor: 'pointer' }} onClick={() => router.push("/marketplace")}>
                  View All Listings
                </a>
              </div>

              <div className="listings-section" style={{ marginBottom: '22px' }}>
                {isMobile ? (
                  <div className="lg listings-mobile-grid">
                    {listingCards.map((item) => (
                      <ListingCard key={`${item.name}-${item.img}-${item.sell}`} {...item} />
                    ))}
                  </div>
                ) : (
                  <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={5}
                    slidesPerGroup={1}
                    loop={listingCards.length > 5}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true
                    }}
                    speed={800}
                    breakpoints={{
                      901: { slidesPerView: 3, spaceBetween: 10 },
                      1100: { slidesPerView: 4, spaceBetween: 10 },
                      1280: { slidesPerView: 5, spaceBetween: 10 }
                    }}
                  >
                    {listingCards.map((item) => (
                      <SwiperSlide key={`${item.name}-${item.img}-${item.sell}`}>
                        <ListingCard {...item} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>

              <div className="mkt">
                <div className="mh">
                  <div>
                    <div className="st">Market Overview</div>
                    <div className="sub">Real-time NFT liquidity and floor data across major collections.</div>
                  </div>
                  <div className="tf">
                    <div 
                      className={`to ${marketTimeFrame === '24H' ? 'active' : ''}`}
                      onClick={() => setMarketTimeFrame('24H')}
                      style={{ cursor: 'pointer' }}
                    >
                      24H
                    </div>
                    <div 
                      className={`to ${marketTimeFrame === '7D' ? 'active' : ''}`}
                      onClick={() => setMarketTimeFrame('7D')}
                      style={{ cursor: 'pointer' }}
                    >
                      7D
                    </div>
                    <div 
                      className={`to ${marketTimeFrame === '30D' ? 'active' : ''}`}
                      onClick={() => setMarketTimeFrame('30D')}
                      style={{ cursor: 'pointer' }}
                    >
                      30D
                    </div>
                  </div>
                </div>
                <div className="mkp">
                  <div className="mk">
                    <div className="mkl">Total Volume</div>
                    <div className="mkv">
                      {market.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}{" "}
                      <span className="mku">ETH</span>
                    </div>
                  </div>
                  <div className="mk">
                    <div className="mkl">Active Collections</div>
                    <div className="mkv">{market.activeCollections.toLocaleString()}</div>
                  </div>
                  <div className="mk">
                    <div className="mkl">ETH Gas</div>
                    <div className="mkv">12 <span className="mku">Gwei</span></div>
                  </div>
                  <div className="mk">
                    <div className="mkl">NFT Dominance</div>
                    <div className="mkv">8.4 <span className="mku">%</span></div>
                  </div>
                </div>
                <div className="mtt">
                  <div>
                    <div className="mttl"><span className="mdt"></span> Top</div>
                    {market.top.map((row, i) => {
                      const changeLabel = formatChangePct(row.change);
                      const isPos = row.change >= 0;
                      const thumbIsUrl = typeof row.thumb === "string" && row.thumb.startsWith("http");
                      return (
                        <div className="mr" key={`top-${row.name}-${i}`}>
                          <div className="mrth">
                            {thumbIsUrl ? (
                              <img src={row.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                            ) : (
                              row.thumb
                            )}
                          </div>
                          <div className="mri">
                            <div className="mrn">{row.name}</div>
                            <div className="mrf">
                              Floor: {row.floorPrice.toFixed(4)} <span className="eth-ic"></span>
                            </div>
                          </div>
                          <div className={`mrc ${isPos ? "pos" : "neg"}`} data-base={changeLabel}>
                            {changeLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div className="mttl"><span className="mdt"></span> Trending</div>
                    {market.trending.map((row, i) => {
                      const thumbIsUrl = typeof row.thumb === "string" && row.thumb.startsWith("http");
                      return (
                        <div className="mr" key={`trend-${row.name}-${i}`}>
                          <div className="mrth">
                            {thumbIsUrl ? (
                              <img src={row.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                            ) : (
                              row.thumb
                            )}
                          </div>
                          <div className="mri">
                            <div className="mrn">{row.name}</div>
                            <div className="mrf">
                              Floor: {row.floorPrice.toFixed(4)} Ξ · Vol: ${(row.volume || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div className="mttl"><span className="mdt"></span> Top Flyers</div>
                    {market.topFlyers.map((row, i) => {
                      const changeLabel = formatChangePct(row.change);
                      const isPos = row.change >= 0;
                      const thumbIsUrl = typeof row.thumb === "string" && row.thumb.startsWith("http");
                      return (
                        <div className="mr" key={`flyer-${row.name}-${i}`}>
                          <div className="mrth">
                            {thumbIsUrl ? (
                              <img src={row.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                            ) : (
                              row.thumb
                            )}
                          </div>
                          <div className="mri">
                            <div className="mrn">{row.name}</div>
                            <div className="mrf">
                              Floor: {row.floorPrice.toFixed(4)} <span className="eth-ic"></span>
                            </div>
                          </div>
                          <div className={`mrc ${isPos ? "pos" : "neg"}`} data-base={changeLabel}>
                            {changeLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sh">
                <div>
                  <div className="st">HNTR'S SALES</div>
                  <div className="sub">All NFTs sold by HNTR</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <a
                    className="va"
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push("/marketplace")}
                  >
                    View All Sales
                  </a>
                </div>
              </div>

              <div className="sales-marquee" ref={salesMarqueeRef}>
                <div className="sales-track" id="salesTrack" ref={salesTrackRef}>
                  {[...salesCards, ...salesCards].map((sale, idx) => (
                    <div
                      className="sc"
                      key={`${sale.name}-${idx}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (sale.openseaUrl) {
                          window.open(sale.openseaUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      <div className="badge bsold">SOLD</div>
                      <img className="scimg" src={sale.img} alt={sale.name} draggable={false} />
                      <div className="scb">
                        <div className="scn">{sale.name}</div>
                        <div className="scrow">
                          <div className="lck">BOUGHT</div>
                          <div className="lcv">{sale.bought} <span className="eth-ic"></span></div>
                        </div>
                        <div className="scrow">
                          <div className="lck">SALE</div>
                          <div className="lcv">{sale.sale} <span className="eth-ic"></span></div>
                        </div>
                        <div className="scrow">
                          <div className="lck">PROFIT</div>
                          <div className="lcg">{sale.profit}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="home-footer" data-screen-label="Home Footer">
                <div className="hf-top">
                  <div className="hf-logo">
                    <span className="hf-logo-mark">
                      <img src="/assets/images/logoMark.png" alt="HNTR" />
                    </span>
                    <span className="hf-logo-word">HNTR</span>
                  </div>
                  <div className="hf-socials">
                    <a className="hf-social" aria-label="X" href="#" onClick={(e) => e.preventDefault()}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.83L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.02 4.13H5.06l12.02 15.64Z"></path>
                      </svg>
                    </a>
                    <a className="hf-social" aria-label="Discord" href="#" onClick={(e) => e.preventDefault()}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.32 4.37A19.8 19.8 0 0 0 15.44 3l-.24.44a18.3 18.3 0 0 1 4.32 1.34c-2.5-1.14-5.24-1.6-7.52-1.6s-5.02.46-7.52 1.6A18.3 18.3 0 0 1 8.8 3.44L8.56 3A19.8 19.8 0 0 0 3.68 4.37 20.9 20.9 0 0 0 .1 18.61a19.9 19.9 0 0 0 6.06 3.06l.49-.68c-.66-.24-1.29-.54-1.9-.9l.36-.28c3.66 1.7 7.72 1.7 11.34 0l.36.28c-.61.36-1.24.66-1.9.9l.49.68a19.9 19.9 0 0 0 6.06-3.06 20.9 20.9 0 0 0-3.14-14.24ZM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.41s.95-2.41 2.15-2.41 2.17 1.09 2.15 2.41c0 1.33-.95 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41s.95-2.41 2.15-2.41 2.17 1.09 2.15 2.41c0 1.33-.94 2.41-2.15 2.41Z"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </footer>
            </div>
        </MainLayout>
      </div>
    );
  }

