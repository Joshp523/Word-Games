-- Rabble word exceptions now need the opponent's OK.
-- In Rabble, a player whose word is refused taps "Ask to Allow It". The word waits as 'pending' until another
-- player in that game taps "Allow It" (then it's accepted for everyone, in every game) or "Not a Word".
-- Run once in the Supabase SQL Editor. Safe to run again.

alter table wg_words add column if not exists status text not null default 'ok';
alter table wg_words add column if not exists decided_by uuid;
alter table wg_words drop constraint if exists wg_words_status_chk;
alter table wg_words add constraint wg_words_status_chk check (status in ('pending','ok','no'));

-- Pokémon are not words.
delete from wg_words where word = 'STEELIX';

-- No more adding words directly: requests go through wg_ask_word, decisions through wg_rule_word.
drop policy if exists wg_words_add on wg_words;

create or replace function wg_ask_word(p_word text, p_game uuid) returns text
language plpgsql security definer set search_path=public as $$
declare w text := upper(trim(p_word)); s text;
begin
  if p_game is null or not wg_is_member(p_game) then raise exception 'not in this game'; end if;
  insert into wg_words(word, added_by, game_id, status) values (w, auth.uid(), p_game, 'pending')
  on conflict (word) do update set added_by = auth.uid(), game_id = p_game, status = 'pending', decided_by = null, created_at = now()
    where wg_words.status = 'no';
  select status into s from wg_words where word = w;
  return s;
end $$;

create or replace function wg_rule_word(p_word text, p_ok boolean) returns void
language sql security definer set search_path=public as $$
  update wg_words set status = case when p_ok then 'ok' else 'no' end, decided_by = auth.uid()
  where word = upper(trim(p_word)) and status = 'pending' and added_by <> auth.uid()
    and game_id is not null and wg_is_member(game_id) $$;

grant execute on function wg_ask_word(text, uuid), wg_rule_word(text, boolean) to authenticated;

-- Alerts: the opponent hears about a request; the asker hears the answer.
drop trigger if exists wg_t_word_ask on wg_words;
create trigger wg_t_word_ask after insert on wg_words for each row
  when (new.status = 'pending' and new.game_id is not null) execute function wg_ping_notify();
drop trigger if exists wg_t_word_upd on wg_words;
create trigger wg_t_word_upd after update of status on wg_words for each row
  when (old.status is distinct from new.status and new.game_id is not null) execute function wg_ping_notify();
