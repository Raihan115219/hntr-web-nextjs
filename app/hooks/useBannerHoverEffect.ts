"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const BANNER_HERO_SELECTOR =
  "#feed-home .hero, #feed-collection .hero, #feed-membership .hero, #feed-network .hero, #feed-pools .pools-hero";

const BANNER_IMG_SELECTOR =
  "#homeRevealCv, #collBannerCv, #memBannerCv, #netBannerCv, .pools-banner-img";

export function useBannerHoverEffect() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    const bindBannerHover = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      document.querySelectorAll<HTMLElement>(BANNER_HERO_SELECTOR).forEach((hero) => {
        const img = hero.querySelector<HTMLElement>(BANNER_IMG_SELECTOR);
        if (!img || hero.dataset.bannerHoverBound === "1") return;
        hero.dataset.bannerHoverBound = "1";

        const onMove = (event: MouseEvent) => {
          const rect = hero.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          img.style.transform = `scale(1.06) translate(${px * 14}px, ${py * 8}px)`;
        };

        const onLeave = () => {
          img.style.transform = "";
        };

        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          hero.removeEventListener("mousemove", onMove);
          hero.removeEventListener("mouseleave", onLeave);
          delete hero.dataset.bannerHoverBound;
          img.style.transform = "";
        });
      });
    };

    bindBannerHover();
    const timer = window.setTimeout(bindBannerHover, 0);

    return () => {
      window.clearTimeout(timer);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);
}
