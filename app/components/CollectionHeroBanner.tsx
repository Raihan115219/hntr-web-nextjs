"use client";

import { memo } from "react";
import PageHeroBanner from "./PageHeroBanner";

function CollectionHeroBanner() {
  return (
    <PageHeroBanner
      canvasId="collBannerCv"
      animationKind="collection"
      shadeClassName="coll-banner-shade"
      mosaicId="collMosaic"
      style={{ marginBottom: "18px" }}
    >
      <div className="hero-title">MY NFT COLLECTION</div>
      <div className="hero-sub hero-sub-desktop">
        Real-time oversight across all your NFT positions.
      </div>
      <div className="hero-sub hero-sub-mobile">Oversight across your positions.</div>
    </PageHeroBanner>
  );
}

export default memo(CollectionHeroBanner);
