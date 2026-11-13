// Own sign-in slot so the Word Games never replace another app's login on joshp523.github.io
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{storageKey:'word-games-auth'}});
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
const shell=b=>{const y=scrollY;document.documentElement.dataset.t=document.body.dataset.t=G.kind;app.innerHTML=frame(KINDS[G.kind][0],KINDS[G.kind][1],wbox()+b);scrollTo(0,y);tick()};
const nm=id=>esc(names[id]||'…'),opp=()=>(PL.find(x=>x.player!=me)||{}).player;
const fatal=m=>app.innerHTML=frame('Alas','something went wrong',`<div class="row"><div class="pn"><p>${esc(m)}</p><p><em>Check config.js, run wg_schema.sql, and enable anonymous sign-ins in Supabase.</em></p></div></div>`);
async function pushOn(){try{if(!('serviceWorker' in navigator&&'PushManager' in window))return false;const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();
 if(sub){const j=sub.toJSON();sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'}).then(()=>{})}return !!sub}catch(e){return false}}

async function subscribe(){try{
 const reg=await navigator.serviceWorker.register('sw.js');if(await Notification.requestPermission()!='granted')return 'Notifications are blocked for this site. You can allow them in Settings → Notifications.';
 const u=VAPID_PUBLIC_KEY.replace(/-/g,'+').replace(/_/g,'/'),raw=atob(u+'='.repeat((4-u.length%4)%4));
 const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:Uint8Array.from(raw,c=>c.charCodeAt(0))}),j=sub.toJSON();
 const {error}=await sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'});return error?error.message:null}catch(e){return e.message||'Could not turn on alerts.'}}

/* ---------- phone prompts: add to home screen, then turn alerts (shown once in a while, never on a computer) ---------- */
const UA=navigator.userAgent,IOS=/iPhone|iPad|iPod/.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1),PHONE=IOS||/Android/i.test(UA);
const STANDALONE=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let BIP=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();BIP=e});
const snoozed=k=>+(localStorage.getItem('wg_snooze_'+k)||0)>Date.now(),snooze=(k,d)=>localStorage.setItem('wg_snooze_'+k,Date.now()+d*864e5);
const SHARE='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
function sheet(h){closeSheet();const d=document.createElement('div');d.id='sheet';d.innerHTML=`<div class="sh-bg" data-a="sheetx"></div><div class="sh pn" role="dialog" aria-modal="true">${h}</div>`;document.body.appendChild(d);requestAnimationFrame(()=>d.classList.add('on'))}
const closeSheet=()=>{const d=document.getElementById('sheet');if(d)d.remove()};
async function nudge(on){
 if(!PHONE||document.getElementById('sheet'))return;
 const canPush='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
 if(!STANDALONE()&&!snoozed('install')){
  const how=IOS?`<ol class="sh-steps"><li>Tap the Share button ${SHARE} at the bottom of Safari.</li><li>Scroll down and tap <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong>, then open Word Games from your home screen.</li></ol>`
   :BIP?'':`<ol class="sh-steps"><li>Tap the <strong>⋮</strong> menu at the top of the browser.</li><li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li></ol>`;
  return sheet(`<h2>Keep Word Games on Your Phone</h2><p>Put it on your home screen and it opens like an app, full screen. It’s also the only way your phone can tell you when it’s your turn.</p>${how}${BIP?'<button class="btn" data-a="install">Add to Home Screen</button>':''}<button class="btn ghost" data-a="later" data-v="install">Not Now</button>`)}
 if(on||!canPush||Notification.permission=='denied'||!VAPID_PUBLIC_KEY||VAPID_PUBLIC_KEY.startsWith('YOUR'))return;
 if(Notification.permission=='granted'){if(!await subscribe())lobby();return}   // already allowed once: switch alerts on quietly
 if(snoozed('alerts'))return;
 sheet(`<h2>Never Miss Your Turn</h2><p>Your phone will let you know when someone plays a word, joins your game, or the results are in. Nothing else.</p><button class="btn" data-a="alertson">Turn On Turn Alerts</button><button class="btn ghost" data-a="later" data-v="alerts">Not Now</button>`)}

