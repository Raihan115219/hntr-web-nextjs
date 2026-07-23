
let cur=(document.body&&document.body.dataset.page)||'home';
const loaderEl=document.getElementById('loader');
function animateLoader(cb){
  loaderEl.classList.remove('out');
  loaderEl.querySelectorAll('.ll,.ls,.loader-cursor').forEach(el=>{el.style.animation='none';void el.offsetHeight;el.style.animation=''});
  setTimeout(()=>{loaderEl.classList.add('out');if(cb)setTimeout(cb,400);},1050);
}
function countUpFeed(feedId){
  var feed=document.getElementById(feedId);
  if(!feed)return;
  feed.querySelectorAll('.npc-sv').forEach(function(el){
    var txt=el.firstChild;
    if(!txt||txt.nodeType!==3)return;
    if(el.dataset.countTo==null)el.dataset.countTo=txt.nodeValue.trim();
    var target=parseFloat(el.dataset.countTo);
    if(isNaN(target))return;
    var dec=(el.dataset.countTo.split('.')[1]||'').length;
    var dur=1150,start=null;
    function step(ts){
      if(start===null)start=ts;
      var p=Math.min((ts-start)/dur,1);
      var e=1-Math.pow(1-p,3);
      txt.nodeValue=(target*e).toFixed(dec);
      if(p<1)requestAnimationFrame(step);
      else txt.nodeValue=target.toFixed(dec);
    }
    txt.nodeValue=(0).toFixed(dec);
    requestAnimationFrame(step);
  });
}
function openLearn(){
  var ov=document.getElementById('learnOverlay'),lf=document.getElementById('learnFrame'),ld=document.getElementById('learnLoader');
  if(lf&&!lf.src){
    if(ld){ ld.style.display='flex'; ld.style.opacity='1';
      [].forEach.call(ld.querySelectorAll('.ll'),function(el){ el.style.animation='none'; void el.offsetWidth; el.style.animation=''; });
      lf.addEventListener('load',function(){ setTimeout(function(){ ld.style.opacity='0'; setTimeout(function(){ ld.style.display='none'; },480); }, 200); });
      setTimeout(function(){ if(ld.style.opacity!=='0'){ ld.style.opacity='0'; setTimeout(function(){ ld.style.display='none'; },480); } }, 6000);
    }
    lf.src=((window.__resources||{}).learnDocs)||'HNTR Docs.html';
  }
  ov.style.display='block';
  document.querySelector('.si[data-page="learn"]').classList.add('active');
}
function closeLearn(){
  document.getElementById('learnOverlay').style.display='none';
  document.querySelector('.si[data-page="learn"]').classList.remove('active');
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.getElementById('learnOverlay').style.display==='block')closeLearn();});

function go(page){
  if(page===cur)return;
  var t0=document.querySelector('.si[data-page="'+page+'"]');
  // if(t0&&t0.classList.contains('locked')){ if(typeof openSignup==='function')openSignup(); return; }
  // if(t0&&t0.classList.contains('locked')){ if(typeof openSignup==='function')openSignup(); return; }
  animateLoader(()=>{
    document.getElementById('panel-'+cur).classList.remove('active');
    document.getElementById('panel-'+page).classList.add('active');
    const feed=document.getElementById('feed-'+page);
    if(feed)feed.scrollTop=0;
    document.querySelectorAll('.si[data-page]').forEach(s=>s.classList.remove('active'));
    const t=document.querySelector('.si[data-page="'+page+'"]');
    if(t)t.classList.add('active');
    cur=page;
    onPageEnter(page);
  });
}
function onPageEnter(page){
  if(page==='home'||page==='pools')countUpFeed('feed-'+page);
  document.querySelectorAll('#panel-'+page+' .rpf,#panel-'+page+' .ppf,#panel-'+page+' .progress-fill,#panel-'+page+' .net-prog-fill').forEach(el=>{const w=el.style.width;el.style.width='0%';void el.offsetHeight;el.style.width=w;});
  if(page==='pools'){document.querySelectorAll('#panel-pools .ring-fill[data-pct]').forEach(el=>{const pct=parseFloat(el.dataset.pct),circ=2*Math.PI*22;el.style.strokeDashoffset=circ;void el.offsetHeight;setTimeout(()=>{el.style.strokeDashoffset=circ-(pct/100)*circ;},300);});}
  if(page==='membership'){document.querySelectorAll('#panel-membership .tier-card,.info-card').forEach(el=>{el.style.animationName='none';void el.offsetHeight;el.style.animationName='';});}
  if(page==='network'){setTimeout(drawNetworkTree,120);setTimeout(drawQR,180);}
  if(page==='collection'){
    setTimeout(()=>{
      document.querySelectorAll('#panel-collection .nc-ring-fill[data-pct]').forEach(el=>{
        const pct=parseFloat(el.dataset.pct);
        const circ=parseFloat(el.style.strokeDasharray)||201.06;
        el.style.strokeDashoffset=circ;
        void el.offsetHeight;
        setTimeout(()=>{el.style.strokeDashoffset=circ-(pct/100)*circ;},100);
      });
    },200);
  }
}
setTimeout(()=>loaderEl.classList.add('out'),1150);
setTimeout(()=>countUpFeed('feed-home'),1250);

[['mosaic','mc'],['heroMosaic','hmc'],['poolsMosaic','phmc'],['vhgrid','vh-mc'],['networkMosaic','hmc'],['collMosaic','hmc']].forEach(([id,cls])=>{
  const el=document.getElementById(id);
  if(el&&el.children.length===0)for(let i=0;i<60;i++){const d=document.createElement('div');d.className=cls;el.appendChild(d);}
});
document.querySelectorAll('.nc-ring-fill[data-pct]').forEach(el=>{
  const pct=parseFloat(el.dataset.pct);
  const circ=parseFloat(el.style.strokeDasharray)||201.06;
  setTimeout(()=>{el.style.strokeDashoffset=circ-(pct/100)*circ;},500);
});
document.querySelectorAll('.ring-fill[data-pct]').forEach(el=>{const pct=parseFloat(el.dataset.pct),circ=2*Math.PI*22;setTimeout(()=>{el.style.strokeDashoffset=circ-(pct/100)*circ;},400);});

