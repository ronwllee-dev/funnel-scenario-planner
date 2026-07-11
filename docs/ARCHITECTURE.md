# Architecture - Funnel Scenario Planner

## Stack

- Frontend: Next.js App Router + Tailwind CSS
- Auth and database: Supabase Auth, Postgres, RLS
- Hosting: Vercel
- No AI dependencies in V1; all computation is deterministic formula logic

## V1 Application Flow

1. User signs up or logs in with email and password.
2. Supabase SSR middleware refreshes the cookie-based session.
3. User opens the protected planner.
4. User edits funnel assumptions, currency label, CTR, and Core CTA Action label.
5. Client calls `/api/calculate` and renders deterministic conservative, expected, and optimistic results.
6. User saves the scenario.
7. API route uses the authenticated Supabase user id as `user_id`.
8. RLS allows the owner to load, rename, and delete only their own private scenarios.

## Frontend

- Auth pages for login, signup, forgot password, and reset password.
- Protected dark analytics dashboard shell.
- Fixed left sidebar on desktop.
- Hamburger and slide-in drawer on mobile.
- Planner output sections: campaign summary, scenario snapshots, funnel volume, commercial outcome, cost efficiency, bottleneck insight, and disclaimer.

## Backend

- Next.js API routes.
- Calculation route validates inputs and returns computed scenarios.
- Scenario routes enforce authentication and use Supabase RLS for owner-scoped reads/writes.
- No service-role key is used by the app for scenario access.

## Non-goals

- Payment checkout
- CRM integration
- Ad platform integration
- Live currency conversion
- AI-generated advice
- AI-generated strategy report