/* ---------- solo games (Ogle, Categories): kept on this device only, never in the Hall of Winners ---------- */
const soloK=k=>'wg_solo_'+k,getSolo=k=>{try{return JSON.parse(localStorage.getItem(soloK(k)))}catch(e){return null}},putSolo=g=>localStorage.setItem(soloK(g.kind),JSON.stringify(g));
const newSolo=k=>{const g={id:'solo_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),kind:k,seed:SEED[k](),status:'active',max_players:1,code:'SOLO-'+k.toUpperCase(),solo:true,moves:[]};putSolo(g);return g};
const bestK=k=>'wg_best_'+k;
async function put(payload){if(G.solo){const g=getSolo(G.kind);if(!g||g.id!=G.id)return;g.moves.push({id:g.moves.length+1,game_id:g.id,player:me,payload});putSolo(g);G=g;return{}}return sb.from('wg_moves').insert({game_id:G.id,player:me,payload})}

/* ---------- login ---------- */
function showLogin(){clearInterval(timer);G=null;me=null;document.documentElement.dataset.t=document.body.dataset.t='lobby';
 app.innerHTML=frame('Welcome','who is playing?',`<div class="row"><div class="pn"><h2>Your Name</h2><p>Type your name to see all your games, on any device. There is no password, so use the same spelling every time.</p><label for="nm">Name</label><input id="nm" maxlength="20" value="${esc(saved())}" autocomplete="name" autocapitalize="words"><button class="btn" data-a="login">Enter</button></div></div>`)}
async function login(n){const {data,error}=await sb.rpc('wg_login',{p_name:n});if(error){alert(error.message);return false}me=data;localStorage.setItem('rr_name',n.trim());return true}
async function init(){
 try{let {data:{session}}=await sb.auth.getSession();if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error}
  if(saved()&&await login(saved()))return start();showLogin()}catch(e){fatal(e.message||e)}}
const start=()=>{if(!started){started=true;addEventListener('hashchange',route)}route()};
async function route(){
 clearInterval(timer);if(!me)return showLogin();
 const c=location.hash.slice(1).toUpperCase();
 if(c.startsWith('SOLO-')){const g=getSolo(c.slice(5).toLowerCase());if(!g){location.hash='';return}G=g;key=null;lastSig='';return draw()}
 if(c.length!=4)return lobby();
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
 return(on?`${KINDS[x.kind][0]} with ${on}`:`${KINDS[x.kind][0]} — invite ${x.code}`)+`<br>${t=='your turn'?'<span class="yt">Your turn</span>':`<em>${t}</em>`}`}
/* Hall of Winners: the single best result ever recorded for each game.
   Ogle, Rabble, Categories: the winner's points (first number of the score). Matches scored in rounds are skipped.
   Codemaster: the win with the most turns to spare. */
function best(x){const s=x.score||'';if(x.kind=='codemaster'){const m=/(\d+) turns? spare/.exec(s);return m?+m[1]:0}if(/rounds/.test(s)||!x.victors||x.victors=='A draw')return null;const m=/^\s*(\d+)/.exec(s);return m?+m[1]:null}
function hall(rows){return['ogle','rabble','categories','codemaster'].map(k=>{let top=null;for(const x of rows){if(x.kind!=k)continue;const v=best(x);if(v==null)continue;if(!top||v>top.v)top={x,v}}
 const what=top?(k=='codemaster'?`${top.v} turn${top.v==1?'':'s'} to spare`:`${top.v} point${top.v==1?'':'s'}`):'';
 return `<div class="hl"><div class="gm"><span><strong>${KINDS[k][0]}</strong></span>${top?`<em>${new Date(top.x.won_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}</em>`:''}</div><p>${top?`${esc(top.x.victors)} — ${what}`:'No high score yet.'}</p></div>`}).join('')}
/* The lobby checks for news every 8 seconds while it's on screen, and right away when you come back to the app.
   A quiet check only redraws when something changed, and never while you're typing a code or a sheet is open.
   Games where it's your turn go to the top, and the count shows on the app icon (where the phone allows it). */
let LOBSIG='',MYTURN=new Set();
function turnBadge(n){document.title=(n?`(${n}) `:'')+TITLE0;try{if(navigator.setAppBadge)n?navigator.setAppBadge(n):navigator.clearAppBadge()}catch(e){}}
const TITLE0=document.title.replace(/^\(\d+\) /,'');
async function lobby(quiet){
 if(quiet&&(G||location.hash.length>1))return;
 if(!quiet){G=null;document.documentElement.dataset.t=document.body.dataset.t='lobby'}const on=quiet?true:await pushOn();
 const [g,w,h]=await Promise.all([sb.from('wg_games').select('*').order('created_at',{ascending:false}).limit(40),sb.from('wg_winners').select('*').order('won_at',{ascending:false}).limit(1000),sb.from('wg_hidden').select('game_id')]);
 const solo=['ogle','categories'].map(getSolo).filter(x=>x&&x.status!='finished');
 const hid=new Set([...(h.data||[]).map(r=>r.game_id),...hidLocal()]),vis=(g.data||[]).filter(x=>!hid.has(x.id)).slice(0,12),MV={},GP={};
 if(vis.length){const ids=vis.map(x=>x.id),[m,p]=await Promise.all([sb.from('wg_moves').select('game_id,player,payload,id').in('game_id',ids).order('id'),sb.from('wg_game_players').select('*').in('game_id',ids).order('seat')]);
  (m.data||[]).forEach(x=>(MV[x.game_id]=MV[x.game_id]||[]).push(x));(p.data||[]).forEach(x=>(GP[x.game_id]=GP[x.game_id]||[]).push(x))}
 const TT={};for(const x of vis){try{TT[x.id]=turnOf(x,MV[x.id]||[],GP[x.id]||[])}catch(e){TT[x.id]=''}}
 vis.sort((a,b)=>(TT[b.id]=='your turn')-(TT[a.id]=='your turn'));
 const now=new Set(vis.filter(x=>TT[x.id]=='your turn').map(x=>x.code)),fresh=[...now].filter(c=>!MYTURN.has(c));
 const sig=vis.map(x=>x.id+':'+TT[x.id]).join()+'|'+solo.length+'|'+(w.data||[]).length;
 if(quiet){if(G||location.hash.length>1||sig===LOBSIG)return;const ae=document.activeElement;
  if(document.getElementById('sheet')||(ae&&/INPUT|SELECT|TEXTAREA/.test(ae.tagName))||($('#jc')&&$('#jc').value))return}
 LOBSIG=sig;MYTURN=now;turnBadge(now.size);
 app.innerHTML=frame('The Lobby','begin a game, or enter an invite code',`<p class="sub">Playing as <strong>${esc(saved())}</strong> <button class="lnk" data-a="logout">Not you?</button></p><div class="lg">
 <div class="pn"><h2>Your Games</h2>${solo.map(x=>{const m=x.moves.filter(v=>v.payload.words||v.payload.answers).length,R=1+x.moves.filter(v=>v.payload.rematch).length,up=m<R;return `<div class="gm hl${up?' up':''}"><a href="#${x.code}" style="color:inherit;text-decoration:none;flex:1">${KINDS[x.kind][0]} — solo practice<br>${up?'<span class="yt">Your turn</span>':'<em>round complete</em>'}</a><button class="lnk" data-a="hidesolo" data-v="${x.kind}">Remove</button></div>`}).join('')}${vis.map(x=>`<div class="gm hl${turnOf(x,MV[x.id]||[],GP[x.id]||[])=='your turn'?' up':''}"><a href="#${x.code}" style="color:inherit;text-decoration:none;flex:1">${rowLabel(x,MV[x.id]||[],GP[x.id]||[])}</a><button class="lnk" data-a="hide" data-v="${x.id}">Remove</button></div>`).join('')||(solo.length?'':'<p><em>None yet.</em></p>')}${on?'<p style="margin-top:12px"><button class="lnk" data-a="testalert">Send Me a Test Alert</button></p>':'<button class="btn ghost" data-a="push">Turn Alerts</button>'}</div>
 <div class="pn"><h2>Join with a Code</h2><label for="jc">4-character code</label><input id="jc" class="cin" maxlength="4" autocapitalize="characters"><button class="btn" data-a="join">Enter the Game</button></div>
 <div class="pn"><h2>Begin a New Game</h2><label for="np">Players (Ogle, Rabble, Categories)</label><select id="np"><option value="1">1 · solo practice (Ogle, Categories)</option><option selected>2</option><option>3</option><option>4</option></select>${['ogle','rabble','categories','codemaster'].map(k=>`<button class="btn" data-a="new" data-v="${k}">${KINDS[k][0]}</button>`).join('')}</div>
 <div class="pn"><h2>Hall of Winners</h2>${hall(w.data||[])}</div></div>`);
 if(quiet&&fresh.length){fresh.forEach(c=>{const a=document.querySelector(`a[href="#${c}"]`),r=a&&(a.closest('.gm')||a);if(r)r.classList.add('fresh')});try{navigator.vibrate&&navigator.vibrate([120,60,120])}catch(e){}}
 if(!quiet){clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)lobby(true)},8000);setTimeout(()=>nudge(on),900)}
}

