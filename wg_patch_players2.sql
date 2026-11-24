-- Word Games: the player list shows only real Word Games players, and removing someone is permanent.
-- Run once in Supabase (the project Word Games uses): SQL Editor > New query > paste > Run.

-- Who shows up: people who have sat down in a game with at least one other person.
-- Never-played accounts and the old "Reader" placeholder accounts are left out.
create or replace function wg_player_list() returns table(id uuid, name text, avatar text, seen_at timestamptz)
language sql stable security definer set search_path=public as $$
  select p.id, p.name, p.avatar, p.seen_at from wg_players p
  where not p.hidden and lower(trim(p.name)) <> 'reader'
    and exists (select 1 from wg_game_players gp where gp.player = p.id
                and (select count(*) from wg_game_players o where o.game_id = gp.game_id) >= 2)
  order by p.seen_at desc nulls last, p.name $$;

-- Removing a player for good: their account, their seats, their push alerts and invitations,
-- and every game they were in. Wins already in the Hall of Fame stay (without the link to the game).
create or replace function wg_purge_player(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare gids uuid[]; t text;
begin
  select coalesce(array_agg(distinct g), '{}') into gids from (
    select id as g from wg_games where p1 = p_id or p2 = p_id
    union select game_id from wg_game_players where player = p_id) s;
  update wg_winners set game_id = null where game_id = any(gids);
  if to_regclass('wg_words') is not null then update wg_words set game_id = null where game_id = any(gids); end if;
  foreach t in array array['wg_hidden','wg_invites','wg_game_players','wg_moves','wg_disputes','wg_cm_keys','wg_cm_reveals'] loop
    if to_regclass(t) is not null then execute format('delete from %I where game_id = any($1)', t) using gids; end if;
  end loop;
  delete from wg_invites where player = p_id or from_player = p_id;
  delete from wg_game_players where player = p_id;
  delete from wg_games where id = any(gids);
  delete from wg_push_subs where player = p_id;
  delete from wg_players where id = p_id;
end $$;
revoke all on function wg_purge_player(uuid) from public, anon, authenticated;

-- Only Josh can remove people.
create or replace function wg_delete_player(p_me uuid, p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from wg_players where id = p_me and lower(trim(name)) = 'josh') then raise exception 'Only Josh can remove players.'; end if;
  if p_id = p_me then raise exception 'You can’t remove yourself.'; end if;
  perform wg_purge_player(p_id);
end $$;
grant execute on function wg_player_list(), wg_delete_player(uuid, uuid) to authenticated;

-- Clean-up: everyone you already took off the list is now removed for good.
select wg_purge_player(id) from wg_players where hidden;
