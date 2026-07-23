"use client";

import { memo } from "react";
import { POOLS_BANNER_SVG } from "./pools-banner-svg";

function PoolsBannerArt() {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: POOLS_BANNER_SVG }} />;
}

export default memo(PoolsBannerArt);
