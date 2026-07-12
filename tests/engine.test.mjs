import assert from "node:assert/strict";
import test from "node:test";

const engine = await import("../lib/engine.ts");

test("calculates the formula spot-check from the PRD", () => {
  const result = engine.calculateScenario({
    name: "Spot check",
    currency_label: "USD",
    ad_budget: 5000,
    management_fee: 0,
    cpc: 1,
    ctr: 0.02,
    core_cta_action: "Demo Booked",
    conv_rate_click_to_lead: 0.5,
    conv_rate_lead_to_cta: 0.25,
    conv_rate_cta_to_next_step: 0.6,
    conv_rate_next_step_to_closed: 0.4,
    average_order_value: 1000,
    gross_margin_pct: 0.6,
  });

  assert.equal(result.clicks, 5000);
  assert.equal(result.impressions, 250000);
  assert.equal(result.leads, 2500);
  assert.equal(result.cta_actions, 625);
  assert.equal(result.next_step_offers, 375);
  assert.equal(result.closed_sales, 150);
  assert.equal(result.revenue, 150000);
  assert.equal(result.gross_profit, 90000);
  assert.equal(result.net_profit, 85000);
  assert.equal(result.media_roas, 30);
  assert.equal(result.media_cpl, 2);
  assert.equal(result.all_in_cpl, 2);
  assert.equal(result.media_cpa, 33.33);
  assert.equal(result.all_in_cpa, 33.33);
});

test("normalises percentage-style rates", () => {
  const result = engine.calculateScenario({
    name: "Percent entry",
    currency_label: "SGD",
    ad_budget: 1000,
    management_fee: 100,
    cpc: 2,
    ctr: 2,
    core_cta_action: "Quote Request",
    conv_rate_click_to_lead: 50,
    conv_rate_lead_to_cta: 10,
    conv_rate_cta_to_next_step: 80,
    conv_rate_next_step_to_closed: 25,
    average_order_value: 2000,
    gross_margin_pct: 50,
  });

  assert.equal(result.clicks, 500);
  assert.equal(result.impressions, 25000);
  assert.equal(result.leads, 250);
  assert.equal(result.cta_actions, 25);
  assert.equal(result.next_step_offers, 20);
  assert.equal(result.closed_sales, 5);
  assert.equal(result.net_profit, 3900);
  assert.equal(result.media_cpl, 4);
  assert.equal(result.all_in_cpl, 4.4);
});

test("detects the biggest expected-stage drop with configurable CTA label", () => {
  const calculation = engine.calculateAll({
    name: "Bottleneck",
    currency_label: "RM",
    ad_budget: 2000,
    management_fee: 0,
    cpc: 1,
    ctr: 0.02,
    core_cta_action: "Trial Started",
    conv_rate_click_to_lead: 0.9,
    conv_rate_lead_to_cta: 0.05,
    conv_rate_cta_to_next_step: 0.9,
    conv_rate_next_step_to_closed: 0.9,
    average_order_value: 500,
    gross_margin_pct: 0.5,
  });

  assert.equal(calculation.bottleneck.stage, "Lead -> Trial Started");
  assert.equal(calculation.bottleneck.drop_pct, 95);
});

const transparentInputs = {
  name: "Transparent forecast",
  currency_label: "SGD",
  ad_budget: 4000,
  management_fee: 600,
  cpc: 2,
  ctr: 0.04,
  core_cta_action: "Booked Call",
  conv_rate_click_to_lead: 0.4,
  conv_rate_lead_to_cta: 0.25,
  conv_rate_cta_to_next_step: 0.5,
  conv_rate_next_step_to_closed: 0.2,
  average_order_value: 3000,
  gross_margin_pct: 0.7,
  campaign_channel: "Meta Ads",
  target_market: "Singapore SMEs",
  assumption_basis: "Media buyer estimate",
  assumption_date: "2026-07-12",
  assumption_notes: "Planning estimate",
};

test("uses 85%, 100%, and 115% conversion sensitivities only", () => {
  const calculation = engine.calculateAll(transparentInputs);
  assert.deepEqual(engine.DEFAULT_MULTIPLIERS, {
    conservative: 0.85,
    expected: 1,
    optimistic: 1.15,
  });
  assert.deepEqual(calculation.adjusted_rates.conservative, {
    click_to_lead: 0.34,
    lead_to_cta: 0.2125,
    cta_to_next_step: 0.425,
    next_step_to_closed: 0.17,
  });
  assert.deepEqual(calculation.adjusted_rates.expected, {
    click_to_lead: 0.4,
    lead_to_cta: 0.25,
    cta_to_next_step: 0.5,
    next_step_to_closed: 0.2,
  });
  assert.deepEqual(calculation.adjusted_rates.optimistic, {
    click_to_lead: 0.45999999999999996,
    lead_to_cta: 0.2875,
    cta_to_next_step: 0.575,
    next_step_to_closed: 0.22999999999999998,
  });

  for (const tier of ["conservative", "expected", "optimistic"]) {
    assert.equal(calculation.results[tier].clicks, 2000);
    assert.equal(calculation.results[tier].impressions, 50000);
  }
  assert.equal(calculation.inputs.ad_budget, 4000);
  assert.equal(calculation.inputs.management_fee, 600);
  assert.equal(calculation.inputs.cpc, 2);
  assert.equal(calculation.inputs.ctr, 0.04);
  assert.equal(calculation.inputs.average_order_value, 3000);
  assert.equal(calculation.inputs.gross_margin_pct, 0.7);
});

test("caps adjusted conversion rates at 100%", () => {
  const rates = engine.adjustedConversionRates(
    { ...transparentInputs, conv_rate_click_to_lead: 0.95 },
    1.15,
  );
  assert.equal(rates.click_to_lead, 1);
});

test("context metadata never changes calculation outputs", () => {
  const baseline = engine.calculateAll(transparentInputs).results;
  const variants = [
    { campaign_channel: "Google Search" },
    { target_market: "Malaysia" },
    { assumption_basis: "Current campaign data" },
    { assumption_date: "2026-08-01" },
    { assumption_notes: "Updated context only" },
  ];
  for (const variant of variants) {
    assert.deepEqual(engine.calculateAll({ ...transparentInputs, ...variant }).results, baseline);
  }
});

test("protects every ratio and output from divide-by-zero", () => {
  const result = engine.calculateScenario({
    ...transparentInputs,
    ad_budget: 0,
    cpc: 0,
    ctr: 0,
  });
  for (const value of Object.values(result)) {
    assert.equal(Number.isFinite(value), true);
  }
});
