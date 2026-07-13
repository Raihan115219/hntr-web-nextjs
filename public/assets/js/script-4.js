
    (function(){
      var cv=document.getElementById('memBannerCv');
      if(!cv||cv.__mosaic) return; cv.__mosaic=true;
      var ctx=cv.getContext('2d');
      var DPR=Math.min(window.devicePixelRatio||1,2);
      var W=0,H=0,cells=[],t=0;
      var mouse={x:0,y:0,on:false};
      var COLORS=['#5FD24A','#9AD23E','#CFC93B','#E3B838','#E7A32B'];
      var DARK='#0d0b07';
      var MOTIFS=['circle','ring','quarter','quarter','half','leaf','bars','dot','logo','logo'];
      function rand(a,b){return a+Math.random()*(b-a);}
      function pick(a){return a[(Math.random()*a.length)|0];}
      var logoImg=new Image(); var logoReady=false;
      logoImg.onload=function(){logoReady=true;}; logoImg.src=((window.__resources||{}).logoMark)||'logo-mark-clean.png';
      var logoCache={};
      function logoTinted(color,size){
        size=Math.max(8,Math.round(size));
        var key=color+'_'+size;
        if(logoCache[key]) return logoCache[key];
        var oc=document.createElement('canvas'); oc.width=oc.height=size;
        var o=oc.getContext('2d');
        var iw=logoImg.width,ih=logoImg.height,sc=Math.min(size/iw,size/ih)*0.92;
        var dw=iw*sc,dh=ih*sc;
        o.drawImage(logoImg,(size-dw)/2,(size-dh)/2,dw,dh);
        o.globalCompositeOperation='source-in';
        o.fillStyle=color; o.fillRect(0,0,size,size);
        logoCache[key]=oc; return oc;
      }
      function build(){
        var w=cv.clientWidth,h=cv.clientHeight;
        if(!w||!h) return false;
        if(w===W&&h===H&&cells.length) return true;
        W=w;H=h;
        cv.width=Math.round(w*DPR); cv.height=Math.round(h*DPR);
        ctx.setTransform(DPR,0,0,DPR,0,0);
        var cols=Math.max(6,Math.round(w/46));
        var s=w/cols, rows=Math.ceil(h/s);
        cells=[];
        for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
          var bg=Math.random()<0.5?DARK:pick(COLORS);
          var fg=pick(COLORS); if(fg===bg) fg=DARK;
          cells.push({cx:c*s+s/2, cy:r*s+s/2, s:s,
            motif:pick(MOTIFS), bg:bg, fg:fg,
            baseRot:(Math.random()*4|0)*Math.PI/2,
            seed:Math.random()*6.28, speed:rand(.35,.85), dir:Math.random()<.5?-1:1});
        }
        return true;
      }
      function roam(){ return {x:W*(0.5+0.33*Math.cos(t*0.29)+0.13*Math.sin(t*0.5)),
                               y:H*(0.5+0.36*Math.sin(t*0.24)+0.13*Math.cos(t*0.58))}; }
      function motif(m,s,fg){
        var r;
        if(m==='circle'){ ctx.beginPath(); ctx.arc(0,0,s*0.40,0,6.2832); ctx.fill(); }
        else if(m==='ring'){ ctx.beginPath(); ctx.arc(0,0,s*0.36,0,6.2832); ctx.lineWidth=s*0.14; ctx.strokeStyle=fg; ctx.stroke(); }
        else if(m==='half'){ ctx.beginPath(); ctx.arc(0,s*0.10,s*0.5,Math.PI,0,false); ctx.fill(); }
        else if(m==='quarter'){ ctx.beginPath(); ctx.moveTo(-s/2,-s/2); ctx.arc(-s/2,-s/2,s*0.98,0,Math.PI/2); ctx.closePath(); ctx.fill(); }
        else if(m==='leaf'){
          ctx.beginPath(); ctx.moveTo(-s/2,-s/2); ctx.arc(-s/2,-s/2,s*0.98,0,Math.PI/2); ctx.closePath(); ctx.fill();
          ctx.beginPath(); ctx.moveTo(s/2,s/2); ctx.arc(s/2,s/2,s*0.98,Math.PI,Math.PI*1.5); ctx.closePath(); ctx.fill();
        }
        else if(m==='bars'){ var bw=s*0.16; for(var i=-1;i<=1;i++){ ctx.fillRect(-s*0.42, i*bw*1.9-bw/2, s*0.84, bw); } }
        else if(m==='dot'){ ctx.beginPath(); ctx.arc(0,0,s*0.17,0,6.2832); ctx.fill(); }
        else if(m==='logo'){
          if(logoReady){ var lc=logoTinted(fg,s*0.9); ctx.drawImage(lc,-s*0.45,-s*0.45,s*0.9,s*0.9); }
          else { ctx.beginPath(); ctx.arc(0,0,s*0.34,0,6.2832); ctx.fill(); }
        }
      }
      function frame(){
        requestAnimationFrame(frame);
        if(cv.offsetParent===null) return;
        if(!build()) return;
        t+=0.016;
        var att=roam();
        var strength=0.5, R=155;
        ctx.clearRect(0,0,W,H);
        for(var i=0;i<cells.length;i++){
          var c=cells[i];
          var dx=c.cx-att.x, dy=c.cy-att.y, d=Math.sqrt(dx*dx+dy*dy);
          var infl=d<R?(1-d/R)*strength:0;
          var osc=Math.sin(t*c.speed+c.seed);
          var rot=c.baseRot+osc*0.26+infl*c.dir*1.4;
          var sc=1+0.05*Math.sin(t*c.speed*1.3+c.seed)+infl*0.34;
          ctx.save();
          ctx.beginPath(); ctx.rect(c.cx-c.s/2,c.cy-c.s/2,c.s,c.s); ctx.clip();
          ctx.fillStyle=c.bg; ctx.fillRect(c.cx-c.s/2,c.cy-c.s/2,c.s,c.s);
          ctx.translate(c.cx,c.cy); ctx.rotate(rot); ctx.scale(sc,sc);
          ctx.fillStyle=c.fg;
          motif(c.motif,c.s,c.fg);
          ctx.restore();
        }
      }
      cv.style.pointerEvents='none';
      requestAnimationFrame(frame);
    })();
    