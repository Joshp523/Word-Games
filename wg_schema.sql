-- Word Games (Ogle / Rabble / Categories / Codemaster): complete Supabase setup.
-- Everything is prefixed wg_ so it can't collide with anything else in your project.
-- Safe to run more than once.
-- 1) Change 'CHANGE-ME' near the bottom to a long random string.  2) Run this whole file in SQL Editor.
-- 3) Authentication → Sign In / Providers → enable "Allow anonymous sign-ins".

create table if not exists wg_players(id uuid primary key references auth.users on delete cascade, name text not null);
create table if not exists wg_games(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('ogle','rabble','categories','codemaster')),
  p1 uuid not null references wg_players, p1_name text not null default 'Reader',
  p2 uuid references wg_players, p2_name text,
  seed jsonb not null default '{}', status text not null default 'waiting',
  created_at timestamptz not null default now());
create table if not exists wg_moves(id bigserial primary key, game_id uuid not null references wg_games on delete cascade,
  player uuid not null, payload jsonb not null, created_at timestamptz not null default now());
create table if not exists wg_disputes(id bigserial primary key, game_id uuid not null references wg_games on delete cascade,
  item text not null, raised_by uuid not null, verdict text check (verdict in ('real','fake')),
  unique(game_id,item));
create table if not exists wg_cm_keys(game_id uuid primary key references wg_games on delete cascade, codemaster uuid not null, key text[] not null);
create table if not exists wg_cm_reveals(game_id uuid references wg_games on delete cascade, idx int, result text, primary key(game_id,idx));
create table if not exists wg_winners(id bigserial primary key, game_id uuid references wg_games, kind text not null,
  victors text not null, score text, won_at timestamptz not null default now());
create table if not exists wg_push_subs(endpoint text primary key, player uuid not null references wg_players on delete cascade, sub jsonb not null);

alter table wg_games add column if not exists p1_name text not null default 'Reader';
alter table wg_games add column if not exists p2_name text;

create or replace function wg_is_member(g uuid) returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from wg_games where id=g and auth.uid() in (p1,p2)) $$;

alter table wg_players enable row level security; alter table wg_games enable row level security;
alter table wg_moves enable row level security; alter table wg_disputes enable row level security;
alter table wg_cm_keys enable row level security; alter table wg_cm_reveals enable row level security;
alter table wg_winners enable row level security; alter table wg_push_subs enable row level security;

drop policy if exists wg_players_read on wg_players;
create policy wg_players_read on wg_players for select to authenticated using (true);
drop policy if exists wg_players_ins on wg_players;
create policy wg_players_ins on wg_players for insert to authenticated with check (id=auth.uid());
drop policy if exists wg_players_upd on wg_players;
create policy wg_players_upd on wg_players for update to authenticated using (id=auth.uid());
drop policy if exists wg_games_read on wg_games;
create policy wg_games_read on wg_games for select to authenticated using (auth.uid() in (p1,p2));
drop policy if exists wg_moves_read on wg_moves;
create policy wg_moves_read on wg_moves for select to authenticated using (wg_is_member(game_id));
drop policy if exists wg_moves_ins on wg_moves;
create policy wg_moves_ins on wg_moves for insert to authenticated with check (player=auth.uid() and wg_is_member(game_id));
drop policy if exists wg_disputes_read on wg_disputes;
create policy wg_disputes_read on wg_disputes for select to authenticated using (wg_is_member(game_id));
drop policy if exists wg_disputes_ins on wg_disputes;
create policy wg_disputes_ins on wg_disputes for insert to authenticated with check (raised_by=auth.uid() and wg_is_member(game_id));
-- Only the codemaster can ever read the key; the guesser reveals cards through wg_cm_guess().
drop policy if exists wg_cm_keys_read on wg_cm_keys;
create policy wg_cm_keys_read on wg_cm_keys for select to authenticated using (codemaster=auth.uid());
drop policy if exists wg_cm_reveals_read on wg_cm_reveals;
create policy wg_cm_reveals_read on wg_cm_reveals for select to authenticated using (wg_is_member(game_id));
drop policy if exists wg_winners_read on wg_winners;
create policy wg_winners_read on wg_winners for select to authenticated using (true);
drop policy if exists wg_push_subs_all on wg_push_subs;
create policy wg_push_subs_all on wg_push_subs for all to authenticated using (player=auth.uid()) with check (player=auth.uid());