/* ---------- game loading ---------- */
async function load(){
 loadExt();
 if(G.solo){const g=getSolo(G.kind);if(g&&g.id==G.id)G=g;moves=G.moves;disp=[];reveals=[];WQ=[];PL=[{player:me,name:saved(),seat:1}];names={[me]:saved()};return}
 const id=G.id,[m,d,r,g,p,wq]=await Promise.all([sb.from('wg_moves').select('*').eq('game_id',id).order('id'),sb.from('wg_disputes').select('*').eq('game_id',id).order('id'),sb.from('wg_cm_reveals').select('*').eq('game_id',id),sb.from('wg_games').select('*').eq('id',id).single(),sb.from('wg_game_players').select('*').eq('game_id',id).order('seat'),G.kind=='rabble'?sb.from('wg_words').select('word,status,added_by,decided_by').eq('game_id',id):Promise.resolve({data:[]})]);
 moves=m.data||[];disp=d.data||[];reveals=r.data||[];if(g.data)G=g.data;PL=p.data||[];names=Object.fromEntries(PL.map(x=>[x.player,x.name]));WQ=wq.data||[];WQ.forEach(q=>{if(q.status=='ok')EXT.add(q.word)});
 if(G.kind=='codemaster'&&G.p1==me&&!key){const {data:k}=await sb.from('wg_cm_keys').select('key').eq('game_id',id).maybeSingle();key=k&&k.key}
}
async function draw(){
 if(!G)return;await load();
 const sig=[moves.length,disp.map(d=>d.verdict).join(),WQ.map(q=>q.word+q.status).join(),reveals.length,G.status,PL.length,!!key].join('|');
 if(sig===lastSig)return;lastSig=sig;VIEW[G.kind]();
}
const refresh=async()=>{lastSig='';await draw()};
const wait=()=>shell(`<div class="row"><div class="pn"><h2>Invite Players</h2><p>${PL.length} of ${G.max_players} have joined.</p><div class="code">${G.code}</div><p>Send them this link, or the code:</p><input readonly value="${location.origin+location.pathname}#${G.code}"><button class="btn" data-a="copy">Copy Invite Link</button><a class="btn ghost" href="#">Return to Lobby</a></div></div>`);
const fk=i=>disp.some(d=>d.item==i&&d.verdict=='fake');
/* WORD LIST: ENABLE (public domain, ~173,000 words) plus the official two-letter words added since (QI, ZA, KI, OK, EW…).
   Rabble plays and Ogle words must be in it. If a word is refused, the player can look it up on Merriam-Webster's free Scrabble
   dictionary. In Rabble they can also tap "Ask to Allow It": the other player(s) then see the word and choose "Allow It" or
   "Not a Word". Once allowed it joins the shared list of extra words (Supabase table wg_words) for everyone. In solo Rabble there's
   nobody to ask, so an allowed word counts in your own solo games on this device only. Ogle is timed, so no exceptions there.
   Categories keeps its Dispute button. */
let DICT=null,EXT=new Set(JSON.parse(localStorage.getItem('wg_ok_words')||'[]')),SOLOW=new Set(JSON.parse(localStorage.getItem('wg_solo_words')||'[]')),WQ=[],extAt=0;
try{localStorage.removeItem('wg_extra')}catch(e){}
const LOOK=w=>'https://scrabble.merriam.com/finder/'+encodeURIComponent(w.toLowerCase());
async function loadExt(){if(Date.now()-extAt<30000||!sb||!me)return;extAt=Date.now();try{const {data,error}=await sb.from('wg_words').select('word').eq('status','ok');if(error)return;EXT=new Set((data||[]).map(x=>x.word.toUpperCase()));localStorage.setItem('wg_ok_words',JSON.stringify([...EXT]))}catch(e){}}
const others=()=>{const o=PL.filter(x=>x.player!=me).map(x=>esc(x.name));return o.length?o.join(' or '):'your opponent'};
const fixW=w=>{const W=w.toUpperCase(),look=`<a class="lnk" target="_blank" rel="noopener" href="${LOOK(w)}">Look It Up</a>`;
 if(G&&G.kind=='ogle')return look;   // Ogle is timed, so there's no waiting for an opponent: the word list decides
 if(!G||G.solo)return look+` <button class="lnk" data-a="realw" data-v="${esc(W)}">Allow It in My Solo Games</button>`;
 const q=WQ.find(x=>x.word==W);
 if(q&&q.status=='pending')return look+(q.added_by==me?` <em>Waiting for ${others()} to allow it.</em>`:` <em>${nm(q.added_by)} has asked about this word. See above.</em>`);
 if(q&&q.status=='no')return look+` <em>${nm(q.decided_by)} said it’s not a word.</em> <button class="lnk" data-a="realw" data-v="${esc(W)}">Ask Again</button>`;
 return look+` <button class="lnk" data-a="realw" data-v="${esc(W)}">Ask ${others()} to Allow It</button>`};
