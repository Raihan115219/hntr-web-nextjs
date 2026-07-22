"use client";

import { memo } from "react";
import { BANNER_IMAGES } from "./banner-images";

function PoolsHeroBanner() {
  return (
    <div className="pools-hero">
      <img className="pools-banner-img" src={BANNER_IMAGES.pools} alt="" draggable={false} />
      <div className="pools-hero-shade" />
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
