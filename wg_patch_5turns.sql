-- Run once. Only replaces the Codemaster guess function (5-turn rule). Safe to re-run.
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
      values(p_game,'codemaster',g.p1_name||' & '||g.p2_name,'9 of 9 agents · '||greatest(5-clues,0)||' turns spare');
    end if;
  end if;
  return r;
end $$;
