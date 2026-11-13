-- Fix for Rabble word requests (Nov 2026). Run once in Supabase → SQL Editor. Safe to run again.
-- The first version recorded the phone's sign-in id instead of the player, so the asker was treated as
-- someone else: they saw their own request, the name showed as "…", and the alert went to them too.
-- Now the player id is passed in and checked against the game's seats.

drop function if exists wg_ask_word(text, uuid);
drop function if exists wg_rule_word(text, boolean);

create or replace function wg_ask_word(p_word text, p_game uuid, p_player uuid) returns text
language plpgsql security definer set search_path=public as $$
declare w text := upper(trim(p_word)); s text;
begin
  if p_game is null or not wg_is_member(p_game)
     or not exists (select 1 from wg_game_players where game_id = p_game and player = p_player) then
    raise exception 'not in this game';
  end if;
  insert into wg_words(word, added_by, game_id, status) values (w, p_player, p_game, 'pending')
  on conflict (word) do update set added_by = p_player, game_id = p_game, status = 'pending', decided_by = null, created_at = now()
    where wg_words.status = 'no';
  select status into s from wg_words where word = w;
  return s;
end $$;

create or replace function wg_rule_word(p_word text, p_ok boolean, p_player uuid) returns void
language sql security definer set search_path=public as $$
  update wg_words set status = case when p_ok then 'ok' else 'no' end, decided_by = p_player
  where word = upper(trim(p_word)) and status = 'pending' and added_by <> p_player
    and game_id is not null and wg_is_member(game_id)
    and exists (select 1 from wg_game_players gp where gp.game_id = wg_words.game_id and gp.player = p_player) $$;

grant execute on function wg_ask_word(text, uuid, uuid), wg_rule_word(text, boolean, uuid) to authenticated;

-- Requests made with the old version can't be matched to a player, so clear them. Players can simply ask again.
delete from wg_words where status in ('pending', 'no');
