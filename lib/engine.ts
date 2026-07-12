export type ScenarioInputs = {
  name: string;
  currency_label: string;
  ad_budget: number;
  management_fee: number;
  cpc: number;
  ctr: number;
  core_cta_action: string;
  conv_rate_click_to_lead: number;
  conv_rate_lead_to_cta: number;
  conv_rate_cta_to_next_step: number;
  conv_rate_next_step_to_closed: number;
  average_order_value: number;
  gross_margin_pct: number;
  campaign_channel: string;
  target_market: string;
  assumption_basis: string;
  assumption_date: string;
  assumption_notes: string;
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
  media_cpl: number;
  all_in_cpl: number;
  media_cost_per_cta: number;
  all_in_cost_per_cta: number;
  media_cost_per_next_step: number;
  all_in_cost_per_next_step: number;
  media_cpa: number;
  all_in_cpa: number;
  media_roas: number;
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
  adjusted_rates: Record<ScenarioTier, AdjustedConversionRates>;
};

export type AdjustedConversionRates = {
  click_to_lead: number;
  lead_to_cta: number;
  cta_to_next_step: number;
  next_step_to_closed: number;
};

export const DEFAULT_MULTIPLIERS: Record<ScenarioTier, number> = {
  conservative: 0.85,
  expected: 1,
  optimistic: 1.15,
};

const DEFAULT_CTR = 0.02;

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
    ctr: normaliseRate(inputs.ctr ?? DEFAULT_CTR) || DEFAULT_CTR,
    core_cta_action: inputs.core_cta_action?.trim() || "Core CTA Action",
    conv_rate_click_to_lead: normaliseRate(inputs.conv_rate_click_to_lead),
    conv_rate_lead_to_cta: normaliseRate(inputs.conv_rate_lead_to_cta),
    conv_rate_cta_to_next_step: normaliseRate(inputs.conv_rate_cta_to_next_step),
    conv_rate_next_step_to_closed: normaliseRate(
      inputs.conv_rate_next_step_to_closed,
    ),
    average_order_value: positive(inputs.average_order_value),
    gross_margin_pct: normaliseRate(inputs.gross_margin_pct),
    campaign_channel: inputs.campaign_channel?.trim() || "Mixed channels",
    target_market: inputs.target_market?.trim() || "",
    assumption_basis: inputs.assumption_basis?.trim() || "Consultant assumption",
    assumption_date: inputs.assumption_date || "",
    assumption_notes: inputs.assumption_notes?.trim() || "",
  };
}

export function adjustedConversionRates(
  rawInputs: ScenarioInputs,
  multiplier = 1,
): AdjustedConversionRates {
  const inputs = normaliseInputs(rawInputs);
  const adjust = (rate: number) => Math.min(1, rate * multiplier);
  return {
    click_to_lead: adjust(inputs.conv_rate_click_to_lead),
    lead_to_cta: adjust(inputs.conv_rate_lead_to_cta),
    cta_to_next_step: adjust(inputs.conv_rate_cta_to_next_step),
    next_step_to_closed: adjust(inputs.conv_rate_next_step_to_closed),
  };
}

export function calculateScenario(
  rawInputs: ScenarioInputs,
  multiplier = 1,
): ScenarioResults {
  const inputs = normaliseInputs(rawInputs);
  const rates = adjustedConversionRates(inputs, multiplier);
  const clicks = inputs.cpc > 0 ? inputs.ad_budget / inputs.cpc : 0;
  const impressions = inputs.ctr > 0 ? clicks / inputs.ctr : 0;
  const leads = clicks * rates.click_to_lead;
  const ctaActions = leads * rates.lead_to_cta;
  const nextStepOffers = ctaActions * rates.cta_to_next_step;
  const closedSales = nextStepOffers * rates.next_step_to_closed;
  const revenue = closedSales * inputs.average_order_value;
  const grossProfit = revenue * inputs.gross_margin_pct;
  const totalCampaignCost = inputs.ad_budget + inputs.management_fee;
  const netProfit = grossProfit - totalCampaignCost;

  return {
    impressions: round(impressions),
    clicks: round(clicks),
    leads: round(leads),
    cta_actions: round(ctaActions),
    next_step_offers: round(nextStepOffers),
    closed_sales: round(closedSales),
    revenue: round(revenue),
    media_cpl: ratio(inputs.ad_budget, leads),
    all_in_cpl: ratio(totalCampaignCost, leads),
    media_cost_per_cta: ratio(inputs.ad_budget, ctaActions),
    all_in_cost_per_cta: ratio(totalCampaignCost, ctaActions),
    media_cost_per_next_step: ratio(inputs.ad_budget, nextStepOffers),
    all_in_cost_per_next_step: ratio(totalCampaignCost, nextStepOffers),
    media_cpa: ratio(inputs.ad_budget, closedSales),
    all_in_cpa: ratio(totalCampaignCost, closedSales),
    media_roas: ratio(revenue, inputs.ad_budget),
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
    adjusted_rates: {
      conservative: adjustedConversionRates(inputs, DEFAULT_MULTIPLIERS.conservative),
      expected: adjustedConversionRates(inputs, DEFAULT_MULTIPLIERS.expected),
      optimistic: adjustedConversionRates(inputs, DEFAULT_MULTIPLIERS.optimistic),
    },
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
  if (!Number.isFinite(inputs.ad_budget) || inputs.ad_budget <= 0) {
    errors.ad_budget = "Ad budget is required.";
  }
  if (!Number.isFinite(inputs.cpc) || inputs.cpc <= 0) {
    errors.cpc = "CPC is required.";
  }
  if (!Number.isFinite(inputs.ctr) || inputs.ctr <= 0) {
    errors.ctr = "CTR is required.";
  }
  if (!Number.isFinite(inputs.average_order_value) || inputs.average_order_value <= 0) {
    errors.average_order_value = "Average order value is required.";
  }

  for (const key of [
    "conv_rate_click_to_lead",
    "conv_rate_lead_to_cta",
    "conv_rate_cta_to_next_step",
    "conv_rate_next_step_to_closed",
    "gross_margin_pct",
    "ctr",
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