create or replace function wg_create_game(p_kind text, p_seed jsonb, p_name text) returns wg_games language plpgsql security definer set search_path=public as $$
declare g wg_games; c text; a text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  loop
    c:=''; for i in 1..4 loop c:=c||substr(a,1+floor(random()*length(a))::int,1); end loop;
    exit when not exists(select 1 from wg_games where code=c);
  end loop;
  insert into wg_games(code,kind,p1,p1_name,seed)
  values(c,p_kind,auth.uid(),left(coalesce(nullif(trim(p_name),''),'Reader'),20),p_seed) returning * into g;
  if p_kind='codemaster' then
    insert into wg_cm_keys(game_id,codemaster,key)
    select g.id,auth.uid(),array_agg(k order by random()) from (
      select 'a' k from generate_series(1,9) union all select 'k' from generate_series(1,5) union all select 'm' from generate_series(1,11)) s;
  end if;
  return g;
end $$;

create or replace function wg_join_game(p_code text, p_name text) returns wg_games language plpgsql security definer set search_path=public as $$
declare g wg_games;
begin
  select * into g from wg_games where code=upper(p_code);
  if not found then raise exception 'No game with that code'; end if;
  if auth.uid() in (g.p1,g.p2) then return g; end if;
  if g.p2 is not null then raise exception 'That game is full'; end if;
  update wg_games set p2=auth.uid(), p2_name=left(coalesce(nullif(trim(p_name),''),'Reader'),20), status='active'
  where id=g.id returning * into g;
  return g;
end $$;

create or replace function wg_cm_guess(p_game uuid, p_idx int) returns text language plpgsql security definer set search_path=public as $$
declare g wg_games; k text[]; r text; n int; clues int;
begin
  select * into g from wg_games where id=p_game;
  if g.p2 is distinct from auth.uid() then raise exception 'Only the guesser may guess'; end if;
  if g.status<>'active' then raise exception 'The game is over'; end if;
  select key into k from wg_cm_keys where game_id=p_game;
  r:=k[p_idx+1];
  insert into wg_cm_reveals values(p_game,p_idx,r);
  if r='k' then update wg_games set status='finished' where id=p_game;
  else
    select count(*) into n from wg_cm_reveals where game_id=p_game and result='a';
    if n=9 then
      update wg_games set status='finished' where id=p_game;
      select count(*) into clues from wg_moves where game_id=p_game and payload ? 'clue';
      insert into wg_winners(game_id,kind,victors,score)
      values(p_game,'codemaster',g.p1_name||' & '||g.p2_name,'9 of 9 agents · '||greatest(8-clues,0)||' clues spare');
    end if;
  end if;
  return r;
end $$;

create or replace function wg_rule_dispute(p_id bigint, p_verdict text) returns void language sql security definer set search_path=public as $$
  update wg_disputes set verdict=p_verdict where id=p_id and raised_by=auth.uid() and wg_is_member(game_id) and p_verdict in ('real','fake') $$;

create or replace function wg_finish_game(p_game uuid, p_victors text, p_score text) returns void language plpgsql security definer set search_path=public as $$
declare g wg_games;
begin
  select * into g from wg_games where id=p_game;
  if auth.uid() not in (g.p1,g.p2) or g.status='finished' then return; end if;
  update wg_games set status='finished' where id=p_game;
  if p_victors is not null then insert into wg_winners(game_id,kind,victors,score) values(p_game,g.kind,p_victors,p_score); end if;
end $$;

-- Turn alerts: call the wg-notify edge function on each move, dispute, or join.
-- Use the same secret here as the WEBHOOK_SECRET function secret.
create extension if not exists pg_net;
create or replace function wg_ping_notify() returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform net.http_post(url:='https://vikxpnxnbmhmawhnwxzl.supabase.co/functions/v1/wg-notify',
    headers:=jsonb_build_object('Content-Type','application/json','x-webhook-secret','supercalifragilisticexpialidocious'),
    body:=jsonb_build_object('table',TG_TABLE_NAME,'record',to_jsonb(NEW)));
  return NEW;
end $$;
drop trigger if exists wg_t_moves on wg_moves;
create trigger wg_t_moves after insert on wg_moves for each row execute function wg_ping_notify();
drop trigger if exists wg_t_disputes on wg_disputes;
create trigger wg_t_disputes after insert on wg_disputes for each row execute function wg_ping_notify();
drop trigger if exists wg_t_join on wg_games;
create trigger wg_t_join after update of p2 on wg_games for each row when (old.p2 is null and new.p2 is not null) execute function wg_ping_notify();
