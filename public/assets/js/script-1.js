
window.__initReveal=function(cv){
  if(!cv||cv.__reveal) return; cv.__reveal=true;
  var gl=cv.getContext('webgl')||cv.getContext('experimental-webgl');
  if(!gl){ cv.style.background="url('"+(((window.__resources||{}).revealTop)||'reveal/original.jpg')+"') center/cover no-repeat"; return; }
  var vsrc='attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}';
  var fsrc=[
  'precision highp float;varying vec2 vUv;',
  'uniform sampler2D uTop,uBottom;uniform vec2 uMouse;uniform float uRadius,uTime,uCA,uImgA;',
  'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}',
  'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.02;a*=0.5;}return v;}',
  'vec2 coverUv(vec2 uv,float imgA,float canA){vec2 s=canA>imgA?vec2(1.0,imgA/canA):vec2(canA/imgA,1.0);return (uv-0.5)*s+0.5;}',
  'void main(){vec2 uv=vUv;vec2 pc=vec2(uv.x*uCA,uv.y);vec2 mc=vec2(uMouse.x*uCA,uMouse.y);',
  'vec2 dir=pc-mc;float dist=length(dir);float ang=atan(dir.y,dir.x);',
  'float wob=(fbm(vec2(cos(ang),sin(ang))*2.2+uTime*0.3)-0.5)*0.10+(fbm(pc*3.0+uTime*0.2)-0.5)*0.05;',
  'float r=uRadius*(1.0+wob);float feather=max(0.02,uRadius*0.4);',
  'float mask=smoothstep(r+feather,r-feather,dist);',
  'float ring=smoothstep(r+feather,r,dist)*smoothstep(r-feather,r,dist);',
  'vec2 g=dir/(dist+1e-4);vec2 gUv=vec2(g.x/uCA,g.y);float disp=ring*0.035;',
  'vec2 liquid=vec2(fbm(pc*5.0+uTime*0.6),fbm(pc*5.0-uTime*0.5))-0.5;',
  'vec2 vo=vec2(0.0,0.08);vec2 bTop=coverUv(uv,uImgA,uCA)+vo;vec2 bBot=coverUv(uv,uImgA,uCA)+vo;',
  'vec3 top=texture2D(uTop,bTop+gUv*disp).rgb;',
  'vec3 bot=texture2D(uBottom,bBot-gUv*disp*0.5+vec2(liquid.x/uCA,liquid.y)*0.01*mask).rgb;',
  'vec3 col=mix(top,bot,mask);',
  'col=mix(col,col*vec3(0.30,0.22,0.20),ring*0.5);',
  'col+=vec3(1.0,0.55,0.25)*ring*0.30;',
  'col+=vec3(0.45,0.65,1.0)*ring*0.14;',
  'gl_FragColor=vec4(col,1.0);}'
  ].join('\n');
  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  var prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,vsrc));
  gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fsrc));
  gl.linkProgram(prog);gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  var aPos=gl.getAttribLocation(prog,'aPos');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
  var uTop=gl.getUniformLocation(prog,'uTop'),uBottom=gl.getUniformLocation(prog,'uBottom'),
      uMouse=gl.getUniformLocation(prog,'uMouse'),uRadius=gl.getUniformLocation(prog,'uRadius'),
      uTime=gl.getUniformLocation(prog,'uTime'),uCA=gl.getUniformLocation(prog,'uCA'),uImgA=gl.getUniformLocation(prog,'uImgA');
  function tex(unit){var t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([20,20,24,255]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;}
  var tTop=tex(0),tBot=tex(1),imgA=2.204;
  function load(src,unit,t){var im=new Image();im.onload=function(){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);imgA=im.width/im.height;};im.src=src;}
  load(((window.__resources||{}).revealTop)||'reveal/original.jpg',0,tTop);load(((window.__resources||{}).revealBot)||'reveal/neon.png',1,tBot);
  gl.uniform1i(uTop,0);gl.uniform1i(uBottom,1);
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var W=0,H=0;
  function resize(){var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return false;if(w!==W||h!==H){W=w;H=h;cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);gl.viewport(0,0,cv.width,cv.height);}return true;}
  var hover=false,tx=0.5,ty=0.5,mx=0.5,my=0.5,rad=0,tR=0,tt=0,lastMove=0;
  cv.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=1.0-(e.clientY-r.top)/r.height;hover=true;lastMove=performance.now();});
  cv.addEventListener('pointerleave',function(){hover=false;});
  cv.addEventListener('pointerdown',function(e){var r=cv.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=1.0-(e.clientY-r.top)/r.height;hover=true;lastMove=performance.now();});
  function frame(){
    requestAnimationFrame(frame);
    if(!cv.offsetWidth && !cv.offsetHeight) return;
    if(!resize()) return;
    tt+=0.016;
    mx+=(tx-mx)*0.14; my+=(ty-my)*0.14;
    if(hover){ var idle=performance.now()-lastMove; tR = (idle<140?0.72:0.52)*(cv.__rscale||1); } else { tR=0.0; }
    rad+=(tR-rad)*(hover?0.12:0.16);
    gl.uniform2f(uMouse,mx,my);
    gl.uniform1f(uRadius,rad);
    gl.uniform1f(uTime,tt);
    gl.uniform1f(uCA,W/H);
    gl.uniform1f(uImgA,imgA);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  requestAnimationFrame(frame);
};
try{window.__initReveal(document.getElementById('homeRevealCv'));}catch(e){}