const wbox=()=>!G||G.solo||G.kind!='rabble'?'':WQ.filter(q=>q.status=='pending').map(q=>q.added_by==me
 ?`<div class="row"><div class="pn"><h2>Waiting on “${esc(q.word)}”</h2><p>You’ve asked ${others()} to allow it. Once they do, you can play it.</p></div></div>`
 :`<div class="row"><div class="pn"><h2>Is “${esc(q.word)}” a Word?</h2><p>${nm(q.added_by)} wants to play it. Look it up, then decide. If you allow it, it counts for everyone from now on.</p><a class="btn ghost" target="_blank" rel="noopener" href="${LOOK(q.word)}">Look It Up</a><button class="btn" data-a="wok" data-v="${esc(q.word)}">Allow It</button><button class="btn ghost" data-a="wno" data-v="${esc(q.word)}">Not a Word</button></div></div>`).join('');
const loadDict=()=>fetch('words.txt').then(r=>r.ok?r.text():Promise.reject()).then(t=>{DICT=new Set(t.split('\n').map(x=>x.trim().toUpperCase()).filter(Boolean));if(G&&G.kind=='rabble')VIEW.rabble()}).catch(()=>setTimeout(loadDict,5000));
loadDict();
const okW=w=>{if(!DICT)return false;const W=w.toUpperCase();return DICT.has(W)||EXT.has(W)||!!(G&&G.solo&&SOLOW.has(W))},WAIT='The word list is still loading. Try again in a moment.';
const dbtn=i=>G&&G.kind!='categories'?'':disp.some(d=>d.item==i)?'<em>disputed</em>':`<button class="lnk" data-a="dispute" data-v="${esc(i)}">Dispute</button>`;
const dbox=()=>disp.filter(d=>!d.verdict).map(d=>d.raised_by==me?`<div class="pn"><h2>Disputed: ${esc(d.item)}</h2><p>Look it up, then give your verdict.</p><a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/search?q=define+${encodeURIComponent(d.item)}">Look It Up</a><button class="btn" data-a="rule" data-v="real" data-id="${d.id}">It’s a Real Word</button><button class="btn ghost" data-a="rule" data-v="fake" data-id="${d.id}">It’s Not a Word</button></div>`:`<div class="pn"><h2>Disputed: ${esc(d.item)}</h2><p><em>${nm(d.raised_by)} is checking this one…</em></p></div>`).join('');
const lobbyBtn='<a class="btn ghost" href="#">Return to Lobby</a>';
const pts=w=>w.length>=8?11:[0,0,0,1,1,2,3,5][w.length];
const K=p=>p+G.id+'_'+CUR;
const finData=(m,unit)=>{const e=PL.map(x=>[x.name,m[x.player]||0]).sort((a,b)=>b[1]-a[1]),top=e.filter(x=>x[1]==e[0][1]);return{w:top.length>1?'A draw':e[0][0],s:e.map(x=>x[1]).join(' – ')+(unit?' '+unit:'')}};
const finBtn=v=>G.status=='finished'?'<p><em>Game over.</em></p>':`<button class="btn" data-a="finish" data-v="${esc(JSON.stringify(v))}">Finish Game</button>`;

