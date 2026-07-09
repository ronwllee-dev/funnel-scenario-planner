# Data Model — Funnel Scenario Planner

## scenarios
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner; null for demo/anonymous rows |
| created_at | timestamptz | default now() |
| name | text | e.g. "SaaS Demo Booking Campaign" |
| currency_label | text | e.g. "SGD", "RM", "USD" |
| ad_budget | numeric | total ad spend |
| management_fee | numeric | optional agency fee subtracted in net profit |
| cpc | numeric | cost per click |
| core_cta_action | text | e.g. "Demo Booked", "Consultation Booked" |
| conv_rate_click_to_lead | numeric | 0–1 decimal |
| conv_rate_lead_to_cta | numeric | 0–1 decimal |
| conv_rate_cta_to_next_step | numeric | 0–1 decimal |
| conv_rate_next_step_to_closed | numeric | 0–1 decimal |
| average_order_value | numeric | revenue per closed sale |
| gross_margin_pct | numeric | 0–1 decimal |
| scenario_multipliers | jsonb | `{conservative, expected, optimistic}` floats |
| computed_results | jsonb | cached KPI outputs per scenario tier |
| bottleneck_stage | text | rule-derived weakest stage label |
| is_demo | boolean | true for seeded rows |

## RLS
- v1: permissive read + write for all rows (demo-first)
- Lock-down sprint: select/insert/update/delete restricted to `auth.uid() = user_id`; `is_demo = true` rows remain publicly readable

## No AI fields in v1
When AI narrative is added (later), store: `ai_narrative text`, `ai_narrative_source text`, `ai_narrative_confidence numeric`, `ai_narrative_review_status text default 'unreviewed'`.
