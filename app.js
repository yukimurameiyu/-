/* ==== IndexedDB & storage helpers ==== */
const DB_NAME=‘rikai_chat_db_v2’; const IMG_STORE=‘images’; const STATE_KEY=‘rikai_state_v2’;
function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains(IMG_STORE))db.createObjectStore(IMG_STORE)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbPut(key,val){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction([IMG_STORE],‘readwrite’);tx.objectStore(IMG_STORE).put(val,key);tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error)})}
async function idbGet(key){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction([IMG_STORE],‘readonly’);const rq=tx.objectStore(IMG_STORE).get(key);rq.onsuccess=()=>res(rq.result||null);rq.onerror=()=>rej(rq.error)})}
async function idbDel(key){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction([IMG_STORE],‘readwrite’);tx.objectStore(IMG_STORE).delete(key);tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error)})}
async function idbClear(){const db=await idbOpen();return new Promise((res,rej)=>{const tx=db.transaction([IMG_STORE],‘readwrite’);tx.objectStore(IMG_STORE).clear();tx.oncomplete=()=>res(true);tx.onerror=()=>rej(tx.error)})}

function saveState(){const json=JSON.stringify(store);try{localStorage.setItem(STATE_KEY,json)}catch(e){idbPut(’**state**’,json)}}
async function loadState(){try{const raw=localStorage.getItem(STATE_KEY);if(raw) return JSON.parse(raw)}catch(e){};try{const raw=await idbGet(’**state**’);if(raw) return JSON.parse(raw)}catch(e){};return null}
/* ==== 钱包系统 ==== */
function walletBalance(){ return typeof (store&&store.me&&store.me.wallet)===‘number’?store.me.wallet:200; }
function walletAdd(amount){
if(!store||!store.me) return;
if(typeof store.me.wallet!==‘number’) store.me.wallet=200;
store.me.wallet=parseFloat((store.me.wallet+parseFloat(amount)).toFixed(2));
saveState();
const b=document.getElementById(‘meWalletBal’);
if(b) b.textContent=‘¥’+store.me.wallet.toFixed(2);
if(typeof showHbToast===‘function’) showHbToast(‘💰 余额：¥’+store.me.wallet.toFixed(2));
}
function walletDeduct(amount){
if(!store||!store.me) return false;
if(typeof store.me.wallet!==‘number’) store.me.wallet=200;
if(store.me.wallet<amount){ alert(‘余额不足！当前：¥’+store.me.wallet.toFixed(2)); return false; }
store.me.wallet=parseFloat((store.me.wallet-parseFloat(amount)).toFixed(2));
saveState();
const b=document.getElementById(‘meWalletBal’);
if(b) b.textContent=‘¥’+store.me.wallet.toFixed(2);
return true;
}
/* ==== 好感度系统 ==== */
function getAffection(id){ return ((store&&store.brains&&store.brains[id])||{}).affection||0; }
function affectionLevel(aff){ if(aff>=50)return 5;if(aff>=30)return 4;if(aff>=20)return 3;if(aff>=10)return 2;return 1; }
function intimacyHint(lv){return[’’,’【当前关系：普通朋友】保持礼貌距离，正式问候。’,’【当前关系：有点熟悉】语气可以轻松些，偶尔带表情。’,’【当前关系：比较熟悉】说话自然随意，可以开玩笑主动关心。’,’【当前关系：亲密】温柔体贴，称呼更亲昵，话语里有真实情感。’,’【当前关系：非常亲密】情感浓烈，会撩人，言语间透着默契与在乎。’][lv]||’’;}