/* ---------- rounds (Ogle and Categories) ---------- */
function rnds(g=G,mv=moves,pl=PL){const R=[{n:1,seed:g.seed}];let req=null,rej=null;
 for(const m of mv){const p=m.payload;
  if(p.rematch){req={by:m.player,n:p.rematch.n,seed:p.rematch.seed,acc:new Set()};rej=null;if(req.n==R.length+1&&pl.every(x=>x.player==req.by)){R.push({n:req.n,seed:req.seed});req=null}}
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
 let h=G.solo?`<h2>Solo Practice</h2><p>Round ${c.cur.n} · Best on this device: ${+localStorage.getItem(bestK(G.kind))||0}</p>`:`<h2>Match</h2><p>Round ${c.cur.n} · ${PL.map(x=>`${x.player==me?'You':esc(x.name)} ${t[x.player]}`).join(' · ')}</p>`;
 if(G.status=='finished')return h+(G.solo?`<p><em>Practice over.</em></p><button class="btn" data-a="new" data-v="${G.kind}" data-solo="1">Play Again</button>`:'<p><em>Match over.</em></p>');
 if(!done)return h;
 const q=c.req;
 if(q){const wt=PL.filter(x=>x.player!=q.by&&!q.acc.has(x.player));
  if(q.by==me)h+=`<p><em>Waiting for ${wt.map(x=>esc(x.name)).join(', ')} to accept another round…</em></p>`;
  else if(!q.acc.has(me))h+=`<p>${nm(q.by)} wants another round.</p><button class="btn" data-a="racc">Accept</button><button class="btn ghost" data-a="rrej">Decline</button>`;
  else h+='<p><em>You accepted. Waiting for the others…</em></p>'}
 else h+=(c.rej&&c.rej.by==me?`<p><em>${nm(c.rej.rb)} declined another round.</em></p>`:'')+'<button class="btn" data-a="rnew">New Round</button>';
 if(G.solo)return h+'<button class="btn ghost" data-a="finish" data-v="solo">End Practice</button>';
 const v=c.R.length>1?finData(t,'rounds'):finData(sc);
 return h+`<button class="btn ghost" data-a="finish" data-v="${esc(JSON.stringify(v))}">End Match</button>`}
function solBest(sc){if(!G.solo)return'';const v=sc[me]||0,k=bestK(G.kind),seen='wg_seen_'+G.id+'_'+CUR,nw='wg_new_'+G.id+'_'+CUR;   // check each solo round once against the device best
 if(!localStorage.getItem(seen)){localStorage.setItem(seen,1);if(v>0&&v>(+localStorage.getItem(k)||0)){localStorage.setItem(k,v);localStorage.setItem(nw,1)}}
 return localStorage.getItem(nw)?'<p><em>A new personal best!</em></p>':''}
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
 else{const sc=scores(CUR),nb=solBest(sc);
  p=`<div class="pn"><h2>Round ${CUR} Results</h2>${nb}${PL.map(x=>`<p>${x.player==me?'You':nm(x.player)} <span class="big">${sc[x.player]}</span></p>`).join('')}${PL.map(x=>{const L=sub(CUR,x.player).payload.words,O=PL.filter(y=>y.player!=x.player).flatMap(y=>sub(CUR,y.player).payload.words);return `<h2>${x.player==me?'Your':nm(x.player)+'’s'} Words</h2>${wl(L,O,x.player!=me)}`}).join('')}</div><div class="pn">${matchBox(c,true)}${lobbyBtn}</div>`}
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
 else{const sc=scores(CUR),nb=solBest(sc);
  p=`<div class="pn" style="max-width:560px"><h2>Round ${CUR} Results</h2>${nb}${PL.map(x=>`<p>${x.player==me?'You':nm(x.player)} <span class="big">${sc[x.player]}</span></p>`).join('')}${cats.map((cat,i)=>`<div class="hl"><p><em>${esc(cat)}</em></p>${PL.map(x=>{const a=sub(CUR,x.player).payload.answers[i];return `<div class="gm"><span>${x.player==me?'You':nm(x.player)}: ${esc(a||'—')}</span>${a&&x.player!=me?dbtn(a.toLowerCase()):''}</div>`}).join('')}</div>`).join('')}</div><div class="pn">${matchBox(c,true)}${lobbyBtn}</div>`}
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
  if(p.exch){for(const l of p.exch){const i=r.indexOf(l);if(i>=0)r.splice(i,1)}r.push(...q.splice(0,p.exch.length));q.push(...p.exch);passes=0;continue}
  if(p.words&&p.words.some(fk))continue;
  passes=0;for(const t of p.play){board[t.r*15+t.c]={l:t.l,b:t.b};const i=r.indexOf(t.b?'?':t.l);if(i>=0)r.splice(i,1)}
  r.push(...q.splice(0,p.play.length));sc[m.player]+=p.score;last=m}
 const sum=r=>r.reduce((s,l)=>s+TV[l],0),out=q.length==0&&ids.find(id=>!racks[id].length),over=passes>=2*n||!!out,tot={...sc};
 if(over){ids.forEach(id=>tot[id]-=sum(racks[id]));if(out)tot[out]+=ids.reduce((s,id)=>s+(id==out?0:sum(racks[id])),0)}
 return{board,racks,tot,left:q.length,over,passes,byPass:over&&!out,last,lastRaw:raw,turn:raw?ids[(ids.indexOf(raw.player)+1)%n]:ids[0]}
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
 const words=W.map(w=>w.map(k=>at(k).l).join(''));if(!DICT)return{err:WAIT};
 const bad=words.filter(w=>!okW(w));
 if(bad.length)return{err:`${bad.join(', ')} ${bad.length>1?'aren’t':'isn’t'} in the word list.`,bad};
 return{score:total,words}
}
VIEW.rabble=()=>{
 if(G.status=='waiting')return wait();
 const S=rstate(),mine=S.turn==me&&!S.over&&G.status!='finished';if(RB.sig!=moves.length){RB.pend=new Map();RB.sel=null;RB.ex=null;RB.sig=moves.length}
 const used=new Set([...RB.pend.values()].map(v=>v.ri)),open=disp.some(d=>!d.verdict&&d.raised_by==me),lw=S.lastRaw&&S.lastRaw.player!=me&&S.lastRaw.payload.play?S.lastRaw.payload:null;
 const cells=[...Array(225).keys()].map(i=>{const t=RB.pend.get(i);if(t)return `<b class="p" data-a="rpick" data-v="${i}">${t.l}<small>${t.b?0:TV[t.l]}</small></b>`;const b=S.board[i];if(b)return `<b>${b.l}<small>${b.b?0:TV[b.l]}</small></b>`;return `<i class="${PREM[i]||''}" data-a="rput" data-v="${i}"></i>`}).join('');
 const rack=(S.racks[me]||[]).map((l,ri)=>used.has(ri)?'':`<b class="${(RB.ex?RB.ex.has(ri):RB.sel===ri)?'s':''}" data-a="rsel" data-v="${ri}">${l=='?'?'_':l}<small>${TV[l]}</small></b>`).join('');
 const pv=mine&&!open&&!RB.ex&&RB.pend.size?rscore(S.board,RB.pend):null;   // live score while tiles sit on the board
 const pvl=pv?`<div class="pv${pv.err?' bad':''}">${pv.err?esc(pv.err)+(pv.bad?pv.bad.map(w=>`<div>${pv.bad.length>1?esc(w)+': ':''}${fixW(w)}</div>`).join(''):''):`${pv.words.map(esc).join(' + ')} <span>${pv.score} point${pv.score==1?'':'s'}</span>${RB.pend.size==7?' <em>(with the 50-point bonus)</em>':''}`}</div>`:'';
 let ctl;
 if(S.over||G.status=='finished')ctl=finBtn(finData(S.tot));
 else if(!mine)ctl=`<p><em>Waiting on ${nm(S.turn)}…</em></p>`;
 else if(open)ctl='<p><em>Settle your dispute first.</em></p>';
 else if(RB.ex)ctl=`<p>Tap the tiles you want to swap.</p><button class="btn" data-a="rexch">Swap ${RB.ex.size} Tile${RB.ex.size==1?'':'s'}</button><button class="btn ghost" data-a="rexc">Cancel</button>`;
 else ctl=`<button class="btn" data-a="rplay">${pv&&!pv.err?`Play for ${pv.score}`:'Play Word'}</button><button class="btn ghost" data-a="rrecall">Recall Tiles</button>${S.left>=7?'<button class="btn ghost" data-a="rexmode">Exchange Tiles</button>':'<p><em>Exchanging needs 7 or more tiles in the bag.</em></p>'}<button class="btn ghost" data-a="rpass">Pass Turn</button>`;
 const lp=S.lastRaw&&S.lastRaw.payload,lb=S.lastRaw&&S.lastRaw.player,lwho=lb==me?'You':nm(lb);
 let dl='';
 if(lp&&lp.play&&lp.words){const bad=lp.words.some(fk),sc=bad?0:lp.score;
  dl=`<h2 style="margin-top:18px">Last Play</h2><p>${lwho} played <strong>${esc(lp.words[0])}</strong> for <span class="big lpn">${sc}</span> point${sc==1?'':'s'}${lp.play.length==7?' (all seven tiles, +50)':''}.</p>${bad?'<p><em>Ruled not a word, so no points.</em></p>':''}`
   +(mine&&!open&&lw?lp.words.map(w=>`<div class="gm"><span>${esc(w)}</span>${dbtn(w)}</div>`).join(''):lp.words.length>1?`<p><em>Also made ${lp.words.slice(1).map(esc).join(', ')}.</em></p>`:'')}
 else if(lp&&lp.exch)dl=`<p><em>${lwho} exchanged tiles.</em></p>`;
 else if(lp&&lp.pass)dl=`<p><em>${lwho} passed.</em></p>`;
 if(S.byPass)dl+=`<p><strong>Everyone passed twice in a row, so the game is over.</strong> Tiles left on each rack are taken off that player’s score.</p>`;
 else if(S.passes&&!S.over)dl+=`<p><em>${S.passes} pass${S.passes==1?'':'es'} in a row. The game ends after ${2*PL.length}.</em></p>`;
 shell(`<div class="row"><div class="bd" style="max-width:600px"><div class="g g15">${cells}</div><div class="key"><span><i class="tw"></i>Triple Word</span><span><i class="dw"></i>Double Word</span><span><i class="tl"></i>Triple Letter</span><span><i class="dl"></i>Double Letter</span></div><div class="rack">${rack}</div>${pvl}</div><div class="pn"><h2>Scores</h2>${PL.map(x=>`<p>${x.player==me?'You':nm(x.player)} — <span class="big">${S.tot[x.player]}</span>${S.turn==x.player&&!S.over?' (to play)':''}</p>`).join('')}<p>Tiles in bag: ${S.left}</p>${dl}${ctl}${lobbyBtn}</div>${dbox()}</div>`);
};

