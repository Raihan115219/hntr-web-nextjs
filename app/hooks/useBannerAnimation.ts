"use client";

import { useEffect } from "react";
import {
  type BannerAnimationKind,
  initBannerAnimation,
  setBannerResources,
} from "../../lib/banners";

export function useBannerAnimation(
  kind: BannerAnimationKind,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    setBannerResources();
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    return initBannerAnimation(kind, canvas);
  }, [kind, canvasRef]);
}

export function useRevealBanner(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useBannerAnimation("home", canvasRef);
}
