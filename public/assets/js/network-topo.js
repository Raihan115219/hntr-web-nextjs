// ── shared helpers for laying out the real downline tree ──
function topoShortAddr(addr) {
  if (!addr || addr.length < 10) return addr || '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function topoCountLeaves(n) {
  if (!n.children || n.children.length === 0) return 1;
  return n.children.reduce((sum, c) => sum + topoCountLeaves(c), 0);
}

/**
 * Recursively positions a real NetworkTreeNode (from GET /api/network/:username/tree)
 * into the same {nodes, edges} shape the renderer below expects, allocating each
 * child a horizontal band proportional to its leaf count (rather than the old
 * fixed 3×3×2 layout) so any branching factor lays out without overlap.
 */
function topoBuildLayout(root, W) {
  const nodes = [];
  const edges = [];
  const Y_BY_LEVEL = [46, 138, 228, 304];
  const MAX_LEVEL = 3;

  function place(n, level, xStart, xEnd, parentId) {
    const x = (xStart + xEnd) / 2;
    const id = nodes.length;
    const bandWidth = xEnd - xStart;
    const node = {
      id, x, y: Y_BY_LEVEL[level], level,
      label: level === 0 ? 'You' : '',
      sub: level === 0 ? (n.rank || 'Unranked') : '',
      user: level === 0 ? '' : n.username,
      addr: level === 0 ? '' : topoShortAddr(n.walletAddress),
      mem: level === 0 ? '' : (n.tier || 'None'),
      cardW: level === 1 ? Math.max(64, Math.min(112, bandWidth * 0.82))
        : level === 2 ? Math.max(38, Math.min(50, bandWidth * 0.82))
        : undefined,
    };
    nodes.push(node);
    if (parentId !== null) edges.push([parentId, id]);

    const children = n.children || [];
    if (level < MAX_LEVEL && children.length > 0) {
      const totalLeaves = children.reduce((s, c) => s + topoCountLeaves(c), 0) || 1;
      let cursor = xStart;
      children.forEach((child) => {
        const leaves = topoCountLeaves(child);
        const width = bandWidth * (leaves / totalLeaves);
        place(child, level + 1, cursor, cursor + width, id);
        cursor += width;
      });
    }
    return id;
  }

  place(root, 0, 0, W, null);
  return { nodes, edges };
}

