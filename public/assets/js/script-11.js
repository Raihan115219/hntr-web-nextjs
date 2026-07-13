
(function(){
  var ov=document.getElementById('introOverlay');
  var img=document.getElementById('introRevealCv');
  if(!ov||!img) return;
  try{ if(window.__initReveal) window.__initReveal(img); }catch(e){}
  var leftEl=ov.querySelector('.intro-left'), hint=ov.querySelector('.intro-scrollhint');
  var sb=document.querySelector('.sb');
  var feed=document.getElementById('feed-home');
  var rail=document.querySelector('#panel-home>.rail');
  var navR=document.querySelector('.nav-r');
  var F=null,L=null,heroRad=10,ready=false,settled=false,auto=false;
  var target=0,cur=0,raf=null,autoDir=1;

  function ease(t){t=t<0?0:t>1?1:t;return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function seg(p,a,b){return ease((p-a)/(b-a));}

  function measure(){
    var hero=feed?feed.querySelector('.hero'):null;
    if(!hero) return false;
    var pinned=img.style.position==='fixed';
    if(pinned){img.style.position='';img.style.left='';img.style.top='';img.style.width='';img.style.height='';img.style.inset='';img.style.margin='';if(img.parentNode!==ov.querySelector('.intro-imgwrap'))ov.querySelector('.intro-imgwrap').appendChild(img);}
    F=img.getBoundingClientRect();
    var pT=feed.style.transform,pTr=feed.style.transition,pO=feed.style.opacity;
    feed.style.transition='none';feed.style.transform='none';feed.style.opacity='1';
    L=hero.getBoundingClientRect();
    heroRad=parseFloat(getComputedStyle(hero).borderTopLeftRadius)||10;
    img.__rscale = (F&&F.height) ? (L.height/F.height) : 1;
    feed.style.transform=pT;feed.style.transition=pTr;feed.style.opacity=pO;
    img.style.position='fixed';img.style.margin='0';img.style.inset='auto';img.style.zIndex='940';
    if(img.parentNode!==document.body) document.body.appendChild(img);
    ready=true;return true;
  }

  function apply(p){
    if(!ready) return;
    var e=ease(p);
    img.style.left=lerp(F.left,L.left,e)+'px';
    img.style.top=lerp(F.top,L.top,e)+'px';
    img.style.width=lerp(F.width,L.width,e)+'px';
    img.style.height=lerp(F.height,L.height,e)+'px';
    img.style.borderRadius=lerp(14,heroRad,e)+'px';
    img.style.pointerEvents = p<0.85 ? 'auto' : 'none';
    img.style.opacity=String(1-seg(p,0.78,1));
    ov.style.opacity=String(1-seg(p,0.06,0.5));
    ov.style.pointerEvents = p>0.5 ? 'none' : 'auto';
    if(leftEl){var l=seg(p,0,0.42);leftEl.style.opacity=String(1-l);leftEl.style.transform='translateX('+(-26*l)+'px)';}
    if(hint){hint.style.opacity=String(1-seg(p,0,0.22));}
    if(sb){var s=seg(p,0,0.9);sb.style.transform='translateY('+((1-s)*112)+'%)';sb.style.opacity=String(s);}
    if(rail){var r=seg(p,0.12,0.97);rail.style.transform='translateX('+((1-r)*120)+'%)';rail.style.opacity=String(r);}
    if(navR){var nr=seg(p,0.12,0.97);navR.style.opacity=String(nr);navR.style.transform='translateY('+((1-nr)*-8)+'px)';}
    if(feed){var f=seg(p,0.05,0.95);feed.style.transform='translateY('+((1-f)*48)+'px)';feed.style.opacity=String(f);}
  }

  function settleApp(){
    settled=true; auto=false;
    document.body.classList.remove('intro-active');
    [sb,rail,feed,navR].forEach(function(el){if(el){el.style.transform='';el.style.opacity='';}});
    ov.style.pointerEvents='none'; ov.style.opacity='0';
    img.style.opacity='0'; img.style.pointerEvents='none';
  }
  function unsettle(){
    settled=false;
    document.body.classList.add('intro-active');
    ov.style.display='flex';
  }

  function loop(){
    raf=requestAnimationFrame(loop);
    if(auto) target=Math.max(0,Math.min(1,target+autoDir*0.013));
    var next=cur+(target-cur)*0.15;
    if(Math.abs(target-next)<0.0008) next=target;
    if(settled && next>=0.999 && target>=1) return; // idle in app
    cur=next;
    if(cur<0.999 && settled) unsettle();
    apply(cur);
    if(cur>=0.999 && target>=1 && !settled) settleApp();
  }

  function drive(delta){
    auto=false;
    target=Math.max(0,Math.min(1,target+delta));
    // a light scroll launches it; the majority then auto-plays straight into place (both directions)
    if(delta>0 && target>0.16){ auto=true; autoDir=1; }
    else if(delta<0 && target<0.84){ auto=true; autoDir=-1; }
  }
  var armed=false, armTimer=null;
  function disarm(){ armed=false; if(armTimer){clearTimeout(armTimer);armTimer=null;} }
  var lastWheel=0, readyRev=false, stopTimer=null;
  function armAfterStop(){
    if(stopTimer) clearTimeout(stopTimer);
    stopTimer=setTimeout(function(){
      var atTop = !feed || feed.scrollTop<=0;
      var inApp = cur>=0.999 && target>=0.999;
      if(atTop && inApp && onHome()) readyRev=true;   // settled at top of home → next up-scroll returns to intro
    },160);
  }
  function onHome(){ var a=document.querySelector('.page-panel.active'); return a && a.id==='panel-home'; }
  function onWheel(e){
    armAfterStop();
    var atTop = !feed || feed.scrollTop<=0;
    var transitioning = cur<0.999 || target<0.999;
    if(transitioning){ e.preventDefault(); readyRev=false; drive(e.deltaY/1500); return; }
    if(e.deltaY>=0){ readyRev=false; return; }   // scrolling down never reverses
    if(!onHome()){ readyRev=false; return; }      // reverse-to-intro only from the home page
    if(!atTop){ readyRev=false; return; }         // feed can still scroll up; let it
    // in app, at top, scrolling up: only reverse once scrolling has settled (a prior stop), so the
    // momentum tail of the flick that reached the top is ignored — a fresh up-scroll returns to intro
    if(readyRev){ e.preventDefault(); readyRev=false; drive(e.deltaY/1500); }
  }
  var ty=null, gStartTop=false;
  function onTS(e){ ty=e.touches[0].clientY; gStartTop = !feed || feed.scrollTop<=0; }
  function onTM(e){
    if(ty==null){ty=e.touches[0].clientY;return;}
    var dy=ty-e.touches[0].clientY; ty=e.touches[0].clientY;
    var atTop = !feed || feed.scrollTop<=0;
    var transitioning = cur<0.999 || target<0.999;
    if(transitioning){ e.preventDefault(); drive(dy/520); return; }
    if(dy>=0) return;
    if(!onHome()) return;         // reverse-to-intro only from the home page
    if(!atTop) return;
    // return to intro only if this touch gesture STARTED while already at the top
    if(gStartTop){ e.preventDefault(); drive(dy/520); }
  }

  window.enterApp=function(){ auto=true; autoDir=1; };

  function init(){
    if(measure()){
      apply(0);
      window.addEventListener('wheel',onWheel,{passive:false});
      window.addEventListener('touchstart',onTS,{passive:true});
      window.addEventListener('touchmove',onTM,{passive:false});
      window.addEventListener('resize',function(){ measure(); apply(cur); });
      loop();
    } else setTimeout(init,120);
  }
  if(img.complete&&img.naturalWidth) setTimeout(init,80);
  else img.addEventListener('load',function(){setTimeout(init,80);});
  setTimeout(function(){ if(!ready) init(); },1600);
})();