document.addEventListener('click',e=>{
  const npcArt=e.target.closest('.npc-art');if(npcArt&&typeof go==='function'){go('pooldetail');return;}
  const to=e.target.closest('.to');if(to){to.closest('.tf').querySelectorAll('.to').forEach(t=>t.classList.remove('active'));to.classList.add('active');}
  const at=e.target.closest('.at');if(at){at.parentElement.querySelectorAll('.at').forEach(t=>t.classList.remove('active'));at.classList.add('active');}
  const cc=e.target.closest('.coll-check');if(cc)cc.classList.toggle('checked');
  const gi=e.target.closest('.gi');if(gi){gi.closest('.grid-icons').querySelectorAll('.gi').forEach(b=>b.classList.remove('active'));gi.classList.add('active');}
  const tvb=e.target.closest('.topo-vbtn');if(tvb){tvb.closest('.topo-view-btns').querySelectorAll('.topo-vbtn').forEach(b=>b.classList.remove('active'));tvb.classList.add('active');drawNetworkTree();}
  const tpg=e.target.closest('.txh-pg');if(tpg&&!tpg.textContent.includes('‹')&&!tpg.textContent.includes('›')){tpg.closest('.txh-pages').querySelectorAll('.txh-pg').forEach(b=>b.classList.remove('active'));tpg.classList.add('active');}
});

const ACT=[
  {icon:'🐧',name:'Pudgy Penguin #3362',action:'DEPOSITED',val:'2.4 Ξ',pos:true},
  {icon:'🦧',name:'BAYC #9112',action:'LISTED',val:'$19,400',pos:true},
  {icon:'👾',name:'CryptoPunk #7804',action:'SOLD',val:'$91,000',pos:true},
  {icon:'🐧',name:'Pudgy Penguin #1021',action:'BID PLACED',val:'3.1 Ξ',pos:true},
  {icon:'🦧',name:'BAYC #5678',action:'RENEWED',val:'+14% APY',pos:true},
  {icon:'🎨',name:'Normie #2265',action:'SOLD',val:'$4,200',pos:true},
  {icon:'👾',name:'CryptoPunk #3100',action:'LISTED',val:'$110,000',pos:true},
  {icon:'⚡',name:'Kaito Genesis #441',action:'LISTED',val:'1.4 Ξ',pos:false},
  {icon:'🦧',name:'BAYC #1142',action:'WITHDRAWN',val:'3.2 Ξ',pos:false},
];
let actLog=[];
function tAgo(ms){const s=Math.floor((Date.now()-ms)/1000);return s<60?s+'s':s<3600?Math.floor(s/60)+'m':Math.floor(s/3600)+'h';}
function renderAct(){document.querySelectorAll('[id="activityFeed"]').forEach(el=>{el.innerHTML=actLog.slice(0,6).map((e,i)=>`<div class="arow${i===0?' arow-new':''}"><div class="adot">${e.icon}</div><div class="ainf"><div class="an">${e.name}</div><div class="aa" style="color:${e.pos?'var(--green)':'var(--red)'}">${e.action} · ${e.val}</div></div><div class="atm">${tAgo(e.ts)}</div></div>`).join('');});}
for(let i=0;i<6;i++){const a=ACT[i%ACT.length];actLog.push({...a,ts:Date.now()-(i*47+22)*1000});}
renderAct();
(function sa(){setTimeout(()=>{const a=ACT[Math.floor(Math.random()*ACT.length)];actLog.unshift({...a,ts:Date.now()});if(actLog.length>20)actLog.pop();renderAct();sa();},3000+Math.random()*3000);})();
setInterval(renderAct,15000);

const mrcEls=document.querySelectorAll('.mrc[data-base]');
function nudge(s){const sg=s.startsWith('+')?1:-1,n=parseFloat(s.replace(/[^0-9.]/g,''));return(sg>0?'+':'−')+(Math.max(.01,n+(Math.random()*.12-.03))).toFixed(2)+' %';}
setInterval(()=>{mrcEls.forEach(el=>{if(Math.random()<.45){const v=nudge(el.dataset.base);el.dataset.base=v;const p=!v.startsWith('−');el.className='mrc '+(p?'pos':'neg');el.textContent=v;el.classList.add(p?'flash-pos':'flash-neg');setTimeout(()=>el.classList.remove('flash-pos','flash-neg'),600);}});},2500);

