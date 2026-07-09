# Test Plan — Funnel Scenario Planner

## 1. v1 Success Scenario (manual walkthrough)

**Setup:** Open app at `/` in a fresh browser tab (no login).

1. **Demo load** — Form is pre-filled with "SaaS Demo Booking Campaign". Scenario table shows 3 columns. Bottleneck callout is visible. ✓
2. **Edit budget** — Change Ad Budget from 5000 to 10000. Table KPIs double proportionally (clicks, leads, etc.). ✓
3. **Edit CPC** — Change CPC from 1.20 to 2.50. Clicks drop; CPL rises. ROAS drops. ✓
4. **Edit conversion rate** — Set Lead→Demo Booked to 5%. Bottleneck callout switches to "Lead → Demo Booked". ✓
5. **Currency label** — Change label to "SGD". All monetary outputs display "SGD" prefix. ✓
6. **Save** — Click Save Scenario. URL changes to `/scenario/[uuid]`. Toast confirms save. ✓
7. **Share** — Copy URL, open in incognito. Same inputs and results load. ✓

## 2. Empty / Partial State
- Load `/` then clear Ad Budget field → form shows validation error "Ad budget is required"; table shows empty state prompt "Enter your funnel assumptions to see projections". ✓
- Enter budget but leave CPC blank → partial warning banner: "Fill all required fields to calculate". ✓

## 3. Error Cases
- Set a conversion rate > 100 (e.g. 150) → normalised to 1.0 (treated as 100%) OR error message "Rate must be between 0–100%". ✓
- `/api/calculate` returns 500 → error banner "Calculation failed — please check your inputs" shown; no crash. ✓
- `/scenario/nonexistent-id` → error page "Scenario not found" with link back to `/`. ✓

## 4. Formula Spot-Check
**Inputs:** Budget=5000, CPC=1.00, Click→Lead=0.50, Lead→CTA=0.25, CTA→Next=0.60, Next→Closed=0.40, AOV=1000, Margin=0.60, Expected multiplier=1.0

| KPI | Expected value |
|---|---|
| Clicks | 5000 |
| Leads | 2500 |
| CTA Actions | 625 |
| Next-Step Offers | 375 |
| Closed Sales | 150 |
| Revenue | 150,000 |
| Gross Profit | 90,000 |
| Net Profit | 85,000 (−5000 budget) |
| ROAS | 30.0 |
| CPL | 2.00 |
| CPA | 33.33 |

All values must match within ±0.01 rounding. ✓
