"use client";

import { memo, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { type BannerAnimationKind } from "../../lib/banners";
import { useBannerAnimation } from "../hooks/useBannerAnimation";

type PageHeroBannerProps = {
  variant?: "hero" | "pools-hero";
  canvasId: string;
  animationKind: BannerAnimationKind;
  shadeClassName: string;
  contentClassName?: string;
  className?: string;
  style?: CSSProperties;
  mosaicId?: string;
  children: ReactNode;
};

function PageHeroBanner({
  variant = "hero",
  canvasId,
  animationKind,
  shadeClassName,
  contentClassName = variant === "pools-hero" ? "pools-hero-content" : "hero-content",
  className = "",
  style,
  mosaicId,
  children,
}: PageHeroBannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBannerAnimation(animationKind, canvasRef);

  return (
    <div className={`${variant}${className ? ` ${className}` : ""}`} style={style}>
      <canvas id={canvasId} ref={canvasRef} />
      <div className={shadeClassName} />
      {mosaicId ? <div className="hero-mosaic" id={mosaicId} /> : null}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

export default memo(PageHeroBanner);