/* ── POSITIONS BREAKDOWN (Listed / Sold / Progress) ── */
var POS_DATA={
  listed:[
    {src:'OpenSea',coll:'Bored Ape Yacht Club',token:'#6722',price:'42.50 ETH',priceUsd:'$61,750',apr:'12.4%',profit:'+5.30 ETH',profitUsd:'+$7,700'},
    {src:'Blur',coll:'CryptoPunks',token:'#3100',price:'58.20 ETH',priceUsd:'$84,540',apr:'9.8%',profit:'+5.70 ETH',profitUsd:'+$8,280'},
    {src:'OpenSea',coll:'Azuki',token:'#4412',price:'6.40 ETH',priceUsd:'$9,300',apr:'18.2%',profit:'+1.16 ETH',profitUsd:'+$1,685'},
    {src:'LooksRare',coll:'Pudgy Penguins',token:'#1845',price:'12.10 ETH',priceUsd:'$17,580',apr:'14.6%',profit:'+1.77 ETH',profitUsd:'+$2,570'},
    {src:'OpenSea',coll:'Doodles',token:'#9021',price:'4.85 ETH',priceUsd:'$7,045',apr:'21.0%',profit:'+1.02 ETH',profitUsd:'+$1,480'},
  ],
  sold:[
    {src:'OpenSea',coll:'Bored Ape Yacht Club',token:'#5821',bought:'38.00 ETH',boughtUsd:'$55,200',sold:'44.20 ETH',soldUsd:'$64,220',profit:'+6.20 ETH',profitUsd:'+$9,020'},
    {src:'Blur',coll:'CryptoPunks',token:'#2204',bought:'52.00 ETH',boughtUsd:'$75,560',sold:'58.20 ETH',soldUsd:'$84,540',profit:'+6.20 ETH',profitUsd:'+$8,980'},
    {src:'OpenSea',coll:'Azuki',token:'#3318',bought:'7.10 ETH',boughtUsd:'$10,315',sold:'6.40 ETH',soldUsd:'$9,300',profit:'-0.70 ETH',profitUsd:'-$1,015',neg:true},
    {src:'LooksRare',coll:'Moonbirds',token:'#7740',bought:'9.50 ETH',boughtUsd:'$13,800',sold:'11.80 ETH',soldUsd:'$17,145',profit:'+2.30 ETH',profitUsd:'+$3,345'},
    {src:'OpenSea',coll:'Pudgy Penguins',token:'#1102',bought:'10.00 ETH',boughtUsd:'$14,530',sold:'12.10 ETH',soldUsd:'$17,580',profit:'+2.10 ETH',profitUsd:'+$3,050'},
  ],
  progress:[
    {src:'POOL-0481',coll:'Bored Ape Yacht Club',token:'#6722',target:'50.00 ETH',targetUsd:'$72,650',raised:'42.50 ETH',raisedUsd:'$61,750',pct:85,apr:'12.4%',dep:'5.00 ETH',depUsd:'$7,265'},
    {src:'POOL-0477',coll:'CryptoPunks',token:'#3100',target:'60.00 ETH',targetUsd:'$87,180',raised:'33.00 ETH',raisedUsd:'$47,950',pct:55,apr:'9.8%',dep:'8.20 ETH',depUsd:'$11,915'},
    {src:'POOL-0492',coll:'Azuki',token:'#4412',target:'8.00 ETH',targetUsd:'$11,624',raised:'7.20 ETH',raisedUsd:'$10,460',pct:90,apr:'18.2%',dep:'1.50 ETH',depUsd:'$2,180'},
    {src:'POOL-0468',coll:'Doodles',token:'#9021',target:'6.00 ETH',targetUsd:'$8,718',raised:'2.40 ETH',raisedUsd:'$3,487',pct:40,apr:'21.0%',dep:'0.60 ETH',depUsd:'$872'},
    {src:'POOL-0455',coll:'Pudgy Penguins',token:'#1845',target:'15.00 ETH',targetUsd:'$21,795',raised:'10.90 ETH',raisedUsd:'$15,838',pct:73,apr:'14.6%',dep:'3.00 ETH',depUsd:'$4,359'},
  ]
};
var POS_HEADS={
  listed:['Source','Collection','Price Listed','APR','My Profit','Action','View NFT'],
  sold:['Source','Collection','Bought Price','Sold Price','My Profit','Action','View NFT'],
  progress:['Source','Collection','ETH Target','Raised','APR','My Deposit','View NFT']
};
function posVal(eth,usd){return '<div class="pos-val">'+eth+'</div><div class="pos-val-sub">'+usd+'</div>';}
function posColl(r){return '<td><div class="pos-coll">'+r.coll+'</div><div class="pos-id">'+r.token+'</div></td>';}
function setPosView(view){
  document.querySelectorAll('.pos-tab').forEach(function(t){t.classList.toggle('active',t.dataset.view===view);});
  var head=document.getElementById('posHead'),body=document.getElementById('posTable');
  if(!head||!body)return;
  head.innerHTML=POS_HEADS[view].map(function(h){return '<th>'+h+'</th>';}).join('');
  var rows=POS_DATA[view],vb='<button class="pos-view-btn">VIEW NFT</button>';
  body.innerHTML=rows.map(function(r){
    var profit='<td class="pos-profit'+(r.neg?' neg':'')+'"><div>'+r.profit+'</div><div class="pos-val-sub" style="color:inherit;opacity:.7">'+r.profitUsd+'</div></td>';
    if(view==='listed'){
      return '<tr class="pos-tr"><td class="pos-src">'+r.src+'</td>'+posColl(r)+
        '<td>'+posVal(r.price,r.priceUsd)+'</td>'+
        '<td class="pos-apr">'+r.apr+'</td>'+profit+
        '<td><div class="pos-status"><div class="pos-dot-listed"></div><span class="pos-status-lbl">LISTED</span></div></td>'+
        '<td>'+vb+'</td></tr>';
    }
    if(view==='sold'){
      return '<tr class="pos-tr"><td class="pos-src">'+r.src+'</td>'+posColl(r)+
        '<td>'+posVal(r.bought,r.boughtUsd)+'</td><td>'+posVal(r.sold,r.soldUsd)+'</td>'+
        profit+'<td><div class="pos-status"><div class="pos-dot-sold"></div><span class="pos-status-lbl">SOLD</span></div></td><td>'+vb+'</td></tr>';
    }
    return '<tr class="pos-tr"><td class="pos-src">'+r.src+'</td>'+posColl(r)+
      '<td>'+posVal(r.target,r.targetUsd)+'</td>'+
      '<td><div class="pos-val">'+r.raised+'</div><div class="pos-val-sub">'+r.raisedUsd+'</div><div class="pos-raised-bar"><div class="pos-raised-fill" style="width:'+r.pct+'%"></div></div></td>'+
      '<td class="pos-apr">'+r.apr+'</td><td>'+posVal(r.dep,r.depUsd)+'</td>'+
      '<td>'+vb+'</td></tr>';
  }).join('');
  var cnt=document.getElementById('posCount');
  if(cnt)cnt.textContent='Showing 1-'+rows.length+' of '+({listed:'847',sold:'312',progress:'85'}[view])+' entries';
}
window.setPosView=setPosView;
setPosView('listed');

const txTb=document.getElementById('txTable');
const WS=['0x71C...492','0x3A8...12D','0x9FE...88A','0x12C...55B','0xB4D...F31'];
const AS=['0.50 ETH','0.85 ETH','1.25 ETH','2.10 ETH','3.40 ETH'];
const DS=['Jun 14, 2026','Jun 12, 2026','Jun 10, 2026','Jun 08, 2026'];
let txC=0;
if(txTb){
  function mkTx(a){const tr=document.createElement('tr');if(a)tr.classList.add('row-new');tr.innerHTML=`<td class="td-wallet">${WS[Math.floor(Math.random()*WS.length)]}</td><td><span class="td-badge">POOL_DEPOSIT</span></td><td class="td-date">${DS[Math.floor(Math.random()*DS.length)]}</td><td class="td-amount">${AS[Math.floor(Math.random()*AS.length)]}</td><td><span class="td-action">View Transaction</span></td>`;return tr;}
  for(let i=0;i<4;i++){txTb.appendChild(mkTx(false));txC++;}
  (function st(){setTimeout(()=>{txC++;const tr=mkTx(true);txTb.insertBefore(tr,txTb.firstChild);const pg=document.getElementById('pgInfo');if(pg)pg.textContent=`Showing 1-4 of ${txC.toLocaleString()} entries`;while(txTb.children.length>4)txTb.removeChild(txTb.lastChild);st();},2500+Math.random()*2000);})();
}

