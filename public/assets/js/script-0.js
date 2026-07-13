
  (function(){
    if (!document.getElementById('introOverlay')) return;
    try{ document.body.classList.add('intro-active'); }catch(e){}
    function run(){
      var titleEl=document.querySelector('#introOverlay .intro-title');
      var subEl=document.querySelector('#introOverlay .intro-sub');
      var btn=document.querySelector('#introOverlay .intro-btn');
      if(!titleEl||!subEl){ return; }
      if(titleEl.__tw) return; titleEl.__tw=true;

      function build(el, segs){
        el.innerHTML=''; var chars=[];
        segs.forEach(function(seg){
          var container=el;
          if(seg.cls){ var w=document.createElement('span'); w.className=seg.cls; el.appendChild(w); container=w; }
          for(var i=0;i<seg.text.length;i++){
            var ch=seg.text[i];
            if(ch==='\n'){ container.appendChild(document.createElement('br')); continue; }
            var s=document.createElement('span'); s.textContent=ch; s.style.visibility='hidden';
            container.appendChild(s); chars.push(s);
          }
        });
        return chars;
      }
      function caret(){ var c=document.createElement('span'); c.className='tw-caret'; return c; }
      function reveal(chars, car, speed, done){
        var host=chars.length?chars[0].parentNode:null;
        var i=0;
        (function step(){
          if(i>=chars.length){ if(done)done(); return; }
          var s=chars[i]; s.style.visibility='visible';
          s.parentNode.insertBefore(car, s.nextSibling);
          var t=s.textContent, d=speed;
          if(t===' ') d=speed*0.4;
          else if(t===',') d=speed*4;
          else if(t==='.') d=speed*7;
          i++; setTimeout(step, d);
        })();
      }

      var titleChars=build(titleEl, [{text:'STOP WATCHING,\nSTART '},{text:'OWNING.',cls:'tw-orange'}]);
      var subChars=build(subEl, [
        {text:'HNTR is a perpetual, community-powered machine engineered to accumulate premium NFTs, execute profitable trades, and reward the community.\n\n'},
        {text:'Decentralized. Transparent. ', cls:'tagline'},
        {text:'Forever in Motion.', cls:'tagline tw-orange'}
      ]);
      var car=caret(); titleEl.appendChild(car);

      reveal(titleChars, car, 46, function(){
        subEl.appendChild(car);
        setTimeout(function(){
          reveal(subChars, car, 15, function(){
            car.classList.add('tw-done');
            if(btn) btn.classList.add('tw-in');
            setTimeout(function(){ if(car&&car.parentNode) car.parentNode.removeChild(car); }, 3200);
          });
        }, 260);
      });
    }
    if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(function(){ setTimeout(run,120); }); setTimeout(run,900); }
    else setTimeout(run,300);
  })();
