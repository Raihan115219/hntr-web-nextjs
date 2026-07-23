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
      <div className="hero-title" style={{ fontSize: "20px", letterSpacing: ".08em" }}>
        MY NFT COLLECTION
      </div>
      <div className="hero-sub">Real-time oversight across all your NFT positions.</div>
    </PageHeroBanner>
  );
}

export default memo(CollectionHeroBanner);
