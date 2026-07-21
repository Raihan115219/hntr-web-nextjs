"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { COLLECTION_BANNER_IMAGES } from "./collection-banner-images";

type DriftCanvas = HTMLCanvasElement & { __drift?: boolean };

function CollectionHeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const cv = canvasRef.current as DriftCanvas | null;
    if (!cv || cv.__drift) return;
    cv.__drift = true;

    const canvas = cv;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawCtx = ctx;

    const imgs = COLLECTION_BANNER_IMAGES.map((src) => {
      const im = new Image();
      im.src = src;
      return im;
    });

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const GOLD = "rgba(232,190,80,";
    let W = 0;
    let H = 0;
    let cell = 0;
    const gap = 2;
    const rows = 3;
    let period = 0;
    const t0 = performance.now();
    let last = 0;
    let rafId = 0;

    function size() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return false;
      if (w !== W || h !== H) {
        W = w;
        H = h;
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        drawCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
        cell = Math.ceil((H - (rows - 1) * gap) / rows);
        period = cell + gap;
      }
      return true;
    }

    function rowOff(r: number, now: number) {
      const dir = r % 2 === 0 ? -1 : 1;
      const speed = 6 + r * 2.5;
      return dir * ((now - t0) / 1000) * speed;
    }

    function tileImg(r: number, k: number) {
      const n = COLLECTION_BANNER_IMAGES.length;
      return imgs[(((k * 3 + r * 7) % n) + n) % n];
    }

    function drawTile(im: HTMLImageElement, x: number, y: number) {
      drawCtx.fillStyle = "#15161a";
      drawCtx.fillRect(x, y, cell, cell);
      if (im.complete && im.naturalWidth) {
        const sc = Math.max(cell / im.naturalWidth, cell / im.naturalHeight);
        drawCtx.save();
        drawCtx.beginPath();
        drawCtx.rect(x, y, cell, cell);
        drawCtx.clip();
        drawCtx.drawImage(
          im,
          x + (cell - im.naturalWidth * sc) / 2,
          y + (cell - im.naturalHeight * sc) / 2,
          im.naturalWidth * sc,
          im.naturalHeight * sc,
        );
        drawCtx.restore();
      }
      drawCtx.strokeStyle = `${GOLD}0.35)`;
      drawCtx.lineWidth = 1;
      drawCtx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
    }

    function frame(now: number) {
      if (size() && now - last > 33) {
        last = now;
        drawCtx.clearRect(0, 0, W, H);
        for (let r = 0; r < rows; r++) {
          const off = rowOff(r, now);
          const y = r * period;
          const kMin = Math.floor(-off / period) - 1;
          const kMax = kMin + Math.ceil(W / period) + 2;
          for (let k = kMin; k <= kMax; k++) {
            drawTile(tileImg(r, k), k * period + off, y);
          }
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      delete canvas.__drift;
    };
  }, []);

  return (
    <div className="hero" style={{ marginBottom: "18px" }}>
      <canvas ref={canvasRef} id="collBannerCv" />
      <div className="coll-banner-shade" />
      <div className="hero-content">
        <div className="hero-title" style={{ fontSize: "20px", letterSpacing: ".08em" }}>
          MY NFT COLLECTION
        </div>
        <div className="hero-sub">Real-time oversight across all your NFT positions.</div>
      </div>
    </div>
  );
}

export default memo(CollectionHeroBanner);
