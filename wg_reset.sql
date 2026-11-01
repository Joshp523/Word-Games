-- OPTIONAL clean slate: deletes ONLY this app's wg_ tables, functions and triggers (and all their data).
drop table if exists wg_push_subs, wg_winners, wg_cm_reveals, wg_cm_keys, wg_disputes, wg_moves, wg_games, wg_players cascade;
drop function if exists wg_is_member(uuid), wg_create_game(text,jsonb,text), wg_join_game(text,text), wg_cm_guess(uuid,int),
  wg_rule_dispute(bigint,text), wg_finish_game(uuid,text,text), wg_ping_notify();
