# Tasks — Funnel Scenario Planner

## Sprint 1 — Database + Formula Engine
**Goal:** Schema live, seed data readable, formula engine unit-tested.

- [ ] Apply migration SQL to Supabase (scenarios table + 3 demo rows)
- [ ] Verify demo rows return via Supabase anon client
- [ ] Implement `calculateScenario(inputs, multiplier)` in `lib/engine.ts` — returns all KPIs
- [ ] Implement `detectBottleneck(results)` in `lib/engine.ts` — returns stage label + drop %
- [ ] Unit tests: 3 known-input/known-output cases covering all KPI formulas
- [ ] `POST /api/calculate` route — validates inputs, runs engine, returns JSON

**Definition of Done:** `POST /api/calculate` with demo inputs returns correct KPIs matching unit tests. DB seed rows are readable via Supabase client. No hardcoded values in engine.

---

## Sprint 2 — Core UI (⭐ v1 functional milestone)
**Goal:** A consultant can open the app, edit inputs, and see scenario results — no login.

- [ ] Funnel assumption form component (all input fields, validation, inline error messages)
- [ ] Currency label input + Core CTA Action dropdown (9 options)
- [ ] Conversion rate inputs with % ↔ decimal normalisation
- [ ] On-change call to `/api/calculate`; debounced 300ms
- [ ] Scenario comparison table: 3 columns × all KPI rows
- [ ] Bottleneck callout component (highlighted row + plain-English sentence)
- [ ] All five UI states: loading skeleton, empty prompt, partial warning, error banner, ready table
- [ ] Pre-fill form with first demo scenario on load
- [ ] Deploy to Vercel; public URL, no login gate

**Definition of Done:** App loads at `/` with demo data visible. Editing any input updates the table within 500ms. Bottleneck callout shows correct stage. All states render without crash.

---

## Sprint 3 — Save, Load, Share
**Goal:** Scenarios persist and are shareable by URL.

- [ ] **Save Scenario** button → POST to Supabase `scenarios` → URL becomes `/scenario/[id]`
- [ ] `GET /scenario/[id]` page loads scenario from DB and pre-fills form
- [ ] Scenario list page `/scenarios` — shows saved + demo rows, sorted by created_at desc
- [ ] Edit scenario name inline
- [ ] Delete scenario with confirm dialog
- [ ] Empty state for list (no saved scenarios yet)
- [ ] Error handling: save failure toast, load failure fallback to blank form

**Definition of Done:** Save → share URL → open in incognito → correct inputs and results load. Delete removes row from list immediately. No dead buttons.

---

## Sprint 4 — Lock It Down (Auth + RLS)
**Goal:** Per-user data isolation; demo rows remain public.

- [ ] Enable Supabase Auth (magic link)
- [ ] Sign-in UI (email entry, magic link flow)
- [ ] On sign-in, stamp `user_id` on new scenarios
- [ ] Replace v1 RLS policies with owner-scoped policies (`auth.uid() = user_id`)
- [ ] `is_demo = true` rows: public read preserved
- [ ] Scenario list filtered to current user's rows + demo rows
- [ ] Redirect after login to in-progress or last scenario
- [ ] Confirm cross-user data isolation: user A cannot read/write user B's scenarios

**Definition of Done:** Two test accounts cannot see each other's scenarios. Demo rows visible to both. Magic link flow completes without error. Service role key never appears in browser network tab.

---

## Gantt (sprint → feature)
```
Week 1  [Sprint 1] DB schema · seed data · formula engine · API route
Week 1  [Sprint 2] Input form · scenario table · bottleneck · deploy ← v1 functional
Week 2  [Sprint 3] Save · load by URL · list page · delete
Week 2  [Sprint 4] Auth · RLS lock-down · user isolation
```
