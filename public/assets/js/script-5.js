
  (function(){
    var cv=document.getElementById('netBannerCv');
    if(!cv||cv.__plexus) return; cv.__plexus=true;
    var ctx=cv.getContext('2d');
    var DPR=Math.min(window.devicePixelRatio||1,2);
    var W=0,H=0,P=[],t=0;
    var mouse={x:0,y:0,on:false};
    function rand(a,b){return a+Math.random()*(b-a);}
    function init(){
      var w=cv.clientWidth,h=cv.clientHeight;
      if(!w||!h) return false;
      if(w===W&&h===H&&P.length) return true;
      W=w;H=h;
      cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
      var count=Math.max(46,Math.min(150,Math.round(w*h/6200)));
      P=[];
      for(var i=0;i<count;i++) P.push({x:rand(0,w),y:rand(0,h),vx:rand(-.45,.45),vy:rand(-.4,.4),r:rand(.7,2.1)});
      return true;
    }
    function virtual(){
      return {x:W*(0.5+0.32*Math.cos(t*0.31)+0.12*Math.sin(t*0.53)),
              y:H*(0.5+0.34*Math.sin(t*0.27)+0.12*Math.cos(t*0.61))};
    }
    var Rc=180, D=120;
    function frame(){
      requestAnimationFrame(frame);
      if(cv.offsetParent===null) return;
      if(!init()) return;
      t+=0.016;
      var att=mouse.on?{x:mouse.x,y:mouse.y}:virtual();
      for(var i=0;i<P.length;i++){
        var p=P[i];
        var dx=att.x-p.x,dy=att.y-p.y,d=Math.sqrt(dx*dx+dy*dy)+.001;
        if(d<Rc){var f=(1-d/Rc)*(mouse.on?0.17:0.09);p.vx+=(dx/d)*f;p.vy+=(dy/d)*f;}
        p.vx*=0.985;p.vy*=0.985;
        p.vx+=rand(-.02,.02);p.vy+=rand(-.02,.02);
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0){p.x=0;p.vx*=-1;}else if(p.x>W){p.x=W;p.vx*=-1;}
        if(p.y<0){p.y=0;p.vy*=-1;}else if(p.y>H){p.y=H;p.vy*=-1;}
        var sp=Math.hypot(p.vx,p.vy);if(sp>1.7){p.vx=p.vx/sp*1.7;p.vy=p.vy/sp*1.7;}
      }
      draw(att);
    }
    function draw(att){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<P.length;i++){
        var a=P[i];
        for(var j=i+1;j<P.length;j++){
          var b=P[j];
          var dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
          if(d2>D*D) continue;
          var d=Math.sqrt(d2),al=1-d/D;
          ctx.strokeStyle='rgba(255,'+((28+al*36)|0)+','+((8+al*16)|0)+','+(al*0.5).toFixed(3)+')';
          ctx.lineWidth=0.55+al*0.5;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
      for(var i=0;i<P.length;i++){
        var a=P[i];
        var dx=a.x-att.x,dy=a.y-att.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d>Rc) continue;
        var al=1-d/Rc;
        ctx.strokeStyle='rgba(255,'+((80+al*130)|0)+','+((35+al*70)|0)+','+(al*0.75).toFixed(3)+')';
        ctx.lineWidth=0.5+al*1.0;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(att.x,att.y);ctx.stroke();
      }
      for(var i=0;i<P.length;i++){
        var p=P[i];
        var dd=Math.hypot(p.x-att.x,p.y-att.y);
        var near=dd<Rc?(1-dd/Rc):0;
        ctx.beginPath();
        ctx.fillStyle='rgba(255,'+((40+near*150)|0)+','+((20+near*95)|0)+','+(0.5+near*0.45).toFixed(3)+')';
        ctx.arc(p.x,p.y,p.r+near*1.2,0,6.2832);ctx.fill();
      }
      var g=ctx.createRadialGradient(att.x,att.y,0,att.x,att.y,80);
      g.addColorStop(0,'rgba(255,64,26,0.30)');
      g.addColorStop(1,'rgba(255,40,10,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(att.x,att.y,80,0,6.2832);ctx.fill();
    }
    cv.addEventListener('mousemove',function(e){var r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.on=true;});
    cv.addEventListener('mouseleave',function(){mouse.on=false;});
    requestAnimationFrame(frame);
  })();
  