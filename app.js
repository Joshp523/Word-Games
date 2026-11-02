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
 codemaster:()=>({words:shuf(WORDS).slice(0,25).map(w=>w.toUpperCase())})};
const CAT_SECS=60,OGLE_SECS=180,LIM=5,saved=()=>localStorage.getItem('rr_name')||'';
let me,P,G,moves=[],disp=[],reveals=[],names={},key=null,timer,lastSig='';
const svg=(k,h,c='o')=>{const o=ORN[k];return `<svg class="${c}" viewBox="0 0 ${o.w} ${o.h}" height="${h}" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${o.d}"/></svg>`};
const frame=(t,s,b)=>`<div class="pg"><div class="fr">${['tl','tr','bl','br'].map(c=>svg('cn',120,'cn k-'+c)).join('')}${svg('fl',60)}<h1>${t}</h1><p class="sub">${s}</p>${svg('dv',44)}${b}${svg('dv',56)}</div></div>`;
const shell=b=>{const y=scrollY;document.body.dataset.t=G.kind;app.innerHTML=frame(KINDS[G.kind][0],KINDS[G.kind][1],b);scrollTo(0,y);tick()};
const nm=id=>esc(names[id]||'…'),opp=()=>G.p1==me?G.p2:G.p1;
async function pushOn(){try{if(!('serviceWorker' in navigator&&'PushManager' in window))return false;const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();
 if(sub){const j=sub.toJSON();sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'}).then(()=>{})}return !!sub}catch(e){return false}}
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
function turnOf(g,mv){
 if(g.status=='finished')return'finished';if(!g.p2)return'waiting for a friend';
 const other=g.p1==me?g.p2:g.p1,lm=mv.at(-1);
 if(g.kind=='rabble')return(lm?lm.player!=me:g.p1==me)?'your turn':"opponent's turn";
 if(g.kind=='codemaster'){const open=lm&&lm.payload.clue;return(open?g.p2==me:g.p1==me)?'your turn':"opponent's turn"}
 const c=rnds(g,mv),n=c.cur.n,did=p=>mv.some(m=>m.player==p&&(m.payload.r||1)==n&&(m.payload.words||m.payload.answers));
 if(!did(me))return'your turn';if(!did(other))return"opponent's turn";
 return c.req?(c.req.by!=me?'your turn':"opponent's turn"):'round complete'}
function rowLabel(x,mv){const on=x.p1==me?(x.p2?x.p2_name:null):x.p1_name,t=turnOf(x,mv||[]);
 return(on?`${KINDS[x.kind][0]} with ${esc(on)}`:`${KINDS[x.kind][0]} — invite ${x.code}`)+`<br><em>${t=='your turn'?'<strong>your turn</strong>':t}</em>`}
async function lobby(){
 G=null;document.body.dataset.t='lobby';
 const on=await pushOn();
 const [g,w,h]=await Promise.all([sb.from('wg_games').select('*').order('created_at',{ascending:false}).limit(40),sb.from('wg_winners').select('*').order('won_at',{ascending:false}).limit(8),sb.from('wg_hidden').select('game_id')]);const hid=new Set((h.data||[]).map(r=>r.game_id));
 const vis=(g.data||[]).filter(x=>!hid.has(x.id)).slice(0,12),MV={};
 if(vis.length)((await sb.from('wg_moves').select('game_id,player,payload,id').in('game_id',vis.map(x=>x.id)).order('id')).data||[]).forEach(m=>(MV[m.game_id]=MV[m.game_id]||[]).push(m));
 app.innerHTML=frame('The Lobby','begin a game, or enter an invite code',`<div class="lg">
 <div class="pn"><h2>Join with a Code</h2><label for="jc">4-character code</label><input id="jc" class="cin" maxlength="4" autocapitalize="characters"><button class="btn" data-a="join">Enter the Game</button></div>
 <div class="pn"><h2>Begin a New Game</h2><label for="me">Your name</label><input id="me" maxlength="20" value="${esc(saved())}" autocomplete="name">${['ogle','rabble','categories','codemaster'].map(k=>`<button class="btn" data-a="new" data-v="${k}">${KINDS[k][0]}</button>`).join('')}</div>
 <div class="pn"><h2>Your Games</h2>${vis.map(x=>`<div class="gm hl"><a href="#${x.code}" style="color:inherit;text-decoration:none;flex:1">${rowLabel(x,MV[x.id])}</a><button class="lnk" data-a="hide" data-v="${x.id}">Remove</button></div>`).join('')||'<p><em>None yet.</em></p>'}${on?'':'<button class="btn ghost" data-a="push">Turn Alerts</button>'}</div>
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
let CUR=1;const K=p=>p+G.id+'_'+CUR;
function rnds(g=G,mv=moves){const R=[{n:1,seed:g.seed}];let req=null,rej=null;
 for(const m of mv){const p=m.payload;
  if(p.rematch){req={by:m.player,n:p.rematch.n,seed:p.rematch.seed};rej=null}
  else if(p.accept&&req&&req.n==p.accept&&req.by!=m.player&&req.n==R.length+1){R.push({n:req.n,seed:req.seed});req=null;rej=null}
  else if(p.reject&&req&&req.n==p.reject&&req.by!=m.player){rej=req;req=null}}
 return{R,req,rej,cur:R.at(-1)}}
const ctx=()=>{const c=rnds();CUR=c.cur.n;return c};
const sub=(n,pl)=>moves.find(m=>m.player==pl&&(m.payload.r||1)==n&&(m.payload.words||m.payload.answers));
const ogSc=(a,o)=>a.filter(w=>!o.includes(w)&&!fk(w)).reduce((s,w)=>s+pts(w),0);
const wl=(L,O,d)=>L.map(w=>{const sh=O.includes(w),f=fk(w),pt=sh||f?0:pts(w);return `<div class="gm"><span${pt?'':' style="text-decoration:line-through;opacity:.7"'}>${esc(w)}</span><span>${pt}${sh?' · both found':f?' · not a word':''} ${d&&!sh?dbtn(w):''}</span></div>`}).join('')||'<p><em>None.</em></p>';
const catSc=(a,o)=>a.reduce((s,x,i)=>s+(x&&x.toLowerCase()!=(o[i]||'').toLowerCase()&&!fk(x.toLowerCase())?1:0),0);
function tally(R){let w=0,l=0;for(const r of R){const a=sub(r.n,me),b=sub(r.n,opp());if(!a||!b)continue;
 const [x,y]=G.kind=='ogle'?[ogSc(a.payload.words,b.payload.words),ogSc(b.payload.words,a.payload.words)]:[catSc(a.payload.answers,b.payload.answers),catSc(b.payload.answers,a.payload.answers)];
 if(x>y)w++;else if(y>x)l++}return[w,l]}
function matchBox(c,done,pt){
 const [w,l]=tally(c.R),o=nm(opp());
 let h=`<h2>Match</h2><p>Round ${c.cur.n} · You ${w} – ${l} ${o}</p>`;
 if(G.status=='finished')return h+'<p><em>Match over.</em></p>';
 if(!done)return h;
 if(c.req)h+=c.req.by==me?`<p><em>Waiting for ${o} to accept another round…</em></p>`:`<p>${o} wants another round.</p><button class="btn" data-a="racc">Accept</button><button class="btn ghost" data-a="rrej">Decline</button>`;
 else h+=(c.rej&&c.rej.by==me?`<p><em>${o} declined another round.</em></p>`:'')+'<button class="btn" data-a="rnew">New Round</button>';
 return h+`<button class="btn ghost" data-a="finish" data-v="${w}|${l}|m|${c.R.length}|${pt||''}">End Match</button>`}
const OG={id:null,path:[]};
const ow=()=>JSON.parse(localStorage.getItem(K('rr_ow_'))||'[]'),adj=(a,b)=>Math.abs((a>>2)-(b>>2))<2&&Math.abs((a&3)-(b&3))<2;
function ogPaint(){const l=OG.path.at(-1);document.querySelectorAll('.g4 b[data-a="otap"]').forEach((e,i)=>{e.className=OG.path.includes(i)?(i===l?'u l':'u'):''});const c=document.querySelector('.curw');if(c)c.innerHTML=ocur()||'&nbsp;'}
const ocur=()=>OG.path.map(i=>rnds().cur.seed.board[i].toUpperCase()).join('');
VIEW.ogle=()=>{
 if(!G.p2)return wait();
 const c=ctx();if(OG.id!=G.id+'_'+CUR){OG.id=G.id+'_'+CUR;OG.path=[]}
 const b=c.cur.seed.board,mine=sub(CUR,me),th=sub(CUR,opp()),t0=+localStorage.getItem(K('rr_t_'))||0,live=!mine&&t0;
 const mb=CUR>1||G.status=='finished'?`<div class="pn">${matchBox(c,false)}</div>`:'';
 let p;
 if(!mine&&!t0)p=`<div class="pn"><h2>Ready?</h2><p>You will have ${OGLE_SECS/60} minutes once you start. Tap letters to spell words. When the clock runs out, your words are sent automatically.</p><button class="btn" data-a="start">Start the Clock</button>${lobbyBtn}</div>`;
 else if(!mine){const w=ow();p=`<div class="pn"><h2>Your Word</h2><label for="ot">Type a word and press Enter, or tap tiles</label><input id="ot" autocomplete="off" autocapitalize="characters" spellcheck="false"><p id="oerr" style="min-height:1.2em;margin:4px 0"></p><div class="curw">${ocur()||'&nbsp;'}</div><button class="btn" data-a="oadd">Add Word</button><button class="btn ghost" data-a="oclr">Clear</button><h2 style="margin-top:20px">Words Found (${w.length})</h2>${w.map(x=>`<div class="gm"><span>${esc(x)}</span><button class="lnk" data-a="orm" data-v="${esc(x)}">Remove</button></div>`).join('')||'<p><em>None yet.</em></p>'}<button class="btn" data-a="words">Submit Words</button>${lobbyBtn}</div>`}
 else if(!th)p=`<div class="pn"><h2>Submitted</h2><p><em>Waiting on ${nm(opp())}…</em></p>${lobbyBtn}</div>`;
 else{const A=mine.payload.words,B=th.payload.words,x=ogSc(A,B),y=ogSc(B,A),both=A.filter(w=>B.includes(w));
  p=`<div class="pn"><h2>Round ${CUR} Results</h2><p>You <span class="big">${x}</span></p><p>${nm(opp())} <span class="big">${y}</span></p><h2>Your Words</h2>${wl(A,B,0)}<h2>${nm(opp())}’s Words</h2>${wl(B,A,1)}</div><div class="pn">${matchBox(c,true,Math.max(x,y)+' – '+Math.min(x,y))}${lobbyBtn}</div>`}
 const last=OG.path.at(-1);
 const tiles=b.map((c,i)=>live?`<b class="${OG.path.includes(i)?(i===last?'u l':'u'):''}" data-a="otap" data-v="${i}">${c}</b>`:`<b>${t0||mine?c:'?'}</b>`).join('');
 shell(`<div class="row"><div class="bd" style="max-width:420px">${live?'<p class="big" id="cdown" style="text-align:center"></p>':''}<div class="g g4">${tiles}</div></div>${p}${th&&mine?'':mb}${dbox()}</div>`);
};
VIEW.categories=()=>{
 if(!G.p2)return wait();
 const c=ctx(),{letter,cats}=c.cur.seed,mine=sub(CUR,me),th=sub(CUR,opp()),t0=+localStorage.getItem(K('rr_t_'))||0;
 const mb=CUR>1||G.status=='finished'?`<div class="pn">${matchBox(c,false)}</div>`:'';
 let p;
 if(!mine&&!t0)p=`<div class="pn" style="max-width:560px"><h2>Ready?</h2><p>You will have ${CAT_SECS} seconds once you start. When the clock runs out, your answers are sent automatically.</p><button class="btn" data-a="start">Start the Clock</button>${lobbyBtn}</div>`;
 else if(!mine){const dr=JSON.parse(localStorage.getItem(K('rr_d_'))||'[]');p=`<div class="pn" style="max-width:560px"><h2>Your Answers</h2>${cats.map((c,i)=>`<label for="a${i}">${i+1}. ${esc(c)}</label><input id="a${i}" class="ans" autocomplete="off" value="${esc(dr[i]||'')}">`).join('')}<button class="btn" data-a="answers">Seal &amp; Send</button>${lobbyBtn}</div>`}
 else if(!th)p=`<div class="pn"><h2>Sealed</h2><p><em>Waiting on ${nm(opp())}…</em></p>${lobbyBtn}</div>`;
 else{const A=mine.payload.answers,B=th.payload.answers,x=catSc(A,B),y=catSc(B,A);
  p=`<div class="pn" style="max-width:560px"><h2>Round ${CUR} Results</h2><p>You <span class="big">${x}</span> · ${nm(opp())} <span class="big">${y}</span></p>${cats.map((c,i)=>`<div class="hl"><p><em>${esc(c)}</em></p><div class="gm"><span>You: ${esc(A[i]||'—')}</span></div><div class="gm"><span>${nm(opp())}: ${esc(B[i]||'—')}</span>${B[i]?dbtn(B[i].toLowerCase()):''}</div></div>`).join('')}</div><div class="pn">${matchBox(c,true,Math.max(x,y)+' – '+Math.min(x,y))}${lobbyBtn}</div>`}
 shell(`<div class="row"><div class="pn" style="max-width:260px;text-align:center"><h2>The Letter Is</h2><div class="lt">${mine||t0?letter:'?'}</div>${!mine&&t0?'<p class="big" id="cdown"></p>':''}</div>${p}${th&&mine?'':mb}${dbox()}</div>`);
};
VIEW.codemaster=()=>{
 if(!G.p2)return wait();
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
 shell(`<div class="row"><div class="bd" style="max-width:600px"><div class="g g15">${cells}</div><div class="key"><span><i class="tw"></i>Triple Word</span><span><i class="dw"></i>Double Word</span><span><i class="tl"></i>Triple Letter</span><span><i class="dl"></i>Double Letter</span></div><div class="rack">${rack}</div></div><div class="pn"><h2>Scores</h2><p>You — <span class="big">${S.tot[me]}</span></p><p>${nm(opp())} — <span class="big">${S.tot[opp()]}</span></p><p>Tiles in bag: ${S.left}</p>${dl}${ctl}${lobbyBtn}</div>${dbox()}</div>`);
};
const ACT={
 async new(k){const n=$('#me').value.trim();if(!n)return alert('Please enter your name first.');localStorage.setItem('rr_name',n);const {data,error}=await sb.rpc('wg_create_game',{p_kind:k,p_seed:SEED[k](),p_name:n});if(error)return alert(error.message);location.hash=data.code},
 async seat(c){const n=$('#nm').value.trim();if(!n)return alert('Please enter your name.');localStorage.setItem('rr_name',n);const {error}=await sb.rpc('wg_join_game',{p_code:c,p_name:n});if(error){alert(error.message);return}route()},
 async push(){if(!('serviceWorker' in navigator&&'PushManager' in window))return alert('On iPhone: tap Share → Add to Home Screen, then open the game from your home screen and try again.');
  if(!VAPID_PUBLIC_KEY||VAPID_PUBLIC_KEY.startsWith('YOUR'))return alert('Add your VAPID public key to config.js first.');
  const reg=await navigator.serviceWorker.register('sw.js');if(await Notification.requestPermission()!='granted')return alert('Notifications are blocked for this site.');
  const u=VAPID_PUBLIC_KEY.replace(/-/g,'+').replace(/_/g,'/'),raw=atob(u+'='.repeat((4-u.length%4)%4));
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,c=>c.charCodeAt(0))}),j=sub.toJSON();
  const {error}=await sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'});alert(error?error.message:'Turn alerts are on.');if(!error)lobby()},
 rsel(v){RB.sel=RB.sel===+v?null:+v;VIEW.rabble()},
 rput(v){const S=rstate();if(RB.sel==null||S.turn!=me||S.over)return;let l=S.racks[me][RB.sel],b=0;if(l=='?'){l=(prompt('Which letter should the blank be?')||'').toUpperCase().slice(0,1);if(!/[A-Z]/.test(l))return;b=1}RB.pend.set(+v,{l,b,ri:RB.sel});RB.sel=null;VIEW.rabble()},
 rpick(v){RB.pend.delete(+v);VIEW.rabble()},
 rrecall(){RB.pend.clear();VIEW.rabble()},
 async rplay(){const S=rstate(),r=rscore(S.board,RB.pend);if(r.err)return alert(r.err);await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{play:[...RB.pend].map(([i,t])=>({r:i/15|0,c:i%15,l:t.l,b:t.b})),words:r.words,score:r.score}});refresh()},
 async rpass(){if(!confirm('Pass your turn?'))return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{pass:true}});refresh()},
 join(){const c=$('#jc').value.trim().toUpperCase();if(c.length==4)location.hash=c},
 async copy(){await navigator.clipboard.writeText(location.origin+location.pathname+'#'+G.code);alert('Invite link copied')},
 otap(v){const i=+v,l=OG.path.at(-1);if(OG.path.length&&i===l)OG.path.pop();else if(OG.path.includes(i))return;else if(!OG.path.length||adj(l,i))OG.path.push(i);else return;ogPaint()},
 oadd(){const w=ocur();if(w.length<3)return alert('Words need at least 3 letters.');const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle()},
 oclr(){OG.path=[];VIEW.ogle()},
 orm(v){localStorage.setItem(K('rr_ow_'),JSON.stringify(ow().filter(w=>w!=v)));VIEW.ogle()},
 async words(v,t,auto){if(sub(CUR,me))return;const w=ow(),c=ocur();if(c.length>=3&&!w.includes(c))w.push(c);
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{words:w,r:CUR}});OG.path=[];refresh()},
 async hide(v){if(!confirm('Remove this game from your list? Your opponent keeps their copy.'))return;await sb.from('wg_hidden').insert({game_id:v,player:me});lobby()},
 async rnew(){const n=rnds().R.length+1;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{rematch:{n,seed:SEED[G.kind](rnds().R.map(r=>r.seed))}}});refresh()},
 async racc(){const q=rnds().req;if(!q)return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{accept:q.n}});refresh()},
 async rrej(){const q=rnds().req;if(!q)return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{reject:q.n}});refresh()},
 async start(){localStorage.setItem(K('rr_t_'),Date.now());VIEW[G.kind]()},
 async answers(v,t,auto){if(!document.querySelector('.ans'))return;const a=[...document.querySelectorAll('.ans')].map(i=>i.value.trim()).map(v=>v&&v[0].toUpperCase()==rnds().cur.seed.letter?v:'');
  if(a.some((v,i)=>!v&&document.querySelectorAll('.ans')[i].value.trim())&&!auto&&!confirm('Some answers don’t start with '+rnds().cur.seed.letter+' and will be dropped. Send anyway?'))return;
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{answers:a,r:CUR}});refresh()},
 async dispute(v){await sb.from('wg_disputes').insert({game_id:G.id,item:v,raised_by:me});refresh()},
 async rule(v,t){await sb.rpc('wg_rule_dispute',{p_id:+t.dataset.id,p_verdict:v});refresh()},
 async clue(){const c=$('#cl').value.trim().toUpperCase(),n=+$('#cn').value;
  if(!/^[A-Z'-]+$/.test(c)||G.seed.words.includes(c))return alert('One word, and not one on the board.');
  await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{clue:c,n}});refresh()},
 async end(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{end:true}});if(moves.filter(m=>m.payload.clue).length>=LIM)await sb.rpc('wg_finish_game',{p_game:G.id,p_victors:null,p_score:null});refresh()},
 async guess(v){const {data,error}=await sb.rpc('wg_cm_guess',{p_game:G.id,p_idx:+v});if(error){alert(error.message);return refresh()}if(data=='m')return ACT.end();refresh()},
 async cmrq(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{rematch:true}});refresh()},
 async cmrej(){await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{reject:true}});refresh()},
 async cmacc(){const {data,error}=await sb.rpc('wg_cm_rematch',{p_game:G.id,p_seed:SEED.codemaster()});if(error)return alert(error.message);location.hash=data.code},
 async finish(v){let w=null,s=null;
  if(v!='lost'){const [a,b,m,n,pt]=v.split('|'),A=+a,B=+b;w=A>B?names[me]:B>A?names[opp()]:'A draw';s=m&&+n>1?`${Math.max(A,B)} – ${Math.min(A,B)} rounds`:(pt||`${Math.max(A,B)} – ${Math.min(A,B)}`)}
  await sb.rpc('wg_finish_game',{p_game:G.id,p_victors:w,p_score:s});refresh()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&!t.disabled)ACT[t.dataset.a](t.dataset.v,t)});
document.addEventListener('input',e=>{if(G&&e.target.classList&&e.target.classList.contains('ans'))localStorage.setItem(K('rr_d_'),JSON.stringify([...document.querySelectorAll('.ans')].map(i=>i.value)))});
function trace(w,b){const u=[],f=(k,l)=>{if(k==w.length)return true;for(let i=0;i<16;i++){if(u.includes(i)||(l>=0&&!adj(l,i)))continue;const t=b[i].toUpperCase();if(w.startsWith(t,k)){u.push(i);if(f(k+t.length,i))return true;u.pop()}}return false};return f(0,-1)?u:null}
document.addEventListener('input',e=>{if(e.target.id!='ot')return;const w=e.target.value.toUpperCase().replace(/[^A-Z]/g,''),p=w?trace(w,rnds().cur.seed.board):[],c=$('.curw');$('#oerr').textContent='';
 if(p){OG.path=p;ogPaint();c.classList.remove('bad')}else{OG.path=[];ogPaint();c.textContent=w;c.classList.add('bad')}});
document.addEventListener('keydown',e=>{if(e.key!='Enter'||e.target.id!='ot')return;e.preventDefault();const w=e.target.value.toUpperCase().replace(/[^A-Z]/g,'');
 if(w.length<3)return void($('#oerr').textContent='Words need at least 3 letters.');
 if(!trace(w,rnds().cur.seed.board))return void($('#oerr').textContent='“'+w+'” isn’t on the board.');
 const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle();$('#ot').focus()});
let sending=false;
function tick(){if(!G||!['categories','ogle'].includes(G.kind))return;const t0=+localStorage.getItem(K('rr_t_'))||0,el=$('#cdown');if(!t0||!el||sub(CUR,me))return;
 const left=Math.max(0,(G.kind=='ogle'?OGLE_SECS:CAT_SECS)-Math.floor((Date.now()-t0)/1000));el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
 if(left==0&&!sending){sending=true;ACT[G.kind=='ogle'?'words':'answers'](null,null,true).finally(()=>sending=false)}}
setInterval(tick,1000);
init();
