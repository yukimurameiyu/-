
(function(){
  const HINT = "发消息... 支持@、 长按消息删除/撤回";
  function nukeGhostBars(){
    try{
      const nodes = Array.from(document.querySelectorAll('div,section,footer,nav'));
      nodes.forEach(n=>{
        const t = (n.textContent||'').trim();
        if(t===HINT && !n.querySelector('input,textarea,button')){
          n.remove();
        }
      });
      const bars = Array.from(document.querySelectorAll('.inputbar'));
      if(bars.length>1){
        const keep = bars.find(b=>b.querySelector('input,textarea')) || bars[0];
        bars.forEach(b=>{ if(b!==keep) b.remove(); });
      }
    }catch(e){}
  }
  function ensureDMHeader(){
    try{
      const hdr = document.querySelector('.dm-header,.header,.topbar');
      if(!hdr) return;
      const titles = hdr.querySelectorAll('.title, h1, .name');
      if(titles.length>=2){
        const first = titles[0].textContent.trim();
        for(let i=1;i<titles.length;i++){
          if(titles[i].textContent.trim()===first) titles[i].remove();
        }
      }
    }catch(e){}
  }
  function initProfileEdit(){
    document.addEventListener('click', (e)=>{
      const tg = e.target.closest('[data-action="edit-profile"], .me-card .btn-edit, .me-card button');
      if(!tg) return;
      if((tg.textContent||'').trim().startsWith('编辑')){
        e.preventDefault(); e.stopPropagation();
        openMiniEditor();
      }
    });
    function openMiniEditor(){
      if(document.getElementById('miniProfileEditor')) return;
      const wrap = document.createElement('div');
      wrap.id = 'miniProfileEditor';
      wrap.innerHTML = `
        <div class="patch-mask" part="overlay"></div>
        <div class="patch-sheet" role="dialog" aria-modal="true">
           <div class="patch-sheet-head">
             <span>编辑资料</span>
             <button class="patch-close" aria-label="关闭">×</button>
           </div>
           <div class="patch-sheet-body">
             <label>昵称 <input id="patch-nick" maxlength="12" placeholder="输入昵称"/></label>
             <label>状态 <input id="patch-status" maxlength="24" placeholder="输入状态"/></label>
             <div class="patch-actions">
               <button class="patch-save">保存</button>
               <button class="patch-cancel">取消</button>
             </div>
           </div>
        </div>`;
      document.body.appendChild(wrap);
      const close = ()=> wrap.remove();
      wrap.querySelector('.patch-close').onclick = close;
      wrap.querySelector('.patch-cancel').onclick = close;
      wrap.querySelector('.patch-mask').onclick = close;
      wrap.querySelector('.patch-save').onclick = ()=>{
         const nick = wrap.querySelector('#patch-nick').value.trim();
         const st = wrap.querySelector('#patch-status').value.trim();
         const nameNode = document.querySelector('.me-card .name, .profile-name');
         const statusNode = document.querySelector('.me-card .status, .profile-status');
         if(nick && nameNode) nameNode.textContent = nick;
         if(st && statusNode) statusNode.textContent = st;
         close();
      };
    }
  }
  function initEngineSheetCloser(){
    document.addEventListener('click', (e)=>{
      const closeBtn = e.target.closest('[data-action="close-engine"], .engine-sheet .close, .engine-drawer .close, [data-close="engine"]');
      if(closeBtn){
        e.preventDefault(); e.stopPropagation();
        const sheet = document.querySelector('.engine-sheet, .engine-drawer, #engineSheet, #engineManager');
        if(sheet) sheet.style.display = 'none';
      }
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Escape'){
        const sheet = document.querySelector('.engine-sheet, .engine-drawer, #engineSheet, #engineManager');
        if(sheet) sheet.style.display = 'none';
        const mini = document.getElementById('miniProfileEditor'); if(mini) mini.remove();
      }
    });
  }
  const obs = new MutationObserver(()=>{ nukeGhostBars(); ensureDMHeader(); });
  obs.observe(document.documentElement, {childList:true, subtree:true});
  window.addEventListener('load', ()=>{ nukeGhostBars(); ensureDMHeader(); initProfileEdit(); initEngineSheetCloser();
        initStatusLikes(); });
})();
