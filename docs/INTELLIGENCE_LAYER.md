# Intelligence Layer — Funnel Scenario Planner

## v1 — Rule-Based Only (no AI)

### Inputs (messy, user-entered)
- Free-text currency label, raw numeric rates (may be entered as % or decimal)
- CPC and budget with no unit guard
- Conversion rates that may sum to impossibly high totals

### Auto-Structure on Capture
```json
{
  "ad_budget": 5000,
  "cpc": 1.20,
  "conv_rate_click_to_lead": 0.30,
  "conv_rate_lead_to_cta": 0.25,
  "conv_rate_cta_to_next_step": 0.60,
  "conv_rate_next_step_to_closed": 0.40,
  "average_order_value": 2400,
  "gross_margin_pct": 0.75
}
```
Normalisation rule: if any rate > 1, divide by 100 (treat as percentage entry).

### Bottleneck Detection (rule-based, v1)
Compare the volume drop at each stage for the **expected** scenario:
- Click → Lead, Lead → CTA, CTA → Next-Step, Next-Step → Closed
- The stage with the largest absolute volume drop = bottleneck
- Display: `"Biggest drop: Lead → Demo Booked (75% of leads don't convert)"`

### Events to Track
- `scenario_calculated` (inputs snapshot)
- `scenario_saved` (scenario id)
- `scenario_loaded` (scenario id, source: direct/share)

## Later — AI Layer
- GPT-4o generates a 3-sentence bottleneck narrative
- Stores as `ai_narrative` + `source` + `confidence` + `review_status = 'unreviewed'`
- Human consultant reviews before sharing with client