/* ---------- actions ---------- */
const trace=(w,b)=>{const u=[],f=(k,l)=>{if(k==w.length)return true;for(let i=0;i<16;i++){if(u.includes(i)||(l>=0&&!adj(l,i)))continue;const t=b[i].toUpperCase();if(w.startsWith(t,k)){u.push(i);if(f(k+t.length,i))return true;u.pop()}}return false};return f(0,-1)?u:null};
const ACT={
 async login(){const n=$('#nm').value.trim();if(!n)return alert('Please enter your name.');if(await login(n))start()},
 logout(){localStorage.removeItem('rr_name');showLogin()},
 async new(k,t){const np=k=='codemaster'?2:t&&t.dataset.solo?1:+$('#np').value;
  if(np==1){if(!['ogle','categories'].includes(k))return alert(KINDS[k][0]+' needs at least 2 players. Solo practice is for Ogle and Categories.');const g=newSolo(k);if(location.hash=='#'+g.code)return route();location.hash=g.code;return}const {data,error}=await sb.rpc('wg_create_game',{p_kind:k,p_seed:SEED[k](),p_name:saved(),p_max:np});if(error)return alert(error.message);location.hash=data.code},
 join(){const c=$('#jc').value.trim().toUpperCase();if(c.length==4)location.hash=c},
 async copy(){await navigator.clipboard.writeText(location.origin+location.pathname+'#'+G.code);alert('Invite link copied')},
 hidesolo(v){if(!confirm('Remove this practice game?'))return;localStorage.removeItem(soloK(v));lobby()},
 async hide(v){if(!confirm('Remove this game from your list? Other players keep it.'))return;
  localStorage.setItem('rr_hid',JSON.stringify([...new Set([...hidLocal(),v])]));sb.from('wg_hidden').insert({game_id:v,player:me}).then(()=>{});lobby()},
 sheetx(){closeSheet()},
 later(v){snooze(v,v=='install'?5:7);closeSheet()},
 async install(){if(!BIP)return;BIP.prompt();const r=await BIP.userChoice;BIP=null;closeSheet();if(r.outcome!='accepted')snooze('install',5)},
 async alertson(){const b=document.querySelector('[data-a=alertson]');if(b){b.disabled=true;b.textContent='One moment…'}const e=await subscribe();if(e){sheet(`<h2>Alerts Are Off</h2><p>${esc(e)}</p><button class="btn" data-a="sheetx">OK</button>`);snooze('alerts',7)}else{sheet('<h2>You’re All Set</h2><p>We’ll tell you when it’s your turn.</p><button class="btn" data-a="sheetx">Lovely</button>');lobby()}},
 async testalert(){const b=document.querySelector('[data-a=testalert]');if(b){b.disabled=true;b.textContent='Sending…'}
  let ep='';try{const reg=await navigator.serviceWorker.getRegistration(),sub=reg&&await reg.pushManager.getSubscription();ep=sub?sub.endpoint:''}catch(e){}
  if(!ep){if(b)b.textContent='Send Me a Test Alert',b.disabled=false;return sheet('<h2>Alerts Are Off on This Phone</h2><p>Tap Turn Alerts in the lobby to switch them on.</p><button class="btn" data-a="sheetx">OK</button>')}
  try{const reg=await navigator.serviceWorker.getRegistration(),j=(await reg.pushManager.getSubscription()).toJSON();await sb.from('wg_push_subs').upsert({endpoint:j.endpoint,player:me,sub:j},{onConflict:'endpoint'})}catch(e){}
  const {data,error}=await sb.functions.invoke('wg-notify',{body:{test:true,endpoint:ep}});if(b){b.textContent='Send Me a Test Alert';b.disabled=false}
  const msg=error||!data?'The alert service didn’t answer. The wg-notify function in Supabase may need to be updated or deployed again.'
   :data.ok?'A test alert is on its way. If nothing shows up within a minute, check Settings → Notifications → Word Games and make sure alerts are allowed.'
   :data.why=='not-registered'?'This phone isn’t on the alert list yet. Close Word Games, open it again from your home screen, and try once more.'
   :`Your phone’s alert service refused the message (code ${data.code||'?'}). Tap Turn Alerts again, or remove Word Games from your home screen and add it back.`;
  sheet(`<h2>${data&&data.ok?'Test Alert Sent':'Alert Check'}</h2><p>${esc(msg)}</p><button class="btn" data-a="sheetx">OK</button>`)},
 async push(){if(!('serviceWorker' in navigator&&'PushManager' in window))return alert('On iPhone: tap Share → Add to Home Screen, then open the game from your home screen and try again.');
  if(!VAPID_PUBLIC_KEY||VAPID_PUBLIC_KEY.startsWith('YOUR'))return alert('Add your VAPID public key to config.js first.');
  const e=await subscribe();alert(e||'Turn alerts are on.');if(!e)lobby()},
 start(){localStorage.setItem(K('rr_t_'),Date.now());VIEW[G.kind]()},
 otap(v){const i=+v,l=OG.path.at(-1);if(OG.path.length&&i===l)OG.path.pop();else if(OG.path.includes(i))return;else if(!OG.path.length||adj(l,i))OG.path.push(i);else return;ogPaint()},
 oadd(){const w=ocur();if(w.length<3)return alert('Words need at least 3 letters.');if(!okW(w)){const e=$('#oerr');if(!DICT)return e?void(e.textContent=WAIT):alert(WAIT);if(e){e.innerHTML='“'+esc(w)+'” isn’t in the word list. '+fixW(w);return}return alert('“'+w+'” isn’t in the word list.')}const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle()},
 oclr(){OG.path=[];VIEW.ogle()},
 orm(v){localStorage.setItem(K('rr_ow_'),JSON.stringify(ow().filter(w=>w!=v)));VIEW.ogle()},
 async words(v,t,auto){if(sub(CUR,me))return;const w=ow(),c=ocur();if(c.length>=3&&!w.includes(c)&&okW(c))w.push(c);
  await put({words:w,r:CUR});OG.path=[];refresh()},
 async answers(v,t,auto){if(!document.querySelector('.ans')||sub(CUR,me))return;const L=rnds().cur.seed.letter,inp=[...document.querySelectorAll('.ans')],a=inp.map(i=>i.value.trim()).map(x=>x&&x[0].toUpperCase()==L?x:'');
  if(inp.some((i,k)=>i.value.trim()&&!a[k])&&!auto&&!confirm('Some answers don’t start with '+L+' and will be dropped. Send anyway?'))return;
  await put({answers:a,r:CUR});refresh()},
 async realw(v){const w=String(v).toUpperCase();
  if(G&&!G.solo){const {data,error}=await sb.rpc('wg_ask_word',{p_word:w,p_game:G.id,p_player:me});
   if(error)return alert('Couldn’t send that. '+error.message);
   await refresh();
   if(!WQ.some(q=>q.word==w&&q.status=='pending')&&data=='pending')return alert('“'+w+'” is already waiting for an answer in another game.');
   if(data=='ok')return alert('“'+w+'” has already been allowed. Try playing it again.');
   return alert('Sent. '+others().replace(/&amp;/g,'&')+' will be asked to allow “'+w+'”. Once they do, you can play it.')}
  SOLOW.add(w);localStorage.setItem('wg_solo_words',JSON.stringify([...SOLOW]));
  if(G&&G.kind=='ogle'){const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle();const t=$('#ot');if(t){t.value='';t.focus()}}else if(G&&G.kind=='rabble')VIEW.rabble()},
 async wok(v){const {error}=await sb.rpc('wg_rule_word',{p_word:v,p_ok:true,p_player:me});if(error)alert('Couldn’t save that. '+error.message);EXT.add(String(v).toUpperCase());refresh()},
 async wno(v){const {error}=await sb.rpc('wg_rule_word',{p_word:v,p_ok:false,p_player:me});if(error)alert('Couldn’t save that. '+error.message);refresh()},
 async dispute(v){await sb.from('wg_disputes').insert({game_id:G.id,item:v,raised_by:me});refresh()},
 async rule(v,t){await sb.rpc('wg_rule_dispute',{p_id:+t.dataset.id,p_verdict:v});refresh()},
 async rnew(){const n=rnds().R.length+1;await put({rematch:{n,seed:SEED[G.kind](rnds().R.map(r=>r.seed))}});refresh()},
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
 async finish(v){if(G.solo){const g=getSolo(G.kind);if(g&&g.id==G.id){g.status='finished';putSolo(g)}return refresh()}let w=null,s=null;if(v!='lost'){const o=JSON.parse(v);w=o.w;s=o.s}await sb.rpc('wg_finish_game',{p_game:G.id,p_victors:w,p_score:s});refresh()},
 rsel(v){const i=+v;if(RB.ex){RB.ex.has(i)?RB.ex.delete(i):RB.ex.add(i)}else RB.sel=RB.sel===i?null:i;VIEW.rabble()},
 rput(v){const S=rstate();if(RB.ex||RB.sel==null||S.turn!=me||S.over)return;let l=S.racks[me][RB.sel],b=0;if(l=='?'){l=(prompt('Which letter should the blank be?')||'').toUpperCase().slice(0,1);if(!/[A-Z]/.test(l))return;b=1}RB.pend.set(+v,{l,b,ri:RB.sel});RB.sel=null;VIEW.rabble()},
 rpick(v){RB.pend.delete(+v);VIEW.rabble()},
 rrecall(){RB.pend.clear();VIEW.rabble()},
 rexmode(){RB.ex=new Set();RB.pend.clear();RB.sel=null;VIEW.rabble()},
 rexc(){RB.ex=null;VIEW.rabble()},
 async rexch(){const S=rstate();if(!RB.ex||!RB.ex.size)return alert('Tap the tiles you want to swap first.');if(S.left<7)return alert('Exchanging needs 7 or more tiles in the bag.');
  const L=[...RB.ex].map(i=>S.racks[me][i]);await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{exch:L}});RB.ex=null;refresh()},
 async rplay(){const S=rstate(),r=rscore(S.board,RB.pend);if(r.err)return alert(r.err);await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{play:[...RB.pend].map(([i,t])=>({r:i/15|0,c:i%15,l:t.l,b:t.b})),words:r.words,score:r.score}});refresh()},
 async rpass(){const S=rstate(),last=S.passes+1>=2*PL.length;if(!confirm(last?'Everyone else has passed twice. If you pass too, the game ends now. Pass?':'Pass your turn?'))return;await sb.from('wg_moves').insert({game_id:G.id,player:me,payload:{pass:true}});await refresh();
  if(last){const T=rstate();if(T.over&&G.status!='finished')await ACT.finish(JSON.stringify(finData(T.tot)))}}
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
 if(!okW(w)){const o=$('#oerr');if(!DICT)return void(o.textContent=WAIT);return void(o.innerHTML='“'+esc(w)+'” isn’t in the word list. '+fixW(w))}
 const a=ow();if(!a.includes(w)){a.push(w);localStorage.setItem(K('rr_ow_'),JSON.stringify(a))}OG.path=[];VIEW.ogle();$('#ot').focus()});
