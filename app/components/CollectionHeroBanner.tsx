"use client";

import { memo } from "react";
import { BANNER_IMAGES } from "./banner-images";

function CollectionHeroBanner() {
  return (
    <div className="hero" style={{ marginBottom: "18px" }}>
      <img id="collBannerCv" src={BANNER_IMAGES.collection} alt="" draggable={false} />
      <div className="coll-banner-shade" />
      <div className="hero-content">
        <div className="hero-title" style={{ fontSize: "20px", letterSpacing: ".08em" }}>
          MY NFT COLLECTION
        </div>
        <div className="hero-sub">Oversight across your positions.</div>
      </div>
    </div>
  );
}

export default memo(CollectionHeroBanner);