const atTb=document.getElementById('actTable');
const AC_C=[{name:'Bored Ape Yacht Club',color:'var(--olive)'},{name:'CryptoPunks',color:'var(--sage)'},{name:'Pudgy Penguins',color:'#c8b99a'},{name:'Azuki',color:'#9e7a6a'},{name:'Doodles',color:'#8a9e82'}];
const AC_A=['0.50 ETH','0.85 ETH','1.25 ETH','2.10 ETH','3.40 ETH'];
const AC_P=[35,40,55,62,75,80,88];
if(atTb){
  function mkAct(a){const c=AC_C[Math.floor(Math.random()*AC_C.length)],pct=AC_P[Math.floor(Math.random()*AC_P.length)];const tr=document.createElement('tr');if(a)tr.classList.add('row-new');tr.innerHTML=`<td class="td-wallet">${WS[Math.floor(Math.random()*WS.length)]}</td><td class="td-amt">${AC_A[Math.floor(Math.random()*AC_A.length)]}</td><td><div class="td-coll"><div class="td-coll-dot" style="background:${c.color}"></div><span class="td-coll-name">${c.name}</span></div></td><td><div class="td-prog-wrap"><div class="td-prog-bar"><div class="td-prog-fill" style="width:0%"></div></div><span class="td-prog-pct">${pct}%</span></div></td><td><span class="td-action">VIEW TX</span></td>`;return{tr,pct};}
  for(let i=0;i<4;i++){const{tr,pct}=mkAct(false);atTb.appendChild(tr);setTimeout(()=>{const b=tr.querySelector('.td-prog-fill');if(b)b.style.width=pct+'%';},200+i*100);}
  (function sa(){setTimeout(()=>{const{tr,pct}=mkAct(true);atTb.insertBefore(tr,atTb.firstChild);setTimeout(()=>{const b=tr.querySelector('.td-prog-fill');if(b)b.style.width=pct+'%';},100);while(atTb.children.length>6)atTb.removeChild(atTb.lastChild);sa();},2500+Math.random()*2500);})();
}

const ntTb=document.getElementById('netTable');
const NE=[['Pudgy Penguin #6523','PURCHASE','4.85 ETH','Blur.io'],['BAYC #9112','SALE','12.40 ETH','OpenSea'],['CryptoPunk #3295','SALE','28.00 ETH','Blur.io'],['Azuki #3295','PURCHASE','2.30 ETH','OpenSea']];
if(ntTb)setInterval(()=>{const e=NE[Math.floor(Math.random()*NE.length)],p=e[1]==='PURCHASE',r=document.createElement('tr');r.style.animation='fadeSlideIn .3s ease both';r.innerHTML=`<td class="td-asset">${e[0]}</td><td><span class="td-event ${p?'ev-purchase':'ev-sale'}">${e[1]}</span></td><td class="td-price">${e[2]}</td><td class="td-source">${e[3]}</td><td class="td-time">just now</td>`;ntTb.insertBefore(r,ntTb.firstChild);if(ntTb.children.length>5)ntTb.removeChild(ntTb.lastChild);},4500);

const ct=document.getElementById('carouselTrack');
if(ct){
  const PD=[{n:'Bored Ape Yacht Club',a:'5.1/10 ETH (51%)'},{n:'CryptoPunks',a:'5.1/10 ETH (51%)'},{n:'Pudgy Penguins',a:'8.2/12 ETH (68%)'},{n:'BAYC Zombie',a:'3.5/8 ETH (44%)'},{n:'BAYC 3D',a:'6.8/14 ETH (49%)'},{n:'BAYC Soldier',a:'4.2/9 ETH (47%)'}];
  [...PD,...PD].forEach(p=>{const d=document.createElement('div');d.className='pool-thumb';d.innerHTML=`<div style="width:52px;height:52px;background:var(--olive-deep);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🦧</div><div class="pool-thumb-info"><div class="pt-name">${p.n}</div><div class="pt-activity">Activity: ${p.a}</div><div class="pt-view">View →</div></div>`;d.onmouseenter=()=>ct.style.animationPlayState='paused';d.onmouseleave=()=>ct.style.animationPlayState='running';ct.appendChild(d);});
}

window.selectTier=function(btn){document.querySelectorAll('.tier-btn').forEach(b=>{b.classList.remove('purchase');b.textContent='SELECT';b.closest('.tier-card').classList.remove('recommended');});btn.classList.add('purchase');btn.textContent='PURCHASE';btn.closest('.tier-card').classList.add('recommended');};

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
  const memTiers=['Bronze','Silver','Gold','Platinum','Diamond'];
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
  const l1Mem    = ['Diamond','Platinum','Gold'];
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
setTimeout(drawNetworkTree, 200);

function drawQR(){
  // Fake decorative QR — real referral QR is rendered in app/network/page.tsx via qrcode.
  // const canvas=document.getElementById('qrCanvas');if(!canvas)return;
  // const ctx=canvas.getContext('2d'),size=160,cells=20,cell=size/cells;
  // const cs=getComputedStyle(document.documentElement);
  // const olive=cs.getPropertyValue('--olive').trim()||'#5E6B55';
  // const bg=cs.getPropertyValue('--e3').trim()||'#f4f2ee';
  // ctx.fillStyle=bg;ctx.fillRect(0,0,size,size);
  // [[0,0],[13,0],[0,13]].forEach(([cx,cy])=>{ctx.fillStyle=olive;ctx.fillRect(cx*cell,cy*cell,7*cell,7*cell);ctx.fillStyle=bg;ctx.fillRect((cx+1)*cell,(cy+1)*cell,5*cell,5*cell);ctx.fillStyle=olive;ctx.fillRect((cx+2)*cell,(cy+2)*cell,3*cell,3*cell);});
  // const seed=[1,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0];
  // for(let r=0;r<cells;r++)for(let c=0;c<cells;c++){if((r<8&&c<8)||(r<8&&c>11)||(r>11&&c<8))continue;if((seed[(r+c)%20]+seed[(r*c)%20])%2===0){ctx.fillStyle=olive;ctx.fillRect(c*cell,r*cell,cell*.9,cell*.9);}}
  window.drawQR?.();
}
// setTimeout(drawQR,300);

