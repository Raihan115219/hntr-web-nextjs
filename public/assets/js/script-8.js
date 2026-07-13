
var SU_TIERS=[
  {no:'Tier 01',name:'Scout',price:'50',uni:'3 Levels',dep:'$400 Max Deposit'},
  {no:'Tier 02',name:'Tracker',price:'250',uni:'6 Levels',dep:'$1,500 Max Deposit'},
  {no:'Tier 03',name:'Ranger',price:'750',uni:'9 Levels',dep:'$4,000 Max Deposit',rec:true},
  {no:'Tier 04',name:'Hunter',price:'1,500',uni:'12 Levels',dep:'$8,000 Max Deposit'},
  {no:'Tier 05',name:'Apex',price:'2,500',uni:'12 Levels',dep:'$25,000 Max Deposit',extra:'OTC Desk & NFT Lending'},
];
function initSuTiers(){
  var c=document.getElementById('suTiers');if(!c)return;
  c.innerHTML=SU_TIERS.map(function(t){
    return '<div class="su-tier'+(t.rec?' rec':'')+'">'+(t.rec?'<div class="su-tier-ribbon">Recommended</div>':'')+
      '<div class="su-tier-no">'+t.no+'</div><div class="su-tier-name">'+t.name+'</div>'+
      '<div class="su-tier-price"><span class="cur">$</span><span class="amt">'+t.price+'</span></div>'+
      '<div class="su-tier-feats">'+
        '<div class="su-feat"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 11l3-3 2.5 1.5L11 5l3-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg><div><div class="su-feat-t">Unilevel Unlock</div><div class="su-feat-s">'+t.uni+'</div></div></div>'+
        '<div class="su-feat"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="5" width="11" height="8" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M5 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" stroke-width="1.3"/></svg><div><div class="su-feat-t">Strategy Pools</div><div class="su-feat-s">All Strategy Pools</div></div></div>'+
        '<div class="su-feat"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3l2 1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><div><div class="su-feat-t">Max Deposit</div><div class="su-feat-s">'+t.dep+'</div></div></div>'+
        (t.extra?'<div class="su-feat"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg><div><div class="su-feat-t">'+t.extra+'</div></div></div>':'')+
      '</div>'+
      '<button class="su-tier-btn" onclick="suSelectTier(\''+t.name+'\')">Select</button></div>';
  }).join('');
}
initSuTiers();
function openSignup(){suGoto(1);document.getElementById('signupOverlay').classList.add('open');}
function closeSignup(){document.getElementById('signupOverlay').classList.remove('open');}
function suGoto(n){
  for(var i=1;i<=3;i++){var s=document.getElementById('suStep'+i);if(s)s.classList.toggle('on',i===n);}
  document.getElementById('suModal').classList.toggle('wide',n===3);
  document.getElementById('signupOverlay').scrollTop=0;
}
function suSelectTier(name){
  showMembershipSuccess(name);
}
function showMembershipSuccess(name){
  var T={
    Scout:{amt:'50 USDT',uni:'3 Levels',pool:'All Strategy Pools'},
    Tracker:{amt:'250 USDT',uni:'6 Levels',pool:'All Strategy Pools'},
    Ranger:{amt:'750 USDT',uni:'9 Levels',pool:'All Strategy Pools'},
    Hunter:{amt:'1,500 USDT',uni:'12 Levels',pool:'All Strategy Pools'},
    Apex:{amt:'2,500 USDT',uni:'12 Levels',pool:'All Strategy Pools'}
  }[name]||{amt:'—',uni:'—',pool:'—'};
  var handle=(document.getElementById('suUsername')&&document.getElementById('suUsername').value.trim())||'';
  handle=(handle||name).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12)||'RANGER';
  document.getElementById('msPkg').textContent=name.toUpperCase();
  document.getElementById('msStatus').textContent=name.toUpperCase()+' STATUS ACTIVATED';
  document.getElementById('msUni').textContent=T.uni;
  document.getElementById('msPool').textContent=T.pool;
  document.getElementById('msAmt').textContent=T.amt;
  document.getElementById('msRef').value='https://hntr.art/join/'+handle;
  document.getElementById('msRefCopy').textContent='COPY';
  closeSignup();
  document.getElementById('msOverlay').classList.add('open');
  fireConfetti();
}
function closeMembership(){
  document.getElementById('msOverlay').classList.remove('open');
  if(typeof reconnectWallet==='function') reconnectWallet();
}
function msCopyRef(btn){
  var inp=document.getElementById('msRef');
  inp.select();
  try{navigator.clipboard.writeText(inp.value);}catch(e){try{document.execCommand('copy');}catch(e2){}}
  btn.textContent='COPIED';setTimeout(function(){btn.textContent='COPY';},1600);
}
// ── confetti ──
function fireConfetti(){
  var cv=document.getElementById('msConfetti');if(!cv)return;
  var ctx=cv.getContext('2d');
  var rect=cv.parentNode.getBoundingClientRect();
  cv.width=rect.width;cv.height=rect.height;
  var cols=['#5E6B55','#A8B5A2','#c8b99a','#2b3224','#3d7a5a','#dbd6cf'];
  var P=[];
  for(var i=0;i<140;i++){
    P.push({x:cv.width/2+(Math.random()-.5)*120,y:cv.height*0.32,
      vx:(Math.random()-.5)*9,vy:Math.random()*-11-4,
      g:0.28+Math.random()*0.12,w:5+Math.random()*6,h:7+Math.random()*7,
      rot:Math.random()*6.28,vr:(Math.random()-.5)*0.4,
      col:cols[(Math.random()*cols.length)|0],life:0});
  }
  var max=150;
  function frame(){
    ctx.clearRect(0,0,cv.width,cv.height);
    var alive=false;
    P.forEach(function(p){
      p.life++;p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.vx*=0.99;p.rot+=p.vr;
      var a=p.life>max?Math.max(0,1-(p.life-max)/30):1;
      if(a>0&&p.y<cv.height+30){alive=true;
        ctx.save();ctx.globalAlpha=a;ctx.translate(p.x,p.y);ctx.rotate(p.rot);
        ctx.fillStyle=p.col;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();}
    });
    if(alive)requestAnimationFrame(frame);else ctx.clearRect(0,0,cv.width,cv.height);
  }
  requestAnimationFrame(frame);
}
window.openSignup=openSignup;window.closeSignup=closeSignup;
window.closeMembership=closeMembership;window.msCopyRef=msCopyRef;
window.initSuTiers=initSuTiers;window.suGoto=suGoto;window.suSelectTier=suSelectTier;
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSignup();});
