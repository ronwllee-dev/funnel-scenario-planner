# PRD — Funnel Scenario Planner

## Problem
Marketing consultants and SME owners launch ad campaigns without knowing if the funnel economics work. They need a fast, visual way to stress-test assumptions before spending money.

## Target Users
Marketing consultants, funnel strategists, agency owners, SME business owners.

## Core Objects
- **Scenario** — named funnel simulation with all inputs and computed outputs
- **Funnel Stage** — click → lead → Core CTA Action → next-step offer → closed sale
- **Core CTA Action** — configurable label (Booked Call, Demo Booked, Appointment, Quote Request, Trial Started, Checkout Started, Registration, Consultation, Profiling Session)

## MVP Must-Haves
- [ ] Input form: currency label, ad budget, optional management fee, CPC, Core CTA Action selector, four conversion rate fields, AOV, gross margin
- [ ] Three-scenario engine computes all KPIs: impressions, clicks, leads, CTA actions, next-step offers, closed sales, CPL, cost-per-CTA, cost-per-next-step, CPA, ROAS, gross profit, net profit
- [ ] Side-by-side conservative / expected / optimistic comparison table
- [ ] Biggest bottleneck stage highlighted with plain-English callout
- [ ] App loads with a seeded demo scenario — no login required
- [ ] Save scenario to database; reload by URL

## Non-Goals (v1)
No login wall, no AI-generated advice, no ad platform integration, no CRM, no team permissions, no PDF export, no client accounts.

## Definition of Done
A consultant opens the app, edits the pre-filled demo inputs for a client's campaign, sees the three-scenario table update instantly, reads the bottleneck callout, saves the scenario, and shares the URL — all without creating an account. Every computed value matches the formula spec. No dead buttons.
