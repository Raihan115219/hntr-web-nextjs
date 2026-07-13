
function openSupport(){document.getElementById('supportOverlay').classList.add('open');supCount();}
function closeSupport(){document.getElementById('supportOverlay').classList.remove('open');document.getElementById('supSent').classList.remove('show');}
function supCount(){var v=document.getElementById('supMsg').value.trim();var n=v?v.split(/\s+/).length:0;var el=document.getElementById('supLimit');el.textContent=n+' / 360 words';el.style.color=n>360?'var(--red)':'';}
var supStore=[];
function supAddFiles(list){for(var i=0;i<list.length;i++)supStore.push(list[i]);supRender();}
function supRemove(i){supStore.splice(i,1);supRender();}
function supRender(){var c=document.getElementById('supFileList');c.innerHTML='';supStore.forEach(function(f,i){var d=document.createElement('div');d.className='support-file';d.innerHTML='<span>'+f.name+'</span>';var b=document.createElement('button');b.textContent='✕';b.onclick=function(){supRemove(i);};d.appendChild(b);c.appendChild(d);});}
(function(){var d=document.getElementById('supDrop');if(!d)return;['dragover','dragenter'].forEach(function(e){d.addEventListener(e,function(ev){ev.preventDefault();d.classList.add('drag');});});['dragleave','drop'].forEach(function(e){d.addEventListener(e,function(ev){ev.preventDefault();d.classList.remove('drag');});});d.addEventListener('drop',function(ev){if(ev.dataTransfer&&ev.dataTransfer.files)supAddFiles(ev.dataTransfer.files);});})();
function supSend(){document.getElementById('supSent').classList.add('show');setTimeout(closeSupport,1600);}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSupport();});
