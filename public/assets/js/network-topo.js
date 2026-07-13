function drawNetworkTree() {
  const svg = document.getElementById('topoSvg');
  if (!svg) return;
  const W = svg.parentElement.offsetWidth || 700;
  const H = Math.max(svg.parentElement.offsetHeight, 320);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cs = getComputedStyle(document.documentElement);
  const olive  = cs.getPropertyValue('--olive').trim()  || '#5E6B55';
  const sage   = cs.getPropertyValue('--sage').trim()   || '#A8B5A2';
  const sf     = cs.getPropertyValue('--sage-faint').trim() || '#dce3da';
  const t2val  = cs.getPropertyValue('--t2').trim()     || 'rgba(58,67,49,.64)';
  const e2val  = cs.getPropertyValue('--e2').trim()     || '#ffffff';

  // ── synthetic user identity helpers ──
  const memTiers=['Scout','Tracker','Ranger','Hunter','Apex'];
  const unames=['Alpha','Nova','Byte','Orion','Vega','Lynx','Echo','Zephyr','Quill','Rune','Sable','Onyx','Cipher','Delta','Flux','Grove','Halo','Iris','Koda','Wren'];
  function mkHex(s){let h=(Math.imul(s^0x9e3779b1,2654435761))>>>0;return h.toString(16).toUpperCase().padStart(6,'0');}
  function mkAddr(s){const a=mkHex(s*7+11);return '0x'+a.slice(0,3)+'...'+a.slice(3,4);}
  function mkUser(s){return unames[s%unames.length]+s;}
  function mkMem(s){return memTiers[s%memTiers.length];}

  // ── Build node tree: root → 3 L1 → 3 L2 each → 2 L3 each ──
  const nodes = [];
  const edges = [];

  // L0 root
  nodes.push({id:0, x:W/2,       y:46,  level:0, label:'You', sub:'Elite Hunter'});

  // L1 (3 nodes)
  const l1Xs = [W*0.18, W*0.50, W*0.82];
  const l1Labels = ['0x71C...492','0x3A8...12D','0x9FE...88A'];
  const l1Subs   = ['$4.2K','$1.8K','$9.2K'];
  const l1Users  = ['AlphaHunter','NovaScout','ByteRanger'];
  const l1Mem    = ['Apex','Hunter','Ranger'];
  for (let i=0;i<3;i++) {
    nodes.push({id:1+i, x:l1Xs[i], y:138, level:1, label:l1Labels[i], sub:l1Subs[i], user:l1Users[i], addr:l1Labels[i], mem:l1Mem[i]});
    edges.push([0, 1+i]);
  }

  // L2 (9 nodes, 3 per L1)
  const l2Offsets = [-0.105, 0, 0.105];
  const l2Lbs = ['0xB4D','0xA2E','0xC8F','0xD7B','0xF93','0xE11','0x81E','0x4FA','0x22D'];
  const l2Sbs = ['$1.2K','$890','$440','$2.1K','$670','$310','$430','$180','$90'];
  for (let i=0;i<3;i++) {
    for (let j=0;j<3;j++) {
      const id = 4 + i*3 + j;
      nodes.push({id, x: l1Xs[i] + l2Offsets[j]*W, y:228, level:2, label:l2Lbs[i*3+j], sub:l2Sbs[i*3+j], user:mkUser(id), addr:mkAddr(id), mem:mkMem(id)});
      edges.push([1+i, id]);
    }
  }

  // L3 (18 nodes, 2 per L2)
  const l3Colors = [olive, sage];
  for (let i=0;i<9;i++) {
    for (let j=0;j<2;j++) {
      const id = 13 + i*2 + j;
      const parentNode = nodes[4+i];
      const xOff = (j===0 ? -0.052 : 0.052) * W;
      nodes.push({id, x: parentNode.x + xOff, y:304, level:3, label:'', sub:'', user:mkUser(id), addr:mkAddr(id), mem:mkMem(id)});
      edges.push([4+i, id]);
    }
  }

  // ── ZOOM STATE ──
  if (!svg._zoom) svg._zoom = 1;
  if (!svg._panX) svg._panX = 0;
  if (!svg._panY) svg._panY = 0;
  let zoom = svg._zoom, panX = svg._panX, panY = svg._panY;
  let dragging = false, lastX = 0, lastY = 0;

  svg.innerHTML = '';

  // Group for zoom/pan
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id','topoGroup');
  g.setAttribute('transform', `translate(${panX},${panY}) scale(${zoom})`);
  svg.appendChild(g);

  // ── HOVER TOOLTIP (HTML, lives on the canvas) ──
  const canvasEl = svg.parentElement;
  let tip = document.getElementById('topoTip');
  if (!tip) { tip = document.createElement('div'); tip.id = 'topoTip'; canvasEl.appendChild(tip); }
  function moveTip(e){
    const r = canvasEl.getBoundingClientRect();
    let lx = e.clientX - r.left + 14, ly = e.clientY - r.top + 14;
    if (lx + 130 > r.width) lx = e.clientX - r.left - 140;
    if (ly + 60 > r.height) ly = e.clientY - r.top - 60;
    tip.style.left = lx + 'px'; tip.style.top = ly + 'px';
  }
  function showTip(n, e){
    tip.innerHTML = '<div class="tt-user">'+n.user+'</div><div class="tt-addr">'+n.addr+'</div><div class="tt-mem">'+n.mem.toUpperCase()+'</div>';
    tip.style.display = 'block'; moveTip(e);
  }
  function hideTip(){ tip.style.display = 'none'; }

  // ── user card renderer (levels 1 & 2) ──
  function nsvg(t){ return document.createElementNS('http://www.w3.org/2000/svg', t); }
  function drawUserCard(grp, n, w, h, big){
    const x = n.x - w/2, y = n.y - h/2;
    const rect = nsvg('rect');
    rect.setAttribute('x',x); rect.setAttribute('y',y);
    rect.setAttribute('width',w); rect.setAttribute('height',h); rect.setAttribute('rx','6');
    rect.setAttribute('fill',e2val); rect.setAttribute('stroke', big?olive:sage);
    rect.setAttribute('stroke-width', big?'1.4':'1');
    grp.appendChild(rect);
    const bar = nsvg('rect');
    bar.setAttribute('x',x); bar.setAttribute('y',y);
    bar.setAttribute('width','3'); bar.setAttribute('height',h);
    bar.setAttribute('fill', big?olive:sage); grp.appendChild(bar);
    const tx = x + (big ? 9 : 5);
    const line = (txt,dy,size,col,weight) => {
      const t = nsvg('text');
      t.setAttribute('x',tx); t.setAttribute('y',y+dy);
      t.setAttribute('font-family',"'Space Mono',monospace");
      t.setAttribute('font-size',size); t.setAttribute('fill',col);
      if(weight) t.setAttribute('font-weight',weight);
      t.textContent = txt; grp.appendChild(t);
    };
    if(big){ line(n.user,15,'8.5',olive,'700'); line(n.addr,27,'7.5',t2val); line(n.mem.toUpperCase(),38.5,'6.5',sage,'700'); }
    else   { line(n.user,11,'6',olive,'700'); line(n.addr,19.5,'5.4',t2val); line(n.mem.toUpperCase(),27.5,'4.8',sage,'700'); }
  }

  // Draw edges
  edges.forEach(([a,b], i) => {
    const na = nodes[a], nb = nodes[b];
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', na.x); line.setAttribute('y1', na.y);
    line.setAttribute('x2', nb.x); line.setAttribute('y2', nb.y);
    const lv = nb.level;
    line.setAttribute('stroke', lv===3 ? 'rgba(168,181,162,.18)' : lv===2 ? 'rgba(168,181,162,.28)' : sf);
    line.setAttribute('stroke-width', lv===3 ? '0.8' : lv===2 ? '1' : '1.4');
    line.style.strokeDasharray = '300';
    line.style.strokeDashoffset = '300';
    line.style.animation = `edgeDraw .4s ease ${i*.022}s both`;
    g.appendChild(line);
  });

  // Draw nodes
  nodes.forEach((n, i) => {
    const grp = document.createElementNS('http://www.w3.org/2000/svg','g');
    grp.style.animation = `nodeAppear .35s cubic-bezier(.22,1,.36,1) ${.08+i*.025}s both`;
    grp.style.opacity = '0';
    grp.style.transformOrigin = `${n.x}px ${n.y}px`;

    if (n.level === 0) {
      const bg = document.createElementNS('http://www.w3.org/2000/svg','circle');
      bg.setAttribute('cx',n.x); bg.setAttribute('cy',n.y); bg.setAttribute('r','22');
      bg.setAttribute('fill',olive); bg.setAttribute('opacity','.1'); grp.appendChild(bg);
      const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx',n.x); c.setAttribute('cy',n.y); c.setAttribute('r','9');
      c.setAttribute('fill',olive); grp.appendChild(c);
      const pr = document.createElementNS('http://www.w3.org/2000/svg','circle');
      pr.setAttribute('cx',n.x); pr.setAttribute('cy',n.y); pr.setAttribute('r','14');
      pr.setAttribute('fill','none'); pr.setAttribute('stroke',olive);
      pr.setAttribute('stroke-width','1.4'); pr.setAttribute('opacity','.35');
      pr.style.animation='nodePulse 2.5s ease-in-out infinite'; grp.appendChild(pr);
      ['label','sub'].forEach((k,ki) => {
        if(!n[k]) return;
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',n.x); t.setAttribute('y', n.y+(ki?38:26));
        t.setAttribute('text-anchor','middle');
        t.setAttribute('font-family',"'Space Mono',monospace");
        t.setAttribute('font-size', ki?'7':'9');
        t.setAttribute('fill', ki?sage:olive);
        if(!ki) t.setAttribute('font-weight','700');
        t.textContent = n[k]; grp.appendChild(t);
      });
    } else if (n.level === 1) {
      drawUserCard(grp, n, 112, 46, true);
    } else if (n.level === 2) {
      drawUserCard(grp, n, 50, 34, false);
    } else {
      // L3 — blank square, reveals identity popup on hover
      const s = 12;
      const sq = document.createElementNS('http://www.w3.org/2000/svg','rect');
      sq.setAttribute('x', n.x - s/2); sq.setAttribute('y', n.y - s/2);
      sq.setAttribute('width', s); sq.setAttribute('height', s); sq.setAttribute('rx','2.5');
      sq.setAttribute('fill','none'); sq.setAttribute('stroke', sage);
      sq.setAttribute('stroke-width','1'); sq.setAttribute('opacity','.5');
      sq.style.cursor = 'pointer'; sq.style.transition = 'fill .15s, opacity .15s';
      sq.addEventListener('mouseenter', function(e){ sq.setAttribute('fill', sage); sq.setAttribute('opacity','1'); showTip(n, e); });
      sq.addEventListener('mousemove', function(e){ moveTip(e); });
      sq.addEventListener('mouseleave', function(){ sq.setAttribute('fill','none'); sq.setAttribute('opacity','.5'); hideTip(); });
      grp.appendChild(sq);
    }
    g.appendChild(grp);
  });

  // ── ZOOM CONTROLS (SVG buttons) ──
  function applyTransform() {
    g.setAttribute('transform', `translate(${panX},${panY}) scale(${zoom})`);
    svg._zoom=zoom; svg._panX=panX; svg._panY=panY;
  }

  // Zoom in / out buttons
  function makeZoomBtn(label, x, cb) {
    const btn = document.createElementNS('http://www.w3.org/2000/svg','g');
    btn.style.cursor = 'pointer';
    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',x); rect.setAttribute('y', H-36);
    rect.setAttribute('width','26'); rect.setAttribute('height','26');
    rect.setAttribute('rx','5'); rect.setAttribute('fill',e2val);
    rect.setAttribute('stroke', sf); rect.setAttribute('stroke-width','0.8');
    btn.appendChild(rect);
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x', x+13); txt.setAttribute('y', H-17);
    txt.setAttribute('text-anchor','middle'); txt.setAttribute('dominant-baseline','central');
    txt.setAttribute('font-family',"'Space Mono',monospace");
    txt.setAttribute('font-size','14'); txt.setAttribute('fill',olive);
    txt.textContent = label; btn.appendChild(txt);
    btn.addEventListener('click', function(e){ e.stopPropagation(); cb(); applyTransform(); });
    btn.addEventListener('mouseover', () => rect.setAttribute('fill', sf));
    btn.addEventListener('mouseleave', () => rect.setAttribute('fill', e2val));
    svg.appendChild(btn); // on svg, not g, so not affected by zoom
  }

  makeZoomBtn('+', W-62, () => { zoom = Math.min(zoom * 1.25, 3); });
  makeZoomBtn('−', W-32, () => { zoom = Math.max(zoom * 0.8, 0.3); });

  // Reset button
  const resetBtn = document.createElementNS('http://www.w3.org/2000/svg','g');
  resetBtn.style.cursor = 'pointer';
  const resetRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  resetRect.setAttribute('x', W-100); resetRect.setAttribute('y', H-36);
  resetRect.setAttribute('width','32'); resetRect.setAttribute('height','26');
  resetRect.setAttribute('rx','5'); resetRect.setAttribute('fill',e2val);
  resetRect.setAttribute('stroke',sf); resetRect.setAttribute('stroke-width','0.8');
  resetBtn.appendChild(resetRect);
  const resetTxt = document.createElementNS('http://www.w3.org/2000/svg','text');
  resetTxt.setAttribute('x', W-84); resetTxt.setAttribute('y', H-17);
  resetTxt.setAttribute('text-anchor','middle'); resetTxt.setAttribute('dominant-baseline','central');
  resetTxt.setAttribute('font-family',"'Space Mono',monospace");
  resetTxt.setAttribute('font-size','7.5'); resetTxt.setAttribute('fill',t2val);
  resetTxt.textContent = 'RESET'; resetBtn.appendChild(resetTxt);
  resetBtn.addEventListener('click', function(e){
    e.stopPropagation(); zoom=1; panX=0; panY=0; applyTransform();
  });
  resetBtn.addEventListener('mouseover', () => resetRect.setAttribute('fill', sf));
  resetBtn.addEventListener('mouseleave', () => resetRect.setAttribute('fill', e2val));
  svg.appendChild(resetBtn);

  // Wheel zoom
  svg.onwheel = function(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    // Zoom toward cursor
    panX = mx - delta * (mx - panX);
    panY = my - delta * (my - panY);
    zoom = Math.max(0.3, Math.min(zoom * delta, 3));
    applyTransform();
  };

  // Pan drag
  svg.onmousedown = function(e) {
    if (e.target.closest && e.target.closest('g[style*="cursor: pointer"]')) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    svg.style.cursor = 'grabbing';
  };
  svg.onmousemove = function(e) {
    if (!dragging) return;
    panX += e.clientX - lastX;
    panY += e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    applyTransform();
  };
  svg.onmouseup = svg.onmouseleave = function() {
    dragging = false; svg.style.cursor = 'grab';
  };
  svg.style.cursor = 'grab';

  // Latency ticker
  const latEl = document.getElementById('topoLatency');
  if (!window._latInterval) window._latInterval = setInterval(() => {
    const lat = 10 + Math.floor(Math.random()*12);
    if (latEl) latEl.textContent = lat+'ms';
  }, 2000);
}
function drawQR(){
  const canvas=document.getElementById('qrCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d'),size=160,cells=20,cell=size/cells;
  const cs=getComputedStyle(document.documentElement);
  const olive=cs.getPropertyValue('--olive').trim()||'#5E6B55';
  const bg=cs.getPropertyValue('--e3').trim()||'#f4f2ee';
  ctx.fillStyle=bg;ctx.fillRect(0,0,size,size);
  [[0,0],[13,0],[0,13]].forEach(([cx,cy])=>{ctx.fillStyle=olive;ctx.fillRect(cx*cell,cy*cell,7*cell,7*cell);ctx.fillStyle=bg;ctx.fillRect((cx+1)*cell,(cy+1)*cell,5*cell,5*cell);ctx.fillStyle=olive;ctx.fillRect((cx+2)*cell,(cy+2)*cell,3*cell,3*cell);});
  const seed=[1,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0];
  for(let r=0;r<cells;r++)for(let c=0;c<cells;c++){if((r<8&&c<8)||(r<8&&c>11)||(r>11&&c<8))continue;if((seed[(r+c)%20]+seed[(r*c)%20])%2===0){ctx.fillStyle=olive;ctx.fillRect(c*cell,r*cell,cell*.9,cell*.9);}}
}

window.drawNetworkTree = drawNetworkTree;
window.drawQR = drawQR;
