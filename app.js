const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
const KINDS={ogle:['Ogle','a game of hidden words'],categories:['Categories','a game of quick wit'],codemaster:['Codemaster','win together, or fall together'],rabble:['Rabble','a game of tiles and cunning']};
const DICE='AAEEGN ABBJOO ACHOPS AFFKPS AOOTTW CIMOTU DEILRX DELRVY DISTTY EEGHNW EEINSU EHRTVW EIOSST ELRTTY HIMNQU HLNNRZ'.split(' ');
const CATS=`Boy’s name|Girl’s name|City|Country|U.S. state|Animal|Bird|Fish|Insect|Flower|Tree|Vegetable|Fruit|Something cold|Something hot|Something sweet|Something sour|Something spicy|Something crunchy|Something sticky|Something round|Something soft|Something loud|Something shiny|Something expensive|Something cheap|Something heavy|Something fragile|Something in the kitchen|Something in the bathroom|Something in the bedroom|Something in a garage|Something in a toolbox|Something in a purse|Something in a backpack|Something at the beach|Something at a zoo|Something at a circus|Something at a wedding|Something at a funeral|Something at a carnival|Something at the airport|Something in a hospital|Something in a classroom|Something in a library|Something in a museum|Something in a park|Something in the sky|Something in the ocean|Something in a forest|Something in the desert|Something you wear|Something you wear on your feet|Something you wear on your head|Something you can sit on|Something you can ride|Something you can fold|Something you can break|Something you can plug in|Something you can read|Something you eat with a spoon|Something you drink|Something you plant|Something you collect|Something you throw away|Something you lose|Something you save|Something you do on a date|Something you do at night|Something you do on vacation|Something you do to relax|Something you do at work|Something you do with your hands|Something you do in the rain|Something you do in the snow|Something with wheels|Something with wings|Something with a shell|Something with stripes|Something with spots|Something green|Something red|Something yellow|Something blue|Something white|Something black|Something orange|Something purple|Something brown|Something pink|Something gold|Something that flies|Something that swims|Something that glows|Something that melts|Something that bounces|Something that spins|Something that squeaks|Something that smells good|Something that smells bad|Something slippery|Something sharp|Something scary|Something funny|Something old|Something tiny|Something huge|Something tall|A famous book|A famous movie|A famous actor|A famous singer|A famous athlete|A famous scientist|A famous painter|A famous leader|A famous building|A famous river|A famous mountain|A famous island|A famous landmark|A cartoon character|A fairy-tale character|A superhero|A villain|A video game|A board game|A card game|A sport|An Olympic event|A kind of dance|A musical instrument|A kind of music|A song title|A TV show|A magazine|A school subject|A profession|A job with a uniform|A tool|A kitchen appliance|A piece of furniture|A piece of clothing|A kind of hat|A kind of shoe|A kind of bread|A kind of cheese|A kind of pasta|A kind of soup|A kind of candy|A kind of cookie|A kind of cake|A breakfast food|A snack food|A fast food|A dessert|An ice cream flavor|A pizza topping|A sandwich filling|A spice or herb|A drink with ice|A breed of dog|A breed of cat|A farm animal|A wild animal|A baby animal|A reptile|A sea creature|A dinosaur|A gemstone|A metal|A fabric|A shape|A unit of measure|A vehicle|A holiday|A month or season|A body part|An illness|A hobby|A toy|A street name|A type of store|A restaurant chain|A brand name|A language|A currency|A planet or star|A weather event|A natural disaster|A type of boat|A type of building|A room in a house|A thing with a handle|A thing with a button|A thing with a lid|A thing with a cord|A thing with a screen|A thing with keys|A thing with a string|A thing with pages|A thing with teeth|A thing with a tail`.split('|');
const WORDS='Apple Arrow Baker Ball Bank Bark Bat Bear Bell Berry Bill Bird Block Board Bolt Bomb Bottle Bridge Brush Button Cake Camp Cap Card Carrot Castle Cat Chair Check Chest Church Circle Clock Cloud Club Coat Code Comb Cook Cotton Court Cow Crane Crown Cup Desk Diamond Doctor Dog Door Dragon Dress Drum Duck Eagle Engine Eye Fair Fan Farm Fence Field Fire Fish Flag Fly Foot Forest Fork Fox Frog Game Garden Gas Ghost Glass Glove Gold Grass Ham Hand Hawk Heart Hood Horn Horse Ice Iron Jack Jam Judge Key King Kite Knife Knight Lab Lamp Lead Leaf Lemon Light Line Lion Lock Mail Match Mine Mint Moon Mouse Nail Net Night Note Nut Oil Olive Opera Orange Palm Pan Paper Park Party Pass Pen Pie Pilot Pin Pipe Pitch Plane Plate Pool Post Press Queen Rabbit Ring River Robin Rock Rose Row Ruler Saw Scale School Screen Seal Ship Shoe Shop Sink Slip Snow Soldier Spider Spring Star Stick Stock Storm Table Tag Tail Temple Tick Tie Tower Track Train Trip Tube Wall Watch Wave Web Whale Wind Wing Wolf Yard'.split(' ');
const SEED={
 ogle:()=>({board:shuf(DICE).map(d=>{const c=d[Math.floor(Math.random()*6)];return c=='Q'?'Qu':c})}),
 categories:(prev=[])=>{const A=[...'ABCDEFGHIJKLMNOPRSTW'],ul=prev.map(p=>p.letter),uc=prev.flatMap(p=>p.cats||[]);const L=A.filter(l=>!ul.includes(l));let P=CATS.filter(c=>!uc.includes(c));if(P.length<10)P=CATS;return{letter:shuf(L.length?L:A)[0],cats:shuf(P).slice(0,10)}},
 codemaster:()=>({words:shuf(WORDS).slice(0,25).map(w=>w.toUpperCase())}),
 rabble:()=>({bag:shuf('A9B2C2D4E12F2G3H2I9J1K1L4M2N6O8P2Q1R6S4T6U4V2W2X1Y2Z1?2'.match(/[A-Z?]\d+/g).flatMap(x=>Array(+x.slice(1)).fill(x[0])))})};