const TXH=[
  {dt:'2024-05-12 14:32:01',type:'POOL_REWARD',source:'Global Liquidity Pool A',amount:'+$142.50'},
  {dt:'2024-05-12 12:00:00',type:'RANK_REWARD',source:'Monthly Elite Stipend',amount:'+$2,500.00'},
  {dt:'2024-05-11 18:15:44',type:'NETWORK_COMM',source:'Inst. Direct #8829',amount:'+$48.12'},
  {dt:'2024-05-11 09:05:22',type:'DISCRETIONARY',source:'V3 Governance Vote',amount:'+$12.00'},
];
let txhC=1244;
const txhTb=document.getElementById('txhTable');
function buildTxh(data){if(!txhTb)return;txhTb.innerHTML=data.slice(0,4).map((r,i)=>`<tr class="${i===0?'txh-row-new':''}"><td class="txh-dt">${r.dt}</td><td><span class="txh-type">${r.type}</span></td><td class="txh-source">${r.source}</td><td class="txh-amount">${r.amount}</td><td class="txh-status"><div class="txh-check"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div></td></tr>`).join('');}
buildTxh(TXH);
setInterval(()=>{const types=['POOL_REWARD','NETWORK_COMM','RANK_REWARD','DISCRETIONARY'],srcs=['Global Liquidity Pool A','Inst. Direct #'+Math.floor(Math.random()*9999),'Monthly Elite Stipend'];const now=new Date().toISOString().replace('T',' ').slice(0,19);TXH.unshift({dt:now,type:types[Math.floor(Math.random()*types.length)],source:srcs[Math.floor(Math.random()*srcs.length)],amount:'+$'+(Math.random()*500+10).toFixed(2)});txhC++;buildTxh(TXH);const cnt=document.getElementById('txhCount');if(cnt)cnt.textContent=`Showing 1-4 of ${txhC.toLocaleString()} entries`;},5000);

window.copyRef=function(){navigator.clipboard?.writeText('hntr.net/ref/0x71c...492');const btn=document.querySelector('.ref-copy-btn');if(btn){btn.style.color='var(--green)';setTimeout(()=>btn.style.color='',1000);}};

/* THEME TOGGLE */
let isDark = true;
document.body.classList.add('dark');
(function(){var ico=document.getElementById('themeIcon');if(ico)ico.innerHTML='<path d="M13 10.5A5.5 5.5 0 0 1 6.5 4a5.5 5.5 0 0 0 0 8.5A5.5 5.5 0 0 0 13 10.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>';var lbl=document.querySelector('#themeToggle .si-label');if(lbl)lbl.textContent='Dark Mode';})();
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  const ico = document.getElementById('themeIcon');
  if (ico) {
    if (isDark) {
      // Moon icon
      ico.innerHTML = '<path d="M13 10.5A5.5 5.5 0 0 1 6.5 4a5.5 5.5 0 0 0 0 8.5A5.5 5.5 0 0 0 13 10.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>';
    } else {
      // Sun icon
      ico.innerHTML = '<circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>';
    }
  }
}
window.toggleTheme = toggleTheme;

console.log('HNTR.art Sage×Olive×Cream SPA ✓');

/* ══ TOAST NOTIFICATIONS ══ */
const TOASTS = [
  {
    title: 'Referral Commission claimed successfully',
    sub:   '0.25 ETH claimed to wallet: 0x71C…492',
    link:  'VIEW TRANSACTION',
    icon:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: 'Pool Reward claimed successfully',
    sub:   '1.15 ETH claimed to wallet: 0x71C…492',
    link:  'VIEW TRANSACTION',
    icon:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: 'Pool Deposit Successful',
    sub:   '1.25 ETH deposited into Fidenza #565',
    link:  'VIEW TRANSACTION',
    icon:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: 'NFT Listing Updated',
    sub:   'BAYC #9112 listed for 7.75 ETH',
    link:  'VIEW LISTING',
    icon:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: 'Rank Bonus Received',
    sub:   '+$31,005 credited to your account',
    link:  'VIEW REWARDS',
    icon:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    title: 'New Network Member Joined',
    sub:   '0x3A8…12D joined via your referral link',
    link:  'VIEW NETWORK',
    icon:  '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
];

const toastContainer = document.getElementById('toast-container');
const TOAST_DURATION = 1000; // ms visible

function showToast(data) {
  if (document.body.classList.contains('intro-active')) return;
  var _lo=document.getElementById('learnOverlay'); if (_lo && _lo.style.display==='block') return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.setProperty('--dur', (TOAST_DURATION / 1000) + 's');
  el.innerHTML = `
    <div class="toast-icon">${data.icon}</div>
    <div class="toast-body">
      <div class="toast-title">${data.title}</div>
      <div class="toast-sub">${data.sub}</div>
      <a class="toast-link">${data.link}</a>
    </div>
    <button class="toast-close" onclick="dismissToast(this.closest('.toast'))">×</button>
  `;
  const tc = toastContainer || document.getElementById('toast-container');
  if (!tc) return;
  tc.appendChild(el);

  // Auto dismiss
  const timer = setTimeout(() => dismissToast(el), TOAST_DURATION);

  // Cancel timer if user interacts
  el.addEventListener('mouseenter', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => {
    const remaining = parseFloat(getComputedStyle(el).getPropertyValue('--dur')) * 1000;
    setTimeout(() => dismissToast(el), remaining > 1000 ? 1500 : 800);
  });
}

function dismissToast(el) {
  if (!el || el.classList.contains('out')) return;
  el.classList.add('out');
  setTimeout(() => el.remove(), 380);
}

// Random appearance: show one toast every 22-46 seconds
function scheduleToast() {
  const delay = 22000 + Math.random() * 24000;
  setTimeout(() => {
    const t = TOASTS[Math.floor(Math.random() * TOASTS.length)];
    showToast(t);
    scheduleToast(); // schedule next
  }, delay);
}

// First toast after 3-5 seconds
setTimeout(() => {
  showToast(TOASTS[0]);
  scheduleToast();
}, 3000 + Math.random() * 2000);


/* ══ DEPOSIT MODAL ══ */
const DM_BALANCE = 4.25;
const DM_ETH_USD = 1820;

function openDepositModal(assetName, floorEth) {
  const overlay = document.getElementById('depositOverlay');
  if (!overlay) return;
  // Set asset details
  const nameEl = document.getElementById('dm-asset-name');
  const floorEl = document.getElementById('dm-floor');
  if (nameEl) nameEl.textContent = assetName || 'Bored Ape YC #3362';
  if (floorEl) floorEl.innerHTML = (floorEth || '7.80') + ' <span class="eth-ic"></span>';
  // Reset input
  const inp = document.getElementById('dm-eth-input');
  if (inp) inp.value = '';
  dmOnInput('');
  document.querySelectorAll('.dm-pct-btn').forEach(b => b.classList.remove('active'));
  // Open
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { if (inp) inp.focus(); }, 320);
}

