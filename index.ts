// wg-notify: sends a turn alert to the right people after every move, dispute, or join.
// Works for 2, 3 and 4 player games (it reads the seats from wg_game_players).
// Also: Rabble word requests (the other players are asked, the asker hears the answer),
// and a "test" call from the lobby so a player can check alerts reach their own phone.
//
// Two ways in, same alerts, never sent twice (wg_notified remembers what was announced):
//  1. "ping": the app calls this right after a player does something in a game. This is the main route,
//     because it uses the same path as the test alert, which is known to work.
//  2. the old database triggers (pg_net + webhook secret), if they happen to be working too.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
const TITLE: Record<string, string> = { ogle: "Ogle", rabble: "Rabble", categories: "Categories", codemaster: "Codemaster" };
type Seat = { player: string; name: string; seat: number };

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...CORS, "Content-Type": "application/json" } });
const send = (sub: unknown, title: string, body: string, url: string, tag: string) =>
  webpush.sendNotification(sub as webpush.PushSubscription, JSON.stringify({ title, body, url, tag }), { TTL: 86400, urgency: "high" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const body = await req.json().catch(() => ({}));

  // Test from the lobby: ping only the phone that asked (it sends its own push address).
  if (body.test) {
    const { data: s } = await db.from("wg_push_subs").select("*").eq("endpoint", body.endpoint ?? "").maybeSingle();
    if (!s) return json({ ok: false, why: "not-registered" });
    try { await send(s.sub, "Word Games", "Test alert: turn alerts reach this phone.", "./", "wg-test"); return json({ ok: true }); }
    catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await db.from("wg_push_subs").delete().eq("endpoint", s.endpoint);
      return json({ ok: false, why: "push-failed", code: e.statusCode ?? null, detail: String(e.body ?? e.message ?? e).slice(0, 200) });
    }
  }

  // Ping from the app: look at what happened in this game in the last 15 minutes and announce anything new.
  if (body.ping) {
    const gid = String(body.ping), since = new Date(Date.now() - 15 * 60e3).toISOString();
    const [mv, ds, ws] = await Promise.all([
      db.from("wg_moves").select("*").eq("game_id", gid).gte("created_at", since).order("id"),
      db.from("wg_disputes").select("*").eq("game_id", gid).gte("created_at", since).order("id"),
      db.from("wg_words").select("*").eq("game_id", gid).or(`created_at.gte.${since},decided_at.gte.${since}`),
    ]);
    const jobs: [string, string, Record<string, unknown>][] = [];
    for (const r of mv.data ?? []) jobs.push([`m:${r.id}`, "wg_moves", r]);
    for (const r of ds.data ?? []) jobs.push([`d:${r.id}`, "wg_disputes", r]);
    for (const r of ws.data ?? []) jobs.push([`w:${r.word}:${r.status}:${r.decided_at ?? r.created_at}`, "wg_words", r]);
    if (body.joined) {
      const { data: seat } = await db.from("wg_game_players").select("*").eq("game_id", gid).eq("player", body.joined).maybeSingle();
      if (seat) jobs.push([`j:${gid}:${body.joined}`, "wg_game_players", seat]);
    }
    let sent = 0;
    for (const [key, table, r] of jobs) if (await claim(key)) sent += await handle(table, r);
    return json({ ok: true, sent });
  }

  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) return new Response("no", { status: 401 });
  const { table, record: r } = body;
  // Joins are announced from wg_game_players (one row per seat), so the old wg_games ping is ignored.
  if (table === "wg_games") return new Response("ok");
  const key = table === "wg_moves" ? `m:${r.id}` : table === "wg_disputes" ? `d:${r.id}` : table === "wg_game_players" ? `j:${r.game_id}:${r.player}`
    : `w:${r.word}:${r.status}:${r.decided_at ?? r.created_at}`;
  if (await claim(key)) await handle(table, r);
  return new Response("ok");
});

// Mark an event as announced. Returns false if it already was.
async function claim(key: string) {
  const { error } = await db.from("wg_notified").insert({ key });
  if (!error) return true;
  // Table not created yet (wg_patch_pings.sql not run): send anyway rather than never.
  return error.code === "42P01" || /does not exist|schema cache/i.test(error.message ?? "");
}

