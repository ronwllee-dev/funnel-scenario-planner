export type ScenarioInputs = {
  name: string;
  currency_label: string;
  ad_budget: number;
  management_fee: number;
  cpc: number;
  core_cta_action: string;
  conv_rate_click_to_lead: number;
  conv_rate_lead_to_cta: number;
  conv_rate_cta_to_next_step: number;
  conv_rate_next_step_to_closed: number;
  average_order_value: number;
  gross_margin_pct: number;
};

export type ScenarioTier = "conservative" | "expected" | "optimistic";

export type ScenarioResults = {
  impressions: number;
  clicks: number;
  leads: number;
  cta_actions: number;
  next_step_offers: number;
  closed_sales: number;
  revenue: number;
  cpl: number;
  cost_per_cta: number;
  cost_per_next_step: number;
  cpa: number;
  roas: number;
  gross_profit: number;
  net_profit: number;
};

export type Bottleneck = {
  stage: string;
  drop_pct: number;
  message: string;
};

export type CalculationResponse = {
  inputs: ScenarioInputs;
  results: Record<ScenarioTier, ScenarioResults>;
  bottleneck: Bottleneck;
};

export const DEFAULT_MULTIPLIERS: Record<ScenarioTier, number> = {
  conservative: 0.7,
  expected: 1,
  optimistic: 1.3,
};

const IMPLIED_CTR = 0.02;

export function normaliseRate(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 1;
  if (value > 1) return value / 100;
  return value;
}

export function normaliseInputs(inputs: ScenarioInputs): ScenarioInputs {
  return {
    name: inputs.name?.trim() || "Untitled Scenario",
    currency_label: inputs.currency_label?.trim() || "USD",
    ad_budget: positive(inputs.ad_budget),
    management_fee: positive(inputs.management_fee),
    cpc: positive(inputs.cpc),
    core_cta_action: inputs.core_cta_action?.trim() || "Core CTA Action",
    conv_rate_click_to_lead: normaliseRate(inputs.conv_rate_click_to_lead),
    conv_rate_lead_to_cta: normaliseRate(inputs.conv_rate_lead_to_cta),
    conv_rate_cta_to_next_step: normaliseRate(inputs.conv_rate_cta_to_next_step),
    conv_rate_next_step_to_closed: normaliseRate(
      inputs.conv_rate_next_step_to_closed,
    ),
    average_order_value: positive(inputs.average_order_value),
    gross_margin_pct: normaliseRate(inputs.gross_margin_pct),
  };
}

export function calculateScenario(
  rawInputs: ScenarioInputs,
  multiplier = 1,
): ScenarioResults {
  const inputs = normaliseInputs(rawInputs);
  const effectiveRate = (rate: number) => Math.min(1, rate * multiplier);
  const clicks = inputs.cpc > 0 ? inputs.ad_budget / inputs.cpc : 0;
  const impressions = clicks / IMPLIED_CTR;
  const leads = clicks * effectiveRate(inputs.conv_rate_click_to_lead);
  const ctaActions = leads * effectiveRate(inputs.conv_rate_lead_to_cta);
  const nextStepOffers =
    ctaActions * effectiveRate(inputs.conv_rate_cta_to_next_step);
  const closedSales =
    nextStepOffers * effectiveRate(inputs.conv_rate_next_step_to_closed);
  const revenue = closedSales * inputs.average_order_value;
  const grossProfit = revenue * inputs.gross_margin_pct;
  const netProfit = grossProfit - inputs.ad_budget - inputs.management_fee;

  return {
    impressions: round(impressions),
    clicks: round(clicks),
    leads: round(leads),
    cta_actions: round(ctaActions),
    next_step_offers: round(nextStepOffers),
    closed_sales: round(closedSales),
    revenue: round(revenue),
    cpl: ratio(inputs.ad_budget, leads),
    cost_per_cta: ratio(inputs.ad_budget, ctaActions),
    cost_per_next_step: ratio(inputs.ad_budget, nextStepOffers),
    cpa: ratio(inputs.ad_budget, closedSales),
    roas: ratio(revenue, inputs.ad_budget),
    gross_profit: round(grossProfit),
    net_profit: round(netProfit),
  };
}

export function calculateAll(rawInputs: ScenarioInputs): CalculationResponse {
  const inputs = normaliseInputs(rawInputs);
  const results = {
    conservative: calculateScenario(inputs, DEFAULT_MULTIPLIERS.conservative),
    expected: calculateScenario(inputs, DEFAULT_MULTIPLIERS.expected),
    optimistic: calculateScenario(inputs, DEFAULT_MULTIPLIERS.optimistic),
  };

  return {
    inputs,
    results,
    bottleneck: detectBottleneck(results.expected, inputs.core_cta_action),
  };
}

export function detectBottleneck(
  expected: ScenarioResults,
  ctaLabel = "Core CTA Action",
): Bottleneck {
  const stages = [
    {
      stage: `Click -> Lead`,
      from: expected.clicks,
      to: expected.leads,
      target: "leads",
    },
    {
      stage: `Lead -> ${ctaLabel}`,
      from: expected.leads,
      to: expected.cta_actions,
      target: ctaLabel,
    },
    {
      stage: `${ctaLabel} -> Next-Step Offer`,
      from: expected.cta_actions,
      to: expected.next_step_offers,
      target: "next-step offers",
    },
    {
      stage: "Next-Step Offer -> Closed Sale",
      from: expected.next_step_offers,
      to: expected.closed_sales,
      target: "closed sales",
    },
  ];

  const bottleneck = stages
    .map((item) => ({
      ...item,
      drop_pct: item.from > 0 ? ((item.from - item.to) / item.from) * 100 : 0,
    }))
    .sort((a, b) => b.drop_pct - a.drop_pct)[0];

  return {
    stage: bottleneck.stage,
    drop_pct: round(bottleneck.drop_pct),
    message: `Biggest drop: ${bottleneck.stage} (${round(
      bottleneck.drop_pct,
    )}% do not convert to ${bottleneck.target}).`,
  };
}

export function validateInputs(inputs: ScenarioInputs) {
  const errors: Record<string, string> = {};

  if (!inputs.name?.trim()) errors.name = "Scenario name is required.";
  if (!inputs.currency_label?.trim()) {
    errors.currency_label = "Currency label is required.";
  }
  if (inputs.ad_budget <= 0) errors.ad_budget = "Ad budget is required.";
  if (inputs.cpc <= 0) errors.cpc = "CPC is required.";
  if (inputs.average_order_value <= 0) {
    errors.average_order_value = "Average order value is required.";
  }

  for (const key of [
    "conv_rate_click_to_lead",
    "conv_rate_lead_to_cta",
    "conv_rate_cta_to_next_step",
    "conv_rate_next_step_to_closed",
    "gross_margin_pct",
  ] as const) {
    if (!Number.isFinite(inputs[key]) || inputs[key] < 0) {
      errors[key] = "Enter a rate from 0 to 100%.";
    }
  }

  return errors;
}

function positive(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? round(numerator / denominator) : 0;
}

function round(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
