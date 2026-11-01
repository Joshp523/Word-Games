const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
const KINDS={ogle:['Ogle','a game of hidden words'],categories:['Categories','a game of quick wit'],codemaster:['Codemaster','win together, or fall together'],rabble:['Rabble','a game of tiles and cunning']};
const DICE='AAEEGN ABBJOO ACHOPS AFFKPS AOOTTW CIMOTU DEILRX DELRVY DISTTY EEGHNW EEINSU EHRTVW EIOSST ELRTTY HIMNOU HLNNRZ'.split(' ');
const CATS=['A boy’s name','A city','Something cold','A famous book','An animal','A profession','In the kitchen','Something you wear','A color','A body of water','A flower','A musical instrument'];
const WORDS='Library Quill Raven Candle Ink Scroll Chalice Statue Cipher Manor Violin Dagger Relic Compass Lantern Locket Thorn Chapel Tome Spire Mirror Crypt Orchid Clock Pendant Velvet Ember Abbey Ivy Gloom Mask Rose Tower Lace Vellum Willow Shadow Parlor Cloak Bell Hearth Sonnet Folio Lyre Moth'.split(' ');
const SEED={
 ogle:()=>({board:shuf(DICE).map(d=>d[Math.floor(Math.random()*6)])}),
 categories:()=>({letter:'ABCDEFGHIJKLMNOPRSTW'[Math.floor(Math.random()*20)],cats:shuf(CATS).slice(0,6)}),
 codemaster:()=>({words:shuf(WORDS).slice(0,25).map(w=>w.toUpperCase())})};
const LIM=8,saved=()=>localStorage.getItem('rr_name')||'';
let me,P,G,moves=[],disp=[],reveals=[],names={},key=null,timer,lastSig='';
const svg=(k,h,c='o')=>{const o=ORN[k];return `<svg class="${c}" viewBox="0 0 ${o.w} ${o.h}" height="${h}" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${o.d}"/></svg>`};
const frame=(t,s,b)=>`<div class="pg"><div class="fr">${['tl','tr','bl','br'].map(c=>svg('cn',120,'cn k-'+c)).join('')}${svg('fl',60)}<h1>${t}</h1><p class="sub">${s}</p>${svg('dv',44)}${b}${svg('dv',56)}</div></div>`;
const shell=b=>{document.body.dataset.t=G.kind;app.innerHTML=frame(KINDS[G.kind][0],KINDS[G.kind][1],b)};
const nm=id=>esc(names[id]||'…'),opp=()=>G.p1==me?G.p2:G.p1;
const fatal=m=>app.innerHTML=frame('Alas','something went wrong',`<div class="row"><div class="pn"><p>${esc(m)}</p><p><em>Check config.js, run schema.sql, and enable anonymous sign-ins in Supabase.</em></p></div></div>`);

