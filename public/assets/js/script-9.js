
/* ══ HNTR AI — chat launcher + comms hub ══ */
(function(){
  var TOPICS=[
    {t:'NFT Strategies',q:'How do NFT investment strategies work on HNTR?',
     a:"HNTR strategies pool community capital to co-invest in blue-chip NFTs. You pick a pool, deposit ETH, and share the upside when the asset sells — all tracked live on your dashboard."},
    {t:'Deposits & Pools',q:'How do I deposit into a pool?',
     a:"Pool deposits are <b>coming soon</b>. Once live, you will open any pool from <b>NFT Strategies</b>, enter your ETH amount, and liquidity will stay locked until the pool hits its target or times out (usually 7 days)."},
    {t:'My Portfolio',q:'How is my portfolio doing?',
     a:"Your positions, APR and realized profit live on the <b>Home</b> and <b>My NFTs</b> pages. Want me to summarize your current holdings?"},
    {t:'Membership & Tiers',q:'What do membership tiers unlock?',
     a:"Tiers from <b>Gold</b> to <b>Hunter</b> raise your pool deposit caps, unlock deeper unilevel rewards and lower your fees. Compare them on the Membership page."},
    {t:'Network & Referrals',q:'How do referral rewards work?',
     a:"Share your referral link to earn unilevel commissions across your network. The <b>Network</b> page shows your tree, ranks and claimable rewards."},
    {t:'Support',q:'I need help with my account.',
     a:"I've got you. Tell me what's going on — deposits, wallet connection or memberships — and I'll walk you through it or route you to a human."}
  ];
  var started=false, unread=0, busy=false;
  var chat=document.getElementById('aiChat');
  var fab=document.getElementById('ai-fab');
  var badge=document.getElementById('ai-fab-badge');
  var body=document.getElementById('aiBody');
  var input=document.getElementById('aiInput');
  if(!chat||!fab)return;
  function botAv(){return '<div class="ai-av"><img src="'+(((window.__resources||{}).aiBot)||'hntr-ai-bot.png')+'" alt=""></div>';}
  function scroll(){body.scrollTop=body.scrollHeight;}
  function isOpen(){return chat.classList.contains('open');}
  function pulse(){fab.classList.remove('pulse');void fab.offsetWidth;fab.classList.add('pulse');}
  function bumpBadge(){unread++;badge.textContent=unread;badge.classList.add('show');pulse();}
  function addMsg(txt,who){
    var m=document.createElement('div');m.className='ai-msg '+who;
    m.innerHTML=(who==='bot'?botAv():'')+'<div class="ai-bubble">'+txt+'</div>';
    body.appendChild(m);scroll();return m;
  }
  function typing(){
    var m=document.createElement('div');m.className='ai-msg bot';
    m.innerHTML=botAv()+'<div class="ai-typing"><span></span><span></span><span></span></div>';
    body.appendChild(m);scroll();return m;
  }
  function botReply(txt,delay){
    busy=true;var t=typing();
    setTimeout(function(){t.remove();addMsg(txt,'bot');busy=false;if(!isOpen())bumpBadge();},delay||(950+Math.random()*550));
  }
  function stripTopics(){body.querySelectorAll('.ai-topics,.ai-topics-lbl').forEach(function(e){e.remove();});}
  function renderIntro(){
    body.innerHTML='';
    addMsg("Hey — I'm <b>HNTR AI</b>, your assistant and the hub for everything happening on your account. Pick a topic or just ask me anything.",'bot');
    var lbl=document.createElement('div');lbl.className='ai-topics-lbl';lbl.textContent='Popular topics';body.appendChild(lbl);
    var wrap=document.createElement('div');wrap.className='ai-topics';
    TOPICS.forEach(function(tp,i){
      var b=document.createElement('div');b.className='ai-topic';b.textContent=tp.t;
      b.onclick=function(){pickTopic(i);};wrap.appendChild(b);
    });
    body.appendChild(wrap);scroll();
  }
  function pickTopic(i){started=true;stripTopics();addMsg(TOPICS[i].q,'user');botReply(TOPICS[i].a);}
  function smartReply(q){
    var s=q.toLowerCase();
    for(var i=0;i<TOPICS.length;i++){
      var key=TOPICS[i].t.toLowerCase().split(/[ &]+/);
      if(key.some(function(k){return k.length>3&&s.indexOf(k)>-1;}))return TOPICS[i].a;
    }
    if(/deposit|pool|invest|stake/.test(s))return TOPICS[1].a;
    if(/refer|network|commission|downline|team/.test(s))return TOPICS[4].a;
    if(/member|tier|elite|ranger|upgrade/.test(s))return TOPICS[3].a;
    if(/portfolio|profit|holding|apr|balance/.test(s))return TOPICS[2].a;
    if(/^(hi|hello|hey|gm|yo|sup)\b/.test(s))return "Hey! 👋 I can help with pools, deposits, memberships and your network. What would you like to do?";
    return "Good question. Short version: HNTR lets you co-invest in blue-chip NFTs through community pools, track positions live, and earn network rewards. Want me to point you to the right page?";
  }
  window.toggleAIChat=function(){
    if(isOpen()){chat.classList.remove('open');return;}
    if(body.children.length===0)renderIntro();
    chat.classList.add('open');unread=0;badge.classList.remove('show');
    setTimeout(function(){input&&input.focus();},260);
  };
  window.aiSend=function(){
    var v=(input.value||'').trim();if(!v||busy)return;
    started=true;stripTopics();
    addMsg(v.replace(/[<>]/g,''),'user');input.value='';
    botReply(smartReply(v));
  };
  // Center of communications: every toast is echoed through the bot
  var tc=document.getElementById('toast-container');
  if(tc&&'MutationObserver' in window){
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        Array.prototype.forEach.call(m.addedNodes,function(n){
          if(n.nodeType!==1)return;
          pulse();
          var tEl=n.querySelector&&n.querySelector('.toast-title,.ts-nft,.ts-title');
          var sEl=n.querySelector&&n.querySelector('.toast-sub,.ts-desc');
          var line=((tEl&&tEl.textContent)||'New activity').trim();
          if(sEl&&sEl.textContent)line+=' — '+sEl.textContent.trim();
          if(isOpen()&&started){addMsg('📣 '+line,'bot');}
          else{bumpBadge();}
        });
      });
    }).observe(tc,{childList:true});
  }
})();
