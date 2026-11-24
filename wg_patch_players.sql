-- Word Games: the player list, challenges and profile pictures.
-- Run once in Supabase → SQL Editor. Safe to run again. Then redeploy wg-notify with the new index.ts.

alter table wg_players add column if not exists avatar text;                 -- small JPEG as a data: URL
alter table wg_players add column if not exists hidden boolean not null default false;
alter table wg_players add column if not exists seen_at timestamptz;

-- A challenge: someone in a game invites another player into it. Accepting just joins the game.
create table if not exists wg_invites(
  id bigserial primary key,
  game_id uuid not null references wg_games on delete cascade,
  player uuid not null,
  from_player uuid not null,
  from_name text, kind text, code text,
  created_at timestamptz not null default now(),
  unique (game_id, player)
);
alter table wg_invites add column if not exists from_name text;
alter table wg_invites add column if not exists kind text;
alter table wg_invites add column if not exists code text;
alter table wg_invites enable row level security;
drop policy if exists wg_invites_read on wg_invites;
create policy wg_invites_read on wg_invites for select to authenticated using (true);
grant select on wg_invites to authenticated;

create or replace function wg_challenge(p_game uuid, p_me uuid, p_players uuid[]) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from wg_game_players where game_id = p_game and player = p_me) then raise exception 'not in this game'; end if;
  insert into wg_invites(game_id, player, from_player, from_name, kind, code)
    select p_game, x, p_me, (select name from wg_players where id = p_me), g.kind, g.code
    from unnest(p_players) x, wg_games g where g.id = p_game and x <> p_me
  on conflict (game_id, player) do nothing;
end $$;

create or replace function wg_decline(p_invite bigint, p_me uuid) returns void
language sql security definer set search_path=public as $$
  delete from wg_invites where id = p_invite and (player = p_me or from_player = p_me) $$;

-- Once someone takes a seat, their invitation is used up.
create or replace function wg_invite_used() returns trigger language plpgsql security definer set search_path=public as $$
begin delete from wg_invites where game_id = new.game_id and player = new.player; return new; end $$;
drop trigger if exists wg_invite_used on wg_game_players;
create trigger wg_invite_used after insert on wg_game_players for each row execute function wg_invite_used();

create or replace function wg_set_avatar(p_me uuid, p_img text) returns void
language sql security definer set search_path=public as $$
  update wg_players set avatar = case when p_img is null or length(p_img) < 120000 then p_img else avatar end where id = p_me $$;

create or replace function wg_seen(p_me uuid) returns void
language sql security definer set search_path=public as $$
  update wg_players set seen_at = now(), hidden = hidden where id = p_me $$;

-- Only Josh can take people off the player list (it hides them; their games and scores stay).
create or replace function wg_hide_player(p_me uuid, p_id uuid, p_hide boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from wg_players where id = p_me and lower(trim(name)) = 'josh') then raise exception 'Only Josh can change the player list.'; end if;
  update wg_players set hidden = p_hide where id = p_id;
end $$;

grant execute on function wg_challenge(uuid, uuid, uuid[]), wg_decline(bigint, uuid), wg_set_avatar(uuid, text), wg_seen(uuid), wg_hide_player(uuid, uuid, boolean) to authenticated;