function closeDeposit() {
  const overlay = document.getElementById('depositOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeDepositModal(e) {
  if (e.target === document.getElementById('depositOverlay')) closeDeposit();
}

function dmOnInput(val) {
  const num = parseFloat(val) || 0;
  const usd = (num * DM_ETH_USD).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  const usdEl = document.getElementById('dm-usd-val');
  if (usdEl) usdEl.textContent = '≈ $' + usd + ' USD';
  // Clear pct active if manually typing
  document.querySelectorAll('.dm-pct-btn').forEach(b => b.classList.remove('active'));
  // Enable/disable proceed
  const btn = document.getElementById('dm-proceed-btn');
  if (btn) btn.disabled = num <= 0 || num > DM_BALANCE;
}

function dmSetPct(pct) {
  const amount = pct === 100 ? DM_BALANCE : parseFloat((DM_BALANCE * pct / 100).toFixed(4));
  const inp = document.getElementById('dm-eth-input');
  if (inp) { inp.value = amount; dmOnInput(amount); }
  document.querySelectorAll('.dm-pct-btn').forEach(b => {
    b.classList.toggle('active', b.textContent === (pct === 100 ? 'MAX' : pct + '%'));
  });
}

function dmProceed() {
  const inp = document.getElementById('dm-eth-input');
  const val = parseFloat(inp?.value) || 0;
  if (val <= 0) return;
  closeDeposit();
  // Show success toast
  setTimeout(() => {
    showToast({
      title: 'Pool Deposit Successful',
      sub: val.toFixed(4) + ' ETH deposited into pool',
      link: 'VIEW TRANSACTION',
    });
  }, 400);
}
window.openDepositModal = openDepositModal;
window.closeDeposit = closeDeposit;
window.closeDepositModal = closeDepositModal;
window.dmOnInput = dmOnInput;
window.dmSetPct = dmSetPct;
window.dmProceed = dmProceed;

/* ======= SEARCH PANEL ======= */
var SEARCH_INDEX = [
  {name:'Bored Ape Yacht Club',sub:'NFT Collection',icon:'&#129415;',page:'vault'},
  {name:'CryptoPunks',sub:'NFT Collection',icon:'&#128126;',page:'vault'},
  {name:'Pudgy Penguins',sub:'NFT Collection',icon:'&#128039;',page:'vault'},
  {name:'BAYC Pool #3362',sub:'Active pool 48.6% funded',icon:'&#128230;',page:'pools'},
  {name:'Pudgy Pool #3363',sub:'Active pool 62% funded',icon:'&#128230;',page:'pools'},
  {name:'Gold Membership',sub:'Tier 03 $750',icon:'&#128179;',page:'membership'},
  {name:'Platinum Membership',sub:'Tier 04 $1500',icon:'&#128179;',page:'membership'},
  {name:'Network Commissions',sub:'Active rewards',icon:'&#128176;',page:'network'},
];
var QUICK_NAV = [
  {page:'home',name:'Home',sub:'Dashboard overview',icon:'&#127968;'},
  {page:'vault',name:'Marketplace',sub:'Browse NFT listings',icon:'&#128717;'},
  {page:'pools',name:'NFT Strategies',sub:'Active investment pools',icon:'&#128200;'},
  {page:'membership',name:'Membership',sub:'Tiers and rewards',icon:'&#128179;'},
  {page:'collection',name:'MY NFTs',sub:'Your collection',icon:'&#128444;'},
  {page:'network',name:'Network',sub:'Referrals and commissions',icon:'&#128100;'},
];

function renderSearchItems(items) {
  return items.map(function(x) {
    return '<div class="search-item" onclick="go(\''+x.page+'\');closeSearch()"><div class="search-item-icon">'+x.icon+'</div><div><div class="search-item-name">'+x.name+'</div><div class="search-item-sub">'+x.sub+'</div></div></div>';
  }).join('');
}

function openSearch() {
  var p = document.getElementById('searchPanel');
  var i = document.getElementById('searchInput');
  closeNotifPanel();
  if (!p) return;
  var isOpen = p.classList.contains('open');
  p.classList.toggle('open');
  if (!isOpen) {
    setTimeout(function(){ if(i){ i.value=''; doSearch(''); i.focus(); } }, 80);
    document.addEventListener('keydown', searchEscHandler);
  }
}
function closeSearch() {
  var p = document.getElementById('searchPanel');
  if (p) p.classList.remove('open');
  document.removeEventListener('keydown', searchEscHandler);
}
function searchEscHandler(e) { if (e.key === 'Escape') closeSearch(); }
function doSearch(q) {
  var res = document.getElementById('searchResults');
  if (!res) return;
  if (!q.trim()) {
    res.innerHTML = '<div class="search-group-lbl">Quick Navigation</div>' + renderSearchItems(QUICK_NAV);
    return;
  }
  var ql = q.toLowerCase();
  var matches = SEARCH_INDEX.filter(function(x){ return x.name.toLowerCase().indexOf(ql)>-1 || x.sub.toLowerCase().indexOf(ql)>-1; });
  if (!matches.length) { res.innerHTML = '<div class="search-empty">No results for "'+q+'"</div>'; return; }
  res.innerHTML = '<div class="search-group-lbl">Results</div>' + renderSearchItems(matches);
}
window.openSearch = openSearch;
window.closeSearch = closeSearch;
window.doSearch = doSearch;

/* ======= NOTIFICATIONS PANEL ======= */
var NOTIF_STORE = [
  {title:'Pool Deposit Successful',sub:'1.25 ETH deposited into BAYC Pool #3362',time:'2m ago',read:false},
  {title:'Referral Commission earned',sub:'0.25 ETH from network activity',time:'14m ago',read:false},
  {title:'Pool Reward claimed',sub:'1.15 ETH sent to your wallet',time:'1h ago',read:true},
  {title:'New pool available',sub:'Azuki Pool #3365 is now open for deposits',time:'3h ago',read:true},
  {title:'Rank Bonus paid',sub:'$31,005.00 one-time bonus distributed',time:'1d ago',read:true},
];

function renderNotifList() {
  var list = document.getElementById('notifList');
  if (!list) return;
  if (!NOTIF_STORE.length) { list.innerHTML = '<div style="text-align:center;padding:24px;font-size:11px;color:var(--t0)">No notifications</div>'; return; }
  list.innerHTML = NOTIF_STORE.map(function(n) {
    return '<div class="notif-item"><div class="notif-dot'+(n.read?' read':'')+'"></div><div class="notif-item-content"><div class="notif-item-title">'+n.title+'</div><div class="notif-item-sub">'+n.sub+'</div><div class="notif-item-time">'+n.time+'</div></div></div>';
  }).join('');
}
function toggleNotifPanel() {
  var p = document.getElementById('notifPanel');
  closeSearch();
  if (!p) return;
  p.classList.toggle('open');
  if (p.classList.contains('open')) { renderNotifList(); updateNotifBadge(); }
}
function closeNotifPanel() {
  var p = document.getElementById('notifPanel');
  if (p) p.classList.remove('open');
}
function clearNotifs() {
  NOTIF_STORE.forEach(function(n){ n.read = true; });
  renderNotifList(); updateNotifBadge();
}
function updateNotifBadge() {
  var unread = NOTIF_STORE.filter(function(n){ return !n.read; }).length;
  var badges = document.querySelectorAll('.notif-badge');
  badges.forEach(function(b){ b.style.display = unread ? 'block' : 'none'; });
}
window.toggleNotifPanel = toggleNotifPanel;
window.clearNotifs = clearNotifs;
document.addEventListener('click', function(e) {
  if (!e.target.closest('#searchPanel') && !e.target.closest('[data-btn="search"]')) closeSearch();
  if (!e.target.closest('#notifPanel') && !e.target.closest('[data-btn="notif"]')) closeNotifPanel();
}, true);
setTimeout(updateNotifBadge, 600);

/* ======= RICH SALE TOAST ======= */
var SALE_TOASTS = [{"nft":"CryptoPunks #3100","img":"data:image/png;base64,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","eth":"18.75","profit_eth":"4.25","profit_usd":"8,950"},{"nft":"BAYC #9112","img":"data:image/png;base64,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","eth":"12.40","profit_eth":"2.80","profit_usd":"5,096"},{"nft":"Pudgy Penguin #6523","img":"data:image/png;base64,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","eth":"5.20","profit_eth":"1.10","profit_usd":"2,002"},];

function showSaleToast(data) {
  if (document.body.classList.contains('intro-active')) return;
  var _lo=document.getElementById('learnOverlay'); if (_lo && _lo.style.display==='block') return;
  var container = document.getElementById('toast-container');
  if (!container) return;
  var el = document.createElement('div');
  el.className = 'toast-sale';
  el.style.setProperty('--toast-dur', '1.2s');
  var body = '<div class="ts-header"><div class="ts-header-title">NFT SUCCESSFULLY SOLD</div><button class="ts-close" onclick="dismissSaleToast(this.closest(&#39;.toast-sale&#39;))">&#215;</button></div>';
  body += '<div class="ts-body"><img class="ts-nft-img" src="' + data.img + '" alt="NFT"><div class="ts-content">';
  body += '<div class="ts-desc"><strong>' + data.nft + '</strong> has been sold for ' + data.eth + ' ETH.</div>';
  body += '<div class="ts-profit">Profit: +' + data.profit_eth + ' ETH (~$' + data.profit_usd + ')</div></div></div>';
  body += '<div class="ts-footer"><a class="ts-view-link" href="https://opensea.io" target="_blank">View Sale <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M5 2H2.5A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11h6A1.5 1.5 0 0 0 10 9.5V7M7 1h4m0 0v4m0-4L5.5 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>';
  el.innerHTML = body;
  // Fix close button onclick after setting innerHTML
  var closeBtn = el.querySelector('.ts-close');
  if (closeBtn) closeBtn.onclick = function(){ dismissSaleToast(el); };
  container.appendChild(el);
  var timer = setTimeout(function(){ dismissSaleToast(el); }, 1200);
  el._timer = timer;
}
function dismissSaleToast(el) {
  if (!el || el.classList.contains('toast-out')) return;
  clearTimeout(el._timer);
  el.classList.add('toast-out');
  setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 380);
}
window.dismissSaleToast = dismissSaleToast;