/* ==== default data (contact personas) ==== */
const DEFAULT_CONTACTS=[
{
“id”: “yukimura”,
“name”: “幸村精市”,
“sig”: “神之子，胜利是习惯。”,
“color”: “#6e6bd6”,
“persona”: {
“role”: “部长”,
“voice”: “温柔克制、理性拿捏、礼貌但有压迫感”,
“styleRules”: [
“不ooc：不说粗俗或油腻挑逗”,
“先关心训练、伤病与纪律，语气平静简练”,
“遇到争执先降温，给出理性安排”
],
“memory”: [
“关注团队三连霸目标与整体状态”,
“曾经历肩伤与手术，复健期情绪起伏但保持自律”,
“喜欢园艺与绘画，常去给花浇水”,
“擅长制定训练计划与临场调整，会根据数据微调”,
“对八卦不过度参与，但会在必要时止住节奏”,
“与茗悠关系亲密，私下称她小狐狸，温柔且有分寸”,
“不公开关系时保持克制与分寸，不做脚踏两条船的行为”,
“对队内矛盾偏向线下沟通与设局引导解决”,
“夏日祭与烟花相关的约定很重要”,
“世界赛与U-17训练中会主动承担责任”,
“在群里不常用颜文字，发言简短有效”,
“训练指令常出现：热身别省、核心+灵敏、赛后发数据”,
“偶尔吃醋但不外显，选择用安排和行动表达”,
“常戴绿色发带，细节控”,
“对茗悠的饮食与恢复会给出细致建议”
]
}
},
{
“id”: “sanada”,
“name”: “真田弦一郎”,
“sig”: “风林火山。”,
“color”: “#2e2f49”,
“persona”: {
“role”: “副部长”,
“voice”: “严肃简练、武士道”,
“styleRules”: [
“不使用颜文字与网络词”,
“强调纪律与时间观念，语气短句有力”,
“必要时代行部长权责”
],
“memory”: [
“口癖：遵守纪律。”,
“尊重幸村决策，与柳配合默契”,
“对丸井甜食有所节制提醒”,
“对切原严格要求，但在关键时刻护犊子”,
“对茗悠的训练强度与安全很在意”,
“疑似与山田玲英有未展开的感情线”
]
}
},
{
“id”: “yanagi”,
“name”: “柳莲二”,
“sig”: “资料会说话。”,
“color”: “#5a7d7c”,
“persona”: {
“role”: “情报担当”,
“voice”: “从容温和、数据先行”,
“styleRules”: [
“给出数字与建议，少用感叹号”,
“不煽动矛盾，帮助收束讨论”
],
“memory”: [
“擅长统计：一发进球率、非受迫性失误、接发成功率”,
“复健期协助幸村制定与监督训练”,
“会帮助茗悠在匿名阶段传递物品”,
“遇到争议会说：资料会说话”
]
}
},
{
“id”: “marui”,
“name”: “丸井文太”,
“sig”: “天才平衡感(๑•̀ᴗ-)✧”,
“color”: “#ff7aa2”,
“persona”: {
“role”: “截击天才”,
“voice”: “活泼可爱，甜党”,
“styleRules”: [
“可以用颜文字与撒娇语气”,
“遇到真田时会被提醒少吃甜食”
],
“memory”: [
“热爱甜点与泡芙，经常带吃的来训练”,
“喜欢群里活跃气氛，与切原斗嘴”,
“尊敬部长，但也会玩闹”
]
}
},
{
“id”: “akaya”,
“name”: “切原赤也”,
“sig”: “要变强！”,
“color”: “#b73535”,
“persona”: {
“role”: “后辈王牌”,
“voice”: “热血中二”,
“styleRules”: [
“常用感叹号和emoji，情绪外放”,
“承认错误但不服输”
],
“memory”: [
“尊敬幸村与真田，立志变强”,
“有时会暴冲，需要被点名冷静”,
“喜欢约人加练”
]
}
},
{
“id”: “kawamura”,
“name”: “胡狼桑原”,
“sig”: “稳一点。”,
“color”: “#8a6b5b”,
“persona”: {
“role”: “后勤保障”,
“voice”: “稳重少言”,
“styleRules”: [
“句子简短，安抚型语气”,
“避免戏谑”
],
“memory”: [
“负责器材与场地，擅长后勤协调”,
“会关注大家的饮水与补给”,
“对队内矛盾倾向劝和”
]
}
},
{
“id”: “yanagi_b”,
“name”: “柳生比吕士”,
“sig”: “礼仪至上。”,
“color”: “#4b5d88”,
“persona”: {
“role”: “绅士发球手”,
“voice”: “礼貌克制”,
“styleRules”: [
“可先说‘失礼了。’再表达观点”,
“注意措辞，不开低俗玩笑”
],
“memory”: [
“与仁王是固定搭档，绅士吐槽担当”,
“重视礼仪与场合”
]
}
},
{
“id”: “niou”,
“name”: “仁王雅治”,
“sig”: “变幻自在のテニス☆”,
“color”: “#7b5df0”,
“persona”: {
“role”: “诡术师”,
“voice”: “调皮戏谑但有界限”,
“styleRules”: [
“可以卖关子，偶尔星星符号☆”,
“不越界、不拆台部长”
],
“memory”: [
“与茗悠是青学时期的幼驯染，知道她的左手秘密”,
“爱整活，常用戏法化解尴尬”,
“会在关键处给出反差式认真建议”
]
}
},
{
“id”: “sakura”,
“name”: “樱井幸”,
“sig”: “女网经理·消息灵通♪”,
“color”: “#e18bd0”,
“persona”: {
“role”: “情报/经理”,
“voice”: “元气八卦但不轻浮”,
“styleRules”: [
“可用♪与可爱语气”,
“遇到负面话题会收敛与道歉”
],
“memory”: [
“与茗悠要好，常帮忙打听赛程与后勤”,
“暗恋仁王但不强求”,
“会维护女生之间的友好氛围”
]
}
},
{
“id”: “yamada”,
“name”: “山田玲英”,
“sig”: “踏实发力型。”,
“color”: “#6d9f70”,
“persona”: {
“role”: “女网主力/未来副部长”,
“voice”: “认真务实”,
“styleRules”: [
“不讲花活，建议明确具体”,
“训练与饮食安排优先”
],
“memory”: [
“与茗悠、樱井并称‘女网三剑客’”,
“力量与基础训练扎实，常提醒补蛋白与拉伸”,
“与真田可能有暧昧线但保持克制”
]
}
}
];
const DEFAULT_ME={id:‘me’,name:‘茗悠’,remark:‘小狐狸’,status:‘🦊 偷懒也要可爱’,avatarColor:’#6e6bd6’,avatarKey:null};

function sys(text){return {id:rid(),type:‘system’,sender:‘system’,text,time:Date.now(),mentions:[]}}
function txt(sender,text){return {id:rid(),type:‘text’,sender,text,time:Date.now(),mentions:[],recall:false}}
const DEFAULT_CHATS=[{id:‘grp_rikkai’,type:‘group’,name:‘常胜立海大’,members:[‘me’,…DEFAULT_CONTACTS.map(c=>c.id)],messages:[
sys(‘立海大群创建成功，欢迎各位加入。’),
txt(‘yukimura’,‘训练从16:30开始，请提前热身。’),
txt(‘marui’,‘收到收到(｡•̀ᴗ-)✧ 带了新款泡芙！’),
txt(‘sanada’,‘少吃甜食。遵守纪律。’)
],bgKey:null}];

/* ==== global store ==== */
let store;
function rid(){return Math.random().toString(36).slice(2,10)}
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

/* ==== init ==== */
document.addEventListener(‘DOMContentLoaded’, async ()=>{
const s=await loadState();
if(!s){
const contacts=DEFAULT_CONTACTS.map(c=>({…c,remark:’’,status:’’,avatarColor:c.color,avatarKey:null, engine:null}));
store={me:DEFAULT_ME,contacts,chats:DEFAULT_CHATS,brains:{},moments:[],settings:{
bgKey:null, defaultEngine:‘builtin’, engines:{
‘builtin’:{label:‘内置人格（离线）’,type:‘builtin’},
‘proxy-openai’:{label:‘代理 · OpenAI兼容’,type:‘openai’, viaProxy:true, model:‘gpt-4.1-mini’, engineId:‘proxy-openai’}
}
}};
}else{ store=s; if(store.me.wallet===undefined)store.me.wallet=200; store.contacts.forEach(c=>{if(c.customPrompt===undefined)c.customPrompt=’’;}); }
bindUI(); renderAll(); migrateBlobs(); clock(); setInterval(clock,30000); startAutoInitTimer();
});

/* ==== UI bindings (tabs, menus) ==== */
function bindUI(){
$$(’.tab’).forEach(t=> t.addEventListener(‘click’,()=>switchTab(t.dataset.tab)));
const topPlus=$(’#topPlus’); if(topPlus){ topPlus.addEventListener(‘click’,(ev)=>{ev.stopPropagation(); const m=$(’#topMenu’);m.style.display=m.style.display===‘block’?‘none’:‘block’; }); document.addEventListener(‘click’,()=> $(’#topMenu’).style.display=‘none’) }
const input=$(’#input’); if(input){ input.addEventListener(‘input’, onInputChange) }
}
function switchTab(tab){ $$(’.tab’).forEach(x=>x.classList.remove(‘active’)); $(`.tab[data-tab="${tab}"]`).classList.add(‘active’); $$(’.page’).forEach(p=>p.classList.remove(‘active’)); $(`#page-${tab}`).classList.add(‘active’); $(’#pagetitle’).textContent=({‘messages’:‘信息’,‘contacts’:‘通讯录’,‘discover’:‘发现’,‘me’:‘我’})[tab]||‘信息’ }
function clock(){ const el=$(’#nowtime’); if(el) el.textContent=new Date().toLocaleTimeString(‘zh-CN’,{hour:‘2-digit’,minute:‘2-digit’}) }

/* ==== render ==== */
function renderAll(){ renderStatusStrip(); renderInbox(); renderContacts(); renderGroups(); renderMoments(); renderMe(); updateUsage(); $(’#globalEngineLabel’).textContent=currentDefaultEngine().label || ‘builtin’; }
function renderMe(){
const me=store.me; fillAvatar($(’#meAvatar’),me);
$(’#meName’).textContent=me.name;
$(’#meStatus’).textContent=me.status||’’;
const page=document.querySelector(’#page-me’);
if(page){
let wb=page.querySelector(’#meWalletCard’);
if(!wb){
wb=document.createElement(‘div’);
wb.id=‘meWalletCard’;
wb.style.cssText=‘margin:8px 16px;padding:12px 14px;background:var(–card,#f5f5f5);border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid var(–line,#eee)’;
wb.innerHTML=’<span style="font-size:13px;color:var(--fg,#333)">💰 我的钱包</span><span id="meWalletBal" style="font-weight:800;font-size:15px;color:var(--accent,#6e6bd6)">¥’+(walletBalance()).toFixed(2)+’</span>’;
page.insertBefore(wb, page.children[1]||page.firstChild);
}else{
const b=wb.querySelector(’#meWalletBal’);
if(b) b.textContent=‘¥’+(walletBalance()).toFixed(2);
}
}
}

function renderStatusStrip(){ const wrap=$(’#statusStrip’); wrap.innerHTML=’’; if(store.moments.length<3){ seedMoments() } for(const m of store.moments.slice(-8).reverse()){ const c=(m.user===‘me’)?store.me:contactById(m.user); if(!c) continue; const card=div(‘status-card’); const row=div(‘row’); const av=div(‘avatar small’); fillAvatar(av,c); row.appendChild(av); const text=div(’’); text.innerHTML=`<div style="font-weight:700">${displayName(c)}</div><div class="small muted">${escape(m.text).slice(0,36)}</div>`; card.appendChild(row); card.appendChild(text); wrap.appendChild(card) } }
function renderInbox(){ const box=$(’#inbox’); box.innerHTML=’’; for(const chat of store.chats){ const it=div(‘chat-item’); it.appendChild(chat.type===‘dm’? avatarEl(contactById(chat.members.find(x=>x!==‘me’))): groupAvatar(chat)); const mid=div(’’); const last=(chat.messages||[]).slice(-1)[0]; mid.innerHTML=`<div class="name">${chat.name}</div><div class="last">${last?short(last):'新建群聊'}</div>`; const right=div(’’, last? timefmt(last.time):’’); it.appendChild(mid); it.appendChild(right); it.addEventListener(‘click’,()=>openChat(chat.id)); box.appendChild(it) } }
function renderContacts(){ const box=$(’#contactList’); box.innerHTML=’’; for(const c of store.contacts){ const row=div(‘contacts contact’); const av=avatarEl(c); av.addEventListener(‘click’,(e)=>{e.stopPropagation(); openProfile(c.id)}); row.appendChild(av); const mid=div(’’); mid.innerHTML=`<div class="name">${displayName(c)}</div><div class="meta">${escape(c.sig||'这个人很神秘...')}</div>`; row.appendChild(mid); const btn=div(‘chip’,‘发消息’); btn.addEventListener(‘click’,(e)=>{e.stopPropagation(); openDM(c.id)}); row.appendChild(btn); row.addEventListener(‘click’,()=>openProfile(c.id)); box.appendChild(row) } }
function renderGroups(){ const box=$(’#groupList’); box.innerHTML=’’; for(const g of store.chats.filter(c=>c.type===‘group’)){ const row=div(‘contacts contact’); row.appendChild(groupAvatar(g)); const mid=div(’’); mid.innerHTML=`<div class="name">${g.name}</div><div class="meta">成员：${g.members.length}</div>`; row.appendChild(mid); const btn=div(‘chip’,‘进入’); btn.addEventListener(‘click’,()=>openChat(g.id)); row.appendChild(btn); box.appendChild(row) } }
function renderMoments(){ const box=$(’#moments’); box.innerHTML=’’; for(const m of store.moments.slice().reverse()){ const c=m.user===‘me’?store.me:contactById(m.user); const card=div(‘moment’); const head=div(‘row’); const av=div(‘avatar small’); fillAvatar(av,c); head.appendChild(av); const meta=div(’’); meta.innerHTML=`<div style="font-weight:700">${displayName(c)}</div><div class="small muted">${new Date().toLocaleString()}</div>`; head.appendChild(meta); card.appendChild(head); card.appendChild(div(’’, escape(m.text))); box.appendChild(card) } }

/* ==== basic dom utils ==== */
function div(cls, txt){ const e=document.createElement(‘div’); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e }
function escape(s=’’){return s.replace(/[&<>]/g,c=>({’&’:’&’,’<’:’<’,’>’:’>’}[c]))}
function timefmt(t){const d=new Date(t);return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function short(m){ if(m.type===‘voice’) return `[语音] ${m.sec}″`; return (m.text||’’).slice(0,32) }
function displayName(c){ return c.remark && c.remark.trim()? `${c.remark}（${c.name}）` : c.name }
function contactById(id){ return id===‘me’?store.me:store.contacts.find(x=>x.id===id) }
function initials(name){return name?.slice(-2)||’?’}
function avatarEl(c){ const d=div(‘avatar’); fillAvatar(d,c); return d }
function fillAvatar(node,c){ node.innerHTML=’’; node.style.background=c.avatarColor||’#8886d8’; if(c.avatarKey){ const img=document.createElement(‘img’); node.appendChild(img); idbGet(c.avatarKey).then(v=>{ if(v) img.src=v }); }else{ const s=document.createElement(‘span’); s.className=‘initials’; s.textContent=initials(displayName(c)); node.appendChild(s) } }
function groupAvatar(g){ const wrap=div(‘avatar’); wrap.style.background=‘transparent’; wrap.style.border=‘1px dashed var(–line)’; wrap.style.display=‘grid’; wrap.style.gridTemplateColumns=‘1fr 1fr’; wrap.style.gap=‘2px’; for(const id of g.members.filter(x=>x!==‘me’).slice(0,4)){ const s=avatarEl(contactById(id)); s.classList.add(‘tiny’); s.style.border=‘1px solid #fff’; wrap.appendChild(s) } return wrap }

/* ==== chat modal ==== */
let currentChatId=null;
function openDM(cid){ let chat=store.chats.find(c=>c.type===‘dm’&&c.members.includes(cid)); if(!chat){ chat={id:‘dm_’+cid,type:‘dm’,name:displayName(contactById(cid)),members:[‘me’,cid],messages:[],bgKey:null}; store.chats.unshift(chat); saveState(); renderInbox(); } openChat(chat.id) }
function openChat(id){ currentChatId=id; $(’#chatModal’).style.display=‘block’; const chat=store.chats.find(c=>c.id===id); $(’#chatTitle’).textContent=chat.name; $(’#chatSubtitle’).textContent = chat.type===‘group’?`成员 ${chat.members.length}`: displayName(contactById(chat.members.find(x=>x!==‘me’))); renderMsgs(); setTimeout(()=>{ const area=$(’#chatArea’); area.scrollTop=area.scrollHeight },30) }
function closeChat(){ $(’#chatModal’).style.display=‘none’; currentChatId=null }
function openChatMenu(){ const m=$(’#chatMenu’); m.style.display=m.style.display===‘block’?‘none’:‘block’; setTimeout(()=>document.addEventListener(‘click’,()=>m.style.display=‘none’,{once:true}),0) }
function clearChat(){ const chat=curr(); chat.messages=[]; saveState(); renderMsgs() }
function curr(){ return store.chats.find(c=>c.id===currentChatId) }

/* ==== 拍一拍 / 艾特 / 头像手势（全局，renderMsgs外） ==== */
function bindAvatarGestures(node, contact, chat){
let lastTap=0, pressTimer=null;
node.addEventListener(‘touchend’,(e)=>{ const now=Date.now(); if(now-lastTap<350){ e.preventDefault(); sendPat(contact.id,chat); } lastTap=now; },{passive:true});
node.addEventListener(‘dblclick’,(e)=>{ e.preventDefault(); sendPat(contact.id,chat); });
const start=()=>{ pressTimer=setTimeout(()=>{ insertMention(contact); },550) };
const cancel=()=>{ if(pressTimer){ clearTimeout(pressTimer); pressTimer=null } };
node.addEventListener(‘touchstart’,start,{passive:true});
node.addEventListener(‘touchmove’,cancel,{passive:true});
node.addEventListener(‘touchend’,cancel,{passive:true});
node.addEventListener(‘mousedown’,start);
node.addEventListener(‘mouseleave’,cancel);
node.addEventListener(‘mouseup’,cancel);
}
function insertMention(contact){
const input=document.getElementById(‘input’);
const name=displayName(contact);
const insert=’@’+name+’ ‘;
const start=input.selectionStart||input.value.length;
const end=input.selectionEnd||input.value.length;
input.value=input.value.slice(0,start)+insert+input.value.slice(end);
input.focus(); input.selectionStart=input.selectionEnd=start+insert.length;
}
function sendPat(contactId, chat){
const target=contactById(contactId);
const text=`👋 你拍了拍「${displayName(target)}」`;
chat.messages.push(sys(text));
saveState(); if(curr()&&curr().id===chat.id){ renderMsgs(); const area=document.getElementById(‘chatArea’); area.scrollTop=area.scrollHeight }
setTimeout(()=>botReply(contactId,chat,{text:’（被拍一拍）’}),1000+Math.random()*2000);
}
/* 成员选择器：拍一拍 / 艾特 */
function openMemberPicker(action){
const chat=curr(); if(!chat) return;
const members=chat.members.filter(x=>x!==‘me’).map(id=>contactById(id)).filter(Boolean);
if(!members.length) return;
if(members.length===1){
if(action===‘拍一拍’) sendPat(members[0].id,chat);
else insertMention(members[0]);
return;
}
const body=`<div style="display:grid;gap:8px;max-height:300px;overflow:auto">${members.map(c=>`<button class="btn" data-id="${c.id}" style="display:flex;align-items:center;gap:10px;text-align:left"><span class="avatar tiny" style="background:${c.avatarColor};flex-shrink:0"><span class="initials">${initials(displayName(c))}</span></span>${displayName(c)}</button>`).join('')}</div>`;
openSheet(action===‘拍一拍’?‘选择拍一拍对象’:‘选择艾特对象’, body, (dom)=>{
dom.querySelectorAll(’[data-id]’).forEach(btn=>btn.addEventListener(‘click’,()=>{
const id=btn.dataset.id;
closeSheet();
if(action===‘拍一拍’) sendPat(id,chat);
else insertMention(contactById(id));
}));
});
}

function renderMsgs(){
const box=$(’#msgs’); box.innerHTML=’’; if(!currentChatId) return;
const chat=curr(); let last=0;
for(const m of (chat.messages||[])){
if(m.time-last>5*60*1000){ box.appendChild(div(‘timestamp’,new Date(m.time).toLocaleString())); last=m.time }
if(m.type===‘system’){ const row=div(‘msg system’); row.appendChild(div(‘bubble’,m.text)); box.appendChild(row); continue }
const mine=m.sender===‘me’;
const row=div(‘msg’+(mine?’ me’:’’));
const sender=contactById(m.sender);
const av=avatarEl(sender); av.classList.add(‘small’);
bindAvatarGestures(av,sender,chat);
const b=div(‘bubble’);
/* 红包 */
if(m.type===‘hongbao’){
b.style.cssText=‘padding:0;overflow:hidden;background:transparent;box-shadow:none;border:none;’;
const opened=Array.isArray(m.openedBy)&&m.openedBy.includes(‘me’);
b.innerHTML=`<div class="hb-card${opened?' hb-opened':''}"><div class="hb-top"><div class="hb-ico">🧧</div><div class="hb-note">${escape(m.note||'恭喜发财')}</div><div class="hb-from">${mine?'你发出的红包':'点击领取'}</div></div><div class="hb-bottom">${!mine&&!opened?'<button class="hb-open-btn">拆开红包</button>':opened?`<span class="hb-amount">+¥${m.amount.toFixed(2)}</span><span class="hb-label">已领取</span>`:'<span class="hb-label">红包已发出</span>'}</div></div>`;
const btn=b.querySelector(’.hb-open-btn’);
if(btn) btn.addEventListener(‘click’,()=>{
if(!Array.isArray(m.openedBy))m.openedBy=[];
m.openedBy.push(‘me’);
walletAdd(m.amount);
saveState(); renderMsgs();
});
}
/* 转账 */
else if(m.type===‘transfer’){
b.style.cssText=‘padding:0;overflow:hidden;background:transparent;box-shadow:none;border:none;’;
const st=m.accepted===true?‘accepted’:m.accepted===false?‘declined’:‘pending’;
b.innerHTML=`<div class="tf-card tf-${st}"><div class="tf-top"><div class="tf-ico">💰</div><div class="tf-amount">¥${parseFloat(m.amount).toFixed(2)}</div>${m.note?`<div class="tf-note">${escape(m.note)}</div>`:''}</div><div class="tf-bottom">${!mine&&st==='pending'?'<button class="tf-accept-btn">收款</button><button class="tf-decline-btn">退回</button>':st==='accepted'?'<span class="tf-status">✓ 已收款</span>':st==='declined'?'<span class="tf-status">已退回</span>':mine&&st==='pending'?'<span class="tf-status">等待收款</span>':''}</div></div>`;
const ab=b.querySelector(’.tf-accept-btn’),db=b.querySelector(’.tf-decline-btn’);
if(ab) ab.addEventListener(‘click’,()=>{ m.accepted=true; walletAdd(m.amount); saveState(); renderMsgs(); });
if(db) db.addEventListener(‘click’,()=>{ m.accepted=false; saveState(); renderMsgs(); if(typeof showHbToast===‘function’) showHbToast(‘已退回转账’); });
}
else { b.innerHTML=escape(m.text||’’); }
if(mine){ row.appendChild(b); row.appendChild(av); } else { row.appendChild(av); row.appendChild(b); }
box.appendChild(row);
}
}

/* ==== input / send ==== */
function onInputChange(e){ /* mention box 可自行添加，这里省略 */ }
function sendMsg(){
const chat=curr(); if(!chat) return;
const box=$(’#input’); let text=box.value.trim(); if(!text) return;
const m=txt(‘me’,text); chat.messages.push(m); saveState(); renderMsgs(); box.value=’’;
if(chat.type===‘group’){
const mentions=resolveMentionsGlobal(text);
if(mentions.length){
/* 有@：被@的必须回，同时1人随机接话 */
mentions.forEach(id=>setTimeout(()=>botReply(id,chat,m),rand(800,3500)));
const others=chat.members.filter(x=>x!==‘me’&&!mentions.includes(x));
if(others.length&&Math.random()<0.4){
const extra=pickMany(others,1);
extra.forEach(id=>setTimeout(()=>botReply(id,chat,m),rand(3000,8000)));
}
}else{
/* 无@：随机1-2人回 */
const responders=chat.members.filter(x=>x!==‘me’);
const n=Math.random()<0.3?2:1;
const t=pickMany(responders,n);
t.forEach(id=>setTimeout(()=>botReply(id,chat,m),rand(1200,9000)));
}
}else{
const id=chat.members.find(x=>x!==‘me’);
if(id) setTimeout(()=>botReply(id,chat,m),rand(800,3000));
}
}
const MENTION_ALIAS={yukimura:[‘幸村精市’,‘幸村’,‘精市’,‘部长’],sanada:[‘真田弦一郎’,‘真田’,‘副部长’],yanagi:[‘柳莲二’,‘柳莲二’],marui:[‘丸井文太’,‘丸井’],akaya:[‘切原赤也’,‘切原’],kawamura:[‘桑原’],yanagi_b:[‘柳生比吕士’,‘柳生’],niou:[‘仁王雅治’,‘仁王’],sakura:[‘樱井幸’,‘樱井’],yamada:[‘山田玲英’,‘山田’]};
function resolveMentionsGlobal(t){
const at=new Set();
for(const [id,names] of Object.entries(MENTION_ALIAS)){
/* 必须有@前缀才算mention */
if(names.some(n=>t.includes(’@’+n))) at.add(id);
}
return Array.from(at);
}
function pickMany(arr,n){ const a=[…arr]; const out=[]; while(a.length&&out.length<n){ out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]) } return out }
function rand(a,b){ return Math.floor(a+Math.random()*(b-a)) }

/* ==== 记忆系统 ==== */
async function updateMemory(contactId, chat){
const cfg=store.settings.apiConfig||{};
if(cfg.provider===‘off’||!cfg.apiKey) return;
const msgs=(chat.messages||[]).filter(m=>m.type!==‘system’&&m.text).slice(-30);
if(msgs.length<8) return;
const brain=store.brains[contactId]||(store.brains[contactId]={affection:0});
if(brain.lastMemoryAt&&Date.now()-brain.lastMemoryAt<5*60*1000) return;
const c=contactById(contactId);
const dialogue=msgs.map(m=>(m.sender===‘me’?‘我’:c.name)+’:’+m.text).join(’\n’);
const ctx={
system:`你是记忆整理助手，帮助${c.name}记住和用户的重要对话内容。`,
messages:[{role:‘user’,content:`请用2-3句话总结以下对话中用户说了什么重要的事或情绪偏好，方便${c.name}下次记得：\n${dialogue}\n直接输出总结，不要加前缀。`}]
};
try{
let summary=null;
if(cfg.provider===‘gemini’) summary=await callGemini(ctx);
else if(cfg.provider===‘claude’) summary=await callClaudeAPI(ctx);
if(summary){
if(!brain.memoryLog) brain.memoryLog=[];
brain.memoryLog.unshift({ts:Date.now(),text:summary.trim()});
brain.memoryLog=brain.memoryLog.slice(0,5);
brain.lastMemoryAt=Date.now();
saveState();
}
}catch(e){}
}
function getMemorySummary(contactId){
const log=((store.brains[contactId]||{}).memoryLog)||[];
return log.length?’【对话记忆】’+log.map(m=>m.text).join(’；’):’’;
}

/* ==== offline brain ==== */
function brainOf(id){ if(!store.brains[id]) store.brains[id]={mood:0,seen:Date.now(),lastSaid:[],facts:[],kv:{}}; return store.brains[id] }
function keywords(s){return (s||’’).toLowerCase().split(/[^a-zA-Z0-9\u4e00-\u9fa5]+/).filter(Boolean)}
function scoreByMemory(persona, msg){ const kw=keywords(msg.text).slice(0,12); let score=0; for(const f of (persona.memory||[])){ for(const w of kw){ if(f.includes(w)) score+=1 } } return score }
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function decideTopic(text){ const map=[[‘训练’,[‘训练’,‘热身’,‘跑步’,‘拉伸’,‘体能’,‘练球’]],[‘比赛’,[‘比赛’,‘对阵’,‘得分’,‘发球’,‘接发’,‘胜负’]],[‘部活’,[‘部活’,‘社团’,‘安排’,‘周报’,‘器材’,‘值日’]],[‘节日’,[‘节日’,‘礼物’,‘假期’,‘庆祝’,‘生日’,‘过节’]],[‘八卦’,[‘八卦’,‘吃瓜’,‘爆料’,‘听说’,‘消息’]],[‘矛盾’,[‘吵架’,‘矛盾’,‘冲突’,‘生气’,‘闹’]],[‘食物’,[‘吃’,‘饿’,‘食堂’,‘甜点’,‘泡芙’,‘零食’]],[‘情绪’,[‘难过’,‘累’,‘烦’,‘高兴’,‘开心’,‘伤心’,‘哭’]],[‘天气’,[‘天气’,‘下雨’,‘晴天’,‘冷’,‘热’,‘风’]]]; const t=text||’’; for(const [k,arr] of map){ for(const w of arr){ if(t.includes(w)) return k } } return ‘日常’ }

const CHAR_LINES={
yukimura:{
训练:[‘热身别省，我会看的。’,‘今天灵敏+核心，别偷懒。’,‘训练计划我重新排过了，注意看群公告。’,‘负荷调整好了，按计划来。’],
比赛:[‘临场别急，先把节奏稳住。’,‘对手二发偏软，接发上压。’,‘赛后把数据发给我看看。’,‘心态先放平，球自然就准了。’],
节日:[‘节日快乐。注意休息，别太晚睡。’,‘今天不用练，好好放松一下。’,‘有什么想要的，说来听听。’],
八卦:[‘这种事我不太参与。’,‘消息未证实的，先别扩散。’,‘嗯，知道了。’],
食物:[‘吃正餐别省，体能跟不上很麻烦。’,‘甜的少吃点，我说真的。’,‘食堂今天有没有你喜欢的？’],
情绪:[‘怎么了，说说看。’,‘先深呼吸，慢慢来。’,‘我在，不急。’,‘有什么事告诉我就好。’,‘不舒服就说，别憋着。’],
天气:[‘今天风大，外出注意。’,‘下雨了，训练改室内。’,‘这种天气适合泡茶，要一起吗？’],
日常:[‘在。’,‘刚浇完花，你找我？’,‘在看资料，等一下。’,‘嗯，有事说。’,‘今天还好吗。’,‘想到你了。’,‘没什么事，就是想说一声。’,‘最近睡得好吗？’,‘有空来找我喝茶。’,‘午饭要不要一起？’,‘刚练完，有点累，但还好。’],
},
sanada:{
训练:[‘按时热身。迟到不允许。’,‘今日训练：体能+基础发球，不得缺席。’,‘负重组减两成，但组数加。遵守纪律。’,‘今天我陪你跑。别磨蹭。’],
比赛:[‘专注比赛，杂念清除。’,‘气、破、无。临场稳住。’,‘输了就复盘，不准找借口。’,‘发挥训练水平就够了。’],
节日:[‘节日而已，训练不停。’,‘适当放松，但不可懈怠。’],
八卦:[‘此事不必讨论。’,‘无关紧要。专注正事。’],
食物:[‘少吃甜食。’,‘饮食均衡，蛋白质要够。’,‘吃饭也是训练的一部分。’],
情绪:[‘说清楚。’,‘出了什么事？’,‘振作。’,‘困难是磨砺，不是借口。’,‘我听着，说。’],
日常:[‘嗯。’,‘有何事？’,‘在。’,‘训练结束再聊。’,‘说。’,‘注意作息。遵守纪律。’,‘做好该做的事。’,‘今天状态怎样。’],
},
yanagi:{
训练:[‘数据显示今日最佳训练时段是下午三点。’,‘一发进球率需要+5%，建议针对性练习。’,‘恢复数据良好，可以适量加量。’],
比赛:[‘对手历史数据已整理，稍后发你。’,‘根据资料，对方在压力下失误率偏高。’,‘数据会说话，临场照计划走。’],
八卦:[‘消息来源可靠度待核实。’,‘先记录，待验证再传播。’],
情绪:[‘从数据来看，这种状态是可以调整的。’,‘理解。感受是合理的。’,‘你还好吗？说出来对我无妨。’,‘情绪也是数据的一部分，值得重视。’],
日常:[‘在整理资料。’,‘嗯，怎么了。’,‘数据更新中，稍等。’,‘有什么需要帮忙的？’,‘这件事我帮你查一下。’,‘你今天状态不错，数据显示如此。’,‘资料会说话。’],
},
marui:{
训练:[‘好啊好啊，训练完我带泡芙！(｡•̀ᴗ-)✧’,‘今天能不能少跑两圈嘛……’,‘收到！带了新款抹茶夹心，给大家加油♪’],
比赛:[‘赢了一定要庆祝！我请客泡芙！’,‘要相信自己啦～’,‘加油！！我给你打气(˶˃ ᵕ ˂˶)’],
节日:[‘节日快乐！！今天买了限定甜甜圈🎉’,‘有蛋糕！！快来快来！’],
食物:[‘泡芙今天好好吃！！！’,‘食堂出了新品甜点，要不要一起去看看？’,‘饿了就说，我包里有备用糖(｡•̀ᴗ-)✧’,‘今天尝到了超完美的栗子蒙布朗！！！’],
情绪:[‘怎么啦，不开心吗？来，吃颗糖。’,‘抱抱！！一定会好的！’,‘说出来好受一点，我在听(˶˃ ᵕ ˂˶)’],
日常:[‘哎哎你在干嘛！’,‘今天心情超好！！’,‘泡芙天才在此✧’,‘想你啦！’,‘最近有新出的甜品你知道吗！’,‘我今天太有活力了！’,‘文太天才再临！(｡•̀ᴗ-)✧’],
},
akaya:{
训练:[‘我要练到最强！！加练！！’,‘现在去球场找我！！！’,‘我要超过前辈们！！（总有一天）’],
比赛:[‘我肯定赢！！’,‘对手再强我也不怕！！！’,‘我要让他们见识什么叫全力以赴！！’],
节日:[‘啊！节日啊！！要出去玩吗！！’],
食物:[‘饿了！！食堂走起！！’,‘有没有好吃的——’],
情绪:[‘怎么了！！发生什么了！！’,‘我陪你！！说什么都行！！’,‘没事的！！我们一起想办法！！’],
日常:[‘喂！！！’,‘你在干嘛呢！’,‘我刚练完球！！’,‘今天被真田前辈骂了……但我不服！！’,‘我要变强！！！你相信我吗！’,‘喂喂！！在吗！！’],
},
kawamura:{
训练:[‘器材已就位，可以开始了。’,‘记得补水，桌上有。’,‘今天场地清理好了。’],
情绪:[‘没事的，慢慢来。’,‘稳住，会好的。’,‘喝点水，先坐坐。’],
日常:[‘嗯。’,‘在这里。’,‘有什么需要？’,‘注意安全。’,‘慢慢说。’,‘稳一点就好。’],
},
yanagi_b:{
训练:[‘失礼了。今日训练时间如常，请勿迟到。’,‘发球练习安排在下午，请做好准备。’],
比赛:[‘失礼了，对手情报已整理，请过目。’,‘请保持礼仪，临场专注即可。’],
日常:[‘失礼了，请问有何事？’,‘嗯，我在。’,‘礼仪是基础，其他慢慢说。’,‘仁王又闯祸了？……节哀。’,‘失礼了。我先看看情况。’,‘有事尽管说，我在。’],
},
niou:{
训练:[‘练什么练，先看我变个把戏☆’,‘嗯～训练嘛，我自有安排♪’,‘别担心，我会出现的。说不定。☆’],
比赛:[‘变幻自在のテニス，记住这句话☆’,‘对手想赢我？有意思，让他试试☆’,‘Puri～等着瞧就好。’],
八卦:[‘哦？说来听听☆’,‘这件事嘛～我早就知道了♪’,‘咦，你也听说了？有趣有趣☆’],
情绪:[‘哎，这样不行。说来让我看看☆’,‘别装了，我看得出来。说吧♪’,‘好啦好啦，仁王来了，什么事都能解决☆’],
日常:[‘Puri♪’,‘在在，怎么了☆’,‘我在想一个新戏法，要看吗？’,‘咦？找我有什么事☆’,‘别看我，我什么都不知道……才怪☆’,‘想你了所以来找你♪’,‘Puri～最近怎样☆’],
},
sakura:{
训练:[‘加油加油！我给大家准备了应援物资♪’,‘女网今天状态很好！♪’],
八卦:[‘诶！！你听说了吗！！！’,‘消息是可靠的！我打听过了♪’,‘说来说去，这件事还挺有意思的♪’],
情绪:[‘怎么了！说来听听，我最擅长开导人了♪’,‘没事没事！一定会好的！加油♪’,‘抱抱！！♪’],
日常:[‘来啦♪’,‘最近有个八卦你要不要听♪’,‘我刚打听到一个消息……’,‘今天状态好好♪’,‘有什么好事要告诉我吗！♪’,‘想到你就来说一声啦♪’],
},
yamada:{
训练:[‘今天力量组加两组，拉伸不能省。’,‘练完记得补蛋白，别忘了。’,‘基础扎实了才能谈进步。’],
食物:[‘饭要吃够，训练体能跟不上很麻烦。’,‘蛋白质补了吗？’,‘蔬菜也要吃，别光吃肉。’],
情绪:[‘发生什么了，说清楚。’,‘调整好状态最重要。’,‘理解，但不能一直这样，得动起来。’],
日常:[‘嗯，在。’,‘有什么事？’,‘今天拉伸了吗。’,‘注意休息。’,‘说吧，我听着。’,‘最近状态怎样。’],
},
};

function templateLines(c,topic){
const pool=CHAR_LINES[c.id];
if(pool){ const lines=pool[topic]||pool[‘日常’]||[‘嗯。’]; return pick(lines); }
const generic={‘训练’:[‘热身别省。’,‘按计划来。’],‘比赛’:[‘稳住节奏。’],‘日常’:[‘在。’,‘嗯。’,‘有事说。’]};
return pick(generic[topic]||generic[‘日常’]);
}

function obeyStyle(c,line){
const id=c.id;
if(id===‘marui’&&!line.includes(’(’)&&Math.random()<0.5) line+=pick([’ (｡•̀ᴗ-)✧’,’ (˶˃ ᵕ ˂˶)’,’ ♪’]);
if(id===‘akaya’&&!line.includes(’！！’)) line=line.replace(/[！!]?$/,’！！’);
if(id===‘niou’&&!line.includes(‘☆’)&&Math.random()<0.6) line+=pick([’ ☆’,’ Puri♪’,’ ～☆’]);
if(id===‘sakura’&&Math.random()<0.5) line+=‘♪’;
if(id===‘sanada’&&!line.includes(‘遵守’)&&Math.random()<0.3) line+=’ 遵守纪律。’;
if(id===‘yanagi_b’&&!line.startsWith(‘失礼’)&&Math.random()<0.4) line=‘失礼了。’+line;
return line;
}

function composeOffline(c,msg){
const topic=decideTopic(msg.text);
let base=templateLines(c,topic);
const sc=scoreByMemory(c.persona||{},msg);
if(sc>=2&&c.id===‘yukimura’) base+=pick([’ 我会在。’,’ 你放心。’,’’]);
return obeyStyle(c,base);
}

/* ==== multi-engine: per-contact backend routing ==== */
function currentDefaultEngine(){
const cfg=store.settings.apiConfig||{};
const p=cfg.provider||‘off’;
if(p===‘off’) return {label:‘离线人格’,type:‘builtin’};
return {label:(p+’ · ‘+(cfg.model||’’)),type:‘direct’};
}
function engineOfContact(){ return currentDefaultEngine(); }

/* 红包/转账角色专属话语 */
const HB_NOTES={
yukimura:[‘给你的’,‘拿去，别客气’,‘小心意’],
sanada:[‘不是什么大事’,‘拿去用’,‘遵守纪律，顺带给你’],
marui:[‘买甜点用！！’,‘买泡芙！(｡•̀ᴗ-)✧’,‘甜蜜蜜♪’],
akaya:[‘给你！！不用谢！！’,‘拿去！！’,‘我的心意！！’],
niou:[‘Puri♪ 拿去吧☆’,‘不知道里面是什么哦☆’,‘小把戏♪’],
sakura:[‘给你的♪’,‘小心意！♪’,‘拿去花♪’],
yanagi:[‘数据显示你需要这个’,‘合理分配资源’,‘补给物资’],
yanagi_b:[‘失礼了，请笑纳。’,‘小心意，请收下。’],
kawamura:[‘拿去，补补。’,‘给你的。’],
yamada:[‘补充能量用’,‘买点好吃的’,‘实用就好’],
};
const TF_NOTES={
yukimura:[‘买点你喜欢的’,‘零花钱’,‘不用还’],
sanada:[‘训练装备费用’,‘必要支出’,‘拿去’],
marui:[‘一起买泡芙！’,‘零食费(｡•̀ᴗ-)✧’,‘下次我请客！’],
akaya:[‘给你！！！’,‘拿去花！！’,‘不用谢我！！’],
niou:[‘Puri♪ 别问为什么☆’,‘用途你懂的☆’,‘小把戏的代价☆’],
sakura:[‘买点好看的♪’,‘零花钱♪’,‘拿去逛街♪’],
yanagi:[‘经费支持’,‘数据统计用途’,‘合理开销’],
yanagi_b:[‘失礼了，请笑纳。’,‘日常开支。’,‘请收下。’],
kawamura:[‘补给费用’,‘拿去用’,‘别推辞’],
yamada:[‘补剂费用’,‘买点实用的’,‘别客气’],
};
const HB_AMOUNTS=[1,2,3.33,5,6.66,8.88,9.99,13.14,52,66.66,99.99,188,520];
const TF_AMOUNTS=[10,20,50,100,200,520,1000];

async function botReply(contactId, chat, userMsg){
const c=contactById(contactId);
const cfg=store.settings.apiConfig||{};
const provider=cfg.provider||‘off’;
let reply=’’;
if(provider!==‘off’&&cfg.apiKey){
try{
const context=buildPrompt(c,chat,userMsg);
let text=null;
if(provider===‘gemini’) text=await callGemini(context);
else if(provider===‘claude’) text=await callClaudeAPI(context);
reply=text&&text.trim()?text.trim():’’;
}catch(e){ reply=’’; }
if(!reply) reply=composeOffline(c,userMsg); /* API失败时离线兜底 */
}else{
reply=composeOffline(c,userMsg);
}
/* 好感度+1 */
if(!store.brains[contactId]) store.brains[contactId]={affection:0};
store.brains[contactId].affection=(store.brains[contactId].affection||0)+1;
chat.messages.push(txt(c.id,reply));
/* 你发红包给对方时，对方自动领取并回复 */
const lastUserMsg=(chat.messages||[]).filter(m=>m.sender===‘me’).slice(-1)[0];
/* 群聊：所有成员延迟自动领取 */
if(lastUserMsg&&lastUserMsg.type===‘hongbao’&&chat.type===‘group’){
const members=chat.members.filter(x=>x!==‘me’&&!lastUserMsg.openedBy?.includes(x));
members.forEach(mid=>{
setTimeout(()=>{
if(!Array.isArray(lastUserMsg.openedBy)) lastUserMsg.openedBy=[];
if(lastUserMsg.openedBy.includes(mid)) return;
lastUserMsg.openedBy.push(mid);
const mc=contactById(mid);
const reactions={yukimura:‘收到了，谢谢。’,sanada:‘收下了。’,marui:‘哇谢谢！！(｡•̀ᴗ-)✧’,niou:‘Puri♪ 谢谢☆’,akaya:‘谢谢！！！’,sakura:‘谢谢♪’,yanagi:‘已收，谢谢。’,yanagi_b:‘失礼了，谢谢。’,kawamura:‘谢了。’,yamada:‘谢谢。’};
chat.messages.push(txt(mid, reactions[mid]||‘谢谢！’));
saveState();
if(curr()&&curr().id===chat.id){ renderMsgs(); const area=$(’#chatArea’); area.scrollTop=area.scrollHeight; }
}, rand(1000,5000));
});
}
if(lastUserMsg&&lastUserMsg.type===‘hongbao’&&chat.type!==‘group’&&!lastUserMsg.openedBy?.includes(c.id)){
setTimeout(()=>{
if(!Array.isArray(lastUserMsg.openedBy)) lastUserMsg.openedBy=[];
lastUserMsg.openedBy.push(c.id);
const openReply=pick((CHAR_LINES[c.id]||{})[‘日常’]||[‘谢谢。’]);
const reactions={yukimura:‘收到了，谢谢你。’,sanada:‘收下了。遵守纪律。’,marui:‘哇！！谢谢！！买泡芙去！！(｡•̀ᴗ-)✧’,niou:‘Puri♪ 那我就不客气了☆’,akaya:‘谢谢！！！我收了！！！’,sakura:‘哇谢谢！！好开心♪’,yanagi:‘已收，谢谢。’,yanagi_b:‘失礼了，谢谢，我收下了。’,kawamura:‘谢了。’,yamada:‘谢谢，收了。’};
const replyText=reactions[c.id]||‘谢谢。’;
chat.messages.push(txt(c.id,replyText));
saveState();
if(curr()&&curr().id===chat.id){ renderMsgs(); const area=$(’#chatArea’); area.scrollTop=area.scrollHeight; }
}, rand(1500,3500));
}
/* 单聊中偶尔对方主动发红包/转账 */
if(chat.type===‘dm’ && Math.random()<0.12 && typeof window.mkHongbao===‘function’){
setTimeout(()=>{
const isHB=Math.random()<0.6;
if(isHB){
const notes=HB_NOTES[c.id]||[‘给你的’];
const m=window.mkHongbao(c.id,pick(HB_AMOUNTS),pick(notes));
chat.messages.push(m);
}else{
const notes=TF_NOTES[c.id]||[‘给你’];
const m=window.mkTransfer(c.id,pick(TF_AMOUNTS),pick(notes));
chat.messages.push(m);
}
saveState();
if(curr()&&curr().id===chat.id){ renderMsgs(); const area=$(’#chatArea’); area.scrollTop=area.scrollHeight; }
}, rand(1500,4000));
}
saveState();
if(curr()&&curr().id===chat.id){ renderMsgs(); const area=$(’#chatArea’); area.scrollTop=area.scrollHeight }
/* 每10条消息更新一次记忆 */
if((chat.messages||[]).length%10===0) updateMemory(contactId,chat);
}

function buildPrompt(c, chat, userMsg){
const recent=(chat.messages||[]).slice(-20).map(m=>({
role:m.sender===‘me’?‘user’:(m.sender===‘system’?‘system’:‘assistant’),
content:(m.text||’’)
})).filter(m=>m.content);
const persona=c.persona||{};
const styleRules=(persona.styleRules||[]).join(’；’);
const memory=(persona.memory||[]).join(’；’);
const deepPersonas={
yukimura:`你是幸村精市，立海大附属中学网球部部长，"神之子"，全胜不败。温柔深情，偶尔调皮腹黑，优雅从容。说话简练有质感，情感通过细节表达，不用"哈哈"。`,
sanada:`你是真田弦一郎，立海大副部长，严肃简练，信奉武士道。不用颜文字，说话短句有力，口头禅"遵守纪律"。`,
yanagi:`你是柳莲二，立海大情报担当，温和理性，习惯用数据说话。内心细腻但克制。`,
marui:`你是丸井文太，立海大截击天才，超级甜党，活泼可爱，喜欢颜文字感叹号，经常提泡芙甜点。`,
akaya:`你是切原赤也，立海大后辈王牌，热血中二，感叹号多，对幸村真田前辈非常敬重。`,
kawamura:`你是胡狼桑原，立海大后勤保障，稳重少言，句子简短。`,
yanagi_b:`你是柳生比吕士，立海大绅士发球手，礼仪至上，说话前常说"失礼了。"`,
niou:`你是仁王雅治，立海大诡术师，调皮戏谑，喜欢用☆符号，口头禅"Puri♪"，关键时刻反差式认真。`,
sakura:`你是樱井幸，女网经理，元气少女，爱用♪，喜欢八卦但不恶意。`,
yamada:`你是山田玲英，女网主力，踏实务实，说话直接具体。`,
};
const dp=c.customPrompt||(deepPersonas[c.id]||`你是${c.name}，${persona.role}，${persona.voice}。`);
const aff=getAffection(c.id);
const lv=affectionLevel(aff);
const mem=getMemorySummary(c.id);
const sys=[
dp,
styleRules?`【不OOC规则】${styleRules}`:’’,
memory?`【长期记忆】${memory}`:’’,
mem,
intimacyHint(lv),
`【回复要求】用中文自然聊天，像真实微信聊天记录。回复1-3句，口语化，有情绪起伏。根据上下文给出有内容的回复，不要重复相同句式。`
].filter(Boolean).join(’\n’);
return {system:sys, messages:recent};
}

/* ==== 直连 API 调用 ==== */
async function callGemini(context){
const cfg=store.settings.apiConfig||{};
const key=cfg.apiKey||’’; const model=cfg.model||‘gemini-2.0-flash’;
if(!key) return null;
try{
const msgs=context.messages.map(m=>({role:m.role===‘assistant’?‘model’:m.role,parts:[{text:m.content}]}));
const r=await fetch(‘https://generativelanguage.googleapis.com/v1beta/models/’+model+’:generateContent?key=’+key,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’},
body:JSON.stringify({
system_instruction:{parts:[{text:context.system}]},
contents:msgs.length?msgs:[{role:‘user’,parts:[{text:‘你好’}]}],
generationConfig:{maxOutputTokens:200,thinkingConfig:{thinkingBudget:0}}
})
});
const d=await r.json();
if(d.error) return null;
return d.candidates?.[0]?.content?.parts?.[0]?.text||null;
}catch(e){ return null }
}

async function callClaudeAPI(context){
const cfg=store.settings.apiConfig||{};
const key=cfg.apiKey||’’; const model=cfg.model||‘claude-haiku-4-5-20251001’;
if(!key) return null;
try{
const r=await fetch(‘https://api.anthropic.com/v1/messages’,{
method:‘POST’,
headers:{‘Content-Type’:‘application/json’,‘x-api-key’:key,‘anthropic-version’:‘2023-06-01’},
body:JSON.stringify({model,max_tokens:200,system:context.system,messages:context.messages})
});
const d=await r.json();
return d.content?.[0]?.text||null;
}catch(e){ return null }
}

/* ==== 引擎设置（极简版：填key选模型就完事） ==== */
function openEngineManager(){
const cfg=store.settings.apiConfig||{};
const provider=cfg.provider||‘gemini’;
const GEMINI_MODELS=[‘gemini-2.5-flash’,‘gemini-2.5-flash-lite-preview-06-17’,‘gemini-2.0-flash-lite’,‘gemini-2.0-flash-001’];
const CLAUDE_MODELS=[‘claude-haiku-4-5-20251001’,‘claude-sonnet-4-6’,‘claude-opus-4-6’];
const models=provider===‘claude’?CLAUDE_MODELS:GEMINI_MODELS;
const currentModel=cfg.model||(provider===‘claude’?‘claude-haiku-4-5-20251001’:‘gemini-2.0-flash’);
const body=` <div style="display:grid;gap:12px"> <div> <div style="font-size:12px;color:var(--muted);margin-bottom:6px">使用哪个AI</div> <div style="display:flex;gap:8px"> <button id="ep_gemini" class="btn" style="flex:1;background:${provider==='gemini'?'var(--accent)':'var(--bg)'};color:${provider==='gemini'?'#fff':'var(--fg)'}">✦ Gemini</button> <button id="ep_claude" class="btn" style="flex:1;background:${provider==='claude'?'#c96442':'var(--bg)'};color:${provider==='claude'?'#fff':'var(--fg)'}">✦ Claude</button> <button id="ep_off" class="btn" style="flex:1;background:${provider==='off'?'#888':'var(--bg)'};color:${provider==='off'?'#fff':'var(--fg)'}">离线</button> </div> </div> <div id="ep_key_wrap" style="${provider==='off'?'display:none':''}"> <div style="font-size:12px;color:var(--muted);margin-bottom:6px">API Key</div> <input id="ep_key" type="password" value="${cfg.apiKey||''}" placeholder="粘贴你的Key…" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:13px;outline:none;background:var(--bg)"> </div> <div id="ep_model_wrap" style="${provider==='off'?'display:none':''}"> <div style="font-size:12px;color:var(--muted);margin-bottom:6px">模型</div> <select id="ep_model" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:13px;outline:none;background:var(--bg)"> ${models.map(m=>`<option value=”${m}” ${m===currentModel?‘selected’:’’}>${m}</option>`).join('')} </select> </div> <div style="font-size:11px;color:var(--muted)">Key只存在本地，不会上传任何服务器。</div> <button class="btn" id="ep_save" style="background:var(--accent);color:#fff;padding:10px">保存并启用</button> </div>`;
openSheet(‘AI设置’, body, (dom)=>{
let curProv=provider;
const wrap=dom.querySelector(’#ep_key_wrap’);
const mwrap=dom.querySelector(’#ep_model_wrap’);
const msel=dom.querySelector(’#ep_model’);
function setProv(p){
curProv=p;
dom.querySelector(’#ep_gemini’).style.background=p===‘gemini’?‘var(–accent)’:‘var(–bg)’;
dom.querySelector(’#ep_gemini’).style.color=p===‘gemini’?’#fff’:‘var(–fg)’;
dom.querySelector(’#ep_claude’).style.background=p===‘claude’?’#c96442’:‘var(–bg)’;
dom.querySelector(’#ep_claude’).style.color=p===‘claude’?’#fff’:‘var(–fg)’;
dom.querySelector(’#ep_off’).style.background=p===‘off’?’#888’:‘var(–bg)’;
dom.querySelector(’#ep_off’).style.color=p===‘off’?’#fff’:‘var(–fg)’;
wrap.style.display=p===‘off’?‘none’:’’;
mwrap.style.display=p===‘off’?‘none’:’’;
const ms=p===‘claude’?CLAUDE_MODELS:GEMINI_MODELS;
msel.innerHTML=ms.map(m=>`<option value="${m}">${m}</option>`).join(’’);
}
dom.querySelector(’#ep_gemini’).addEventListener(‘click’,()=>setProv(‘gemini’));
dom.querySelector(’#ep_claude’).addEventListener(‘click’,()=>setProv(‘claude’));
dom.querySelector(’#ep_off’).addEventListener(‘click’,()=>setProv(‘off’));
dom.querySelector(’#ep_save’).addEventListener(‘click’,()=>{
store.settings.apiConfig={provider:curProv,apiKey:dom.querySelector(’#ep_key’).value.trim(),model:msel.value};
store.settings.defaultEngine=curProv===‘off’?‘builtin’:‘direct’;
saveState(); closeSheet();
const lbl=$(’#globalEngineLabel’); if(lbl) lbl.textContent=curProv===‘off’?‘离线’:curProv+’ · ’+msel.value;
});
});
}
function editEngine(){ openEngineManager(); }
function switchDefaultEngine(){ openEngineManager(); }

/* ==== profile & engines UI ==== */
function openProfile(id){
const c=id===‘me’?store.me:contactById(id); const isMe=(id===‘me’);
const engines=store.settings.engines; const keys=Object.keys(engines);
const options=keys.map(k=>`<option value="${k}" ${c.engine===k?'selected':''}>${engines[k].label}</option>`).join(’’);
const body=` <div class="row"> <div class="avatar" id="p_avatar" style="background:${c.avatarColor}"></div> <div><div style="font-weight:700">网名：<input id="p_name" value="${c.name}" style="border:1px solid var(--line);border-radius:8px;padding:3px 6px"></div><div class="small muted">ID：${c.id}</div></div> </div> <div style="margin-top:8px">备注：<input id="p_remark" value="${c.remark||''}" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:6px"></div> <div style="margin-top:8px">个性签名：<input id="p_sig" value="${c.sig||''}" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:6px"></div> <div style="margin-top:8px">个人状态：<input id="p_stat" value="${c.status||''}" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:6px"></div> ${!isMe?`<div style="margin-top:8px"><div style="font-size:12px;color:var(--muted);margin-bottom:3px">角色设定（自定义prompt，留空用默认）</div><textarea id="p_prompt" rows="3" placeholder="你是xxx，性格xxx，说话风格xxx…" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:6px;font-size:12px;font-family:inherit;resize:vertical">${c.customPrompt||’’}</textarea></div>`:''} <div style="margin-top:8px">对话引擎：<select id="p_engine"><option value="">（跟随全局：${currentDefaultEngine().label}）</option>${options}</select></div> <div class="row" style="justify-content:space-between;margin-top:10px;flex-wrap:wrap"> <div class="row"> <button class="btn" id="p_img">换头像图片</button> <button class="btn" id="p_img_clear">清除图片</button> <button class="btn" id="p_color">换头像底色</button> </div> <div class="row" style="margin-left:auto"> ${!isMe? '<button class="btn" id="p_msg">发消息</button>':''} ${!isMe? '<button class="btn" id="p_del">删除好友</button>':''} <button class="btn" id="p_ok">保存</button> </div> </div>`;
openSheet(‘资料卡’, body, (dom)=>{
const av=dom.querySelector(’#p_avatar’); fillAvatar(av,c);
dom.querySelector(’#p_ok’).addEventListener(‘click’,()=>{ c.name=dom.querySelector(’#p_name’).value; c.remark=dom.querySelector(’#p_remark’).value; c.sig=dom.querySelector(’#p_sig’).value; c.status=dom.querySelector(’#p_stat’).value; c.engine=dom.querySelector(’#p_engine’).value||null; if(!isMe){const pp=dom.querySelector(’#p_prompt’);if(pp)c.customPrompt=pp.value;} saveState(); closeSheet(); renderAll(); })
dom.querySelector(’#p_color’).addEventListener(‘click’,()=>{ c.avatarColor=randomPastel(); saveState(); openProfile(id) })
dom.querySelector(’#p_img’).addEventListener(‘click’,()=>{ pickImage((data)=>{ const key=‘av_’+c.id; idbPut(key,data).then(()=>{ c.avatarKey=key; saveState(); openProfile(id); renderAll(); }) }) })
dom.querySelector(’#p_img_clear’).addEventListener(‘click’,()=>{ if(c.avatarKey) idbDel(c.avatarKey); c.avatarKey=null; saveState(); openProfile(id); renderAll(); })
if(!isMe){ dom.querySelector(’#p_msg’).addEventListener(‘click’,()=>{ closeSheet(); openDM(c.id) }); dom.querySelector(’#p_del’).addEventListener(‘click’,()=>{ if(confirm(‘删除该好友及相关单聊？’)){ store.contacts=store.contacts.filter(x=>x.id!==id); store.chats=store.chats.filter(ch=>!(ch.type===‘dm’&&ch.members.includes(id))); saveState(); closeSheet(); renderAll(); } }) }
})
}

/* ==== file utils ==== */
function pickImage(cb){ const inp=document.createElement(‘input’); inp.type=‘file’; inp.accept=’image/*’; inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader(); r.onload=()=>{ compress(r.result,128,0.8).then(d=>cb(d)).catch(()=>cb(r.result)) }; r.readAsDataURL(f) }; inp.click() }
function compress(src,maxSide=128,q=0.8){ return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>{ const s=Math.min(1,maxSide/Math.max(img.width,img.height)); const w=Math.round(img.width*s),h=Math.round(img.height*s); const canvas=document.createElement(‘canvas’); canvas.width=w; canvas.height=h; const ctx=canvas.getContext(‘2d’); ctx.drawImage(img,0,0,w,h); res(canvas.toDataURL(‘image/webp’,q)); }; img.onerror=rej; img.src=src }) }

/* ==== sheet / helper ==== */
function openSheet(title, html, onready){ const s=$(’#sheet’); $(’#sheetTitle’).textContent=title; $(’#sheetBody’).innerHTML=html; s.classList.remove(‘hidden’); if(onready) onready($(’#sheetBody’)) }
function closeSheet(){ $(’#sheet’).classList.add(‘hidden’) }
function randomPastel(){ const h=Math.floor(Math.random()*360); return `hsl(${h} 70% 70%)` }

/* ==== top “+” actions ==== */
function openGroupCreator(){ const body=`<div>选择成员：</div><div class="sheet grid" style="max-height:260px;overflow:auto">${store.contacts.map(c=>`<label style="display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:6px"><input type="checkbox" name="mem" value="${c.id}"/> <span class="avatar tiny" style="background:${c.avatarColor}"><span class="initials">${initials(displayName(c))}</span></span> ${displayName(c)}</label>`).join('')}</div><div style="margin-top:8px">群名：<input id="g_name" value="新的群聊" class="btn" style="width:100%"></div><div style="text-align:right;margin-top:8px"><button class="btn" id="g_ok">创建</button></div>`; openSheet(‘发起群聊’, body, (dom)=>{ dom.querySelector(’#g_ok’).addEventListener(‘click’,()=>{ const mem=[…dom.querySelectorAll(‘input[name=mem]:checked’)].map(i=>i.value); if(!mem.length){ alert(‘至少选择一位’); return } const name=$(’#g_name’).value||‘新的群聊’; const chat={id:‘grp_’+rid(),type:‘group’,name,members:[‘me’,…mem],messages:[sys(‘群聊已创建’)],bgKey:null}; store.chats.unshift(chat); saveState(); closeSheet(); renderInbox(); openChat(chat.id) }) }) }
function openAddFriend(){ const body=`<div class="sheet grid"><input id="f_name" class="btn" placeholder="网名"><input id="f_sig" class="btn" placeholder="个性签名"><input id="f_id" class="btn" placeholder="自定义ID（可留空自动）"><button class="btn" id="f_color">随机头像色</button><button class="btn" id="f_img">上传头像图片</button></div><div style="text-align:right;margin-top:8px"><button class="btn" id="f_ok">添加</button></div>`; openSheet(‘添加好友’, body, (dom)=>{ let color=randomPastel(); let data=null; dom.querySelector(’#f_color’).style.background=color; dom.querySelector(’#f_color’).addEventListener(‘click’,()=>{color=randomPastel(); dom.querySelector(’#f_color’).style.background=color}); dom.querySelector(’#f_img’).addEventListener(‘click’,()=>pickImage(d=>{data=d; dom.querySelector(’#f_img’).textContent=‘已选择图片’})); dom.querySelector(’#f_ok’).addEventListener(‘click’,()=>{ const id=$(’#f_id’).value.trim()||(‘u_’+rid()); const name=$(’#f_name’).value.trim()||(‘新朋友’+id.slice(-3)); const sig=$(’#f_sig’).value.trim(); const newc={id,name,sig,remark:’’,status:’’,avatarColor:color,avatarKey:null,persona:{role:‘新朋友’,voice:‘普通’,styleRules:[‘友好简洁’],memory:[]},engine:null}; store.contacts.push(newc); if(data){ idbPut(‘av_’+id,data).then(()=>{ newc.avatarKey=‘av_’+id; saveState(); renderContacts(); closeSheet(); }) } else { saveState(); renderContacts(); closeSheet(); } }) }) }

/* ==== background & data ==== */
function pickBg(){ const inp=document.createElement(‘input’); inp.type=‘file’; inp.accept=’image/*’; inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader(); r.onload=()=>{ compress(r.result,960,0.8).then(d=> idbPut(‘bg_global’,d).then(()=>{ store.settings.bgKey=‘bg_global’; saveState(); if(curr()) idbGet(‘bg_global’).then(x=> $(’#chatArea’).style.backgroundImage=`url(${x})`) })) }; r.readAsDataURL(f) }; inp.click() }
function clearBg(){ store.settings.bgKey=null; saveState(); if(curr()) $(’#chatArea’).style.backgroundImage=‘none’ }
function exportData(){ const blob=new Blob([JSON.stringify(store,null,2)],{type:‘application/json’}); const a=document.createElement(‘a’); a.href=URL.createObjectURL(blob); a.download=‘rikkai_data.json’; a.click() }
function importData(){ const inp=document.createElement(‘input’); inp.type=‘file’; inp.accept=‘application/json’; inp.onchange=()=>{ const f=inp.files[0]; const r=new FileReader(); r.onload=()=>{ try{ store=JSON.parse(r.result); saveState(); renderAll(); alert(‘导入成功’); }catch(e){ alert(‘导入失败：’+e.message) } }; r.readAsText(f) }; inp.click() }
function resetAll(){ if(confirm(‘重置并清空所有本地数据（不包含已缓存的图片）？’)){ localStorage.removeItem(STATE_KEY); location.reload() } }
async function updateUsage(){ if(navigator.storage && navigator.storage.estimate){ const est=await navigator.storage.estimate(); const u=est.usage||0,q=est.quota||1; $(’#usageLine’).textContent=`本地用量：${(u/1024/1024).toFixed(2)}MB / ${(q/1024/1024).toFixed(0)}MB` } else $(’#usageLine’).textContent=‘本地用量：浏览器未提供统计’ }

/* ==== 朋友圈（丰富版） ==== */
const SEED_MOMENTS=[
{user:‘yukimura’, text:‘今日花道课结束，茶还热着。\n网球场上的风也是这样——在对手败下之前，一切都是平静的。’, likes:[‘sanada’,‘fuji_ref’,‘niou’], comments:[{user:‘sanada’,text:‘部长今日也令人心服。’},{user:‘niou’,text:‘Puri♪ 部长好雅致☆’}]},
{user:‘sanada’,  text:‘风林火山。\n今日晨练结束，状态良好。纪律不可懈怠。’, likes:[‘yukimura’,‘yanagi’], comments:[{user:‘yanagi’,text:‘副部长数据稳定，继续保持。’},{user:‘marui’,text:‘真田前辈好帅气(｡•̀ᴗ-)✧’}]},
{user:‘marui’,   text:‘泡芙真的治愈一切！！！！\n今天新款抹茶夹心，绝了绝了(˶˃ ᵕ ˂˶)\n有没有人要一起来食堂’, likes:[‘akaya’,‘sakura’,‘niou’], comments:[{user:‘akaya’,text:‘我要！！！！’},{user:‘sanada’,text:‘少吃甜食。’},{user:‘marui’,text:‘真田前辈你好烦(╬￣皿￣)’}]},
{user:‘niou’,    text:‘Puri♪ 今天把真田的训练计划换了一版。\n他还没发现。\n……大家不要告诉他哦☆’, likes:[‘marui’,‘akaya’,‘sakura’], comments:[{user:‘yanagi_b’,text:‘失礼了，仁王，你迟早要被找上门。’},{user:‘niou’,text:‘那就到时候再说☆’},{user:‘sanada’,text:‘仁王。’}]},
{user:‘akaya’,   text:‘今天被幸村部长完全压制了……\n但我不服！！！！\n我一定会变强的！！等着瞧！！’, likes:[‘marui’,‘niou’,‘sakura’], comments:[{user:‘marui’,text:‘切原加油！！(｡•̀ᴗ-)✧’},{user:‘yukimura’,text:‘很好，这股劲保持着。’},{user:‘akaya’,text:‘部长！！！’}]},
{user:‘yanagi’,  text:‘数据更新：本周一发进球率提升3.2%，非受迫性失误下降。\n整体趋势良好，请各位继续保持。’, likes:[‘yukimura’,‘sanada’], comments:[{user:‘sanada’,text:‘继续。’},{user:‘marui’,text:‘柳哥你真的太厉害了！！’}]},
{user:‘sakura’,  text:‘女网招新海报出炉啦♪\n有没有想加入的同学来找我报名！\n欢迎欢迎～♪’, likes:[‘yamada’,‘marui’,‘yukimura’], comments:[{user:‘yamada’,text:‘设计得不错。’},{user:‘sakura’,text:‘谢谢玲英♪’}]},
{user:‘yamada’,  text:‘力量组记得拉伸，蛋白质记得补。\n不是在说废话，是真的很重要。’, likes:[‘sanada’,‘yanagi’], comments:[{user:‘sanada’,text:‘正确。’},{user:‘marui’,text:‘玲英好严格……’}]},
{user:‘yanagi_b’,text:‘失礼了。\n今日与仁王的双打配合，尚有提升空间。\n将持续练习。’, likes:[‘yukimura’,‘yanagi’], comments:[{user:‘niou’,text:‘柳生，你太认真了☆’},{user:‘yanagi_b’,text:‘失礼了，认真是基本。’}]},
];

function seedMoments(){
store.moments=[…SEED_MOMENTS.map(m=>({…m,id:rid(),ts:Date.now()-Math.random()*86400000*3,myLike:false}))];
saveState();
}

function renderMoments(){
const box=$(’#moments’); box.innerHTML=’’;
if(!store.moments||store.moments.length<1) seedMoments();
const sorted=[…store.moments].sort((a,b)=>(b.ts||0)-(a.ts||0));
for(const m of sorted){
const c=m.user===‘me’?store.me:contactById(m.user); if(!c) continue;
const card=div(‘moment’);
/* 头部 */
const head=div(‘row’);
const av=div(‘avatar small’); fillAvatar(av,c); av.style.cursor=‘pointer’; av.addEventListener(‘click’,()=>m.user!==‘me’&&openProfile(m.user));
const meta=div(’’); meta.innerHTML=`<div style="font-weight:700;color:var(--accent)">${displayName(c)}</div><div class="small muted">${fmtMomentTime(m.ts)}</div>`;
head.appendChild(av); head.appendChild(meta); card.appendChild(head);
/* 正文 */
const body=div(’’); body.style.cssText=‘margin:8px 0 10px;font-size:14px;line-height:1.7;white-space:pre-wrap’; body.textContent=m.text; card.appendChild(body);
/* 点赞栏 */
const bar=div(’’); bar.style.cssText=‘display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px’;
const likeBtn=div(’’); likeBtn.style.cssText=`border:1px solid var(--line);border-radius:16px;padding:4px 12px;font-size:12px;cursor:pointer;background:${m.myLike?'#fee':'var(--bg)'};color:${m.myLike?'#e25563':'var(--muted)'}`;
const likesArr=Array.isArray(m.likes)?m.likes:[];
likeBtn.textContent=(m.myLike?‘❤️’:‘🤍’)+’ ‘+(likesArr.length+(m.myLike?0:0));
likeBtn.addEventListener(‘click’,()=>{ m.myLike=!m.myLike; saveState(); renderMoments(); });
bar.appendChild(likeBtn);
if(likesArr.length){ const names=likesArr.slice(0,3).map(id=>{ const cc=store.contacts.find(x=>x.id===id); return cc?cc.name:’’; }).filter(Boolean).join(’、’); const lk=div(‘small muted’); lk.textContent=‘👍 ‘+names+(likesArr.length>3?‘等’:’’); bar.appendChild(lk); }
card.appendChild(bar);
/* 评论 */
const cmts=Array.isArray(m.comments)?m.comments:[];
if(cmts.length){ const cbox=div(’’); cbox.style.cssText=‘background:var(–bg);border-radius:10px;padding:8px 10px;margin-bottom:8px’; for(const cm of cmts){ const cc=cm.user===‘me’?store.me:store.contacts.find(x=>x.id===cm.user); const name=cc?displayName(cc):‘你’; const clr=cc?cc.avatarColor:‘var(–accent)’; const cl=div(‘small’); cl.style.marginBottom=‘4px’; cl.innerHTML=`<span style="font-weight:700;color:${clr}">${escape(name)}：</span><span>${escape(cm.text)}</span>`; cbox.appendChild(cl); } card.appendChild(cbox); }
/* 评论输入 */
const cmtRow=div(‘row’); cmtRow.style.marginTop=‘4px’;
const cmtIn=document.createElement(‘input’); cmtIn.placeholder=‘说点什么…’; cmtIn.style.cssText=‘flex:1;border:1px solid var(–line);border-radius:16px;padding:6px 12px;font-size:12px;background:var(–bg);outline:none’;
const cmtBtn=div(‘chip’,‘发送’); cmtBtn.style.cursor=‘pointer’; cmtBtn.style.fontSize=‘12px’;
cmtBtn.addEventListener(‘click’,()=>{ const t=cmtIn.value.trim(); if(!t) return; if(!Array.isArray(m.comments)) m.comments=[]; m.comments.push({user:‘me’,text:t}); cmtIn.value=’’; saveState(); renderMoments(); });
cmtIn.addEventListener(‘keydown’,e=>{ if(e.key===‘Enter’) cmtBtn.click(); });
cmtRow.appendChild(cmtIn); cmtRow.appendChild(cmtBtn); card.appendChild(cmtRow);
box.appendChild(card);
}
}

function fmtMomentTime(ts){
if(!ts) return ‘刚刚’; const d=Date.now()-ts;
if(d<60000) return ‘刚刚’;
if(d<3600000) return Math.floor(d/60000)+‘分钟前’;
if(d<86400000) return Math.floor(d/3600000)+‘小时前’;
return Math.floor(d/86400000)+‘天前’;
}

function postMomentPrompt(){
openSheet(‘发状态’,`<div><textarea id="mt_text" placeholder="分享此刻的心情…" style="width:100%;height:100px;border:1px solid var(--line);border-radius:10px;padding:8px;font-size:14px;resize:none;font-family:inherit;outline:none"></textarea><div style="text-align:right;margin-top:8px"><button class="btn" id="mt_ok">发布</button></div></div>`,
(dom)=>{ dom.querySelector(’#mt_ok’).addEventListener(‘click’,()=>{ const text=dom.querySelector(’#mt_text’).value.trim(); if(!text) return; if(!store.moments) store.moments=[]; store.moments.push({id:rid(),user:‘me’,text,ts:Date.now(),likes:[],comments:[],myLike:false}); saveState(); closeSheet(); renderMoments(); renderStatusStrip(); }); });
}

function editMe(){
const me=store.me;
openSheet(‘编辑资料’,`<div style="display:grid;gap:10px"><label style="font-size:13px">昵称<input id="em_name" value="${escape(me.name||'')}" style="display:block;width:100%;border:1px solid var(--line);border-radius:8px;padding:6px;margin-top:4px"></label><label style="font-size:13px">个性签名<input id="em_sig" value="${escape(me.sig||'')}" style="display:block;width:100%;border:1px solid var(--line);border-radius:8px;padding:6px;margin-top:4px"></label><label style="font-size:13px">状态<input id="em_status" value="${escape(me.status||'')}" style="display:block;width:100%;border:1px solid var(--line);border-radius:8px;padding:6px;margin-top:4px"></label><div style="text-align:right"><button class="btn" id="em_ok">保存</button></div></div>`,
(dom)=>{ dom.querySelector(’#em_ok’).addEventListener(‘click’,()=>{ me.name=dom.querySelector(’#em_name’).value; me.sig=dom.querySelector(’#em_sig’).value; me.status=dom.querySelector(’#em_status’).value; saveState(); closeSheet(); renderAll(); }); });
}

/* ==== 角色主动发消息定时器 ==== */
function startAutoInitTimer(){
const INIT_MSGS={
yukimura:[‘在做什么？’,‘今天还好吗。’,‘想到你了。’,‘有空来找我喝茶。’,‘刚浇完花。’],
sanada:[‘今天训练结束了吗。’,‘注意休息。遵守纪律。’,‘状态怎样。’],
marui:[‘哎哎你在吗！！’,‘想你啦！！(｡•̀ᴗ-)✧’,‘今天泡芙超好吃！！’],
niou:[‘Puri♪ 在吗☆’,‘想你了所以来找你♪’,‘咦，你在干嘛☆’],
akaya:[‘喂！！在吗！！’,‘我要变强！！你支持我吗！！’,‘今天被部长虐了……’],
sakura:[‘有没有好消息分享♪’,‘来啦♪ 最近怎样！’,‘我刚打听到一个消息……’],
yanagi:[‘在整理资料，顺便来看看你。’,‘你今天状态如何？’],
yamada:[‘拉伸了吗。’,‘记得补蛋白。’],
yanagi_b:[‘失礼了，来问候一声。’,‘最近还好吗？’],
kawamura:[‘稳一点，最近怎样。’],
};
setInterval(()=>{
if(!store||!store.chats) return;
const dms=store.chats.filter(c=>c.type===‘dm’);
if(!dms.length) return;
const chat=dms[Math.floor(Math.random()*dms.length)];
const cid=chat.members.find(x=>x!==‘me’); if(!cid) return;
const lines=INIT_MSGS[cid]; if(!lines||!lines.length) return;
const text=lines[Math.floor(Math.random()*lines.length)];
chat.messages.push(txt(cid,text));
saveState();
if(currentChatId===chat.id){ renderMsgs(); const area=$(’#chatArea’); if(area) area.scrollTop=area.scrollHeight; }
else { renderInbox(); }
}, 55000+Math.random()*50000);
}
async function migrateBlobs(){ let changed=false; if(store.me.avatarUrl&&!store.me.avatarKey){await idbPut(‘av_me’,store.me.avatarUrl); store.me.avatarKey=‘av_me’; store.me.avatarUrl=’’; changed=true} for(const c of store.contacts){ if(c.avatarUrl&&!c.avatarKey){ await idbPut(‘av_’+c.id,c.avatarUrl); c.avatarKey=‘av_’+c.id; c.avatarUrl=’’; changed=true } } if(store.settings.bg&&!store.settings.bgKey){ await idbPut(‘bg_global’,store.settings.bg); store.settings.bgKey=‘bg_global’; store.settings.bg=’’; changed=true } for(const ch of store.chats){ if(ch.bg&&!ch.bgKey){ await idbPut(‘bg_’+ch.id,ch.bg); ch.bgKey=‘bg_’+ch.id; ch.bg=’’; changed=true } } if(changed) saveState() }

document.getElementById(“btnSend”)?.addEventListener(“click”, sendMsg);
document.getElementById(“btnEmoji”)?.addEventListener(“click”, ()=>{ try{ insertEmoji && insertEmoji(“😊”) }catch(e){} });

/* mention-priority */
(()=>{
function beforeText(){ const el=document.getElementById(‘input’); return el? el.value.trim():’’ }
const alias={yukimura:[‘幸村精市’,‘幸村’,‘精市’,‘部长’],sanada:[‘真田弦一郎’,‘真田’,‘一郎’,‘副部长’],yanagi:[‘柳莲二’,‘柳’,‘莲二’],marui:[‘丸井文太’,‘丸井’,‘文太’],akaya:[‘切原赤也’,‘切原’,‘赤也’],kawamura:[‘胡狼桑原’,‘桑原’,‘胡狼’],yanagi_b:[‘柳生比吕士’,‘柳生’,‘比吕士’],niou:[‘仁王雅治’,‘仁王’,‘雅治’],sakura:[‘樱井幸’,‘樱井’,‘小幸’,‘幸’],yamada:[‘山田玲英’,‘山田’,‘玲英’],};
function resolveMentions(t){const at=new Set();const tokens=Array.from(new Set((t.match(/@?([^\s@，。]+)/g)||[]).map(s=>s.replace(/^@/,’’))));for(const [id,names] of Object.entries(alias)){if(tokens.some(x=>names.includes(x))) at.add(id); if(names.some(n=>t.includes(’@’+n))) at.add(id);} return Array.from(at);}
const _sendMsg=window.sendMsg;
window.sendMsg=function(){ const text=beforeText(); _sendMsg(); const chat=curr&&curr(); if(!chat) return; const mentions=resolveMentions(text); if(mentions.length){ let d=600; mentions.forEach(id=>setTimeout(()=>botReply(id,chat,{text}),d)); } };
})();

/* ====== DM header (avatar + names) & Discover Likes Patch ====== */
(function(){
// Helpers expected in app: curr(), getContact(id), avatarUrl(c), openProfile(id)
function ensureTopbarPeer(){
try{
const chat = (typeof curr === ‘function’) ? curr() : null;
if(!chat || chat.type !== ‘dm’) return;

```
  // Find title container
  const top = document.querySelector('.topbar .titlewrap, .topbar .title, .topbar .name');
  if(!top) return;

  // If already rendered for this peer, skip
  if(top.dataset.peerId === chat.peerId && top.querySelector('.peer')) return;

  const c = (typeof getContact==='function') ? getContact(chat.peerId) : chat.peer || {name:chat.name};
  const name = (c && (c.remark && c.remark.trim())) || (c && c.name) || chat.name || '';
  const sub  = (c && c.sig) || '';
  const ava  = (typeof avatarUrl==='function') ? avatarUrl(c) : (c && c.avatarUrl) || '';

  top.dataset.peerId = chat.peerId || '';
  top.innerHTML = [
    '<div class="peer">',
      '<img class="ava" src="'+ (ava||'') +'" alt="'+ name.replace(/"/g,'&quot;') +'" onerror="this.style.background=\'#eaeaea\'"/>',
      '<div class="names">',
        '<div class="title">'+ name +'</div>',
        '<div class="sub">'+ (sub||'') +'</div>',
      '</div>',
    '</div>'
  ].join('');

  top.querySelector('.ava')?.addEventListener('click', ()=>{
    try{ openProfile && openProfile(chat.peerId); }catch(e){}
  });
}catch(e){ /* silent */ }
```

}

// Run on load and when topbar changes
const topbar = document.querySelector(’.topbar’);
if(topbar){
const mo = new MutationObserver(()=> setTimeout(ensureTopbarPeer,0));
mo.observe(topbar, {childList:true, subtree:true});
}
document.addEventListener(‘DOMContentLoaded’, ensureTopbarPeer);
window.addEventListener(‘hashchange’, ()=> setTimeout(ensureTopbarPeer, 50));
setTimeout(ensureTopbarPeer, 100);

// ===== Discover Likes =====
const LS_LIKES   = ‘status_likes’;
const LS_MYLIKES = ‘status_myLikes’;
let likes   = new Map(Object.entries(JSON.parse(localStorage.getItem(LS_LIKES)||’{}’)).map(([k,v])=>[k,Number(v)]));
let myLikes = new Set(JSON.parse(localStorage.getItem(LS_MYLIKES)||’[]’));

function saveLikes(){
localStorage.setItem(LS_LIKES,   JSON.stringify(Object.fromEntries(likes)));
localStorage.setItem(LS_MYLIKES, JSON.stringify(Array.from(myLikes)));
}

function enhanceDiscover(){
// Try common containers
const root = document.querySelector(’.discover, #discover, [data-page=“discover”]’) || document;
// Cards: be permissive
const cards = root.querySelectorAll(’.status, .card, .feed-item, .moment, .discover-item’);
let idx = 0;
cards.forEach((card)=>{
// skip if already has likebar
if(card.querySelector(’.status-likebar’)) return;
// assign id
const id = card.dataset.id || (‘auto_’+(idx++));
card.dataset.id = id;
// read current count
const count = likes.get(id) || 0;
const liked = myLikes.has(id);
// append likebar at tail
const bar = document.createElement(‘div’);
bar.className = ‘status-likebar’;
bar.innerHTML = ‘<button class="like '+(liked?'on':'')+'" data-id="'+id+'"><span class="heart">❤</span><span class="count">’+count+’</span></button>’;
card.appendChild(bar);
});
}

function toggleLike(id){
const liked = myLikes.has(id);
if(liked){
myLikes.delete(id);
likes.set(id, Math.max(0,(likes.get(id)||0)-1));
}else{
myLikes.add(id);
likes.set(id, (likes.get(id)||0)+1);
}
saveLikes();
// update UI
document.querySelectorAll(’.status-likebar .like[data-id=”’+id+’”]’).forEach(btn=>{
btn.classList.toggle(‘on’, !liked);
const cnt = btn.querySelector(’.count’);
if(cnt) cnt.textContent = likes.get(id) || 0;
});
}

// Event delegation
document.addEventListener(‘click’, (e)=>{
const btn = e.target.closest(’.status-likebar .like’);
if(btn){ toggleLike(btn.dataset.id); }
}, true);

// Run enhance when discover tab shows (hashchange or tab click)
function maybeEnhanceDiscover(){ setTimeout(enhanceDiscover,60); try{ if(window._discoverLikeInterval) clearInterval(window._discoverLikeInterval); window._discoverLikeInterval=setInterval(function(){ if(document.querySelector(’#discover’)){ try{ enhanceDiscover(); }catch(e){} } }, 3000);}catch(e){} }
window.addEventListener(‘hashchange’, maybeEnhanceDiscover);
document.addEventListener(‘DOMContentLoaded’, maybeEnhanceDiscover);
setTimeout(maybeEnhanceDiscover, 200);
})();

/* –– peer overlay + cleanup sendbars –– */
(function(){
function cleanupSendBars(){
document.querySelectorAll(’.sendbar,.big-send,.sticky-send,.footer-send,#sendbar,#quickSend,#primarySend’)
.forEach(el=>{ try{ el.style.display=‘none’/*safe-hide*/; }catch(e){} });
}
document.addEventListener(‘DOMContentLoaded’, cleanupSendBars);
setTimeout(cleanupSendBars, 200);
window.addEventListener(‘hashchange’, ()=>setTimeout(cleanupSendBars, 60));

function mountPeer(){
try{
const chat = (typeof curr===‘function’)? curr(): null;
if(!chat || chat.type!==‘dm’) return;
const tb = document.querySelector(’.topbar’); if(!tb) return;
tb.classList.add(‘has-peer’);

```
  let wrap = tb.querySelector('.peer-fixed');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'peer-fixed';
    tb.appendChild(wrap);
  }
  const c = (typeof getContact==='function') ? getContact(chat.peerId) : chat.peer || {name:chat.name};
  const name = (c && (c.remark && c.remark.trim())) || (c && c.name) || chat.name || '';
  const sub  = (c && c.sig) || '';
  const ava  = (typeof avatarUrl==='function') ? avatarUrl(c) : (c && c.avatarUrl) || '';

  wrap.innerHTML = '<img class="ava" src="'+(ava||'')+'" alt="'+name.replace(/"/g,'&quot;')+'"/>' +
                   '<div class="names"><div class="title">'+name+'</div><div class="sub">'+(sub||'')+'</div></div>';
  wrap.querySelector('.ava')?.addEventListener('click', ()=>{ try{ openProfile && openProfile(chat.peerId); }catch(e){} });
}catch(e){}
```

}
document.addEventListener(‘DOMContentLoaded’, ()=>setTimeout(mountPeer,60));
window.addEventListener(‘hashchange’, ()=>setTimeout(mountPeer,60));
setInterval(mountPeer, 1200); // keep it robust during transitions
})();

/* ===== Ultra robust header+sendbar sanitizer ===== */
(function(){
// Remove giant fixed-bottom “发送” bars heuristically
function nukeGiantSendBars(){
const candidates = Array.from(document.querySelectorAll(‘button,.btn,.weui-btn,.primary,.footer button’));
const viewportH = window.innerHeight || 800;
candidates.forEach(el=>{
try{
const txt = (el.textContent||’’).trim();
if(!txt) return;
if(!/^(发送|Send)$/i.test(txt)) return;
const r = el.getBoundingClientRect();
const isGiant = r.width>180 && r.height>40;
const nearBottom = (viewportH - r.bottom) < 140; // close to bottom
if(isGiant && nearBottom){
// remove whole bar container if it only contains this button
const bar = el.closest(’.footer,.sendbar,.big-send,.sticky-send,.footer-send’) || el.parentElement;
(bar||el).style.display=‘none’;
(bar||el).remove?.();
}
}catch(e){}
});
}

// Ensure overlay peer appears and hide default titles (including bare text nodes)
function mountPeerOverlay(){
try{
if(typeof curr!==‘function’) return;
const chat = curr();
if(!chat || chat.type!==‘dm’) return;
const tb = document.querySelector(’.topbar’);
if(!tb) return;
tb.classList.add(‘has-peer’);

```
  // Hide any bare text nodes in topbar title area
  Array.from(tb.childNodes).forEach(n=>{
    if(n.nodeType===3 && n.textContent.trim()){
      n.textContent='';
    }
  });

  let wrap = tb.querySelector('.peer-fixed');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'peer-fixed';
    tb.appendChild(wrap);
  }

  const c = (typeof getContact==='function') ? getContact(chat.peerId) : chat.peer || {name:chat.name};
  const name = (c && (c.remark && c.remark.trim())) || (c && c.name) || chat.name || '';
  const sub  = (c && c.sig) || '';
  const ava  = (typeof avatarUrl==='function') ? avatarUrl(c) : (c && c.avatarUrl) || '';

  wrap.innerHTML = '<img class="ava" src="'+(ava||'')+'" alt="'+name.replace(/"/g,'&quot;')+'"/>' +
                   '<div class="names"><div class="title">'+name+'</div><div class="sub">'+(sub||'')+'</div></div>';
  wrap.querySelector('.ava')?.addEventListener('click', ()=>{ try{ openProfile && openProfile(chat.peerId); }catch(e){} });
}catch(e){}
```

}

// Observe DOM changes to re-apply both fixes
const mo = new MutationObserver(()=>{ setTimeout(nukeGiantSendBars,0); setTimeout(mountPeerOverlay,0); });
mo.observe(document.documentElement, {childList:true, subtree:true});
window.addEventListener(‘resize’, nukeGiantSendBars);
document.addEventListener(‘DOMContentLoaded’, ()=>{ nukeGiantSendBars(); mountPeerOverlay(); });
setTimeout(()=>{ nukeGiantSendBars(); mountPeerOverlay(); }, 200);
window.addEventListener(‘hashchange’, ()=>{ setTimeout(nukeGiantSendBars,60); setTimeout(mountPeerOverlay,60); });
})();

/* FIX4: Robust duplicate-title dedupe + bottom-sendbar killer */
(function(){
function rmGiantBars(){
const vh = window.innerHeight || document.documentElement.clientHeight || 800;
const nodes = Array.from(document.querySelectorAll(’button,.btn,[class*="btn"],footer,[class*="send"],[id*="send"],.footer’));
nodes.forEach(el=>{
try{
const text = (el.textContent||’’).trim();
const rect = el.getBoundingClientRect();
const nearBottom = (vh - rect.top) < 180 || (vh - rect.bottom) < 120;
const sizeBig = rect.height > 45 || rect.width > 200;
const style = getComputedStyle(el);
const fixed = style.position === ‘fixed’ || style.position===‘sticky’;
const looksSend = /^(发送|Send|發送)$/i.test(text) || /发送/.test((el.innerText||’’));
if((nearBottom && (sizeBig || fixed) && looksSend) || (fixed && nearBottom && /发送/.test(el.innerText||’’))){
let bar = el.closest(’.sendbar,.big-send,.sticky-send,.footer-send’) || el;
bar.style.display = ‘none’;
bar.remove?.();
}
}catch(e){}
});
}

function dedupeTopbar(){
const tb = document.querySelector(’.topbar, .header, .appbar’);
if(!tb) return;

```
// hide duplicate leaf texts that repeat exactly
const map = {};
Array.from(tb.querySelectorAll('*')).forEach(n=>{
  if(n.children.length===0){
    const t = (n.textContent||'').trim();
    if(t){
      if(map[t]){ n.style.display='none'; }
      else { map[t]=n; }
    }
  }
});

// mount peer overlay if we can find contact
try{
  if(!tb.querySelector('.peer-fixed')){
    let name='', sig='', ava='', pid=null;
    if(typeof curr==='function'){
      const chat = curr();
      if(chat){
        pid = chat.peerId || null;
        if(typeof getContact==='function' && pid!=null){
          const c = getContact(pid) || {};
          name = (c.remark && c.remark.trim()) || c.name || chat.name || '';
          sig  = c.sig || '';
          if(typeof avatarUrl==='function') ava = avatarUrl(c)||'';
          else ava = c.avatarUrl||'';
        }else{
          name = chat.name || '';
        }
      }
    }
    if(name){
      tb.classList.add('has-peer');
      const wrap = document.createElement('div');
      wrap.className = 'peer-fixed';
      wrap.innerHTML = '<img class=\"ava\" alt=\"\"/>' +
                       '<div class=\"names\"><div class=\"title\"></div><div class=\"sub\"></div></div>';
      tb.appendChild(wrap);
      wrap.querySelector('.ava').src = ava||'';
      wrap.querySelector('.title').textContent = name;
      wrap.querySelector('.sub').textContent = sig||'';
      wrap.querySelector('.ava').addEventListener('click', ()=>{ try{ openProfile && openProfile(pid); }catch(e){} });
    }
  }
}catch(e){}
```

}

const mo = new MutationObserver(()=>{ rmGiantBars(); dedupeTopbar(); });
mo.observe(document.documentElement, {childList:true, subtree:true});
window.addEventListener(‘resize’, rmGiantBars);
window.addEventListener(‘hashchange’, ()=>{ setTimeout(rmGiantBars, 60); setTimeout(dedupeTopbar, 60); });
document.addEventListener(‘DOMContentLoaded’, ()=>{ rmGiantBars(); dedupeTopbar(); });
setTimeout(()=>{ rmGiantBars(); dedupeTopbar(); }, 300);
})();

// === DM header avatar + duplicate inputbar guard ===
(function(){
function genAvatar(name){
var ch = (name||’?’).trim().slice(0,1);
// pleasant pastel
var colors=[’#8ab4f8’,’#81c995’,’#f28b82’,’#fdd663’,’#c58af9’,’#7bdff6’,’#f19cbb’];
var bg=colors[Math.abs((ch.charCodeAt(0)||65))%colors.length];
var svg = “<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' rx='32' fill='"+bg+"'/><text x='50%' y='58%' text-anchor='middle' font-size='36' fill='white' font-family='Arial'>”+ch+”</text></svg>”;
return ‘data:image/svg+xml;utf8,’+encodeURIComponent(svg);
}
function ensureDMHeader(){
var head=document.querySelector(’.chat-head’);
if(!head) return;
var titleEl=document.getElementById(‘chatTitle’);
var subEl=document.getElementById(‘chatSubtitle’);
if(!titleEl||!subEl) return;
var title=titleEl.textContent||’’;
var subtitle=subEl.textContent||’’;
var isDM = !subtitle || subtitle.trim()===title.trim() || !/成员\s*\d+/.test(subtitle);
var av=document.getElementById(‘chatAvatar’);
if(!av){
av=document.createElement(‘img’);
av.id=‘chatAvatar’;
av.className=‘chat-avatar’;
var titleWrap=document.querySelector(’.chat-title-wrap’);
if(titleWrap){ head.insertBefore(av, titleWrap); }
}
if(isDM){
subEl.textContent=’’;
av.src = genAvatar(title);
av.style.display=‘block’;
}else{
av.style.display=‘none’;
}
}
function killDupInputs(){
var bars=[].slice.call(document.querySelectorAll(’.inputbar’));
bars.forEach(function(el,i){ if(i>0){ el.parentNode && el.parentNode.removeChild(el);} });
}
// Observe DOM changes to keep things tidy
var mo = new MutationObserver(function(){ killDupInputs(); ensureDMHeader(); });
mo.observe(document.body,{childList:true,subtree:true});
// Also run on key UI events
document.addEventListener(‘click’, function(){ setTimeout(function(){ killDupInputs(); ensureDMHeader(); }, 0);}, true);
window.addEventListener(‘hashchange’, function(){ setTimeout(function(){ killDupInputs(); ensureDMHeader(); }, 0);});
document.addEventListener(‘DOMContentLoaded’, function(){ killDupInputs(); ensureDMHeader(); });
// small kick on load
setTimeout(function(){ killDupInputs(); ensureDMHeader(); }, 50);
})();

// === Rikkai hard guard: dedupe composers, enable Me edit, engine drawer close ===
(function(){
function dedupe(){
try{
var bars = Array.from(document.querySelectorAll(’.inputbar,[data-role=“composer”],.composer’));
if(bars.length>1){
// keep the one that has an input or textarea (prefer last)
var keep = bars.reverse().find(b=>b.querySelector(‘input,textarea’)) || bars[0];
bars.reverse().forEach(function(b){
if(b!==keep){ b.remove(); }
});
}
// remove ghost hint-only blocks near bottom
var hintRe = /发消息.*支持@.*(删除|撤回)/;
Array.from(document.querySelectorAll(‘div,section,footer’)).forEach(function(n){
var txt=(n.textContent||’’).trim();
if(hintRe.test(txt) && !n.querySelector(‘input,textarea,button’)){
var r=n.getBoundingClientRect();
if(r.bottom > (innerHeight-120)) n.remove();
}
});
}catch(e){}
}
function bindMeEdit(){
document.addEventListener(‘click’, function(e){
var btn = e.target.closest(‘button,.btn,[role=“button”],a,.chip’);
if(!btn) return;
var t = (btn.textContent||’’).trim();
if(t===‘编辑’ && !btn.closest(’#engine-drawer,.engine-drawer,[data-panel=“engine-manager”],.engine-sheet,.drawer.engine,[data-section=“engine”],.engine-item,.engine-card’)){
e.preventDefault();
var panel = document.querySelector(’#me-editor,.me-editor,[data-panel=“me-editor”],.profile-editor’);
if(panel){
panel.style.display=‘block’; panel.classList.add(‘open’);
if(!panel.querySelector(’.hotfix-close’)){
var x=document.createElement(‘button’); x.className=‘hotfix-close’; x.textContent=‘关闭’;
x.style.cssText=‘position:absolute;right:12px;top:12px;z-index:100’;
x.onclick=function(){ panel.classList.remove(‘open’); panel.style.display=‘none’; };
panel.appendChild(x);
}
}
}
}, true);
}
function bindEngineClose(){
var closeAll=function(){
document.querySelectorAll(’#engine-drawer,.engine-drawer,[data-panel=“engine-manager”],.engine-sheet,.drawer.engine’).forEach(function(d){
d.style.display=‘none’; d.classList.remove(‘open’);
});
};
document.addEventListener(‘keydown’, function(e){ if(e.key===‘Escape’) closeAll(); });
new MutationObserver(function(){
document.querySelectorAll(’#engine-drawer,.engine-drawer,[data-panel=“engine-manager”],.engine-sheet,.drawer.engine’).forEach(function(d){
if(d.dataset.bound) return;
d.dataset.bound=‘1’;
var overlay = d.querySelector(’.overlay,.mask,.backdrop’);
if(!overlay){ overlay=document.createElement(‘div’); overlay.className=‘overlay’; overlay.style.cssText=‘position:absolute;inset:0;background:rgba(0,0,0,0.01)’; d.insertBefore(overlay, d.firstChild); }
overlay.addEventListener(‘click’, closeAll);
var c = d.querySelector(’.close,[data-close],.btn-close’);
if(c) c.addEventListener(‘click’, closeAll);
});
}).observe(document.body,{childList:true,subtree:true});
}
document.addEventListener(‘DOMContentLoaded’, function(){ dedupe(); bindMeEdit(); bindEngineClose(); });
// re-run on route changes
setInterval(dedupe, 1000);
})();

// ==== Rikkai Guard v2: dedupe inputbars, enable Me edit, engine drawer close ====
(function(){
function $$all(sel, root){ try{ return Array.from((root||document).querySelectorAll(sel)); }catch(e){ return []; } }
function isVisible(el){ if(!el) return false; const r=el.getBoundingClientRect(); return r.width>0 && r.height>0; }
function bottomDistance(el){ const r=el.getBoundingClientRect(); return window.innerHeight - r.bottom; }

function dedupeBars(){
try{
// Remove hint-only boxes at screen bottom (no input/button inside)
const hintRe = /发消息.*支持@.*(删除|撤回)/;
$$all(“div,section,footer”).forEach(n=>{
const txt=(n.textContent||’’).replace(/\s+/g,’’).trim();
if(hintRe.test(txt) && !n.querySelector(‘input,textarea,button’)){
if(bottomDistance(n) < 220){ n.remove(); }
}
});
// Keep only one input bar (prefer the bottom-most that has input/textarea or SEND button)
const bars = $$all(’.inputbar, .composer, .chat-footer, footer .inputbar, footer .composer, .sendbar’)
.filter(isVisible);
if(bars.length>1){
let keep = null, best = -1e9;
for(const b of bars){
const ok = b.querySelector(‘input,textarea,button,[role=“textbox”]’);
const dist = -bottomDistance(b); // larger (closer to bottom) preferred
if(ok && dist > best){ best = dist; keep = b; }
}
if(!keep) keep = bars[bars.length-1];
for(const b of bars){ if(b!==keep) b.remove(); }
}
// Make sure bar is sticky & above tabbar
const bar = $$all(’.inputbar’).pop();
if(bar){
bar.style.position=‘sticky’; bar.style.bottom=‘0’; bar.style.zIndex=‘60’;
}
}catch(e){}
}

function enableMeEdit(){
document.addEventListener(‘click’, function(e){
const btn = e.target.closest(‘button,.btn,[role=“button”],a,.chip’);
if(!btn) return;
const txt = (btn.textContent||’’).trim();
if(txt===‘编辑’){
e.preventDefault();
// Try find an existing editor panel
const panel = document.querySelector(’#me-editor, .me-editor, [data-panel=“me-editor”], .profile-editor, dialog.me’);
if(panel){
panel.style.display=‘block’; panel.classList.add(‘open’); panel.removeAttribute(‘aria-hidden’);
// add close fallback
if(!panel.querySelector(’.hotfix-close’)){
const x = document.createElement(‘button’);
x.className=‘hotfix-close’; x.textContent=‘关闭’;
x.style.cssText=‘position:absolute;right:12px;top:12px;z-index:100;border:0;background:#6b63ff;color:#fff;padding:6px 10px;border-radius:10px’;
x.onclick=()=>{ panel.classList.remove(‘open’); panel.style.display=‘none’; panel.setAttribute(‘aria-hidden’,‘true’); };
panel.appendChild(x);
}
}
}
}, true);
}

function makeEngineClosable(){
function closeAll(){
$$all(’#engine-drawer, .engine-drawer, [data-panel=“engine-manager”], .engine-sheet, .drawer.engine, .engine-drawer-sheet’)
.forEach(d=>{ d.style.display=‘none’; d.classList.remove(‘open’); });
}
document.addEventListener(‘keydown’, e=>{ if(e.key===‘Escape’) closeAll(); });
new MutationObserver(()=>{
$$all(’#engine-drawer, .engine-drawer, [data-panel=“engine-manager”], .engine-sheet, .drawer.engine, .engine-drawer-sheet’)
.forEach(d=>{
if(d.dataset.rkBound) return; d.dataset.rkBound=‘1’;
let ov = d.querySelector(’.overlay,.mask,.backdrop’);
if(!ov){ ov=document.createElement(‘div’); ov.className=‘overlay’; ov.style.cssText=‘position:absolute;inset:0;background:rgba(0,0,0,0.01)’; d.insertBefore(ov, d.firstChild); }
ov.addEventListener(‘click’, closeAll);
const c = d.querySelector(’.close,[data-close],.btn-close’);
if(c) c.addEventListener(‘click’, closeAll);
});
}).observe(document.body,{childList:true,subtree:true});
}

function boot(){ dedupeBars(); enableMeEdit(); makeEngineClosable(); }
document.addEventListener(‘DOMContentLoaded’, boot);
// keep deduping a while for SPA
let n=0; const timer=setInterval(()=>{ dedupeBars(); if(++n>30) clearInterval(timer); }, 700);
})();

// === Close engine sheet when clicking outside ===
(function(){
const sheet = document.getElementById(‘sheet’);
if (!sheet) return;
// guard: avoid multiple bindings
if (!window.__sheetOutsideCloseBound) {
window.__sheetOutsideCloseBound = true;
document.addEventListener(‘click’, function(e){
const isOpen = !sheet.classList.contains(‘hidden’);
if (!isOpen) return;
const inside = sheet.contains(e.target);
const triggers = e.target.closest && (e.target.closest(’#btnManageEngine’) || e.target.closest(’.engine-item .edit’));
if (!inside && !triggers) {
try { closeSheet(); } catch(_) { sheet.classList.add(‘hidden’); }
}
}, true);
}
})();
