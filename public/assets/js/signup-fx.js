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
window.startSignupFx = startSignupFx;