const CAT_SECS=60,OGLE_SECS=180,LIM=5,saved=()=>localStorage.getItem('rr_name')||'';
let me=null,G=null,PL=[],moves=[],disp=[],reveals=[],names={},key=null,timer=null,lastSig='',CUR=1,started=false;
const svg=(k,h,c='o')=>{const o=ORN[k];return `<svg class="${c}" viewBox="0 0 ${o.w} ${o.h}" height="${h}" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${o.d}"/></svg>`};
const frame=(t,s,b)=>`<div class="pg"><div class="fr">${['tl','tr','bl','br'].map(c=>svg('cn',120,'cn k-'+c)).join('')}${svg('fl',60)}<h1>${t}</h1><p class="sub">${s}</p>${svg('dv',44)}${b}${svg('dv',56)}</div></div>`;
const shell=b=>{const y=scrollY;document.body.dataset.t=G.kind;app.innerHTML=frame(KINDS[G.kind][0],KINDS[G.kind][1],b);scrollTo(0,y);tick()};
const nm=id=>esc(names[id]||'…'),opp=()=>(PL.find(x=>x.player!=me)||{}).player;
const fatal=m=>app.innerHTML=frame('Alas','something went wrong',`<div class="row"><div class="pn"><p>${esc(m)}</p><p><em>Check config.js, run wg_schema.sql, and enable anonymous sign-ins in Supabase.</em></p></div></div>`);
async function pushOn(){try{if(!('serviceWorker' in navigator&&'PushManager' in window))return false;const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();
 if(sub){const j=sub.toJSON();sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'}).then(()=>{})}return !!sub}catch(e){return false}}

/* ---------- login ---------- */
function showLogin(){clearInterval(timer);G=null;me=null;document.body.dataset.t='lobby';
 app.innerHTML=frame('Welcome','who is playing?',`<div class="row"><div class="pn"><h2>Your Name</h2><p>Type your name to see all your games, on any device. There is no password, so use the same spelling every time.</p><label for="nm">Name</label><input id="nm" maxlength="20" value="${esc(saved())}" autocomplete="name" autocapitalize="words"><button class="btn" data-a="login">Enter</button></div></div>`)}
async function login(n){const {data,error}=await sb.rpc('wg_login',{p_name:n});if(error){alert(error.message);return false}me=data;localStorage.setItem('rr_name',n.trim());return true}
async function init(){
 try{let {data:{session}}=await sb.auth.getSession();if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error}
  if(saved()&&await login(saved()))return start();showLogin()}catch(e){fatal(e.message||e)}}
const start=()=>{if(!started){started=true;addEventListener('hashchange',route)}route()};
async function route(){
 clearInterval(timer);if(!me)return showLogin();
 const c=location.hash.slice(1).toUpperCase();if(c.length!=4)return lobby();
 let {data:g}=await sb.from('wg_games').select('*').eq('code',c).maybeSingle();
 if(!g){const r=await sb.rpc('wg_join_game',{p_code:c,p_name:saved()});if(r.error){alert(r.error.message);location.hash='';return}g=r.data}
 G=g;key=null;lastSig='';RB.pend=new Map();RB.sel=null;RB.ex=null;RB.sig=-1;await draw();timer=setInterval(draw,4000);
}

/* ---------- lobby ---------- */
const hidLocal=()=>{try{return JSON.parse(localStorage.getItem('rr_hid')||'[]')}catch(e){return[]}};
function turnOf(g,mv,pl){
 if(g.status=='finished')return'finished';
 if(g.status=='waiting')return`waiting for players (${pl.length}/${g.max_players})`;
 if(g.kind=='rabble'){const r=mv.filter(m=>m.payload.play||m.payload.pass||m.payload.exch).at(-1),i=r?pl.findIndex(x=>x.player==r.player):-1;return pl[(i+1)%pl.length].player==me?'your turn':"opponent's turn"}
 if(g.kind=='codemaster'){const lm=mv.at(-1),open=lm&&lm.payload.clue;return(open?g.p2==me:g.p1==me)?'your turn':"opponent's turn"}
 const c=rnds(g,mv,pl),n=c.cur.n,did=p=>sub(n,p,mv);
 if(!did(me))return'your turn';if(!pl.every(x=>did(x.player)))return'waiting on others';
 if(c.req)return c.req.by!=me&&!c.req.acc.has(me)?'your turn':'waiting on others';return'round complete'}
function rowLabel(x,mv,pl){const on=pl.filter(p=>p.player!=me).map(p=>esc(p.name)).join(', '),t=turnOf(x,mv,pl);
 return(on?`${KINDS[x.kind][0]} with ${on}`:`${KINDS[x.kind][0]} — invite ${x.code}`)+`<br><em>${t=='your turn'?'<strong>your turn</strong>':t}</em>`}
async function lobby(){
 G=null;document.body.dataset.t='lobby';const on=await pushOn();
 const [g,w,h]=await Promise.all([sb.from('wg_games').select('*').order('created_at',{ascending:false}).limit(40),sb.from('wg_winners').select('*').order('won_at',{ascending:false}).limit(8),sb.from('wg_hidden').select('game_id')]);
 const hid=new Set([...(h.data||[]).map(r=>r.game_id),...hidLocal()]),vis=(g.data||[]).filter(x=>!hid.has(x.id)).slice(0,12),MV={},GP={};
 if(vis.length){const ids=vis.map(x=>x.id),[m,p]=await Promise.all([sb.from('wg_moves').select('game_id,player,payload,id').in('game_id',ids).order('id'),sb.from('wg_game_players').select('*').in('game_id',ids).order('seat')]);
  (m.data||[]).forEach(x=>(MV[x.game_id]=MV[x.game_id]||[]).push(x));(p.data||[]).forEach(x=>(GP[x.game_id]=GP[x.game_id]||[]).push(x))}
 app.innerHTML=frame('The Lobby','begin a game, or enter an invite code',`<p class="sub">Playing as <strong>${esc(saved())}</strong> <button class="lnk" data-a="logout">Not you?</button></p><div class="lg">
 <div class="pn"><h2>Join with a Code</h2><label for="jc">4-character code</label><input id="jc" class="cin" maxlength="4" autocapitalize="characters"><button class="btn" data-a="join">Enter the Game</button></div>
 <div class="pn"><h2>Begin a New Game</h2><label for="np">Players (Ogle, Rabble, Categories)</label><select id="np"><option>2</option><option>3</option><option>4</option></select>${['ogle','rabble','categories','codemaster'].map(k=>`<button class="btn" data-a="new" data-v="${k}">${KINDS[k][0]}</button>`).join('')}</div>
 <div class="pn"><h2>Your Games</h2>${vis.map(x=>`<div class="gm hl"><a href="#${x.code}" style="color:inherit;text-decoration:none;flex:1">${rowLabel(x,MV[x.id]||[],GP[x.id]||[])}</a><button class="lnk" data-a="hide" data-v="${x.id}">Remove</button></div>`).join('')||'<p><em>None yet.</em></p>'}${on?'':'<button class="btn ghost" data-a="push">Turn Alerts</button>'}</div>
 <div class="pn"><h2>Hall of Winners</h2>${(w.data||[]).map(x=>`<div class="hl"><div class="gm"><span>${KINDS[x.kind][0]} — ${esc(x.victors)}</span><em>${new Date(x.won_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</em></div><p>${esc(x.score||'')}</p></div>`).join('')||'<p><em>No victors yet.</em></p>'}</div></div>`);
}

/* ---------- game loading ---------- */
async function load(){
 const id=G.id,[m,d,r,g,p]=await Promise.all([sb.from('wg_moves').select('*').eq('game_id',id).order('id'),sb.from('wg_disputes').select('*').eq('game_id',id).order('id'),sb.from('wg_cm_reveals').select('*').eq('game_id',id),sb.from('wg_games').select('*').eq('id',id).single(),sb.from('wg_game_players').select('*').eq('game_id',id).order('seat')]);
 moves=m.data||[];disp=d.data||[];reveals=r.data||[];if(g.data)G=g.data;PL=p.data||[];names=Object.fromEntries(PL.map(x=>[x.player,x.name]));
 if(G.kind=='codemaster'&&G.p1==me&&!key){const {data:k}=await sb.from('wg_cm_keys').select('key').eq('game_id',id).maybeSingle();key=k&&k.key}
}
async function draw(){
 if(!G)return;await load();
 const sig=[moves.length,disp.map(d=>d.verdict).join(),reveals.length,G.status,PL.length,!!key].join('|');
 if(sig===lastSig)return;lastSig=sig;VIEW[G.kind]();
}
const refresh=async()=>{lastSig='';await draw()};
const wait=()=>shell(`<div class="row"><div class="pn"><h2>Invite Players</h2><p>${PL.length} of ${G.max_players} have joined.</p><div class="code">${G.code}</div><p>Send them this link, or the code:</p><input readonly value="${location.origin+location.pathname}#${G.code}"><button class="btn" data-a="copy">Copy Invite Link</button><a class="btn ghost" href="#">The Lobby</a></div></div>`);
const fk=i=>disp.some(d=>d.item==i&&d.verdict=='fake');
const dbtn=i=>disp.some(d=>d.item==i)?'<em>disputed</em>':`<button class="lnk" data-a="dispute" data-v="${esc(i)}">Dispute</button>`;
const dbox=()=>disp.filter(d=>!d.verdict).map(d=>d.raised_by==me?`<div class="pn"><h2>Disputed: ${esc(d.item)}</h2><p>Look it up, then give your verdict.</p><a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/search?q=define+${encodeURIComponent(d.item)}">Look It Up</a><button class="btn" data-a="rule" data-v="real" data-id="${d.id}">It’s a Real Word</button><button class="btn ghost" data-a="rule" data-v="fake" data-id="${d.id}">It’s Not a Word</button></div>`:`<div class="pn"><h2>Disputed: ${esc(d.item)}</h2><p><em>${nm(d.raised_by)} is checking this one…</em></p></div>`).join('');
const lobbyBtn='<a class="btn ghost" href="#">The Lobby</a>';
const pts=w=>w.length>=8?11:[0,0,0,1,1,2,3,5][w.length];
const K=p=>p+G.id+'_'+CUR;
const finData=(m,unit)=>{const e=PL.map(x=>[x.name,m[x.player]||0]).sort((a,b)=>b[1]-a[1]),top=e.filter(x=>x[1]==e[0][1]);return{w:top.length>1?'A draw':e[0][0],s:e.map(x=>x[1]).join(' – ')+(unit?' '+unit:'')}};
const finBtn=v=>G.status=='finished'?'<p><em>Game over.</em></p>':`<button class="btn" data-a="finish" data-v="${esc(JSON.stringify(v))}">Finish Game</button>`;

/* ---------- rounds (Ogle and Categories) ---------- */
function rnds(g=G,mv=moves,pl=PL){const R=[{n:1,seed:g.seed}];let req=null,rej=null;
 for(const m of mv){const p=m.payload;
  if(p.rematch){req={by:m.player,n:p.rematch.n,seed:p.rematch.seed,acc:new Set()};rej=null}
  else if(typeof p.accept=='number'&&req&&req.n==p.accept&&req.n==R.length+1&&req.by!=m.player){req.acc.add(m.player);if(pl.every(x=>x.player==req.by||req.acc.has(x.player))){R.push({n:req.n,seed:req.seed});req=null;rej=null}}
  else if(typeof p.reject=='number'&&req&&req.n==p.reject&&req.by!=m.player){rej={...req,rb:m.player};req=null}}
 return{R,req,rej,cur:R.at(-1)}}
const ctx=()=>{const c=rnds();CUR=c.cur.n;return c};
const sub=(n,p,mv=moves)=>mv.find(m=>m.player==p&&(m.payload.r||1)==n&&(m.payload.words||m.payload.answers));
const ogSc=(a,o)=>a.filter(w=>!o.includes(w)&&!fk(w)).reduce((s,w)=>s+pts(w),0);
const catSc=(a,os)=>a.reduce((s,x,i)=>s+(x&&!os.some(o=>(o[i]||'').toLowerCase()==x.toLowerCase())&&!fk(x.toLowerCase())?1:0),0);
function scores(n){const ss=PL.map(x=>sub(n,x.player));if(ss.some(s=>!s))return null;const out={};
 PL.forEach((x,i)=>{const o=ss.filter((_,j)=>j!=i).map(s=>s.payload);out[x.player]=G.kind=='ogle'?ogSc(ss[i].payload.words,o.flatMap(y=>y.words)):catSc(ss[i].payload.answers,o.map(y=>y.answers))});return out}
function tally(R){const t=Object.fromEntries(PL.map(x=>[x.player,0]));for(const r of R){const s=scores(r.n);if(!s)continue;const v=Object.values(s),mx=Math.max(...v);if(v.filter(x=>x==mx).length==1)t[Object.keys(s).find(k=>s[k]==mx)]++}return t}
function matchBox(c,done){
 const t=tally(c.R),sc=scores(c.cur.n);
 let h=`<h2>Match</h2><p>Round ${c.cur.n} · ${PL.map(x=>`${x.player==me?'You':esc(x.name)} ${t[x.player]}`).join(' · ')}</p>`;
 if(G.status=='finished')return h+'<p><em>Match over.</em></p>';
 if(!done)return h;
 const q=c.req;
 if(q){const wt=PL.filter(x=>x.player!=q.by&&!q.acc.has(x.player));
  if(q.by==me)h+=`<p><em>Waiting for ${wt.map(x=>esc(x.name)).join(', ')} to accept another round…</em></p>`;
  else if(!q.acc.has(me))h+=`<p>${nm(q.by)} wants another round.</p><button class="btn" data-a="racc">Accept</button><button class="btn ghost" data-a="rrej">Decline</button>`;
  else h+='<p><em>You accepted. Waiting for the others…</em></p>'}
 else h+=(c.rej&&c.rej.by==me?`<p><em>${nm(c.rej.rb)} declined another round.</em></p>`:'')+'<button class="btn" data-a="rnew">New Round</button>';
 const v=c.R.length>1?finData(t,'rounds'):finData(sc);
 return h+`<button class="btn ghost" data-a="finish" data-v="${esc(JSON.stringify(v))}">End Match</button>`}
const waitNames=n=>PL.filter(x=>!sub(n,x.player)).map(x=>nm(x.player)).join(', ');

/* ---------- Ogle ---------- */
const OG={id:null,path:[]};
const ow=()=>JSON.parse(localStorage.getItem(K('rr_ow_'))||'[]'),adj=(a,b)=>Math.abs((a>>2)-(b>>2))<2&&Math.abs((a&3)-(b&3))<2;
function ogPaint(){const l=OG.path.at(-1);document.querySelectorAll('.g4 b[data-a="otap"]').forEach((e,i)=>{e.className=OG.path.includes(i)?(i===l?'u l':'u'):''});const c=document.querySelector('.curw');if(c)c.innerHTML=ocur()||'&nbsp;'}
const ocur=()=>OG.path.map(i=>rnds().cur.seed.board[i].toUpperCase()).join('');
const wl=(L,O,d)=>L.map(w=>{const sh=O.includes(w),f=fk(w),pt=sh||f?0:pts(w);return `<div class="gm"><span${pt?'':' style="text-decoration:line-through;opacity:.7"'}>${esc(w)}</span><span>${pt}${sh?' · both found':f?' · not a word':''} ${d&&!sh?dbtn(w):''}</span></div>`}).join('')||'<p><em>None.</em></p>';
const VIEW={};
VIEW.ogle=()=>{
 if(G.status=='waiting')return wait();
 const c=ctx();if(OG.id!=G.id+'_'+CUR){OG.id=G.id+'_'+CUR;OG.path=[]}
 const b=c.cur.seed.board,mine=sub(CUR,me),done=PL.every(x=>sub(CUR,x.player)),t0=+localStorage.getItem(K('rr_t_'))||0,live=!mine&&t0;
 const mb=CUR>1||G.status=='finished'?`<div class="pn">${matchBox(c,false)}</div>`:'';
 let p;
 if(!mine&&!t0)p=`<div class="pn"><h2>Ready?</h2><p>You will have ${OGLE_SECS/60} minutes once you start. Tap letters, or type words and press Enter. When the clock runs out, your words are sent automatically.</p><button class="btn" data-a="start">Start the Clock</button>${lobbyBtn}</div>`;
 else if(!mine){const w=ow();p=`<div class="pn"><h2>Your Word</h2><label for="ot">Type a word and press Enter, or tap tiles</label><input id="ot" autocomplete="off" autocapitalize="characters" spellcheck="false"><p id="oerr" style="min-height:1.2em;margin:4px 0"></p><div class="curw">${ocur()||'&nbsp;'}</div><button class="btn" data-a="oadd">Add Word</button><button class="btn ghost" data-a="oclr">Clear</button><h2 style="margin-top:20px">Words Found (${w.length})</h2>${w.map(x=>`<div class="gm"><span>${esc(x)}</span><button class="lnk" data-a="orm" data-v="${esc(x)}">Remove</button></div>`).join('')||'<p><em>None yet.</em></p>'}<button class="btn" data-a="words">Submit Words</button>${lobbyBtn}</div>`}
 else if(!done)p=`<div class="pn"><h2>Submitted</h2><p><em>Waiting on ${waitNames(CUR)}…</em></p>${lobbyBtn}</div>`;
 else{const sc=scores(CUR);
  p=`<div class="pn"><h2>Round ${CUR} Results</h2>${PL.map(x=>`<p>${x.player==me?'You':nm(x.player)} <span class="big">${sc[x.player]}</span></p>`).join('')}${PL.map(x=>{const L=sub(CUR,x.player).payload.words,O=PL.filter(y=>y.player!=x.player).flatMap(y=>sub(CUR,y.player).payload.words);return `<h2>${x.player==me?'Your':nm(x.player)+'’s'} Words</h2>${wl(L,O,x.player!=me)}`}).join('')}</div><div class="pn">${matchBox(c,true)}${lobbyBtn}</div>`}
 const last=OG.path.at(-1);
 const tiles=b.map((c,i)=>live?`<b class="${OG.path.includes(i)?(i===last?'u l':'u'):''}" data-a="otap" data-v="${i}">${c}</b>`:`<b>${t0||mine?c:'?'}</b>`).join('');
 shell(`<div class="row"><div class="bd" style="max-width:420px">${live?'<p class="big" id="cdown" style="text-align:center"></p>':''}<div class="g g4">${tiles}</div></div>${p}${done&&mine?'':mb}${dbox()}</div>`);
};

/* ---------- Categories ---------- */
VIEW.categories=()=>{
 if(G.status=='waiting')return wait();
 const c=ctx(),{letter,cats}=c.cur.seed,mine=sub(CUR,me),done=PL.every(x=>sub(CUR,x.player)),t0=+localStorage.getItem(K('rr_t_'))||0;
 const mb=CUR>1||G.status=='finished'?`<div class="pn">${matchBox(c,false)}</div>`:'';
 let p;
 if(!mine&&!t0)p=`<div class="pn" style="max-width:560px"><h2>Ready?</h2><p>You will have ${CAT_SECS} seconds once you start. When the clock runs out, your answers are sent automatically.</p><button class="btn" data-a="start">Start the Clock</button>${lobbyBtn}</div>`;
 else if(!mine){const dr=JSON.parse(localStorage.getItem(K('rr_d_'))||'[]');p=`<div class="pn" style="max-width:560px"><h2>Your Answers</h2>${cats.map((c,i)=>`<label for="a${i}">${i+1}. ${esc(c)}</label><input id="a${i}" class="ans" autocomplete="off" value="${esc(dr[i]||'')}">`).join('')}<button class="btn" data-a="answers">Seal &amp; Send</button>${lobbyBtn}</div>`}
 else if(!done)p=`<div class="pn"><h2>Sealed</h2><p><em>Waiting on ${waitNames(CUR)}…</em></p>${lobbyBtn}</div>`;
 else{const sc=scores(CUR);
  p=`<div class="pn" style="max-width:560px"><h2>Round ${CUR} Results</h2>${PL.map(x=>`<p>${x.player==me?'You':nm(x.player)} <span class="big">${sc[x.player]}</span></p>`).join('')}${cats.map((cat,i)=>`<div class="hl"><p><em>${esc(cat)}</em></p>${PL.map(x=>{const a=sub(CUR,x.player).payload.answers[i];return `<div class="gm"><span>${x.player==me?'You':nm(x.player)}: ${esc(a||'—')}</span>${a&&x.player!=me?dbtn(a.toLowerCase()):''}</div>`}).join('')}</div>`).join('')}</div><div class="pn">${matchBox(c,true)}${lobbyBtn}</div>`}
 shell(`<div class="row"><div class="pn" style="max-width:260px;text-align:center"><h2>The Letter Is</h2><div class="lt">${mine||t0?letter:'?'}</div>${!mine&&t0?'<p class="big" id="cdown"></p>':''}</div>${p}${done&&mine?'':mb}${dbox()}</div>`);
};

VIEW.codemaster=()=>{
 if(G.status=='waiting')return wait();
 const cm=G.p1==me,W=G.seed.words,rv=Object.fromEntries(reveals.map(r=>[r.idx,r.result])),clues=moves.filter(m=>m.payload.clue),lm=moves.at(-1),open=lm&&lm.payload.clue?lm.payload:null;
 const found=reveals.filter(r=>r.result=='a').length,over=G.status=='finished',lost=reveals.some(r=>r.result=='k');
 const cards=W.map((w,i)=>{const c=rv[i]||(cm&&key?key[i]:'');const go=!cm&&!rv[i]&&!over&&open;return `<button class="${c}${cm&&rv[i]?' r':''}" ${go?`data-a="guess" data-v="${i}"`:'disabled'}>${esc(w)}</button>`}).join('');
 function cmRematch(){const q=[...moves].reverse().find(m=>m.payload.rematch||m.payload.accept||m.payload.reject),o=nm(opp());
 if(q&&q.payload.accept)return`<a class="btn" href="#${esc(q.payload.code)}">Go to the Next Game</a>`;
 if(q&&q.payload.rematch)return q.player==me?`<p><em>Waiting for ${o} to accept another game…</em></p>`:`<p>${o} wants to play again.</p><button class="btn" data-a="cmacc">Accept</button><button class="btn ghost" data-a="cmrej">Decline</button>`;
 return(q&&q.payload.reject&&q.player!=me?`<p><em>${o} declined.</em></p>`:'')+'<button class="btn" data-a="cmrq">Play Again</button>'}
 const end=over?`<p><em>${found==9?'Victory — all nine agents found.':lost?'A killer was found. You both fall.':'Out of turns. You both fall.'}</em></p>${cmRematch()}${lobbyBtn}`:'';
 const side=cm?`<div class="pn"><h2>Codemaster</h2><p>Agents found <span class="big">${found}</span> of 9</p><p>Turns used ${clues.length} of ${LIM}</p>${over?end:open?`<p><em>${nm(G.p2)} is guessing: ${esc(open.clue)} · ${open.n}</em></p>`:clues.length>=LIM?'<button class="btn" data-a="finish" data-v="lost">Close the Book</button>':`<label for="cl">Your clue</label><input id="cl" autocomplete="off"><label for="cn">Number</label><input id="cn" type="number" min="1" max="9" value="1"><button class="btn" data-a="clue">Give Clue</button>`}${over?'':lobbyBtn}</div>`
 :`<div class="pn"><h2>Guesser</h2><p>Agents found <span class="big">${found}</span> of 9</p><p>Turn ${Math.min(open?clues.length:clues.length+1,LIM)} of ${LIM}</p>${over?end:open?`<h2>Current Clue</h2><p class="big">${esc(open.clue)} · ${open.n}</p><button class="btn" data-a="end">End Turn</button>`:'<p><em>Waiting for the clue…</em></p>'}${over?'':lobbyBtn}</div>`;
 shell(`<div class="row"><div class="bd" style="max-width:640px"><div class="cw">${cards}</div></div>${side}</div>`);
};


/* ---------- Rabble ---------- */
const TV={A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10,'?':0};
const PREM=(()=>{const m={};[0,7,14,105,119,210,217,224].forEach(i=>m[i]='tw');for(let i=1;i<5;i++)[16*i,14*i+14,210-14*i,224-16*i].forEach(j=>m[j]='dw');m[112]='dw';[20,24,76,80,84,88,136,140,144,148,200,204].forEach(i=>m[i]='tl');[3,11,36,38,45,52,59,92,96,98,102,108,116,122,126,128,132,165,172,179,186,188,213,221].forEach(i=>m[i]='dl');return m})();
const RB={pend:new Map(),sel:null,ex:null,sig:-1};
function rstate(){
 const ids=PL.map(x=>x.player),n=ids.length,bag=G.seed.bag,racks={},board=Array(225).fill(null),sc={};
 ids.forEach((id,i)=>{racks[id]=bag.slice(i*7,i*7+7);sc[id]=0});
 const q=bag.slice(n*7);let passes=0,last=null,raw=null;
 for(const m of moves){const p=m.payload;if(!(p.play||p.pass||p.exch))continue;raw=m;const r=racks[m.player];if(!r)continue;
  if(p.pass){passes++;continue}
  if(p.exch){for(const l of p.exch){const i=r.indexOf(l);if(i>=0)r.splice(i,1)}r.push(...q.splice(0,p.exch.length));q.push(...p.exch);passes++;continue}
  if(p.words&&p.words.some(fk))continue;
  passes=0;for(const t of p.play){board[t.r*15+t.c]={l:t.l,b:t.b};const i=r.indexOf(t.b?'?':t.l);if(i>=0)r.splice(i,1)}
  r.push(...q.splice(0,p.play.length));sc[m.player]+=p.score;last=m}
 const sum=r=>r.reduce((s,l)=>s+TV[l],0),out=q.length==0&&ids.find(id=>!racks[id].length),over=passes>=6||!!out,tot={...sc};
 if(over){ids.forEach(id=>tot[id]-=sum(racks[id]));if(out)tot[out]+=ids.reduce((s,id)=>s+(id==out?0:sum(racks[id])),0)}
 return{board,racks,tot,left:q.length,over,last,lastRaw:raw,turn:raw?ids[(ids.indexOf(raw.player)+1)%n]:ids[0]}
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
 if(G.status=='waiting')return wait();
 const S=rstate(),mine=S.turn==me&&!S.over&&G.status!='finished';if(RB.sig!=moves.length){RB.pend=new Map();RB.sel=null;RB.ex=null;RB.sig=moves.length}
 const used=new Set([...RB.pend.values()].map(v=>v.ri)),open=disp.some(d=>!d.verdict&&d.raised_by==me),lw=S.lastRaw&&S.lastRaw.player!=me&&S.lastRaw.payload.play?S.lastRaw.payload:null;
 const cells=[...Array(225).keys()].map(i=>{const t=RB.pend.get(i);if(t)return `<b class="p" data-a="rpick" data-v="${i}">${t.l}<small>${t.b?0:TV[t.l]}</small></b>`;const b=S.board[i];if(b)return `<b>${b.l}<small>${b.b?0:TV[b.l]}</small></b>`;return `<i class="${PREM[i]||''}" data-a="rput" data-v="${i}"></i>`}).join('');
 const rack=(S.racks[me]||[]).map((l,ri)=>used.has(ri)?'':`<b class="${(RB.ex?RB.ex.has(ri):RB.sel===ri)?'s':''}" data-a="rsel" data-v="${ri}">${l=='?'?'_':l}<small>${TV[l]}</small></b>`).join('');
 let ctl;
 if(S.over||G.status=='finished')ctl=finBtn(finData(S.tot));
 else if(!mine)ctl=`<p><em>Waiting on ${nm(S.turn)}…</em></p>`;
 else if(open)ctl='<p><em>Settle your dispute first.</em></p>';
 else if(RB.ex)ctl=`<p>Tap the tiles you want to swap.</p><button class="btn" data-a="rexch">Swap ${RB.ex.size} Tile${RB.ex.size==1?'':'s'}</button><button class="btn ghost" data-a="rexc">Cancel</button>`;
 else ctl=`<button class="btn" data-a="rplay">Play Word</button><button class="btn ghost" data-a="rrecall">Recall Tiles</button>${S.left>=7?'<button class="btn ghost" data-a="rexmode">Exchange Tiles</button>':'<p><em>Exchanging needs 7 or more tiles in the bag.</em></p>'}<button class="btn ghost" data-a="rpass">Pass Turn</button>`;
 const dl=mine&&!open&&lw&&lw.words?`<h2>Last Play</h2><p>${nm(S.lastRaw.player)} played for ${lw.score}.</p>${lw.words.map(w=>`<div class="gm"><span>${esc(w)}</span>${dbtn(w)}</div>`).join('')}`:S.lastRaw&&S.lastRaw.payload.exch?`<p><em>${nm(S.lastRaw.player)} exchanged tiles.</em></p>`:'';
 shell(`<div class="row"><div class="bd" style="max-width:600px"><div class="g g15">${cells}</div><div class="key"><span><i class="tw"></i>Triple Word</span><span><i class="dw"></i>Double Word</span><span><i class="tl"></i>Triple Letter</span><span><i class="dl"></i>Double Letter</span></div><div class="rack">${rack}</div></div><div class="pn"><h2>Scores</h2>${PL.map(x=>`<p>${x.player==me?'You':nm(x.player)} — <span class="big">${S.tot[x.player]}</span>${S.turn==x.player&&!S.over?' (to play)':''}</p>`).join('')}<p>Tiles in bag: ${S.left}</p>${dl}${ctl}${lobbyBtn}</div>${dbox()}</div>`);
};

/* ---------- actions ---------- */
const trace=(w,b)=>{const u=[],f=(k,l)=>{if(k==w.length)return true;for(let i=0;i<16;i++){if(u.includes(i)||(l>=0&&!adj(l,i)))continue;const t=b[i].toUpperCase();if(w.startsWith(t,k)){u.push(i);if(f(k+t.length,i))return true;u.pop()}}return false};return f(0,-1)?u:null};
const ACT={
 async login(){const n=$('#nm').value.trim();if(!n)return alert('Please enter your name.');if(await login(n))start()},
 logout(){localStorage.removeItem('rr_name');showLogin()},
 async new(k){const np=k=='codemaster'?2:+$('#np').value;const {data,error}=await sb.rpc('wg_create_game',{p_kind:k,p_seed:SEED[k](),p_name:saved(),p_max:np});if(error)return alert(error.message);location.hash=data.code},
 join(){const c=$('#jc').value.trim().toUpperCase();if(c.length==4)location.hash=c},
 async copy(){await navigator.clipboard.writeText(location.origin+location.pathname+'#'+G.code);alert('Invite link copied')},
 async hide(v){if(!confirm('Remove this game from your list? Other players keep it.'))return;
  localStorage.setItem('rr_hid',JSON.stringify([...new Set([...hidLocal(),v])]));sb.from('wg_hidden').insert({game_id:v,player:me}).then(()=>{});lobby()},
 async push(){if(!('serviceWorker' in navigator&&'PushManager' in window))return alert('On iPhone: tap Share → Add to Home Screen, then open the game from your home screen and try again.');
  if(!VAPID_PUBLIC_KEY||VAPID_PUBLIC_KEY.startsWith('YOUR'))return alert('Add your VAPID public key to config.js first.');
  const reg=await navigator.serviceWorker.register('sw.js');if(await Notification.requestPermission()!='granted')return alert('Notifications are blocked for this site.');
  const u=VAPID_PUBLIC_KEY.replace(/-/g,'+').replace(/_/g,'/'),raw=atob(u+'='.repeat((4-u.length%4)%4));
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,c=>c.charCodeAt(0))}),j=sub.toJSON();
  const {error}=await sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'});alert(error?error.message:'Turn alerts are on.');if(!error)lobby()},
 start(){localStorage.setItem(K('rr_t_'),Date.now());VIEW[G.kind]()},
 otap(v){const i=+v,l=OG.path.at(-1);if(OG.path.length&&i===l)OG.path.pop();else if(OG.path.includes(i))return;else if(!OG.path.length||adj(l,i))OG.path.push(i);else return;ogPaint()},
 oadd(){const w=ocur();if(w.length<3)return alert('Words need at least 3 letters.');const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle()},
 oclr(){OG.path=[];VIEW.ogle()},
 orm(v){localStorage.setItem(K('rr_ow_'),JSON.stringify(ow().filter(w=>w!=v)));VIEW.ogle()},
 async words(v,t,auto){if(sub(CUR,me))return;const w=ow(),c=ocur();if(c.length>=3&&!w.includes(c))w.push(c);
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{words:w,r:CUR}});OG.path=[];refresh()},
 async answers(v,t,auto){if(!document.querySelector('.ans')||sub(CUR,me))return;const L=rnds().cur.seed.letter,inp=[...document.querySelectorAll('.ans')],a=inp.map(i=>i.value.trim()).map(x=>x&&x[0].toUpperCase()==L?x:'');
  if(inp.some((i,k)=>i.value.trim()&&!a[k])&&!auto&&!confirm('Some answers don’t start with '+L+' and will be dropped. Send anyway?'))return;
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{answers:a,r:CUR}});refresh()},
 async dispute(v){await sb.from('wg_disputes').insert({game_id:G.id,item:v,raised_by:me});refresh()},
 async rule(v,t){await sb.rpc('wg_rule_dispute',{p_id:+t.dataset.id,p_verdict:v});refresh()},
 async rnew(){const n=rnds().R.length+1;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{rematch:{n,seed:SEED[G.kind](rnds().R.map(r=>r.seed))}}});refresh()},
 async racc(){const q=rnds().req;if(!q)return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{accept:q.n}});refresh()},
 async rrej(){const q=rnds().req;if(!q)return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{reject:q.n}});refresh()},
 async clue(){const c=$('#cl').value.trim().toUpperCase(),n=+$('#cn').value;
  if(!/^[A-Z'-]+$/.test(c)||G.seed.words.includes(c))return alert('One word, and not one on the board.');
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{clue:c,n}});refresh()},
 async end(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{end:true}});if(moves.filter(m=>m.payload.clue).length>=LIM)await sb.rpc('wg_finish_game',{p_game:G.id,p_victors:null,p_score:null});refresh()},
 async guess(v){const {data,error}=await sb.rpc('wg_cm_guess',{p_game:G.id,p_idx:+v});if(error){alert(error.message);return refresh()}if(data=='m')return ACT.end();refresh()},
 async cmrq(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{rematch:true}});refresh()},
 async cmrej(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{reject:true}});refresh()},
 async cmacc(){const {data,error}=await sb.rpc('wg_cm_rematch',{p_game:G.id,p_seed:SEED.codemaster()});if(error)return alert(error.message);location.hash=data.code},
 async finish(v){let w=null,s=null;if(v!='lost'){const o=JSON.parse(v);w=o.w;s=o.s}await sb.rpc('wg_finish_game',{p_game:G.id,p_victors:w,p_score:s});refresh()},
 rsel(v){const i=+v;if(RB.ex){RB.ex.has(i)?RB.ex.delete(i):RB.ex.add(i)}else RB.sel=RB.sel===i?null:i;VIEW.rabble()},
 rput(v){const S=rstate();if(RB.ex||RB.sel==null||S.turn!=me||S.over)return;let l=S.racks[me][RB.sel],b=0;if(l=='?'){l=(prompt('Which letter should the blank be?')||'').toUpperCase().slice(0,1);if(!/[A-Z]/.test(l))return;b=1}RB.pend.set(+v,{l,b,ri:RB.sel});RB.sel=null;VIEW.rabble()},
 rpick(v){RB.pend.delete(+v);VIEW.rabble()},
 rrecall(){RB.pend.clear();VIEW.rabble()},
 rexmode(){RB.ex=new Set();RB.pend.clear();RB.sel=null;VIEW.rabble()},
 rexc(){RB.ex=null;VIEW.rabble()},
 async rexch(){const S=rstate();if(!RB.ex||!RB.ex.size)return alert('Tap the tiles you want to swap first.');if(S.left<7)return alert('Exchanging needs 7 or more tiles in the bag.');
  const L=[...RB.ex].map(i=>S.racks[me][i]);await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{exch:L}});RB.ex=null;refresh()},
 async rplay(){const S=rstate(),r=rscore(S.board,RB.pend);if(r.err)return alert(r.err);await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{play:[...RB.pend].map(([i,t])=>({r:i/15|0,c:i%15,l:t.l,b:t.b})),words:r.words,score:r.score}});refresh()},
 async rpass(){if(!confirm('Pass your turn?'))return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{pass:true}});refresh()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&!t.disabled)ACT[t.dataset.a](t.dataset.v,t)});
