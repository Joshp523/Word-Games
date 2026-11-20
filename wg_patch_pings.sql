-- Word Games: turn alerts sent straight from the app (the same route as the test alert).
-- Run once in Supabase → SQL Editor. Safe to run again. Then redeploy wg-notify with the new index.ts.

-- Remembers which moves, disputes, joins and word decisions have been announced, so nobody gets an alert twice.
create table if not exists wg_notified(key text primary key, at timestamptz not null default now());
alter table wg_notified enable row level security;   -- only the alert function (service role) touches it

-- Timestamps the alert function needs. Existing rows stay blank, so nothing old gets announced.
alter table wg_disputes add column if not exists created_at timestamptz;
alter table wg_disputes alter column created_at set default now();
alter table wg_words add column if not exists decided_at timestamptz;

create or replace function wg_rule_word(p_word text, p_ok boolean, p_player uuid) returns void
language sql security definer set search_path=public as $$
  update wg_words set status = case when p_ok then 'ok' else 'no' end, decided_by = p_player, decided_at = now()
  where word = upper(trim(p_word)) and status = 'pending' and added_by <> p_player
    and game_id is not null and wg_is_member(game_id)
    and exists (select 1 from wg_game_players gp where gp.game_id = wg_words.game_id and gp.player = p_player) $$;
grant execute on function wg_rule_word(text, boolean, uuid) to authenticated;

create or replace function wg_ask_word(p_word text, p_game uuid, p_player uuid) returns text
language plpgsql security definer set search_path=public as $$
declare w text := upper(trim(p_word)); s text;
begin
  if p_game is null or not wg_is_member(p_game)
     or not exists (select 1 from wg_game_players where game_id = p_game and player = p_player) then
    raise exception 'not in this game';
  end if;
  insert into wg_words(word, added_by, game_id, status) values (w, p_player, p_game, 'pending')
  on conflict (word) do update set added_by = p_player, game_id = p_game, status = 'pending', decided_by = null, decided_at = null, created_at = now()
    where wg_words.status = 'no';
  select status into s from wg_words where word = w;
  return s;
end $$;
grant execute on function wg_ask_word(text, uuid, uuid) to authenticated;

-- Tidy up: forget announcements older than a week.
delete from wg_notified where at < now() - interval '7 days';
