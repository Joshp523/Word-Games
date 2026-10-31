-- Run this whole file in Supabase → SQL Editor. Then enable
-- Authentication → Sign In / Providers → "Allow anonymous sign-ins".
create table players(id uuid primary key references auth.users on delete cascade, name text not null);
create table games(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('ogle','rabble','categories','codemaster')),
  p1 uuid not null references players, p2 uuid references players,
  seed jsonb not null default '{}', status text not null default 'waiting',
  created_at timestamptz not null default now());
create table moves(id bigserial primary key, game_id uuid not null references games on delete cascade,
  player uuid not null, payload jsonb not null, created_at timestamptz not null default now());
create table disputes(id bigserial primary key, game_id uuid not null references games on delete cascade,
  item text not null, raised_by uuid not null, verdict text check (verdict in ('real','fake')),
  unique(game_id,item));
create table cm_keys(game_id uuid primary key references games on delete cascade, codemaster uuid not null, key text[] not null);
create table cm_reveals(game_id uuid references games on delete cascade, idx int, result text, primary key(game_id,idx));
create table winners(id bigserial primary key, game_id uuid references games, kind text not null,
  victors text not null, score text, won_at timestamptz not null default now());

create function is_member(g uuid) returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from games where id=g and auth.uid() in (p1,p2)) $$;

alter table players enable row level security; alter table games enable row level security;
alter table moves enable row level security; alter table disputes enable row level security;
alter table cm_keys enable row level security; alter table cm_reveals enable row level security;
alter table winners enable row level security;

create policy "names are public" on players for select to authenticated using (true);
create policy "own player" on players for insert to authenticated with check (id=auth.uid());
create policy "own player upd" on players for update to authenticated using (id=auth.uid());
create policy "my games" on games for select to authenticated using (auth.uid() in (p1,p2));
create policy "read moves" on moves for select to authenticated using (is_member(game_id));
create policy "make moves" on moves for insert to authenticated with check (player=auth.uid() and is_member(game_id));
create policy "read disputes" on disputes for select to authenticated using (is_member(game_id));
create policy "raise disputes" on disputes for insert to authenticated with check (raised_by=auth.uid() and is_member(game_id));
-- Only the codemaster can ever read the key; the guesser reveals cards through cm_guess().
create policy "codemaster key" on cm_keys for select to authenticated using (codemaster=auth.uid());
create policy "read reveals" on cm_reveals for select to authenticated using (is_member(game_id));
create policy "hall of winners" on winners for select to authenticated using (true);

create function create_game(p_kind text, p_seed jsonb) returns games language plpgsql security definer set search_path=public as $$
declare g games; c text; a text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  loop
    c:=''; for i in 1..4 loop c:=c||substr(a,1+floor(random()*length(a))::int,1); end loop;
    exit when not exists(select 1 from games where code=c);
  end loop;
  insert into games(code,kind,p1,seed) values(c,p_kind,auth.uid(),p_seed) returning * into g;
  if p_kind='codemaster' then
    insert into cm_keys(game_id,codemaster,key)
    select g.id,auth.uid(),array_agg(k order by random()) from (
      select 'a' k from generate_series(1,9) union all select 'k' from generate_series(1,5) union all select 'm' from generate_series(1,11)) s;
  end if;
  return g;
end $$;

create function join_game(p_code text) returns games language plpgsql security definer set search_path=public as $$
declare g games;
begin
  select * into g from games where code=upper(p_code);
  if not found then raise exception 'No game with that code'; end if;
  if auth.uid() in (g.p1,g.p2) then return g; end if;
  if g.p2 is not null then raise exception 'That game is full'; end if;
  update games set p2=auth.uid(), status='active' where id=g.id returning * into g;
  return g;
end $$;

create function cm_guess(p_game uuid, p_idx int) returns text language plpgsql security definer set search_path=public as $$
declare g games; k text[]; r text; n int; clues int;
begin
  select * into g from games where id=p_game;
  if g.p2 is distinct from auth.uid() then raise exception 'Only the guesser may guess'; end if;
  if g.status<>'active' then raise exception 'The game is over'; end if;
  select key into k from cm_keys where game_id=p_game;
  r:=k[p_idx+1];
  insert into cm_reveals values(p_game,p_idx,r);
  if r='k' then update games set status='finished' where id=p_game;
  else
    select count(*) into n from cm_reveals where game_id=p_game and result='a';
    if n=9 then
      update games set status='finished' where id=p_game;
      select count(*) into clues from moves where game_id=p_game and payload ? 'clue';
      insert into winners(game_id,kind,victors,score)
      values(p_game,'codemaster',(select name from players where id=g.p1)||' & '||(select name from players where id=g.p2),
             '9 of 9 agents · '||greatest(8-clues,0)||' clues spare');
    end if;
  end if;
  return r;
end $$;

create function rule_dispute(p_id bigint, p_verdict text) returns void language sql security definer set search_path=public as $$
  update disputes set verdict=p_verdict where id=p_id and raised_by=auth.uid() and is_member(game_id) and p_verdict in ('real','fake') $$;

create function finish_game(p_game uuid, p_victors text, p_score text) returns void language plpgsql security definer set search_path=public as $$
declare g games;
begin
  select * into g from games where id=p_game;
  if auth.uid() not in (g.p1,g.p2) or g.status='finished' then return; end if;
  update games set status='finished' where id=p_game;
  if p_victors is not null then insert into winners(game_id,kind,victors,score) values(p_game,g.kind,p_victors,p_score); end if;
end $$;
