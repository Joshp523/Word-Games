# Setup
1. Supabase → SQL Editor: run `wg_schema.sql` (safe to re-run; `wg_reset.sql` wipes only wg_ data; edit the 'CHANGE-ME' secret first).
2. Authentication → Sign In / Providers → enable "Allow anonymous sign-ins".
3. Host this folder over https (Netlify / Vercel / GitHub Pages). Not file://.
4. Turn alerts (optional):
   - `npx web-push generate-vapid-keys` → public key into `config.js` (VAPID_PUBLIC_KEY).
   - `supabase functions deploy wg-notify --no-verify-jwt`
   - `supabase secrets set VAPID_PUBLIC=<public> VAPID_PRIVATE=<private> VAPID_SUBJECT=mailto:you@example.com WEBHOOK_SECRET=<same as wg_schema.sql>`
   - iPhone: Share → Add to Home Screen, open the app from the home screen, then tap "Turn Alerts" in the lobby.
