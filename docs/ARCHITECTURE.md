# Architecture — Funnel Scenario Planner

## Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Database:** Supabase (Postgres + RLS)
- **Hosting:** Vercel
- **No AI dependencies in v1** — all computation is deterministic formula logic

## What to Build Now vs Later
| Now (v1) | Later |
|---|---|
| Funnel input form + scenario engine | User login + per-user scenario library |
| Save/load scenario by URL | PDF export, client branding |
| Bottleneck rule engine | AI narrative suggestions |
| Demo rows seeded, no login wall | Team workspaces |

## Key User Action — Step by Step
1. User lands on `/` — form pre-filled with seeded demo scenario
2. User edits inputs (budget, CPC, rates, AOV, margin)
3. On every change, client calls `/api/calculate` with form values
4. API runs formula engine, returns all KPIs for all three multiplier tiers
5. Comparison table re-renders; bottleneck rule fires and highlights the weakest stage
6. User clicks **Save Scenario** → POST to Supabase `scenarios` table → URL updates to `/scenario/[id]`
7. User shares URL; anyone opening it loads the same inputs and results

## Layer Plan
1. **Data layer first** — schema, seed rows, RLS policies
2. **Formula engine** — pure TypeScript functions, unit-tested, no DB dependency
3. **API route** — thin wrapper calling formula engine, reading/writing Supabase
4. **UI** — form + table + bottleneck callout consuming the API
5. **Intelligence (later)** — AI narrative sits on top; removing it leaves the core intact
