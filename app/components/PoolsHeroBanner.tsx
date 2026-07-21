"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { POOLS_BANNER_INNER } from "./pools-banner-markup";

function PoolsHeroBanner() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    hero.innerHTML = POOLS_BANNER_INNER;

    const rots = hero.querySelectorAll<SVGGElement>(".gear-rot");
    const angles: number[] = [];
    const speeds: number[] = [];

    rots.forEach((g, i) => {
      angles[i] = Math.random() * 360;
      speeds[i] = parseFloat(g.getAttribute("data-speed") || "12");
      g.setAttribute("transform", `rotate(${angles[i]})`);
    });

    let dir = 1;
    let cur = 1;
    let holdUntil = 0;
    let last = performance.now();
    let rafId = 0;

    const zone = hero.querySelector(".bn-gearzone");
    const onEnter = () => {
      dir = -1;
      holdUntil = performance.now() + 220;
    };
    const onLeave = () => {
      dir = 1;
      holdUntil = performance.now() + 220;
    };
    zone?.addEventListener("mouseenter", onEnter);
    zone?.addEventListener("mouseleave", onLeave);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = now < holdUntil ? 0 : dir;
      cur += (target - cur) * Math.min(1, dt * 5);
      for (let i = 0; i < rots.length; i++) {
        angles[i] += speeds[i] * cur * dt;
        rots[i].setAttribute("transform", `rotate(${angles[i]})`);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    hero.classList.remove("draw");

    return () => {
      cancelAnimationFrame(rafId);
      zone?.removeEventListener("mouseenter", onEnter);
      zone?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div className="pools-hero" ref={heroRef} />;
}

export default memo(PoolsHeroBanner);
