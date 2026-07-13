"use client";

import Link from "next/link";
import { Fragment, ReactNode, useEffect, useLayoutEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import MainLayout from "./components/MainLayout";
import { openDepositModal } from "../lib/deposit-modal";
import { useRouter } from "nextjs-toploader/app";

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
  { text: "Decentralized. Transparent. ", cls: "tagline" },
  { text: "Forever in Motion.", cls: "tagline tw-orange" }
];

// Build array of characters with their timing info
function buildTimedChars(segments: Segment[], baseSpeed: number) {
  const chars: { ch: string; seg: number; idx: number; delay: number }[] = [];
  segments.forEach((seg, segIdx) => {
    [...seg.text].forEach((ch, idx) => {
      if (ch === "\n") return;
      let delay = baseSpeed;
      if (ch === " ") delay = baseSpeed * 0.4;
      else if (ch === ",") delay = baseSpeed * 4;
      else if (ch === ".") delay = baseSpeed * 7;
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

const LISTING_CARDS = [
  { img: "/assets/images/image-11.jpg", name: "BAYC #9112", bought: "5.75", sell: "7.15", profit: "+19.3%", soon: false },
  { img: "/assets/images/image-6.jpg", name: "BAYC #9112", bought: "4.75", sell: "9.75", profit: "+18.8%", soon: false },
  { img: "/assets/images/image-3.jpg", name: "BAYC #9112", bought: "4.1", sell: "7.9", profit: "+18.8%", soon: false },
  { img: "/assets/images/image-7.jpg", name: "BAYC #5621", bought: "6.2", sell: "8.5", profit: "+15.4%", soon: false },
  { img: "/assets/images/image-5.jpg", name: "BAYC #7832", bought: "3.8", sell: "6.2", profit: "+17.5%", soon: false },
  { img: "/assets/images/image-8.jpg", name: "BAYC #4521", bought: "5.2", sell: "7.8", profit: "+16.2%", soon: false },
  { img: "/assets/images/image-4.jpg", name: "COMING SOON", bought: "--", sell: "--", profit: "--", soon: true },
];

function ListingCard({
  img,
  name,
  bought,
  sell,
  profit,
  soon,
}: {
  img: string;
  name: string;
  bought: string;
  sell: string;
  profit: string;
  soon: boolean;
}) {
  const openListing = () => {
    if (soon) return;
    window.open("https://opensea.io", "_blank", "noopener,noreferrer");
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
  const [marketTimeFrame, setMarketTimeFrame] = useState("24H");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSlideWidth, setMobileSlideWidth] = useState(0);
  const totalSlides = 3;
  const cardWidth = 468;
  const cardGap = 14;
  const npViewportRef = useRef<HTMLDivElement | null>(null);
  
  const titleCharsRef = useRef(buildTimedChars(TITLE_SEGMENTS, 46));
  const subCharsRef = useRef(buildTimedChars(SUB_SEGMENTS, 15));
  const targetRef = useRef(0);
  const autoPlayRef = useRef(false);
  const autoDirectionRef = useRef(1);
  const canvasFromRef = useRef<DOMRect | null>(null);
  const canvasToRef = useRef<DOMRect | null>(null);
  const heroRadiusRef = useRef(10);
  const introEnabledRef = useRef(false);

  const skipIntroForMobile = () => {
    setIntroEnabled(false);
    introEnabledRef.current = false;
    setIntro(false);
    setProgress(1);
    targetRef.current = 1;
    autoPlayRef.current = false;
    document.body.classList.remove("intro-active");

    const cv = document.getElementById("introRevealCv") as HTMLCanvasElement | null;
    if (cv) {
      cv.removeAttribute("style");
      const wrap = document.querySelector(".intro-imgwrap");
      if (wrap && cv.parentNode !== wrap) wrap.appendChild(cv);
    }
  };

  // Decide intro eligibility before paint (avoids mobile flash)
  useLayoutEffect(() => {
    const mq = window.matchMedia(INTRO_DESKTOP_MQ);

    const apply = () => {
      if (mq.matches) {
        setIntroEnabled(true);
        introEnabledRef.current = true;
        if (targetRef.current < 0.999) {
          document.body.classList.add("intro-active");
          setIntro(true);
        }
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

  useEffect(() => {
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
    
    // Measure from position (intro canvas in its natural position)
    // Add small delay on large screens for accurate measurement
    const isLargeScreen = window.innerWidth >= 1440;
    if (isLargeScreen && !isPinned) {
      requestAnimationFrame(() => {
        canvasFromRef.current = cv.getBoundingClientRect();
      });
    } else {
      canvasFromRef.current = cv.getBoundingClientRect();
    }
    
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
    if (canvasFromRef.current && canvasToRef.current) {
      (cv as any).__rscale = canvasToRef.current.height / canvasFromRef.current.height;
    }
    
    feed.style.transform = savedTransform;
    feed.style.transition = savedTransition;
    feed.style.opacity = savedOpacity;
    
    // Set to fixed positioning for animation
    cv.style.position = "fixed";
    cv.style.margin = "0";
    cv.style.inset = "auto";
    cv.style.zIndex = "940";
    
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
    }, 260);
  }, [introEnabled, intro, typedTitleCount]);

  useEffect(() => {
    if (!introEnabled || !intro || typedSubCount < subCharsRef.current.length) return;
    setCaretDone(true);
    setBtnIn(true);
    const t = setTimeout(() => setHideCaret(true), 3200);
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
      document.body.classList.remove("intro-active");
      setIntro(false);
    } else {
      document.body.classList.add("intro-active");
      setIntro(true);
    }
  }, [introEnabled, progress]);

  // Scroll handler
  useEffect(() => {
    if (!introEnabled) return;

    const drive = (delta: number) => {
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

  const p = introEnabled ? progress : 1;
  const introOpacity = 1 - seg(p, 0.06, 0.5);
  const leftOpacity = 1 - seg(p, 0, 0.42);
  const leftTransX = -26 * seg(p, 0, 0.42);
  const hintOpacity = 1 - seg(p, 0, 0.22);
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
                      onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                      disabled={currentSlide === 0}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--bd1)',
                        background: 'var(--e2)',
                        color: 'var(--t3)',
                        cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        opacity: currentSlide === 0 ? 0.4 : 1,
                        transition: 'all .15s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentSlide > 0) {
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
                      onClick={() => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1))}
                      disabled={currentSlide === totalSlides - 1}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--bd1)',
                        background: 'var(--e2)',
                        color: 'var(--t3)',
                        cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        opacity: currentSlide === totalSlides - 1 ? 0.4 : 1,
                        transition: 'all .15s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentSlide < totalSlides - 1) {
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
                    transform: `translateX(-${
                      currentSlide *
                      (isMobile
                        ? (mobileSlideWidth || 0)
                        : cardWidth + cardGap)
                    }px)`,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'visible',
                    marginBottom: '0',
                    paddingBottom: '0',
                    maskImage: 'none',
                    WebkitMaskImage: 'none'
                  }}
                >
                <div className="npc">
                  <div className="npc-row">
                    <div className="npc-art" onClick={() => router.push("/pool/54587")} style={{ cursor: "pointer" }}>
                      <img src="/assets/images/image-11.jpg" alt="Bored Ape Yacht Club" />
                      <div className="npc-pool">POOL #3362</div>
                    </div>
                    <div className="npc-body">
                      <div className="npc-head">
                        <div>
                          <div className="npc-name">Bored Ape Yacht Club <span>#3362</span></div>
                          <div className="npc-tags">
                            <span className="npc-tag">YUGA LABS</span>
                            <span className="npc-tag">SERIES 1/1000</span>
                          </div>
                        </div>
                        <button className="npc-insights" onClick={() => router.push("/pool/54587")}>
                          <i></i>VIEW INSIGHTS
                        </button>
                      </div>
                      <div className="npc-stats">
                        <div>
                          <div className="npc-sl">Pool Target</div>
                          <div className="npc-sv">10.00<span className="eth-ic"></span></div>
                          <div className="npc-su">$21,975.20</div>
                        </div>
                        <div>
                          <div className="npc-sl">Community Raised</div>
                          <div className="npc-sv raised">4.52<span className="eth-ic"></span></div>
                          <div className="npc-su">$9,932.79</div>
                        </div>
                      </div>
                      <div className="npc-prog">
                        <div className="npc-pr">
                          <span>POOL PROGRESS</span>
                          <span className="pct">45.2%</span>
                        </div>
                        <div className="npc-pb">
                          <div className="npc-pf" style={{ width: '45.2%' }}></div>
                        </div>
                      </div>
                      <div className="npc-act">
                        <button className="npc-btn-d" onClick={(e) => {
                          const npcCard = e.currentTarget.closest('.npc');
                          if (npcCard) {
                            npcCard.classList.toggle('open');
                            const caret = e.currentTarget.querySelector('.car');
                            if (caret) caret.textContent = npcCard.classList.contains('open') ? '▴' : '▾';
                          }
                        }}>
                          <span className="car">▾</span>Pool Details
                        </button>
                        <button
                          className="npc-btn-p"
                          type="button"
                          onClick={() => openDepositModal("Bored Ape Yacht Club #3362", "10.00")}
                        >
                          Make a Deposit Now
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="npc-detail">
                    <div className="npc-detail-in">
                      <div className="npc-db"><div className="npc-dl">GP Profit</div><div className="npc-dv">10.00%</div></div>
                      <div className="npc-db"><div className="npc-dl">ETH Profit</div><div className="npc-dv">1.75 <span className="eth-ic"></span></div></div>
                      <div className="npc-db"><div className="npc-dl">USDT Profit</div><div className="npc-dv">$4,198</div></div>
                      <div className="npc-db"><div className="npc-dl">Users</div><div className="npc-dv">132</div></div>
                    </div>
                  </div>
                </div>

                <div className="npc">
                  <div className="npc-row">
                    <div className="npc-art" onClick={() => router.push("/pool/54587")} style={{ cursor: "pointer" }}>
                      <img src="/assets/images/image-6.jpg" alt="Pudgy Penguins" />
                      <div className="npc-pool">POOL #3362</div>
                    </div>
                    <div className="npc-body">
                      <div className="npc-head">
                        <div>
                          <div className="npc-name">Pudgy Penguins <span>#3362</span></div>
                          <div className="npc-tags">
                            <span className="npc-tag">PPENGUIN</span>
                            <span className="npc-tag">SERIES V/500</span>
                          </div>
                        </div>
                        <button className="npc-insights" onClick={() => router.push("/pool/54587")}>
                          <i></i>VIEW INSIGHTS
                        </button>
                      </div>
                      <div className="npc-stats">
                        <div>
                          <div className="npc-sl">Pool Target</div>
                          <div className="npc-sv">5.45<span className="eth-ic"></span></div>
                          <div className="npc-su">$11,976.48</div>
                        </div>
                        <div>
                          <div className="npc-sl">Community Raised</div>
                          <div className="npc-sv raised">2.73<span className="eth-ic"></span></div>
                          <div className="npc-su">$5,999.23</div>
                        </div>
                      </div>
                      <div className="npc-prog">
                        <div className="npc-pr">
                          <span>POOL PROGRESS</span>
                          <span className="pct">50.1%</span>
                        </div>
                        <div className="npc-pb">
                          <div className="npc-pf" style={{ width: '50.1%' }}></div>
                        </div>
                      </div>
                      <div className="npc-act">
                        <button className="npc-btn-d" onClick={(e) => {
                          const npcCard = e.currentTarget.closest('.npc');
                          if (npcCard) {
                            npcCard.classList.toggle('open');
                            const caret = e.currentTarget.querySelector('.car');
                            if (caret) caret.textContent = npcCard.classList.contains('open') ? '▴' : '▾';
                          }
                        }}>
                          <span className="car">▾</span>Pool Details
                        </button>
                        <button
                          className="npc-btn-p"
                          type="button"
                          onClick={(e) => {
                            const card = e.currentTarget.closest(".npc");
                            const name = card?.querySelector(".npc-name")?.textContent?.replace(/\s+/g, " ").trim() || "Pool Asset";
                            const target = card?.querySelector(".npc-sv")?.textContent?.replace(/[^\d.]/g, "") || "0.00";
                            openDepositModal(name, target);
                          }}
                        >
                          Make a Deposit Now
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="npc-detail">
                    <div className="npc-detail-in">
                      <div className="npc-db"><div className="npc-dl">GP Profit</div><div className="npc-dv">10.00%</div></div>
                      <div className="npc-db"><div className="npc-dl">ETH Profit</div><div className="npc-dv">1.75 <span className="eth-ic"></span></div></div>
                      <div className="npc-db"><div className="npc-dl">USDT Profit</div><div className="npc-dv">$4,198</div></div>
                      <div className="npc-db"><div className="npc-dl">Users</div><div className="npc-dv">132</div></div>
                    </div>
                  </div>
                </div>

                <div className="npc">
                  <div className="npc-row">
                    <div className="npc-art" onClick={() => router.push("/pool/54587")} style={{ cursor: "pointer" }}>
                      <img src="/assets/images/image-3.jpg" alt="CryptoPunks" />
                      <div className="npc-pool">POOL #7804</div>
                    </div>
                    <div className="npc-body">
                      <div className="npc-head">
                        <div>
                          <div className="npc-name">CryptoPunks <span>#7804</span></div>
                          <div className="npc-tags">
                            <span className="npc-tag">LARVA LABS</span>
                            <span className="npc-tag">SERIES 1/10000</span>
                          </div>
                        </div>
                        <button className="npc-insights" onClick={() => router.push("/pool/54587")}>
                          <i></i>VIEW INSIGHTS
                        </button>
                      </div>
                      <div className="npc-stats">
                        <div>
                          <div className="npc-sl">Pool Target</div>
                          <div className="npc-sv">31.00<span className="eth-ic"></span></div>
                          <div className="npc-su">$68,123.12</div>
                        </div>
                        <div>
                          <div className="npc-sl">Community Raised</div>
                          <div className="npc-sv raised">22.30<span className="eth-ic"></span></div>
                          <div className="npc-su">$49,004.70</div>
                        </div>
                      </div>
                      <div className="npc-prog">
                        <div className="npc-pr">
                          <span>POOL PROGRESS</span>
                          <span className="pct">71.9%</span>
                        </div>
                        <div className="npc-pb">
                          <div className="npc-pf" style={{ width: '71.9%' }}></div>
                        </div>
                      </div>
                      <div className="npc-act">
                        <button className="npc-btn-d" onClick={(e) => {
                          const npcCard = e.currentTarget.closest('.npc');
                          if (npcCard) {
                            npcCard.classList.toggle('open');
                            const caret = e.currentTarget.querySelector('.car');
                            if (caret) caret.textContent = npcCard.classList.contains('open') ? '▴' : '▾';
                          }
                        }}>
                          <span className="car">▾</span>Pool Details
                        </button>
                        <button
                          className="npc-btn-p"
                          type="button"
                          onClick={(e) => {
                            const card = e.currentTarget.closest(".npc");
                            const name = card?.querySelector(".npc-name")?.textContent?.replace(/\s+/g, " ").trim() || "Pool Asset";
                            const target = card?.querySelector(".npc-sv")?.textContent?.replace(/[^\d.]/g, "") || "0.00";
                            openDepositModal(name, target);
                          }}
                        >
                          Make a Deposit Now
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="npc-detail">
                    <div className="npc-detail-in">
                      <div className="npc-db"><div className="npc-dl">GP Profit</div><div className="npc-dv">9.20%</div></div>
                      <div className="npc-db"><div className="npc-dl">ETH Profit</div><div className="npc-dv">2.10 <span className="eth-ic"></span></div></div>
                      <div className="npc-db"><div className="npc-dl">USDT Profit</div><div className="npc-dv">$5,040</div></div>
                      <div className="npc-db"><div className="npc-dl">Users</div><div className="npc-dv">88</div></div>
                    </div>
                  </div>
                </div>
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
                    {LISTING_CARDS.map((item) => (
                      <ListingCard key={`${item.name}-${item.img}`} {...item} />
                    ))}
                  </div>
                ) : (
                  <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={5}
                    slidesPerGroup={1}
                    loop={true}
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
                    {LISTING_CARDS.map((item) => (
                      <SwiperSlide key={`${item.name}-${item.img}`}>
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
                    <div className="mkv">42,819 <span className="mku">ETH</span></div>
                  </div>
                  <div className="mk">
                    <div className="mkl">Active Collections</div>
                    <div className="mkv">1,204</div>
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
                    <div className="mr"><div className="mrth">🧱</div><div className="mri"><div className="mrn">CryptoPunks</div><div className="mrf">Floor: 30.1900 <span className="eth-ic"></span></div></div><div className="mrc pos" id="mrc1" data-base="+0.18 %">+0.18 %</div></div>
                    <div className="mr"><div className="mrth">✒</div><div className="mri"><div className="mrn">Autoglyphs</div><div className="mrf">Floor: 81.0000 <span className="eth-ic"></span></div></div><div className="mrc neg" id="mrc2" data-base="−8.88 %">−8.88 %</div></div>
                    <div className="mr"><div className="mrth">🎨</div><div className="mri"><div className="mrn">Fidenza by Tyler Hobbs</div><div className="mrf">Floor: 16.4000 <span className="eth-ic"></span></div></div><div className="mrc neg" id="mrc3" data-base="−0.38 %">−0.38 %</div></div>
                    <div className="mr"><div className="mrth">🦧</div><div className="mri"><div className="mrn">Bored Ape Yacht Club</div><div className="mrf">Floor: 7.7994 <span className="eth-ic"></span></div></div><div className="mrc pos" id="mrc4" data-base="+2.44 %">+2.44 %</div></div>
                    <div className="mr"><div className="mrth">🐧</div><div className="mri"><div className="mrn">Pudgy Penguins</div><div className="mrf">Floor: 4.3499 <span className="eth-ic"></span></div></div><div className="mrc pos" id="mrc5" data-base="+6.38 %">+6.38 %</div></div>
                  </div>
                  <div>
                    <div className="mttl"><span className="mdt"></span> Trending</div>
                    <div className="mr"><div className="mrth">🍜</div><div className="mri"><div className="mrn">Nakamigos</div><div className="mrf">Floor: 0.1358 Ξ · Vol: $4,881</div></div></div>
                    <div className="mr"><div className="mrth">🐻</div><div className="mri"><div className="mrn">NORMIES</div><div className="mrf">Floor: 0.0544 Ξ · Vol: $7,7317</div></div></div>
                    <div className="mr"><div className="mrth">⚡</div><div className="mri"><div className="mrn">Kaito Genesis</div><div className="mrf">Floor: 1.3589 Ξ · Vol: $3,4152</div></div></div>
                    <div className="mr"><div className="mrth">🐸</div><div className="mri"><div className="mrn">Lil Pudgys</div><div className="mrf">Floor: 0.9888 Ξ · Vol: $9,6610</div></div></div>
                    <div className="mr"><div className="mrth">👻</div><div className="mri"><div className="mrn">Invisible Friends</div><div className="mrf">Floor: 0.1244 Ξ · Vol: $2,7075</div></div></div>
                  </div>
                  <div>
                    <div className="mttl"><span className="mdt"></span> Top Flyers</div>
                    <div className="mr"><div className="mrth">⚡</div><div className="mri"><div className="mrn">Kaito Genesis</div><div className="mrf">Floor: 0.1500 <span className="eth-ic"></span></div></div><div className="mrc pos" id="mrc6" data-base="+41.65 %">+41.65 %</div></div>
                    <div className="mr"><div className="mrth">🌿</div><div className="mri"><div className="mrn">VoxFriends</div><div className="mrf">Floor: 1.0390 <span className="eth-ic"></span></div></div><div className="mrc pos" id="mrc7" data-base="+28.79 %">+28.79 %</div></div>
                    <div className="mr"><div className="mrth">🐕</div><div className="mri"><div className="mrn">Bored Ape Kennel Club</div><div className="mrf">Floor: 0.3080 <span className="eth-ic"></span></div></div><div className="mrc pos" id="mrc8" data-base="+13.48 %">+13.48 %</div></div>
                    <div className="mr"><div className="mrth">🐧</div><div className="mri"><div className="mrn">Pudgy Rods</div><div className="mrf">Floor: 0.1250 <span className="eth-ic"></span></div></div><div className="mrc neg" id="mrc9" data-base="−5.07 %">−5.07 %</div></div>
                    <div className="mr"><div className="mrth">🌍</div><div className="mri"><div className="mrn">Terraforms by Mathcastles</div><div className="mrf">Floor: 0.5001 <span className="eth-ic"></span></div></div><div className="mrc neg" id="mrc10" data-base="−6.64 %">−6.64 %</div></div>
                  </div>
                </div>
              </div>

              <div className="sh">
                <div>
                  <div className="st">HNTR'S SALES</div>
                  <div className="sub">All NFTs sold by HNTR</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <a className="va" style={{ cursor: 'pointer' }}>View All Sales</a>
                </div>
              </div>

              <div className="sales-marquee">
                <div className="sales-track" id="salesTrack">
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-11.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #3425</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">7.50 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">8.25 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-6.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #7821</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">8.64 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">9.50 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+9.9%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-3.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">CryptoPunks #5421</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">29.23 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">32.15 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-7.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #9321</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">7.09 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">7.80 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-5.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Azuki #1245</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">5.14 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">5.65 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+9.9%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-8.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #4523</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">8.09 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">8.90 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-4.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Doodles #2341</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">5.73 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">6.30 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+9.9%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-9.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Pudgy Penguins #6754</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">4.41 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">4.85 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  {/* Duplicate for seamless loop */}
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-11.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #3425</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">7.50 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">8.25 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-6.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #7821</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">8.64 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">9.50 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+9.9%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-3.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">CryptoPunks #5421</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">29.23 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">32.15 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc">
                    <div className="badge bsold">SOLD</div>
                    <img className="scimg" src="/assets/images/image-7.jpg" alt="Sold NFT" />
                    <div className="scb">
                      <div className="scn">Bored Ape YC #9321</div>
                      <div className="scrow">
                        <div className="lck">BOUGHT</div>
                        <div className="lcv">7.09 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">SALE</div>
                        <div className="lcv">7.80 <span className="eth-ic"></span></div>
                      </div>
                      <div className="scrow">
                        <div className="lck">PROFIT</div>
                        <div className="lcg">+10%</div>
                      </div>
                    </div>
                  </div>
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

