-- Run once after you choose your WEBHOOK_SECRET. Replace PUT-YOUR-SECRET-HERE with that exact value (keep the quotes).
create or replace function wg_ping_notify() returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform net.http_post(url:='https://vikxpnxnbmhmawhnwxzl.supabase.co/functions/v1/wg-notify',
    headers:=jsonb_build_object('Content-Type','application/json','x-webhook-secret','PUT-YOUR-SECRET-HERE'),
    body:=jsonb_build_object('table',TG_TABLE_NAME,'record',to_jsonb(NEW)));
  return NEW;
end $$;
