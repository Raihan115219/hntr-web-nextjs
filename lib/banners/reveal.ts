import { BANNER_ASSETS } from "./resources";

type RevealCanvas = HTMLCanvasElement & {
  __reveal?: boolean;
  __rscale?: number;
};

export function initReveal(cv: HTMLCanvasElement | null): (() => void) | undefined {
  if (!cv) return undefined;
  const canvas = cv as RevealCanvas;
  if (canvas.__reveal) return undefined;
  canvas.__reveal = true;

  const maybeGl =
    canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!maybeGl) {
    canvas.style.background = `url('${BANNER_ASSETS.revealTop}') center/cover no-repeat`;
    return undefined;
  }
  const gl: WebGLRenderingContext = maybeGl;

  const vsrc =
    "attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}";
  const fsrc = [
    "precision highp float;varying vec2 vUv;",
    "uniform sampler2D uTop,uBottom;uniform vec2 uMouse;uniform float uRadius,uTime,uCA,uImgA;",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.02;a*=0.5;}return v;}",
    "vec2 coverUv(vec2 uv,float imgA,float canA){vec2 s=canA>imgA?vec2(1.0,imgA/canA):vec2(canA/imgA,1.0);return (uv-0.5)*s+0.5;}",
    "void main(){vec2 uv=vUv;vec2 pc=vec2(uv.x*uCA,uv.y);vec2 mc=vec2(uMouse.x*uCA,uMouse.y);",
    "vec2 dir=pc-mc;float dist=length(dir);float ang=atan(dir.y,dir.x);",
    "float wob=(fbm(vec2(cos(ang),sin(ang))*2.2+uTime*0.3)-0.5)*0.10+(fbm(pc*3.0+uTime*0.2)-0.5)*0.05;",
    "float r=uRadius*(1.0+wob);float feather=max(0.02,uRadius*0.4);",
    "float mask=smoothstep(r+feather,r-feather,dist);",
    "float ring=smoothstep(r+feather,r,dist)*smoothstep(r-feather,r,dist);",
    "vec2 g=dir/(dist+1e-4);vec2 gUv=vec2(g.x/uCA,g.y);float disp=ring*0.035;",
    "vec2 liquid=vec2(fbm(pc*5.0+uTime*0.6),fbm(pc*5.0-uTime*0.5))-0.5;",
    "vec2 vo=vec2(0.0,0.08);vec2 bTop=coverUv(uv,uImgA,uCA)+vo;vec2 bBot=coverUv(uv,uImgA,uCA)+vo;",
    "vec3 top=texture2D(uTop,bTop+gUv*disp).rgb;",
    "vec3 bot=texture2D(uBottom,bBot-gUv*disp*0.5+vec2(liquid.x/uCA,liquid.y)*0.01*mask).rgb;",
    "vec3 col=mix(top,bot,mask);",
    "col=mix(col,col*vec3(0.30,0.22,0.20),ring*0.5);",
    "col+=vec3(1.0,0.55,0.25)*ring*0.30;",
    "col+=vec3(0.45,0.65,1.0)*ring*0.14;",
    "gl_FragColor=vec4(col,1.0);}",
  ].join("\n");

  function sh(type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vsrc));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fsrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTop = gl.getUniformLocation(prog, "uTop");
  const uBottom = gl.getUniformLocation(prog, "uBottom");
  const uMouse = gl.getUniformLocation(prog, "uMouse");
  const uRadius = gl.getUniformLocation(prog, "uRadius");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uCA = gl.getUniformLocation(prog, "uCA");
  const uImgA = gl.getUniformLocation(prog, "uImgA");

  function tex(unit: number) {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([20, 20, 24, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  const tTop = tex(0);
  const tBot = tex(1);
  let imgA = 2.204;

  function load(src: string, unit: number, t: WebGLTexture) {
    const im = new Image();
    im.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      imgA = im.width / im.height;
    };
    im.src = src;
  }

  load(BANNER_ASSETS.revealTop, 0, tTop);
  load(BANNER_ASSETS.revealBot, 1, tBot);
  gl.uniform1i(uTop, 0);
  gl.uniform1i(uBottom, 1);

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    if (w !== W || h !== H) {
      W = w;
      H = h;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    return true;
  }

  let hover = false;
  let tx = 0.5;
  let ty = 0.5;
  let mx = 0.5;
  let my = 0.5;
  let rad = 0;
  let tR = 0;
  let tt = 0;
  let lastMove = 0;
  let raf = 0;
  let alive = true;

  const onPointerMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = 1.0 - (e.clientY - r.top) / r.height;
    hover = true;
    lastMove = performance.now();
  };
  const onPointerLeave = () => {
    hover = false;
  };
  const onPointerDown = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = 1.0 - (e.clientY - r.top) / r.height;
    hover = true;
    lastMove = performance.now();
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);

  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (!canvas.offsetWidth && !canvas.offsetHeight) return;
    if (!resize()) return;
    tt += 0.016;
    mx += (tx - mx) * 0.14;
    my += (ty - my) * 0.14;
    if (hover) {
      const idle = performance.now() - lastMove;
      tR = (idle < 140 ? 0.72 : 0.52) * (canvas.__rscale || 1);
    } else {
      tR = 0.0;
    }
    rad += (tR - rad) * (hover ? 0.12 : 0.16);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uRadius, rad);
    gl.uniform1f(uTime, tt);
    gl.uniform1f(uCA, W / H);
    gl.uniform1f(uImgA, imgA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  raf = requestAnimationFrame(frame);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("pointerdown", onPointerDown);
    delete canvas.__reveal;
  };
}
