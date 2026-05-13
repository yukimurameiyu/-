
// ===== Patch JS: likes + modal close & priority =====
(function(){
  // --- Likes ---
  const STORE_KEY = 'rikkai_status_likes_v1';
  let liked = {};
  try { liked = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch(e){ liked = {}; }

  function isHeartChip(el){
    if (!el) return false;
    const text = (el.textContent || '').trim();
    // treat as heart chip if contains a heart
    return text.includes('❤️') || el.classList.contains('status-like');
  }

  function ensureButtonWrap(node){
    // If it's a plain chip like "❤️ 0", make it behave like a button
    if (!node) return;
    if (!node.classList.contains('status-like') && isHeartChip(node)){
      node.classList.add('status-like');
      node.setAttribute('role', 'button');
      node.style.userSelect = 'none';
      // find number
      let num = node.querySelector('.num');
      if (!num){
        // try to split last number
        const m = (node.textContent||'').match(/(\d+)\s*$/);
        if (m){
          const span = document.createElement('span');
          span.className = 'num';
          span.textContent = m[1];
          node.appendChild(span);
          // remove trailing count duplication in text if any is safe - skip
        } else {
          const span = document.createElement('span');
          span.className = 'num';
          span.textContent = '0';
          node.appendChild(span);
        }
      }
      let icon = node.querySelector('.icon');
      if (!icon){
        // try to wrap heart
        const heart = document.createElement('span');
        heart.className = 'icon';
        heart.textContent = '❤️';
        node.insertBefore(heart, node.firstChild);
      }
    }
  }

  function hydrateLikes(){
    document.querySelectorAll('.status-like, .chip').forEach((btn)=>{
      if (!isHeartChip(btn)) return;
      ensureButtonWrap(btn);
      const id = btn.dataset.id || 'friends';
      const num = btn.querySelector('.num');
      const base = Number(btn.dataset.base || (num ? num.textContent : 0) || 0) || 0;
      const pressed = !!liked[id];
      btn.setAttribute('aria-pressed', pressed ? 'true':'false');
      btn.classList.toggle('is-liked', pressed);
      if (num) num.textContent = pressed ? base + 1 : base;
    });
  }

  hydrateLikes();
  const ob = new MutationObserver(hydrateLikes);
  ob.observe(document.documentElement, {subtree:true, childList:true});

  document.addEventListener('click', function(e){
    const btn = e.target.closest('.status-like, .chip');
    if (!btn || !isHeartChip(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    ensureButtonWrap(btn);
    const id = btn.dataset.id || 'friends';
    const num = btn.querySelector('.num');
    const base = Number(btn.dataset.base || (num ? num.textContent : 0) || 0) || 0;
    const now = !liked[id];
    liked[id] = now ? 1 : 0;
    localStorage.setItem(STORE_KEY, JSON.stringify(liked));
    btn.setAttribute('aria-pressed', now ? 'true':'false');
    btn.classList.toggle('is-liked', now);
    if (num) num.textContent = now ? base + 1 : base;
  }, {capture:true}); // capture to avoid being swallowed

  // --- Modal close (click blank / ESC) & prioritize engine editor ---
  function closeTopModal(){
    const opened = Array.from(document.querySelectorAll('.modal.is-open, .modal.open, .modal[aria-hidden="false"]'));
    if (!opened.length) return;
    const top = opened[opened.length - 1];
    top.classList.remove('is-open','open');
    top.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }
  document.addEventListener('click', function(e){
    const m = e.target.closest('.modal');
    if (m && (e.target === m)){ // click on overlay
      closeTopModal();
    }
    if (e.target.closest('[data-close-modal]')){
      closeTopModal();
    }
  }, true);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeTopModal();
  });

  // If both engine editor and profile editor are open, bring engine on top
  function promoteEngine(){
    const engine = document.getElementById('engineEditor') || document.querySelector('.modal#engineEditor');
    if (engine && (engine.classList.contains('is-open') || engine.classList.contains('open'))){
      engine.style.zIndex = '3000';
    }
  }
  setInterval(promoteEngine, 500);

  // Avoid accidental profile editor open when clicking engine area
  document.addEventListener('click', function(e){
    const engineArea = e.target.closest('[data-section="engine"], .engine, .engine-card, .engine-item');
    if (engineArea){
      // prevent bubbling to generic handlers that might open profile editor
      // but do NOT prevent default so engine handlers still work
      e.stopPropagation();
    }
  }, true);
})();

// --- Discover likebar self-heal ---
(function(){
  const STORE_LIKES = 'status_likes';
  const STORE_MYLIKES = 'status_mylikes';
  function getLikes(){ try{return new Map(Object.entries(JSON.parse(localStorage.getItem(STORE_LIKES)||'{}')).map(([k,v])=>[k,Number(v)]));}catch(e){return new Map();} }
  function getMy(){ try{return new Set(JSON.parse(localStorage.getItem(STORE_MYLIKES)||'[]'));}catch(e){return new Set();} }
  function save(likes,my){ try{localStorage.setItem(STORE_LIKES,JSON.stringify(Object.fromEntries(likes)));localStorage.setItem(STORE_MYLIKES,JSON.stringify(Array.from(my)));}catch(e){} }
  function ensureBars(){
    try{
      const root = document.querySelector('.discover, #discover, [data-page="discover"]') || document.querySelector('[data-tab="discover"]') || null;
      if(!root) return;
      const likes = getLikes(), my = getMy();
      const cards = root.querySelectorAll('.status, .card, .feed-item, .moment, .discover-item');
      let idx=0;
      cards.forEach(card=>{
        if(card.querySelector('.status-likebar')) return;
        // compute id
        let id = card.getAttribute('data-like-id');
        if(!id){ id = 'd'+(++idx)+'-'+(card.querySelector('.title,.name')?.textContent?.trim()||''); card.setAttribute('data-like-id', id); }
        const bar = document.createElement('div');
        const liked = my.has(id);
        const count = Number(likes.get(id)||0);
        bar.className = 'status-likebar';
        bar.innerHTML = '<button class="like '+(liked?'on':'')+'" data-id="'+id+'"><span class="heart">❤</span><span class="count">'+count+'</span></button>';
        // place bar
        const where = card.querySelector('.content,.text,.body,.desc') || card;
        where.appendChild(bar);
      });
    }catch(e){}
  }
  document.addEventListener('click', function(e){
    const btn = e.target.closest('.status-likebar .like');
    if(!btn) return;
    e.preventDefault();
    const id = btn.dataset.id;
    const likes = getLikes(), my = getMy();
    const liked = my.has(id);
    if(liked){ my.delete(id); likes.set(id, Math.max(0,(likes.get(id)||0)-1)); }
    else { my.add(id); likes.set(id, (likes.get(id)||0)+1); }
    save(likes,my);
    document.querySelectorAll('.status-likebar .like[data-id="'+id+'"]').forEach(n=>{
      const num = n.querySelector('.count'); if(num) num.textContent = String(likes.get(id)||0);
      n.classList.toggle('on', my.has(id));
    });
  }, true);
  const mo = new MutationObserver(ensureBars);
  mo.observe(document.documentElement, {subtree:true, childList:true});
  setInterval(ensureBars, 1500);
  ensureBars();
})();
