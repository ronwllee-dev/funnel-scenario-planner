# Data Model - Funnel Scenario Planner

## scenarios

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner reference to `auth.users(id)`; null rows are preserved safely |
| created_at | timestamptz | default now() |
| name | text | scenario name |
| currency_label | text | display-only currency label |
| ad_budget | numeric | media spend |
| management_fee | numeric | agency or management fee |
| cpc | numeric | cost per click |
| ctr | numeric | click-through rate used for projected impressions |
| core_cta_action | text | configurable core CTA label |
| conv_rate_click_to_lead | numeric | 0-1 decimal |
| conv_rate_lead_to_cta | numeric | 0-1 decimal |
| conv_rate_cta_to_next_step | numeric | 0-1 decimal |
| conv_rate_next_step_to_closed | numeric | 0-1 decimal |
| average_order_value | numeric | revenue per closed sale |
| gross_margin_pct | numeric | 0-1 decimal |
| scenario_multipliers | jsonb | `{conservative, expected, optimistic}` floats |
| computed_results | jsonb | cached KPI outputs per scenario tier |
| bottleneck_stage | text | rule-derived weakest stage label |
| is_demo | boolean | true for seeded rows |

## RLS

- Demo rows are readable.
- User rows are readable, insertable, editable, and deletable only when `auth.uid() = user_id`.
- Insert/update/delete policies require `is_demo = false` so users cannot modify demo rows.
- Existing rows with `user_id is null` and `is_demo = false` remain in the database but are not exposed to normal users.

## No AI fields in V1

V1 has no AI-generated advice or strategy report fields. Any future narrative layer must remain separate from the deterministic calculation engine.
