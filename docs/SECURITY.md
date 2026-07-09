# Security — Funnel Scenario Planner

## Secret Handling
- `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` live in Vercel environment variables only
- Frontend uses only the anon public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — read-only for public tables under RLS
- No secrets in source code, `.env.local` is gitignored

## Permission Model
### v1 (demo-first)
- All `scenarios` rows: public read, public write via permissive RLS policies
- No user identity required — anonymous visitors can create and load scenarios

### Lock-down sprint
- RLS policies replaced: `auth.uid() = user_id` for insert/update/delete
- `is_demo = true` rows: public read remains; no public write
- Service role key used only in server-side API routes, never in browser

## Approved Tools Rule
- API routes call only named, typed Supabase client methods
- No `rpc('run_any_sql', ...)` or dynamic query construction from user input
- All user-supplied values passed as parameterised query bindings

## Audit Principle
- Every scenario save, update, and delete writes an audit record with actor, timestamp, before/after state
- Audit records are append-only (no delete policy on audit table)
- If a security concern arises (data leak, unexpected delete), stop and involve a human before proceeding
