-- Extra words players have confirmed with "It's a Real Word" in Rabble or Ogle. Everyone signed in can read the list and add to it.
create table if not exists wg_words(word text primary key check (word ~ '^[A-Z]{2,15}$'), added_by uuid default auth.uid(), game_id uuid, created_at timestamptz default now());
alter table wg_words enable row level security;
drop policy if exists wg_words_read on wg_words;
create policy wg_words_read on wg_words for select to authenticated using (true);
drop policy if exists wg_words_add on wg_words;
create policy wg_words_add on wg_words for insert to authenticated with check (added_by = auth.uid());
