-- Word Games: check why turn alerts might not arrive. Paste into Supabase → SQL Editor → Run.
-- Read the results top to bottom; each check says what a bad answer means.

-- 1) Is the webhook secret still the placeholder? (true = alerts are blocked; re-run wg_set_secret.sql with your real secret)
select proname, (prosrc like '%CHANGE-ME%' or prosrc like '%PUT-YOUR-SECRET-HERE%') as secret_is_placeholder
from pg_proc where proname = 'wg_ping_notify';

-- 2) Are the alert triggers in place? (expect wg_t_moves, wg_t_disputes, wg_t_seat, wg_t_word_ask, wg_t_word_upd)
select tgname, tgrelid::regclass as on_table from pg_trigger where tgname like 'wg_t_%' order by 1;

-- 3) What did the alert function answer lately?
--    200 = fine · 401 = secret mismatch (re-run wg_set_secret.sql) · 404 = wg-notify not deployed
--    500 = the function crashed (check its VAPID secrets / Logs in Edge Functions)
select id, status_code, left(coalesce(content::text, error_msg, ''), 120) as answer, created
from net._http_response order by id desc limit 15;

-- 4) Which players have phones signed up for alerts?
select p.name, count(*) as phones from wg_push_subs s left join wg_players p on p.id = s.player group by p.name order by 1;
