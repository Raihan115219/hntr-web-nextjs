type PoolsHeroElement = HTMLElement & { __poolsGearsInit?: boolean };

export function initPoolsBannerGears(hero: HTMLElement | null): (() => void) | undefined {
  if (!hero) return undefined;

  const root = hero as PoolsHeroElement;
  if (root.__poolsGearsInit) return undefined;
  root.__poolsGearsInit = true;

  const rots = hero.querySelectorAll<SVGGElement>(".gear-rot");
  if (!rots.length) {
    delete root.__poolsGearsInit;
    return undefined;
  }

  const angles: number[] = [];
  const speeds: number[] = [];
  rots.forEach((g, i) => {
    angles[i] = Math.random() * 360;
    speeds[i] = parseFloat(g.getAttribute("data-speed") || "12") || 12;
    g.setAttribute("transform", `rotate(${angles[i]})`);
  });

  let dir = 1;
  let cur = 1;
  let holdUntil = 0;
  let raf = 0;
  let alive = true;
  let last = performance.now();

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

  function tick(now: number) {
    if (!alive) return;
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const target = now < holdUntil ? 0 : dir;
    cur += (target - cur) * Math.min(1, dt * 5);
    for (let i = 0; i < rots.length; i += 1) {
      angles[i] += speeds[i] * cur * dt;
      rots[i].setAttribute("transform", `rotate(${angles[i]})`);
    }
  }

  hero.classList.remove("draw");
  raf = requestAnimationFrame(tick);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    zone?.removeEventListener("mouseenter", onEnter);
    zone?.removeEventListener("mouseleave", onLeave);
    delete root.__poolsGearsInit;
  };
}