document.addEventListener('input',e=>{
 if(G&&e.target.classList&&e.target.classList.contains('ans'))localStorage.setItem(K('rr_d_'),JSON.stringify([...document.querySelectorAll('.ans')].map(i=>i.value)));
 if(e.target.id!='ot')return;const w=e.target.value.toUpperCase().replace(/[^A-Z]/g,''),p=w?trace(w,rnds().cur.seed.board):[],c=$('.curw');$('#oerr').textContent='';
 if(p){OG.path=p;ogPaint();c.classList.remove('bad')}else{OG.path=[];ogPaint();c.textContent=w;c.classList.add('bad')}});
document.addEventListener('keydown',e=>{
 if(e.key!='Enter')return;
 if(e.target.id=='nm'){e.preventDefault();return ACT.login()}
 if(e.target.id!='ot')return;e.preventDefault();const w=e.target.value.toUpperCase().replace(/[^A-Z]/g,'');
 if(w.length<3)return void($('#oerr').textContent='Words need at least 3 letters.');
 if(!trace(w,rnds().cur.seed.board))return void($('#oerr').textContent='“'+w+'” isn’t on the board.');
 const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle();$('#ot').focus()});
let sending=false;
function tick(){if(!G||!['categories','ogle'].includes(G.kind))return;const t0=+localStorage.getItem(K('rr_t_'))||0,el=$('#cdown');if(!t0||!el||sub(CUR,me))return;
 const left=Math.max(0,(G.kind=='ogle'?OGLE_SECS:CAT_SECS)-Math.floor((Date.now()-t0)/1000));el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
 if(left==0&&!sending){sending=true;ACT[G.kind=='ogle'?'words':'answers'](null,null,true).finally(()=>sending=false)}}
setInterval(tick,1000);
init();