/* Demo NFT sale popups disabled.
function scheduleSaleToast() {
  var delay = 18000 + Math.random() * 12000;
  setTimeout(function() {
    var d = SALE_TOASTS[Math.floor(Math.random() * SALE_TOASTS.length)];
    showSaleToast(d);
    scheduleSaleToast();
  }, delay);
}
setTimeout(function() {
  showSaleToast(SALE_TOASTS[0]);
  scheduleSaleToast();
}, 9000 + Math.random() * 4000);
*/

/* ══ WALLET PANEL ══ */
function toggleWalletPanel() {
  var p = document.getElementById('walletPanel');
  closeSearch();
  closeNotifPanel();
  if (!p) return;
  p.classList.toggle('open');
}
function closeWalletPanel() {
  var p = document.getElementById('walletPanel');
  if (p) p.classList.remove('open');
}
var walletConnected = true;
var WALLET_ADDRESS = '0x71C...4';
try{ document.body.classList.add('wallet-connected'); }catch(e){}

function setWalletState(connected) {
  walletConnected = connected;
  document.body.classList.toggle('wallet-connected', connected);
  var pill = document.getElementById('connPill');
  var dot  = document.getElementById('connDot');
  var lbl  = document.getElementById('connLabel');
  if (!pill) return;
  if (connected) {
    if (dot) { dot.className = 'conn-dot'; }
    if (lbl) lbl.textContent = WALLET_ADDRESS;
    pill.classList.remove('disconnected');
    pill.onclick = toggleWalletPanel;
  } else {
    if (dot) { dot.className = 'conn-dot red'; }
    if (lbl) lbl.textContent = 'CONNECT';
    pill.classList.add('disconnected');
    pill.onclick = reconnectWallet;
  }
  applyRailAuth(connected);
}

