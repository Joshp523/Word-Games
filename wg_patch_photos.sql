-- Word Games: Josh can set anyone's picture. Run once in Supabase: SQL Editor > New query > paste > Run.
create or replace function wg_set_player_avatar(p_me uuid, p_id uuid, p_img text) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from wg_players where id = p_me and lower(trim(name)) = 'josh') then raise exception 'Only Josh can change other people’s pictures.'; end if;
  update wg_players set avatar = case when p_img is null or length(p_img) < 120000 then p_img else avatar end where id = p_id;
end $$;
grant execute on function wg_set_player_avatar(uuid, uuid, text) to authenticated;