let sending=false;
function tick(){if(!G||!['categories','ogle'].includes(G.kind))return;const t0=+localStorage.getItem(K('rr_t_'))||0,el=$('#cdown');if(!t0||!el||sub(CUR,me))return;
 const left=Math.max(0,(G.kind=='ogle'?OGLE_SECS:CAT_SECS)-Math.floor((Date.now()-t0)/1000));el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
 if(left==0&&!sending){sending=true;ACT[G.kind=='ogle'?'words':'answers'](null,null,true).finally(()=>sending=false)}}
setInterval(tick,1000);
const comeBack=()=>{if(document.hidden||!me)return;if(G&&!G.solo)draw();else if(!G)lobby(true)};
addEventListener('visibilitychange',comeBack);addEventListener('pageshow',comeBack);addEventListener('focus',comeBack);
init();

// ---- Tiles drawn as pictures ----
// Some Android browsers repaint pages in their own dark mode: they lighten dark text but can leave the
// beige tile colour alone, which made letters vanish. A picture of the whole tile (beige + letter) is
// either left alone or flipped as a whole, so the letter always stays readable.
const TILE={};
function tileImg(txt,sc,bg,w,h,fs,ss){const dpr=Math.min(3,window.devicePixelRatio||1),k=[txt,sc,bg,w,h,fs,ss,dpr].join('|');if(TILE[k])return TILE[k];
 const c=document.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const x=c.getContext('2d');x.scale(dpr,dpr);
 const r=3;x.fillStyle=bg;x.beginPath();x.moveTo(r,0);x.arcTo(w,0,w,h,r);x.arcTo(w,h,0,h,r);x.arcTo(0,h,0,0,r);x.arcTo(0,0,w,0,r);x.closePath();x.fill();
 x.fillStyle='#1d0a0f';x.textAlign='center';x.textBaseline='middle';x.font=`700 ${fs}px 'Atkinson Hyperlegible',Arial,sans-serif`;x.fillText(txt,w/2,h/2+fs*.05);
 if(sc!==''){x.font=`700 ${ss}px 'Atkinson Hyperlegible',Arial,sans-serif`;x.textAlign='right';x.textBaseline='alphabetic';x.fillText(sc,w-2,h-1.5)}
 return TILE[k]=c.toDataURL('image/png')}