// Swap each rail between the signed-in (profile + rewards) view and the
// signed-out sign-up card. Platform Activity is always preserved.
function applyRailAuth(connected){
  // Lock NFT collection + network nav items when disconnected
  // ['collection','network'].forEach(function(pg){
  //   var si=document.querySelector('.si[data-page="'+pg+'"]');
  //   if(!si)return;
  //   si.classList.toggle('locked',!connected);
  //   var lk=si.querySelector('.si-lock');
  //   if(!connected && !lk){
  //     lk=document.createElement('span');lk.className='si-lock';
  //     lk.innerHTML='<svg viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 6V4.3a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.3"/></svg>';
  //     si.appendChild(lk);
  //   } else if(connected && lk){ lk.remove(); }
  // });
  document.querySelectorAll('.rail').forEach(function(rail){
    var ratl = rail.querySelector('.ratl');
    if(!ratl) return;
    var card = rail.querySelector('.signup-card');
    if(connected){
      if(card) card.parentNode.removeChild(card);
      rail.querySelectorAll('[data-auth-hide]').forEach(function(el){el.style.display='';el.removeAttribute('data-auth-hide');});
    } else {
      var sib = rail.firstElementChild;
      while(sib && sib !== ratl){
        if(getComputedStyle(sib).display !== 'none'){ sib.style.display='none'; sib.setAttribute('data-auth-hide',''); }
        sib = sib.nextElementSibling;
      }
      if(!card){
        card = document.createElement('div');
        card.className = 'signup-card';
        card.style.cursor = 'pointer';
        card.setAttribute('onclick','openSignup()');
        card.innerHTML = '<img src="'+(((window.__resources||{}).signupVr)||'signup-vr.png')+'" alt="HNTR.art"><canvas class="signup-fx"></canvas><span class="signup-card-fill">SIGN UP HERE</span>';
        rail.insertBefore(card, ratl);
        if(window.startSignupFx) startSignupFx(card.querySelector('.signup-fx'));
      }
    }
  });
}

function startSignupFx(cv){
  if(!cv || cv.__fx) return; cv.__fx=true;
  var ctx=cv.getContext('2d');
  var W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
  var dots=[], nodes=[], COLORS=['#7fd4ff','#4aa3ff','#b06cff','#ffffff','#66e0ff'];
  function envW(x){ var d=Math.abs(x/(W||1)-0.5)*2; return Math.max(0.12, Math.min(1, d*1.15)); }
  function seed(){
    dots=[]; nodes=[];
    var nd=Math.max(24, Math.round(W*H/2600));
    for(var i=0;i<nd;i++){ var x=Math.random()*W, y=Math.random()*H;
      dots.push({x:x,y:y,r:Math.random()*1.6+0.5,c:COLORS[(Math.random()*COLORS.length)|0],ph:Math.random()*6.283,sp:0.6+Math.random()*1.9,w:envW(x)}); }
    var nn=Math.max(8, Math.round(W*H/9000));
    for(var j=0;j<nn;j++){ var nx=Math.random()*W;
      nodes.push({x:nx,y:Math.random()*H,vx:(Math.random()-0.5)*0.22,vy:(Math.random()-0.5)*0.22,w:envW(nx)}); }
  }
  function resize(){ var r=cv.getBoundingClientRect(); if(!r.width) return;
    W=r.width; H=r.height; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); seed(); }
  var t=0;
  function frame(){
    if(cv.offsetParent===null){ requestAnimationFrame(frame); return; }
    if(!W){ resize(); if(!W){ requestAnimationFrame(frame); return; } }
    t+=0.016; ctx.clearRect(0,0,W,H);
    for(var i=0;i<nodes.length;i++){ var a=nodes[i]; a.x+=a.vx; a.y+=a.vy;
      if(a.x<0||a.x>W)a.vx*=-1; if(a.y<0||a.y>H)a.vy*=-1;
      a.x=Math.max(0,Math.min(W,a.x)); a.y=Math.max(0,Math.min(H,a.y)); a.w=envW(a.x); }
    ctx.lineWidth=0.6;
    for(var i=0;i<nodes.length;i++){ for(var k=i+1;k<nodes.length;k++){ var a=nodes[i], b=nodes[k];
      var dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<74){ var al=(1-dist/74)*0.30*Math.min(a.w,b.w);
        ctx.strokeStyle='rgba(96,176,255,'+al.toFixed(3)+')';
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } } }
    for(var i=0;i<nodes.length;i++){ var a=nodes[i];
      ctx.fillStyle='rgba(150,215,255,'+(0.55*a.w).toFixed(3)+')';
      ctx.beginPath(); ctx.arc(a.x,a.y,1.3,0,6.2832); ctx.fill(); }
    for(var i=0;i<dots.length;i++){ var d=dots[i];
      var tw=0.5+0.5*Math.sin(t*d.sp+d.ph), al=tw*d.w*0.9;
      if(al<0.02) continue;
      ctx.globalAlpha=al; ctx.fillStyle=d.c;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r*(0.7+tw*0.6),0,6.2832); ctx.fill();
      if(tw>0.93){ ctx.globalAlpha=al*0.45; ctx.beginPath(); ctx.arc(d.x,d.y,d.r*3.2,0,6.2832); ctx.fill(); } }
    ctx.globalAlpha=1; requestAnimationFrame(frame);
  }
  if('ResizeObserver' in window){ try{ new ResizeObserver(resize).observe(cv); }catch(e){} }
  else { window.addEventListener('resize', resize); }
  resize(); requestAnimationFrame(frame);
}
window.startSignupFx=startSignupFx;

function disconnectWallet() {
  closeWalletPanel();
  setWalletState(false);
  showToast({title:'Wallet disconnected',sub:'0x71C...492 has been disconnected',link:'RECONNECT'});
}

function reconnectWallet() {
  setWalletState(true);
  showToast({title:'Wallet connected',sub:'0x71C...492 reconnected successfully',link:'VIEW WALLET'});
}
window.reconnectWallet = reconnectWallet;
window.toggleWalletPanel = toggleWalletPanel;
window.closeWalletPanel = closeWalletPanel;
window.disconnectWallet = disconnectWallet;

document.addEventListener('click', function(e) {
  if (!e.target.closest('#walletPanel') && !e.target.closest('.conn-pill')) closeWalletPanel();
}, true);
