# Security - Funnel Scenario Planner

## Secret Handling

- Supabase URL and anon key live in environment variables.
- Frontend and server routes use only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- No service-role key is required for V1 app traffic.
- No secrets in source code; `.env.local` is gitignored.

## Authentication

- V1 uses Supabase email-and-password authentication.
- Signup, login, logout, forgot password, and reset password are handled through Supabase Auth.
- Sessions are handled with the recommended Supabase SSR cookie client and refreshed in middleware.

## Permission Model

- Planner, saved scenario library, scenario detail pages, and scenario API routes require a logged-in user.
- Saved scenarios are private to the authenticated owner.
- The browser never supplies a trusted `user_id`; server routes use the authenticated Supabase user id.
- Demo scenarios remain readable to logged-in users.
- Existing unowned non-demo rows are preserved but are not readable, editable, or deletable by normal users under RLS.

## Row Level Security

- `scenarios_owner_read`: `auth.uid() = user_id`
- `scenarios_owner_insert`: `auth.uid() = user_id` and non-demo
- `scenarios_owner_update`: `auth.uid() = user_id` and non-demo
- `scenarios_owner_delete`: `auth.uid() = user_id` and non-demo
- `scenarios_demo_read`: `is_demo = true`

## Manual Supabase Settings

- Enable the Email provider in Supabase Auth.
- Add production URL and `http://localhost:3000` to allowed redirect URLs.
- Password reset links should return through `/auth/callback?next=/auth/reset-password`.
