import { BANNER_ASSETS } from "./resources";

type MosaicCanvas = HTMLCanvasElement & { __mosaic?: boolean };

const COLORS = ["#5FD24A", "#9AD23E", "#CFC93B", "#E3B838", "#E7A32B"];
const DARK = "#0d0b07";
const MOTIFS = ["circle", "ring", "quarter", "quarter", "half", "leaf", "bars", "dot", "logo", "logo"] as const;

type Cell = {
  cx: number;
  cy: number;
  s: number;
  motif: (typeof MOTIFS)[number];
  bg: string;
  fg: string;
  baseRot: number;
  seed: number;
  speed: number;
  dir: number;
};

export function initMembershipBanner(cv: HTMLCanvasElement | null): (() => void) | undefined {
  if (!cv) return undefined;
  const canvas = cv as MosaicCanvas;
  if (canvas.__mosaic) return undefined;
  canvas.__mosaic = true;

  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return undefined;
  const drawCtx: CanvasRenderingContext2D = maybeCtx;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let cells: Cell[] = [];
  let t = 0;
  let raf = 0;
  let alive = true;

  const logoImg = new Image();
  let logoReady = false;
  logoImg.onload = () => {
    logoReady = true;
  };
  logoImg.src = BANNER_ASSETS.logoMark;

  const logoCache: Record<string, HTMLCanvasElement> = {};

  function rand(a: number, b: number) {
    return a + Math.random() * (b - a);
  }

  function pick<T>(arr: readonly T[]) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function logoTinted(color: string, size: number) {
    const s = Math.max(8, Math.round(size));
    const key = `${color}_${s}`;
    if (logoCache[key]) return logoCache[key];
    const oc = document.createElement("canvas");
    oc.width = oc.height = s;
    const o = oc.getContext("2d")!;
    const iw = logoImg.width;
    const ih = logoImg.height;
    const sc = Math.min(s / iw, s / ih) * 0.92;
    const dw = iw * sc;
    const dh = ih * sc;
    o.drawImage(logoImg, (s - dw) / 2, (s - dh) / 2, dw, dh);
    o.globalCompositeOperation = "source-in";
    o.fillStyle = color;
    o.fillRect(0, 0, s, s);
    logoCache[key] = oc;
    return oc;
  }

  function build() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    if (w === W && h === H && cells.length) return true;
    W = w;
    H = h;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    drawCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const cols = Math.max(6, Math.round(w / 46));
    const s = w / cols;
    const rows = Math.ceil(h / s);
    cells = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const bg = Math.random() < 0.5 ? DARK : pick(COLORS);
        let fg = pick(COLORS);
        if (fg === bg) fg = DARK;
        cells.push({
          cx: c * s + s / 2,
          cy: r * s + s / 2,
          s,
          motif: pick(MOTIFS),
          bg,
          fg,
          baseRot: ((Math.random() * 4) | 0) * (Math.PI / 2),
          seed: Math.random() * 6.28,
          speed: rand(0.35, 0.85),
          dir: Math.random() < 0.5 ? -1 : 1,
        });
      }
    }
    return true;
  }

  function roam() {
    return {
      x: W * (0.5 + 0.33 * Math.cos(t * 0.29) + 0.13 * Math.sin(t * 0.5)),
      y: H * (0.5 + 0.36 * Math.sin(t * 0.24) + 0.13 * Math.cos(t * 0.58)),
    };
  }

  function motif(m: Cell["motif"], s: number, fg: string) {
    if (m === "circle") {
      drawCtx.beginPath();
      drawCtx.arc(0, 0, s * 0.4, 0, 6.2832);
      drawCtx.fill();
    } else if (m === "ring") {
      drawCtx.beginPath();
      drawCtx.arc(0, 0, s * 0.36, 0, 6.2832);
      drawCtx.lineWidth = s * 0.14;
      drawCtx.strokeStyle = fg;
      drawCtx.stroke();
    } else if (m === "half") {
      drawCtx.beginPath();
      drawCtx.arc(0, s * 0.1, s * 0.5, Math.PI, 0, false);
      drawCtx.fill();
    } else if (m === "quarter") {
      drawCtx.beginPath();
      drawCtx.moveTo(-s / 2, -s / 2);
      drawCtx.arc(-s / 2, -s / 2, s * 0.98, 0, Math.PI / 2);
      drawCtx.closePath();
      drawCtx.fill();
    } else if (m === "leaf") {
      drawCtx.beginPath();
      drawCtx.moveTo(-s / 2, -s / 2);
      drawCtx.arc(-s / 2, -s / 2, s * 0.98, 0, Math.PI / 2);
      drawCtx.closePath();
      drawCtx.fill();
      drawCtx.beginPath();
      drawCtx.moveTo(s / 2, s / 2);
      drawCtx.arc(s / 2, s / 2, s * 0.98, Math.PI, Math.PI * 1.5);
      drawCtx.closePath();
      drawCtx.fill();
    } else if (m === "bars") {
      const bw = s * 0.16;
      for (let i = -1; i <= 1; i += 1) {
        drawCtx.fillRect(-s * 0.42, i * bw * 1.9 - bw / 2, s * 0.84, bw);
      }
    } else if (m === "dot") {
      drawCtx.beginPath();
      drawCtx.arc(0, 0, s * 0.17, 0, 6.2832);
      drawCtx.fill();
    } else if (m === "logo") {
      if (logoReady) {
        const lc = logoTinted(fg, s * 0.9);
        drawCtx.drawImage(lc, -s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
      } else {
        drawCtx.beginPath();
        drawCtx.arc(0, 0, s * 0.34, 0, 6.2832);
        drawCtx.fill();
      }
    }
  }

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (canvas.offsetParent === null) return;
    if (!build()) return;
    t += 0.016;
    const att = roam();
    const strength = 0.5;
    const R = 155;
    drawCtx.clearRect(0, 0, W, H);
    for (let i = 0; i < cells.length; i += 1) {
      const c = cells[i];
      const dx = c.cx - att.x;
      const dy = c.cy - att.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const infl = d < R ? (1 - d / R) * strength : 0;
      const osc = Math.sin(t * c.speed + c.seed);
      const rot = c.baseRot + osc * 0.26 + infl * c.dir * 1.4;
      const sc = 1 + 0.05 * Math.sin(t * c.speed * 1.3 + c.seed) + infl * 0.34;
      drawCtx.save();
      drawCtx.beginPath();
      drawCtx.rect(c.cx - c.s / 2, c.cy - c.s / 2, c.s, c.s);
      drawCtx.clip();
      drawCtx.fillStyle = c.bg;
      drawCtx.fillRect(c.cx - c.s / 2, c.cy - c.s / 2, c.s, c.s);
      drawCtx.translate(c.cx, c.cy);
      drawCtx.rotate(rot);
      drawCtx.scale(sc, sc);
      drawCtx.fillStyle = c.fg;
      motif(c.motif, c.s, c.fg);
      drawCtx.restore();
    }
  }

  canvas.style.pointerEvents = "none";
  raf = requestAnimationFrame(frame);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    delete canvas.__mosaic;
  };
}
