/*! Rikkai Production Hotfix v3
   - Remove duplicate chat composers / ghost hint bars
   - Make "Me → 编辑" reliably open an editor
   - Make Engine drawer closable by overlay / ESC
   This script is idempotent and safe to include once on any page.
*/
(function(){
  const log = (...a)=>{/*console.debug('[hotfix]', ...a)*/};

  function isNearBottom(el){
    try{
      const r = el.getBoundingClientRect();
      return (window.innerHeight - r.bottom) < 140;
    }catch(e){return false;}
  }

  function removeGhostHintBars(){
    const hintWords = [/发消息/, /支持@/, /(删除|撤回)/];
    const nodes = Array.from(document.querySelectorAll('div,section,footer,address,article,nav'));
    nodes.forEach(n=>{
      if(!n.isConnected) return;
      const txt = (n.textContent||'').replace(/\s+/g,'').trim();
      if(!txt) return;
      if(hintWords.every(re=> re.test(txt))){
        // if it contains no input/textarea/button and sits near bottom -> ghost
        if(!n.querySelector('input,textarea,button') && isNearBottom(n)){
          n.remove();
          log('removed ghost hint bar');
        }
      }
    });
  }

  function dedupeComposers(){
    const all = Array.from(document.querySelectorAll('.inputbar,[data-role="composer"],.composer, form[role="form"]')).filter(el=>{
      // heuristics: has input OR looks like composer row
      return el.querySelector('input,textarea') || /发消息|发送/.test((el.textContent||''));
    });
    if(all.length > 1){
      // Keep the last one (most likely the working one), remove others
      const keep = all[all.length-1];
      all.slice(0,-1).forEach(el=>{
        if(el !== keep && el.parentElement){ el.parentElement.removeChild(el); }
      });
      log('deduped composers -> keep last');
    }
    // Ensure the kept composer is sticky and above tabbar
    const composer = document.querySelector('.inputbar,[data-role="composer"],.composer');
    if(composer){
      composer.style.position = 'sticky';
      composer.style.bottom = '0';
      composer.style.zIndex = '60';
    }
  }

  function ensureMeEditor(){
    // insert editor modal lazily
    if(!document.getElementById('rikkai-me-editor')){
      const wrap = document.createElement('div');
      wrap.id = 'rikkai-me-editor';
      wrap.innerHTML = `
      <div class="rk-modal" aria-hidden="true">
        <div class="rk-overlay" data-close="1"></div>
        <div class="rk-dialog" role="dialog" aria-modal="true">
          <div class="rk-head">
            <div>编辑资料</div>
            <button class="rk-close" data-close="1" aria-label="关闭">✕</button>
          </div>
          <div class="rk-body">
            <label>昵称 <input id="rk-name" maxlength="12" placeholder="输入昵称"></label>
            <label>状态 <input id="rk-status" maxlength="32" placeholder="输入状态"></label>
            <label>头像链接 <input id="rk-avatar-url" placeholder="https://..."></label>
            <label>或上传头像 <input id="rk-avatar-file" type="file" accept="image/*"></label>
          </div>
          <div class="rk-actions">
            <button class="rk-btn" data-close="1">取消</button>
            <button class="rk-btn rk-primary" id="rk-save">保存</button>
          </div>
        </div>
      </div>`;
      document.body.appendChild(wrap);
      const modal = wrap.querySelector('.rk-modal');
      const close = ()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); };
      wrap.addEventListener('click', e=>{ if(e.target.dataset.close){ close(); }});
      document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
      document.getElementById('rk-save').addEventListener('click', async ()=>{
        const name = document.getElementById('rk-name').value.trim();
        const st = document.getElementById('rk-status').value.trim();
        const url= document.getElementById('rk-avatar-url').value.trim();
        const file= document.getElementById('rk-avatar-file').files[0];
        try{
          if(name){ localStorage.setItem('me.name', name); const n1 = document.querySelector('#me-name,.me-card .name'); if(n1) n1.textContent = name; }
          if(st){ localStorage.setItem('me.status', st); const s1 = document.querySelector('#me-status,.me-card .status'); if(s1) s1.textContent = (s1.id==='me-status'?'状态：':'') + st; }
          if(file){
            const dataUrl = await fileToDataURL(file, 64);
            localStorage.setItem('me.avatar', dataUrl);
            applyAvatarTo('#me-avatar', dataUrl);
          }else if(url){
            localStorage.setItem('me.avatar', url);
            applyAvatarTo('#me-avatar', url);
          }
        }catch(e){}
        close();
      });
      // Prefill from localStorage when opening
      wrap._prefill = ()=>{
        const name = localStorage.getItem('me.name') || '';
        const st = localStorage.getItem('me.status') || '';
        wrap.querySelector('#rk-name').value = name;
        wrap.querySelector('#rk-status').value = st;
        wrap.querySelector('#rk-avatar-url').value = '';
        wrap.querySelector('#rk-avatar-file').value = '';
      };
      window.__rk_me_editor = wrap;
    }

    function open(){
      const wrap = window.__rk_me_editor; if(!wrap) return;
      wrap._prefill && wrap._prefill();
      const modal = wrap.querySelector('.rk-modal');
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    }

    // Bind clicks on any "编辑" or #btn-edit
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('#btn-edit, .btn, button, a');
      if(!btn) return;
      const txt = (btn.textContent||'').trim();
      if(btn.id==='btn-edit' || txt==='编辑'){ e.preventDefault(); open(); }
    }, true);
  }

  function ensureEngineDrawerClosable(){
    // Close on overlay / ESC
    const closers = ()=>{
      document.querySelectorAll('#engine-drawer,.engine-drawer,[data-panel="engine-manager"],.engine-sheet,.drawer.engine,.engine-panel')
        .forEach(d=>{ d.classList.remove('open'); d.style.display='none'; d.setAttribute && d.setAttribute('aria-hidden','true'); });
    };
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closers(); });

    new MutationObserver(()=>{
      document.querySelectorAll('#engine-drawer,.engine-drawer,[data-panel="engine-manager"],.engine-sheet,.drawer.engine,.engine-panel')
        .forEach(d=>{
          if(d.dataset.rk_bound) return;
          d.dataset.rk_bound='1';
          let overlay = d.querySelector('.overlay,.mask,.backdrop');
          if(!overlay){
            overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.25)';
            d.insertBefore(overlay, d.firstChild);
          }
          overlay.addEventListener('click', closers);
          const btn = d.querySelector('.close,[data-close],.btn-close');
          if(btn) btn.addEventListener('click', closers);
        });
    }).observe(document.body,{childList:true,subtree:true});
  }

  function fileToDataURL(file, size){
    return new Promise((resolve,reject)=>{
      const fr = new FileReader();
      fr.onload = ()=>{
        const img = new Image();
        img.onload = ()=>{
          const s = size||64, scale = s/Math.max(img.width,img.height);
          const w=Math.round(img.width*scale), h=Math.round(img.height*scale);
          const c=document.createElement('canvas'); c.width=w; c.height=h;
          const ctx=c.getContext('2d'); ctx.drawImage(img,0,0,w,h);
          resolve(c.toDataURL('image/png',0.85));
        };
        img.onerror = reject;
        img.src = fr.result;
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }
  function applyAvatarTo(sel, src){
    const el = document.querySelector(sel);
    if(!el) return;
    if(el.tagName==='IMG'){ el.src = src; return; }
    el.style.backgroundImage = `url(${src})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
  }

  function boot(){
    removeGhostHintBars();
    dedupeComposers();
    ensureMeEditor();
    ensureEngineDrawerClosable();
  }

  document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('load', boot);
  setInterval(()=>{ removeGhostHintBars(); dedupeComposers(); }, 1200);
})();