function paintTiles(){const root=document.getElementById('app');if(!root)return;
 for(const b of root.querySelectorAll('.g b,.rack b')){const w=b.clientWidth,h=b.clientHeight;if(!w||!h)continue;
  const sm=b.querySelector('small'),sc=sm?sm.textContent.trim():'',txt=[...b.childNodes].filter(n=>n.nodeType==3).map(n=>n.data).join('').trim();
  const bg=b.classList.contains('p')||b.classList.contains('u')?'#ffe7a8':'#f3e6c8',fs=parseFloat(getComputedStyle(b).fontSize)||16,ss=sm?parseFloat(getComputedStyle(sm).fontSize)||9:0;
  const k=[txt,sc,bg,w,h,fs,ss].join('|');if(b.dataset.tk===k)continue;b.dataset.tk=k;
  b.style.backgroundImage=`url(${tileImg(txt,sc,bg,w,h,fs,ss)})`;b.classList.add('pic')}}
let tileRaf=0;const tilesSoon=()=>{if(!tileRaf)tileRaf=requestAnimationFrame(()=>{tileRaf=0;paintTiles()})};
new MutationObserver(tilesSoon).observe(document.getElementById('app'),{childList:true,subtree:true,characterData:true});
addEventListener('resize',tilesSoon);
if(document.fonts)Promise.all([document.fonts.ready,document.fonts.load("700 20px 'Atkinson Hyperlegible'").catch(()=>0)]).then(()=>{for(const k in TILE)delete TILE[k];document.querySelectorAll('[data-tk]').forEach(b=>delete b.dataset.tk);paintTiles()});
tilesSoon();