async function init(){
 try{
  let {data:{session}}=await sb.auth.getSession();
  if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session}
  me=session.user.id;
  let {data:p}=await sb.from('wg_players').select('*').eq('id',me).maybeSingle();
  if(!p){const r=await sb.from('wg_players').insert({id:me,name:saved()||'Reader'}).select().single();if(r.error)throw r.error;p=r.data}
  P=p;route();addEventListener('hashchange',route);
 }catch(e){fatal(e.message||e)}
}
async function route(){
 clearInterval(timer);const c=location.hash.slice(1).toUpperCase();
 if(c.length!=4)return lobby();
 const {data:g}=await sb.from('wg_games').select('*').eq('code',c).maybeSingle();
 if(g){G=g;key=null;lastSig='';await draw();timer=setInterval(draw,4000);return}
 G=null;document.body.dataset.t='lobby';
 app.innerHTML=frame('Take a Seat','you are invited · code '+esc(c),`<div class="row"><div class="pn"><h2>Your Name</h2><label for="nm">What shall we call you?</label><input id="nm" maxlength="20" value="${esc(saved())}" autocomplete="name"><button class="btn" data-a="seat" data-v="${esc(c)}">Join the Game</button><a class="btn ghost" href="#">The Lobby</a></div></div>`);
}
async function lobby(){
 G=null;document.body.dataset.t='lobby';
 const [g,w]=await Promise.all([sb.from('wg_games').select('*').order('created_at',{ascending:false}).limit(12),sb.from('wg_winners').select('*').order('won_at',{ascending:false}).limit(8)]);
 app.innerHTML=frame('The Lobby','begin a game, or enter an invite code',`<div class="lg">
 <div class="pn"><h2>Begin a New Game</h2><label for="me">Your name</label><input id="me" maxlength="20" value="${esc(saved())}" autocomplete="name">${['ogle','rabble','categories','codemaster'].map(k=>`<button class="btn" data-a="new" data-v="${k}">${KINDS[k][0]}</button>`).join('')}</div>
 <div class="pn"><h2>Join with a Code</h2><label for="jc">4-character code</label><input id="jc" class="cin" maxlength="4" autocapitalize="characters"><button class="btn" data-a="join">Enter the Game</button></div>
 <div class="pn"><h2>Your Games</h2>${(g.data||[]).map(x=>`<a class="gm hl" href="#${x.code}"><span>${KINDS[x.kind][0]} · ${x.code}</span><em>${x.status}</em></a>`).join('')||'<p><em>None yet.</em></p>'}<button class="btn ghost" data-a="push">Turn Alerts</button></div>
 <div class="pn"><h2>Hall of Winners</h2>${(w.data||[]).map(x=>`<div class="hl"><div class="gm"><span>${KINDS[x.kind][0]} — ${esc(x.victors)}</span><em>${new Date(x.won_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</em></div><p>${esc(x.score||'')}</p></div>`).join('')||'<p><em>No victors yet.</em></p>'}</div></div>`);
}
async function load(){
 const [m,d,r,g]=await Promise.all([sb.from('wg_moves').select('*').eq('game_id',G.id).order('id'),sb.from('wg_disputes').select('*').eq('game_id',G.id).order('id'),sb.from('wg_cm_reveals').select('*').eq('game_id',G.id),sb.from('wg_games').select('*').eq('id',G.id).single()]);
 moves=m.data||[];disp=d.data||[];reveals=r.data||[];if(g.data)G=g.data;
 names={[G.p1]:G.p1_name,[G.p2]:G.p2_name};
 if(G.kind=='codemaster'&&G.p1==me&&!key){const {data:k}=await sb.from('wg_cm_keys').select('key').eq('game_id',G.id).maybeSingle();key=k&&k.key}
}
async function draw(){
 if(!G)return;await load();
 const sig=[moves.length,disp.map(d=>d.verdict).join(),reveals.length,G.status,G.p2,!!key].join('|');
 if(sig===lastSig)return;lastSig=sig;VIEW[G.kind]();
}
const refresh=async()=>{lastSig='';await draw()};
const wait=()=>shell(`<div class="row"><div class="pn"><h2>Invite a Friend</h2><div class="code">${G.code}</div><p>Send them this link, or the code:</p><input readonly value="${location.origin+location.pathname}#${G.code}"><button class="btn" data-a="copy">Copy Invite Link</button><a class="btn ghost" href="#">The Lobby</a></div></div>`);
const fk=i=>disp.some(d=>d.item==i&&d.verdict=='fake');
const dbtn=i=>disp.some(d=>d.item==i)?'<em>disputed</em>':`<button class="lnk" data-a="dispute" data-v="${esc(i)}">Dispute</button>`;
const dbox=()=>disp.filter(d=>!d.verdict).map(d=>d.raised_by==me?`<div class="pn"><h2>Disputed: ${esc(d.item)}</h2><p>Look it up, then give your verdict.</p><a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/search?q=define+${encodeURIComponent(d.item)}">Look It Up</a><button class="btn" data-a="rule" data-v="real" data-id="${d.id}">It’s a Real Word</button><button class="btn ghost" data-a="rule" data-v="fake" data-id="${d.id}">It’s Not a Word</button></div>`:`<div class="pn"><h2>Disputed: ${esc(d.item)}</h2><p><em>${nm(d.raised_by)} is checking this one…</em></p></div>`).join('');
const fin=(a,b)=>G.status=='finished'?'<p><em>Game over.</em></p>':`<button class="btn" data-a="finish" data-v="${a}|${b}">Finish Game</button>`;
const lobbyBtn='<a class="btn ghost" href="#">The Lobby</a>';
const pts=w=>w.length>=8?11:[0,0,0,1,1,2,3,5][w.length];
const fits=(w,b)=>{const u=Array(16).fill(0);const f=(i,k)=>{if(b[i]!==w[k])return 0;if(k==w.length-1)return 1;u[i]=1;const r=i>>2,c=i&3;for(let dr=-1;dr<2;dr++)for(let dc=-1;dc<2;dc++){const R=r+dr,C=c+dc,j=R*4+C;if(R>=0&&R<4&&C>=0&&C<4&&!u[j]&&f(j,k+1)){u[i]=0;return 1}}u[i]=0;return 0};return [...Array(16).keys()].some(i=>f(i,0))};
const VIEW={};
VIEW.ogle=()=>{
 if(!G.p2)return wait();
 const b=G.seed.board,mine=moves.find(m=>m.player==me),th=moves.find(m=>m.player!=me);
 const sc=(a,o)=>a.filter(w=>!o.includes(w)&&!fk(w)).reduce((s,w)=>s+pts(w),0);
 let p;
 if(!mine)p=`<div class="pn"><h2>Your Turn</h2><label for="w">Words, separated by spaces</label><textarea id="w" rows="6"></textarea><button class="btn" data-a="words">Submit Words</button>${lobbyBtn}</div>`;
 else if(!th)p=`<div class="pn"><h2>Submitted</h2><p><em>Waiting on ${nm(opp())}…</em></p>${lobbyBtn}</div>`;
 else{const A=mine.payload.words,B=th.payload.words,x=sc(A,B),y=sc(B,A);
  p=`<div class="pn"><h2>Results</h2><p>You <span class="big">${x}</span></p><p>${nm(opp())} <span class="big">${y}</span></p><h2>Their Words</h2>${B.map(w=>`<div class="gm"><span>${esc(w)}</span>${dbtn(w)}</div>`).join('')||'<p><em>None.</em></p>'}${fin(x,y)}${lobbyBtn}</div>`}
 shell(`<div class="row"><div class="bd" style="max-width:420px"><div class="g g4">${b.map(c=>`<b>${c}</b>`).join('')}</div></div>${p}${dbox()}</div>`);
};
VIEW.categories=()=>{
 if(!G.p2)return wait();
 const {letter,cats}=G.seed,mine=moves.find(m=>m.player==me),th=moves.find(m=>m.player!=me);
 const L=(a,o)=>a.reduce((s,x,i)=>s+(x&&x.toLowerCase()!=(o[i]||'').toLowerCase()&&!fk(x.toLowerCase())?1:0),0);
 let p;
 if(!mine)p=`<div class="pn" style="max-width:560px"><h2>Your Answers</h2>${cats.map((c,i)=>`<label for="a${i}">${i+1}. ${esc(c)}</label><input id="a${i}" class="ans" autocomplete="off">`).join('')}<button class="btn" data-a="answers">Seal &amp; Send</button>${lobbyBtn}</div>`;
 else if(!th)p=`<div class="pn"><h2>Sealed</h2><p><em>Waiting on ${nm(opp())}…</em></p>${lobbyBtn}</div>`;
 else{const A=mine.payload.answers,B=th.payload.answers,x=L(A,B),y=L(B,A);
  p=`<div class="pn" style="max-width:560px"><h2>Results</h2><p>You <span class="big">${x}</span> · ${nm(opp())} <span class="big">${y}</span></p>${cats.map((c,i)=>`<div class="hl"><p><em>${esc(c)}</em></p><div class="gm"><span>You: ${esc(A[i]||'—')}</span></div><div class="gm"><span>${nm(opp())}: ${esc(B[i]||'—')}</span>${B[i]?dbtn(B[i].toLowerCase()):''}</div></div>`).join('')}${fin(x,y)}${lobbyBtn}</div>`}
 shell(`<div class="row"><div class="pn" style="max-width:260px;text-align:center"><h2>The Letter Is</h2><div class="lt">${letter}</div></div>${p}${dbox()}</div>`);
};
VIEW.codemaster=()=>{
 if(!G.p2)return wait();
 const cm=G.p1==me,W=G.seed.words,rv=Object.fromEntries(reveals.map(r=>[r.idx,r.result])),clues=moves.filter(m=>m.payload.clue),lm=moves.at(-1),open=lm&&lm.payload.clue?lm.payload:null;
 const found=reveals.filter(r=>r.result=='a').length,over=G.status=='finished',lost=reveals.some(r=>r.result=='k');
 const cards=W.map((w,i)=>{const c=rv[i]||(cm&&key?key[i]:'');const go=!cm&&!rv[i]&&!over&&open;return `<button class="${c}${cm&&rv[i]?' r':''}" ${go?`data-a="guess" data-v="${i}"`:'disabled'}>${esc(w)}</button>`}).join('');
 const end=over?`<p><em>${found==9?'Victory — all nine agents found.':lost?'A killer was found. You both fall.':'Out of clues. You both fall.'}</em></p>${lobbyBtn}`:'';
 const side=cm?`<div class="pn"><h2>Codemaster</h2><p>Agents found <span class="big">${found}</span> of 9</p><p>Clues used ${clues.length} of ${LIM}</p>${over?end:open?`<p><em>${nm(G.p2)} is guessing: ${esc(open.clue)} · ${open.n}</em></p>`:clues.length>=LIM?'<button class="btn" data-a="finish" data-v="lost">Close the Book</button>':`<label for="cl">Your clue</label><input id="cl" autocomplete="off"><label for="cn">Number</label><input id="cn" type="number" min="1" max="9" value="1"><button class="btn" data-a="clue">Give Clue</button>`}${over?'':lobbyBtn}</div>`
 :`<div class="pn"><h2>Guesser</h2><p>Agents found <span class="big">${found}</span> of 9</p>${over?end:open?`<h2>Current Clue</h2><p class="big">${esc(open.clue)} · ${open.n}</p><button class="btn" data-a="end">End Turn</button>`:'<p><em>Waiting for the clue…</em></p>'}${over?'':lobbyBtn}</div>`;
 shell(`<div class="row"><div class="bd" style="max-width:640px"><div class="cw">${cards}</div></div>${side}</div>`);
};
const TV={A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10,'?':0};
const PREM=(()=>{const m={};[0,7,14,105,119,210,217,224].forEach(i=>m[i]='tw');for(let i=1;i<5;i++)[16*i,14*i+14,210-14*i,224-16*i].forEach(j=>m[j]='dw');m[112]='dw';[20,24,76,80,84,88,136,140,144,148,200,204].forEach(i=>m[i]='tl');[3,11,36,38,45,52,59,92,96,98,102,108,116,122,126,128,132,165,172,179,186,188,213,221].forEach(i=>m[i]='dl');return m})();
SEED.rabble=()=>({bag:shuf('A9B2C2D4E12F2G3H2I9J1K1L4M2N6O8P2Q1R6S4T6U4V2W2X1Y2Z1?2'.match(/[A-Z?]\d+/g).flatMap(x=>Array(+x.slice(1)).fill(x[0])))});
const RB={pend:new Map(),sel:null,sig:-1};
function rstate(){
 const bag=G.seed.bag,racks={[G.p1]:bag.slice(0,7),[G.p2]:bag.slice(7,14)},board=Array(225).fill(null),sc={[G.p1]:0,[G.p2]:0};let ptr=14,passes=0,last=null;
 for(const m of moves){const p=m.payload;if(p.pass){passes++;continue}if(p.words&&p.words.some(fk))continue;passes=0;
  for(const t of p.play){board[t.r*15+t.c]={l:t.l,b:t.b};racks[m.player].splice(racks[m.player].indexOf(t.b?'?':t.l),1)}
  const n=Math.min(p.play.length,bag.length-ptr);racks[m.player].push(...bag.slice(ptr,ptr+n));ptr+=n;sc[m.player]+=p.score;last=m}
 const left=bag.length-ptr,out=left==0&&[G.p1,G.p2].find(x=>!racks[x].length),over=passes>=4||!!out,tot={...sc},sum=r=>r.reduce((s,l)=>s+TV[l],0);
 if(over)for(const x of [G.p1,G.p2]){tot[x]-=sum(racks[x]);if(out==x)tot[x]+=sum(racks[x==G.p1?G.p2:G.p1])*2}
 return{board,racks,tot,left,over,last,turn:moves.length?(moves.at(-1).player==G.p1?G.p2:G.p1):G.p1}
}
function rscore(board,pend){
 const at=i=>pend.get(i)||board[i],idx=[...pend.keys()];if(!idx.length)return{err:'Place some tiles first.'};
 const rs=idx.map(i=>i/15|0),cs=idx.map(i=>i%15),sr=rs.every(r=>r==rs[0]),sc=cs.every(c=>c==cs[0]);
 if(!sr&&!sc)return{err:'Tiles must share a row or column.'};
 const run=(i,d)=>{let s=i;while(d==1?s%15>0&&at(s-1):s>=15&&at(s-15))s-=d;const o=[];for(let k=s;k<225&&at(k);k+=d){o.push(k);if(d==1&&k%15==14)break}return o};
 let W=[];
 if(idx.length==1)W=[run(idx[0],1),run(idx[0],15)].filter(w=>w.length>1);
 else{const d=sr?1:15,w=run(idx[0],d);if(!idx.every(i=>w.includes(i)))return{err:'Tiles must form one unbroken line.'};W=[w,...idx.map(i=>run(i,d==1?15:1)).filter(w=>w.length>1)]}
 if(!W.length||!W[0].length)return{err:'Make a word of two or more letters.'};
 if(board.every(x=>!x)){if(!pend.has(112)||idx.length<2)return{err:'The first word must cover the centre star.'}}
 else if(!W.some(w=>w.some(k=>!pend.has(k))))return{err:'Your word must connect to tiles already on the board.'};
 let total=idx.length==7?50:0;
 for(const w of W){let s=0,m=1;for(const k of w){const t=at(k);let v=t.b?0:TV[t.l];if(pend.has(k)){const p=PREM[k];if(p=='tl')v*=3;if(p=='dl')v*=2;if(p=='dw')m*=2;if(p=='tw')m*=3}s+=v}total+=s*m}
 return{score:total,words:W.map(w=>w.map(k=>at(k).l).join(''))}
}
VIEW.rabble=()=>{
 if(!G.p2)return wait();
 const S=rstate(),mine=S.turn==me&&!S.over&&G.status!='finished';if(RB.sig!=moves.length){RB.pend=new Map();RB.sel=null;RB.sig=moves.length}
 const used=new Set([...RB.pend.values()].map(v=>v.ri)),open=disp.some(d=>!d.verdict&&d.raised_by==me),lw=S.last&&S.last.player!=me?S.last.payload:null;
 const cells=[...Array(225).keys()].map(i=>{const t=RB.pend.get(i);if(t)return `<b class="p" data-a="rpick" data-v="${i}">${t.l}<small>${t.b?0:TV[t.l]}</small></b>`;const b=S.board[i];if(b)return `<b>${b.l}<small>${b.b?0:TV[b.l]}</small></b>`;return `<i class="${PREM[i]||''}" data-a="rput" data-v="${i}"></i>`}).join('');
 const rack=S.racks[me].map((l,ri)=>used.has(ri)?'':`<b class="${RB.sel===ri?'s':''}" data-a="rsel" data-v="${ri}">${l=='?'?'_':l}<small>${TV[l]}</small></b>`).join('');
 const ctl=S.over||G.status=='finished'?fin(S.tot[me],S.tot[opp()]):mine?(open?'<p><em>Settle your dispute first.</em></p>':'<button class="btn" data-a="rplay">Play Word</button><button class="btn ghost" data-a="rrecall">Recall Tiles</button><button class="btn ghost" data-a="rpass">Pass Turn</button>'):`<p><em>Waiting on ${nm(opp())}…</em></p>`;
 const dl=mine&&!open&&lw&&lw.words?`<h2>Last Play</h2><p>${nm(opp())} played for ${lw.score}.</p>${lw.words.map(w=>`<div class="gm"><span>${esc(w)}</span>${dbtn(w)}</div>`).join('')}`:'';
 shell(`<div class="row"><div class="bd" style="max-width:600px"><div class="g g15">${cells}</div><div class="rack">${rack}</div></div><div class="pn"><h2>Scores</h2><p>You — <span class="big">${S.tot[me]}</span></p><p>${nm(opp())} — <span class="big">${S.tot[opp()]}</span></p><p>Tiles in bag: ${S.left}</p>${dl}${ctl}${lobbyBtn}</div>${dbox()}</div>`);
};
const ACT={
 async new(k){const n=$('#me').value.trim();if(!n)return alert('Please enter your name first.');localStorage.setItem('rr_name',n);const {data,error}=await sb.rpc('wg_create_game',{p_kind:k,p_seed:SEED[k](),p_name:n});if(error)return alert(error.message);location.hash=data.code},
 async seat(c){const n=$('#nm').value.trim();if(!n)return alert('Please enter your name.');localStorage.setItem('rr_name',n);const {error}=await sb.rpc('wg_join_game',{p_code:c,p_name:n});if(error){alert(error.message);return}route()},
 async push(){if(!('serviceWorker' in navigator&&'PushManager' in window))return alert('On iPhone: tap Share → Add to Home Screen, then open the game from your home screen and try again.');
  if(!VAPID_PUBLIC_KEY||VAPID_PUBLIC_KEY.startsWith('YOUR'))return alert('Add your VAPID public key to config.js first.');
  const reg=await navigator.serviceWorker.register('sw.js');if(await Notification.requestPermission()!='granted')return alert('Notifications are blocked for this site.');
  const u=VAPID_PUBLIC_KEY.replace(/-/g,'+').replace(/_/g,'/'),raw=atob(u+'='.repeat((4-u.length%4)%4));
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,c=>c.charCodeAt(0))}),j=sub.toJSON();
  const {error}=await sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'});alert(error?error.message:'Turn alerts are on.')},
 rsel(v){RB.sel=RB.sel===+v?null:+v;VIEW.rabble()},
 rput(v){const S=rstate();if(RB.sel==null||S.turn!=me||S.over)return;let l=S.racks[me][RB.sel],b=0;if(l=='?'){l=(prompt('Which letter should the blank be?')||'').toUpperCase().slice(0,1);if(!/[A-Z]/.test(l))return;b=1}RB.pend.set(+v,{l,b,ri:RB.sel});RB.sel=null;VIEW.rabble()},
 rpick(v){RB.pend.delete(+v);VIEW.rabble()},
 rrecall(){RB.pend.clear();VIEW.rabble()},
 async rplay(){const S=rstate(),r=rscore(S.board,RB.pend);if(r.err)return alert(r.err);await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{play:[...RB.pend].map(([i,t])=>({r:i/15|0,c:i%15,l:t.l,b:t.b})),words:r.words,score:r.score}});refresh()},
 async rpass(){if(!confirm('Pass your turn?'))return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{pass:true}});refresh()},
 join(){const c=$('#jc').value.trim().toUpperCase();if(c.length==4)location.hash=c},
 async copy(){await navigator.clipboard.writeText(location.origin+location.pathname+'#'+G.code);alert('Invite link copied')},
 async words(){const raw=[...new Set($('#w').value.toUpperCase().split(/[^A-Z]+/).filter(w=>w.length>=3))];const ok=raw.filter(w=>fits(w,G.seed.board)),bad=raw.filter(w=>!ok.includes(w));
  if(bad.length&&!confirm('Not on the board, dropped: '+bad.join(', ')+'. Submit the rest?'))return;
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{words:ok}});refresh()},
 async answers(){const a=[...document.querySelectorAll('.ans')].map(i=>i.value.trim()).map(v=>v&&v[0].toUpperCase()==G.seed.letter?v:'');
  if(a.some((v,i)=>!v&&document.querySelectorAll('.ans')[i].value.trim())&&!confirm('Some answers don’t start with '+G.seed.letter+' and will be dropped. Send anyway?'))return;
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{answers:a}});refresh()},
 async dispute(v){await sb.from('wg_disputes').insert({game_id:G.id,item:v,raised_by:me});refresh()},
 async rule(v,t){await sb.rpc('wg_rule_dispute',{p_id:+t.dataset.id,p_verdict:v});refresh()},
 async clue(){const c=$('#cl').value.trim().toUpperCase(),n=+$('#cn').value;
  if(!/^[A-Z'-]+$/.test(c)||G.seed.words.includes(c))return alert('One word, and not one on the board.');
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{clue:c,n}});refresh()},
 async end(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{end:true}});refresh()},
 async guess(v){const {error}=await sb.rpc('wg_cm_guess',{p_game:G.id,p_idx:+v});if(error)alert(error.message);refresh()},
 async finish(v){let w=null,s=null;
  if(v!='lost'){const [a,b]=v.split('|').map(Number);w=a>b?names[me]:b>a?names[opp()]:'A draw';s=`${Math.max(a,b)} – ${Math.min(a,b)}`}
  await sb.rpc('wg_finish_game',{p_game:G.id,p_victors:w,p_score:s});refresh()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&!t.disabled)ACT[t.dataset.a](t.dataset.v,t)});
init();
