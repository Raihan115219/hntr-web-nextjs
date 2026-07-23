"use client";

import { memo, useRef } from "react";
import { useBannerAnimation } from "../hooks/useBannerAnimation";

function HomeHeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBannerAnimation("home", canvasRef);

  return (
    <div className="hero">
      <canvas id="homeRevealCv" ref={canvasRef} />
      <div className="home-reveal-shade" />
      <div
        className="hero-left"
        style={{
          zIndex: 2,
          pointerEvents: "none",
          padding: "26px 24px 26px 24px",
        }}
      >
        <div className="hero-title" style={{ textShadow: "0 2px 10px rgba(0,0,0,.7)" }}>
          HNTR
        </div>
        <div
          className="hero-sub"
          style={{
            color: "#fff",
            textShadow: "0 1px 8px rgba(0,0,0,.85), 0 0 2px rgba(0,0,0,.6)",
          }}
        >
          Your gateaway to the NFT Universe.
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-mosaic" id="mosaic" />
      </div>
    </div>
  );
}

export default memo(HomeHeroBanner);
