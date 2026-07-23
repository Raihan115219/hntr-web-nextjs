type PlexusCanvas = HTMLCanvasElement & { __plexus?: boolean };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export function initNetworkBanner(cv: HTMLCanvasElement | null): (() => void) | undefined {
  if (!cv) return undefined;
  const canvas = cv as PlexusCanvas;
  if (canvas.__plexus) return undefined;
  canvas.__plexus = true;

  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return undefined;
  const drawCtx: CanvasRenderingContext2D = maybeCtx;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let P: Particle[] = [];
  let t = 0;
  let raf = 0;
  let alive = true;
  const mouse = { x: 0, y: 0, on: false };

  function rand(a: number, b: number) {
    return a + Math.random() * (b - a);
  }

  function init() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    if (w === W && h === H && P.length) return true;
    W = w;
    H = h;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    drawCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.max(46, Math.min(150, Math.round((w * h) / 6200)));
    P = [];
    for (let i = 0; i < count; i += 1) {
      P.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.45, 0.45),
        vy: rand(-0.4, 0.4),
        r: rand(0.7, 2.1),
      });
    }
    return true;
  }

  function virtual() {
    return {
      x: W * (0.5 + 0.32 * Math.cos(t * 0.31) + 0.12 * Math.sin(t * 0.53)),
      y: H * (0.5 + 0.34 * Math.sin(t * 0.27) + 0.12 * Math.cos(t * 0.61)),
    };
  }

  const Rc = 180;
  const D = 120;

  function draw(att: { x: number; y: number }) {
    drawCtx.clearRect(0, 0, W, H);
    for (let i = 0; i < P.length; i += 1) {
      const a = P[i];
      for (let j = i + 1; j < P.length; j += 1) {
        const b = P[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > D * D) continue;
        const d = Math.sqrt(d2);
        const al = 1 - d / D;
        drawCtx.strokeStyle = `rgba(255,${(28 + al * 36) | 0},${(8 + al * 16) | 0},${(al * 0.5).toFixed(3)})`;
        drawCtx.lineWidth = 0.55 + al * 0.5;
        drawCtx.beginPath();
        drawCtx.moveTo(a.x, a.y);
        drawCtx.lineTo(b.x, b.y);
        drawCtx.stroke();
      }
    }
    for (let i = 0; i < P.length; i += 1) {
      const a = P[i];
      const dx = a.x - att.x;
      const dy = a.y - att.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > Rc) continue;
      const al = 1 - d / Rc;
      drawCtx.strokeStyle = `rgba(255,${(80 + al * 130) | 0},${(35 + al * 70) | 0},${(al * 0.75).toFixed(3)})`;
      drawCtx.lineWidth = 0.5 + al * 1.0;
      drawCtx.beginPath();
      drawCtx.moveTo(a.x, a.y);
      drawCtx.lineTo(att.x, att.y);
      drawCtx.stroke();
    }
    for (let i = 0; i < P.length; i += 1) {
      const p = P[i];
      const dd = Math.hypot(p.x - att.x, p.y - att.y);
      const near = dd < Rc ? 1 - dd / Rc : 0;
      drawCtx.beginPath();
      drawCtx.fillStyle = `rgba(255,${(40 + near * 150) | 0},${(20 + near * 95) | 0},${(0.5 + near * 0.45).toFixed(3)})`;
      drawCtx.arc(p.x, p.y, p.r + near * 1.2, 0, 6.2832);
      drawCtx.fill();
    }
    const g = drawCtx.createRadialGradient(att.x, att.y, 0, att.x, att.y, 80);
    g.addColorStop(0, "rgba(255,64,26,0.30)");
    g.addColorStop(1, "rgba(255,40,10,0)");
    drawCtx.fillStyle = g;
    drawCtx.beginPath();
    drawCtx.arc(att.x, att.y, 80, 0, 6.2832);
    drawCtx.fill();
  }

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (canvas.offsetParent === null) return;
    if (!init()) return;
    t += 0.016;
    const att = mouse.on ? { x: mouse.x, y: mouse.y } : virtual();
    for (let i = 0; i < P.length; i += 1) {
      const p = P[i];
      const dx = att.x - p.x;
      const dy = att.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      if (d < Rc) {
        const f = (1 - d / Rc) * (mouse.on ? 0.17 : 0.09);
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vx += rand(-0.02, 0.02);
      p.vy += rand(-0.02, 0.02);
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) {
        p.x = 0;
        p.vx *= -1;
      } else if (p.x > W) {
        p.x = W;
        p.vx *= -1;
      }
      if (p.y < 0) {
        p.y = 0;
        p.vy *= -1;
      } else if (p.y > H) {
        p.y = H;
        p.vy *= -1;
      }
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 1.7) {
        p.vx = (p.vx / sp) * 1.7;
        p.vy = (p.vy / sp) * 1.7;
      }
    }
    draw(att);
  }

  const onMouseMove = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.on = true;
  };
  const onMouseLeave = () => {
    mouse.on = false;
  };

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseleave", onMouseLeave);
  raf = requestAnimationFrame(frame);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseleave", onMouseLeave);
    delete canvas.__plexus;
  };
}
