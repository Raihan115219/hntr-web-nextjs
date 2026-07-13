
(function(){
  var EYE='<svg width=\'15\' height=\'15\' viewBox=\'0 0 20 20\' fill=\'none\'><path d=\'M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6z\' stroke=\'currentColor\' stroke-width=\'1.4\'/><circle cx=\'10\' cy=\'10\' r=\'2.5\' stroke=\'currentColor\' stroke-width=\'1.4\'/></svg>';
  var EYEOFF='<svg width=\'15\' height=\'15\' viewBox=\'0 0 20 20\' fill=\'none\'><path d=\'M2 10S5 4.5 10 4.5c1.3 0 2.5.3 3.6.9M18 10s-3 5.5-8 5.5c-1.3 0-2.5-.3-3.6-.9\' stroke=\'currentColor\' stroke-width=\'1.4\' stroke-linecap=\'round\'/><path d=\'M8.2 8.2a2.5 2.5 0 0 0 3.6 3.6\' stroke=\'currentColor\' stroke-width=\'1.4\'/><path d=\'M3.5 3.5l13 13\' stroke=\'currentColor\' stroke-width=\'1.4\' stroke-linecap=\'round\'/></svg>';
  function maskEl(el,hide){ if(hide){ if(el.dataset.real===undefined) el.dataset.real=el.textContent; el.textContent='\u2022\u2022\u2022\u2022\u2022\u2022'; } else if(el.dataset.real!==undefined){ el.textContent=el.dataset.real; delete el.dataset.real; } }
  function applyMask(hide){
    document.querySelectorAll('.rail').forEach(function(rail){
      rail.querySelectorAll('.rsb').forEach(function(rsb){ var l=(rsb.querySelector('.rsbl')||{}).textContent||''; if(/Total Rewarded|HNTR Points/i.test(l)){ var v=rsb.querySelector('.rsbv'); if(v)maskEl(v,hide);} });
      rail.querySelectorAll('.rrc').forEach(function(rrc){ var t=(rrc.querySelector('.rrctype')||{}).textContent||''; if(/Referral Commission|Pool Rewards/i.test(t)){ var v=rrc.querySelector('.rrcv'); if(v)maskEl(v,hide);} });
    });
  }
  function refreshBtns(hide){ document.querySelectorAll('.privacy-eye').forEach(function(b){ b.classList.toggle('off',hide); b.title=hide?'Show balances':'Hide balances'; b.innerHTML=hide?EYEOFF:EYE; }); }
  window.togglePrivacy=function(){ var hide=!document.body.classList.contains('balances-hidden'); document.body.classList.toggle('balances-hidden',hide); applyMask(hide); refreshBtns(hide); try{localStorage.setItem('hntrBalHidden',hide?'1':'0');}catch(e){} };
  var init=false; try{init=localStorage.getItem('hntrBalHidden')==='1';}catch(e){}
  if(init){ document.body.classList.add('balances-hidden'); applyMask(true); refreshBtns(true); }
})();