// Work out who to tell about one event, and send it. Returns how many alerts went out.
// deno-lint-ignore no-explicit-any
async function handle(table: string, r: any): Promise<number> {
  const gid = r.game_id;
  const [{ data: g }, { data: seats }] = await Promise.all([
    db.from("wg_games").select("*").eq("id", gid).single(),
    db.from("wg_game_players").select("player,name,seat").eq("game_id", gid).order("seat"),
  ]);
  if (!g) return 0;
  const P: Seat[] = seats ?? [];
  const name = (id: string) => P.find((x) => x.player === id)?.name ?? "Someone";
  const others = (id: string) => P.filter((x) => x.player !== id).map((x) => x.player);
  const out: [string, string][] = [];
  const tell = (to: string[], text: string) => to.forEach((t) => out.push([t, text]));

  if (table === "wg_words") {
    // Rabble word request: ask everyone else; once decided, tell the asker.
    if (r.status === "pending") tell(others(r.added_by), `${name(r.added_by)} wants to play “${r.word}”. Is it a word?`);
    else if (r.status === "ok" || r.status === "no") tell([r.added_by], `${name(r.decided_by)} ${r.status === "ok" ? "allowed" : "didn’t allow"} “${r.word}”.`);
  } else if (table === "wg_game_players") {
    tell(others(r.player), `${r.name ?? name(r.player)} has joined your game.`);
  } else if (table === "wg_disputes") {
    tell(others(r.raised_by), `${name(r.raised_by)} disputed “${r.item}”.`);
  } else if (table === "wg_moves") {
    const p = r.payload ?? {}, by: string = r.player, who = name(by);
    if (g.kind === "rabble" && (p.play || p.pass || p.exch)) {
      // Only the next player in seat order is up.
      const i = P.findIndex((x) => x.player === by), next = P[(i + 1) % P.length]?.player;
      const what = p.play ? `played ${p.words?.[0] ?? "a word"} for ${p.score} points` : p.exch ? "swapped tiles" : "passed";
      let ended = false;
      if (p.pass) {
        // Everyone passing twice in a row ends the game.
        const { data: mv } = await db.from("wg_moves").select("payload").eq("game_id", gid).order("id");
        let run = 0;
        for (const m of (mv ?? []).map((x) => x.payload).filter((q) => q.play || q.pass || q.exch)) run = m.pass ? run + 1 : 0;
        ended = run >= 2 * P.length;
      }
      if (ended) tell(others(by), `Everyone passed twice in a row, so the game is over. Come and see the final scores.`);
      else if (next && next !== by) tell([next], `${who} ${what}. It’s your turn.`);
    } else if (g.kind === "codemaster" && p.clue) {
      tell(others(by), `${who} gave a clue: ${p.clue} · ${p.n}. Your turn to guess.`);
    } else if (g.kind === "codemaster" && p.end) {
      tell(others(by), `${who} has finished guessing. Your turn for the next clue.`);
    } else if (p.words || p.answers) {
      // Ogle and Categories: everyone plays each round. Nudge whoever hasn't played yet,
      // and tell everyone once the last player is in.
      const n = p.r ?? 1;
      const { data: mv } = await db.from("wg_moves").select("player,payload").eq("game_id", gid);
      const done = new Set((mv ?? []).filter((m) => (m.payload.words || m.payload.answers) && (m.payload.r ?? 1) === n).map((m) => m.player));
      const todo = others(by).filter((x) => !done.has(x));
      if (todo.length) tell(todo, `${who} has played${n > 1 ? ` round ${n}` : ""}. It’s your turn.`);
      else tell(others(by), `Everyone has played. The results are in.`);
    } else if (p.rematch) {
      tell(others(by), `${who} wants to play another round.`);
    } else if (p.accept !== undefined || p.reject !== undefined) {
      tell(others(by), `${who} ${p.reject !== undefined ? "declined" : "accepted"} another round.`);
    }
  }

  let n = 0;
  for (const [to, text] of out) {
    const { data: subs } = await db.from("wg_push_subs").select("*").eq("player", to);
    for (const s of subs ?? []) {
      try { await send(s.sub, TITLE[g.kind], text, `./#${g.code}`, `wg-${g.code}`); n++; }
      catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await db.from("wg_push_subs").delete().eq("endpoint", s.endpoint); }
    }
  }
  return n;
}
