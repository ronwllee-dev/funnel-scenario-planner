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
    core_cta_action: "Demo Booked",
    conv_rate_click_to_lead: 0.5,
    conv_rate_lead_to_cta: 0.25,
    conv_rate_cta_to_next_step: 0.6,
    conv_rate_next_step_to_closed: 0.4,
    average_order_value: 1000,
    gross_margin_pct: 0.6,
  });

  assert.equal(result.clicks, 5000);
  assert.equal(result.leads, 2500);
  assert.equal(result.cta_actions, 625);
  assert.equal(result.next_step_offers, 375);
  assert.equal(result.closed_sales, 150);
  assert.equal(result.revenue, 150000);
  assert.equal(result.gross_profit, 90000);
  assert.equal(result.net_profit, 85000);
  assert.equal(result.roas, 30);
  assert.equal(result.cpl, 2);
  assert.equal(result.cpa, 33.33);
});

test("normalises percentage-style rates", () => {
  const result = engine.calculateScenario({
    name: "Percent entry",
    currency_label: "SGD",
    ad_budget: 1000,
    management_fee: 100,
    cpc: 2,
    core_cta_action: "Quote Request",
    conv_rate_click_to_lead: 50,
    conv_rate_lead_to_cta: 10,
    conv_rate_cta_to_next_step: 80,
    conv_rate_next_step_to_closed: 25,
    average_order_value: 2000,
    gross_margin_pct: 50,
  });

  assert.equal(result.clicks, 500);
  assert.equal(result.leads, 250);
  assert.equal(result.cta_actions, 25);
  assert.equal(result.next_step_offers, 20);
  assert.equal(result.closed_sales, 5);
  assert.equal(result.net_profit, 3900);
});

test("detects the biggest expected-stage drop with configurable CTA label", () => {
  const calculation = engine.calculateAll({
    name: "Bottleneck",
    currency_label: "RM",
    ad_budget: 2000,
    management_fee: 0,
    cpc: 1,
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
