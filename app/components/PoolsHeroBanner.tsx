"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { initPoolsBannerGears } from "../../lib/banners";
import PoolsBannerArt from "./PoolsBannerArt";

function PoolsHeroBanner() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    return initPoolsBannerGears(hero);
  }, []);

  return (
    <div className="pools-hero" ref={heroRef}>
      <div className="pools-hero-shade" />
      <PoolsBannerArt />
      <div className="pools-hero-content">
        <div className="pools-hero-title">NFT STRATEGIES</div>
        <div className="pools-hero-sub">
          An automatic mechanism designed to accumulate assets, sell for profit and share with
          community.
        </div>
      </div>
    </div>
  );
}

export default memo(PoolsHeroBanner);
