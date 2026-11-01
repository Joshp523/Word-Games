import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);
const TITLE: Record<string, string> = { ogle: "Ogle", rabble: "Rabble", categories: "Categories", codemaster: "Codemaster" };
Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) return new Response("no", { status: 401 });
  const { table, record: r } = await req.json();
  const { data: g } = await db.from("wg_games").select("*").eq("id", table === "wg_games" ? r.id : r.game_id).single();
  if (!g) return new Response("ok");
  let to: string | null, text: string;
  if (table === "wg_games") { to = g.p1; text = `${g.p2_name} has joined your game.`; }
  else {
    const by = table === "wg_moves" ? r.player : r.raised_by;
    to = by === g.p1 ? g.p2 : g.p1;
    const who = by === g.p1 ? g.p1_name : g.p2_name;
    text = table === "wg_moves" ? `${who} has played. It’s your turn.` : `${who} disputed a word.`;
  }
  if (!to) return new Response("ok");
  const { data: subs } = await db.from("wg_push_subs").select("*").eq("player", to);
  for (const s of subs ?? []) {
    try { await webpush.sendNotification(s.sub, JSON.stringify({ title: TITLE[g.kind], body: text, url: `./#${g.code}` })); }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await db.from("wg_push_subs").delete().eq("endpoint", s.endpoint); }
  }
  return new Response("ok");
});