function drawNetworkTree() {
  const svg = document.getElementById('topoSvg');
  if (!svg) return;
  const W = svg.parentElement.offsetWidth || 700;
  const H = Math.max(svg.parentElement.offsetHeight, 320);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const cs = getComputedStyle(document.body);
  const olive  = cs.getPropertyValue('--olive').trim()  || '#5E6B55';
  const sage   = cs.getPropertyValue('--sage').trim()   || '#A8B5A2';
  const sf     = cs.getPropertyValue('--sage-faint').trim() || '#dce3da';
  const textPrimary = 'var(--t4)';
  const textSecondary = 'var(--t2)';
  const cardFill = 'var(--e2)';
  const edgeStroke = 'var(--sage-faint)';

  // ── real downline tree, wired in from network/page.tsx via window.__networkTreeData ──
  const treeData = window.__networkTreeData || null;
  const hasRealData = !!treeData;
  const hasDownline = hasRealData && Array.isArray(treeData.children) && treeData.children.length > 0;

  let nodes, edges;
  if (hasRealData) {
    const layout = topoBuildLayout(treeData, W);
    nodes = layout.nodes;
    edges = layout.edges;
  } else {
    nodes = [{ id: 0, x: W / 2, y: 46, level: 0, label: 'You', sub: '' }];
    edges = [];
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
    rect.setAttribute('fill',cardFill); rect.setAttribute('stroke', big?olive:sage);
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
    if(big){ line(n.user,15,'8.5',textPrimary,'700'); line(n.addr,27,'7.5',textSecondary); line(n.mem.toUpperCase(),38.5,'6.5','var(--sage)','700'); }
    else   { line(n.user,11,'6',textPrimary,'700'); line(n.addr,19.5,'5.4',textSecondary); line(n.mem.toUpperCase(),27.5,'4.8','var(--sage)','700'); }
  }

  // Draw edges
  edges.forEach(([a,b], i) => {
    const na = nodes[a], nb = nodes[b];
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', na.x); line.setAttribute('y1', na.y);
    line.setAttribute('x2', nb.x); line.setAttribute('y2', nb.y);
    const lv = nb.level;
    line.setAttribute('stroke', lv===3 ? edgeStroke : lv===2 ? edgeStroke : sf);
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
        t.setAttribute('fill', ki ? textSecondary : textPrimary);
        if(!ki) t.setAttribute('font-weight','700');
        t.textContent = n[k]; grp.appendChild(t);
      });
    } else if (n.level === 1) {
      drawUserCard(grp, n, n.cardW || 112, 46, true);
    } else if (n.level === 2) {
      drawUserCard(grp, n, n.cardW || 50, 34, false);
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

  // ── empty / loading state copy (drawn once, below the lone root node) ──
  if (!hasRealData || !hasDownline) {
    const lines = !hasRealData
      ? ['Loading your network…', '']
      : ['No referrals yet.', 'Share your referral link to start building your network.'];
    lines.forEach((text, i) => {
      if (!text) return;
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', W / 2); t.setAttribute('y', 120 + i * 16);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-family', "'Space Mono',monospace");
      t.setAttribute('font-size', i === 0 ? '10' : '8');
      t.setAttribute('fill', i === 0 ? textPrimary : textSecondary);
      if (i === 0) t.setAttribute('font-weight', '700');
      t.textContent = text;
      g.appendChild(t);
    });
  }

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
    rect.setAttribute('rx','5'); rect.setAttribute('fill',cardFill);
    rect.setAttribute('stroke', edgeStroke); rect.setAttribute('stroke-width','0.8');
    btn.appendChild(rect);
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x', x+13); txt.setAttribute('y', H-17);
    txt.setAttribute('text-anchor','middle'); txt.setAttribute('dominant-baseline','central');
    txt.setAttribute('font-family',"'Space Mono',monospace");
    txt.setAttribute('font-size','14'); txt.setAttribute('fill',textPrimary);
    txt.textContent = label; btn.appendChild(txt);
    btn.addEventListener('click', function(e){ e.stopPropagation(); cb(); applyTransform(); });
    btn.addEventListener('mouseover', () => rect.setAttribute('fill', sf));
    btn.addEventListener('mouseleave', () => rect.setAttribute('fill', cardFill));
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
  resetRect.setAttribute('rx','5'); resetRect.setAttribute('fill',cardFill);
  resetRect.setAttribute('stroke',edgeStroke); resetRect.setAttribute('stroke-width','0.8');
  resetBtn.appendChild(resetRect);
  const resetTxt = document.createElementNS('http://www.w3.org/2000/svg','text');
  resetTxt.setAttribute('x', W-84); resetTxt.setAttribute('y', H-17);
  resetTxt.setAttribute('text-anchor','middle'); resetTxt.setAttribute('dominant-baseline','central');
  resetTxt.setAttribute('font-family',"'Space Mono',monospace");
  resetTxt.setAttribute('font-size','7.5'); resetTxt.setAttribute('fill',textSecondary);
  resetTxt.textContent = 'RESET'; resetBtn.appendChild(resetTxt);
  resetBtn.addEventListener('click', function(e){
    e.stopPropagation(); zoom=1; panX=0; panY=0; applyTransform();
  });
  resetBtn.addEventListener('mouseover', () => resetRect.setAttribute('fill', sf));
  resetBtn.addEventListener('mouseleave', () => resetRect.setAttribute('fill', cardFill));
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
  const ctx=canvas.getContext('2d'),size=canvas.width||128,cells=20,cell=size/cells;
  const cs=getComputedStyle(document.body);
  const fg=cs.getPropertyValue('--accent').trim()||'#ec7a2c';
  const bg=cs.getPropertyValue('--inner').trim()||cs.getPropertyValue('--e3').trim()||'#f7f5f1';
  ctx.fillStyle=bg;ctx.fillRect(0,0,size,size);
  [[0,0],[13,0],[0,13]].forEach(([cx,cy])=>{ctx.fillStyle=fg;ctx.fillRect(cx*cell,cy*cell,7*cell,7*cell);ctx.fillStyle=bg;ctx.fillRect((cx+1)*cell,(cy+1)*cell,5*cell,5*cell);ctx.fillStyle=fg;ctx.fillRect((cx+2)*cell,(cy+2)*cell,3*cell,3*cell);});
  const seed=[1,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0];
  for(let r=0;r<cells;r++)for(let c=0;c<cells;c++){if((r<8&&c<8)||(r<8&&c>11)||(r>11&&c<8))continue;if((seed[(r+c)%20]+seed[(r*c)%20])%2===0){ctx.fillStyle=fg;ctx.fillRect(c*cell,r*cell,cell*.9,cell*.9);}}
}

window.drawNetworkTree = drawNetworkTree;
window.drawQR = drawQR;

if (!window._topoThemeObs) {
  let lastDark = document.body.classList.contains('dark');
  window._topoThemeObs = new MutationObserver(() => {
    const isDark = document.body.classList.contains('dark');
    if (isDark === lastDark) return;
    lastDark = isDark;
    if (document.getElementById('topoSvg')) drawNetworkTree();
    if (document.getElementById('qrCanvas')) drawQR();
  });
  window._topoThemeObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
