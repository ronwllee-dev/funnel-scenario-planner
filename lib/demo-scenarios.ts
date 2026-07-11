import type { ScenarioInputs } from "@/lib/engine";

export type ScenarioRecord = ScenarioInputs & {
  id: string;
  created_at: string;
  is_demo: boolean;
  user_id?: string | null;
};

export const demoScenarios: ScenarioRecord[] = [
  {
    id: "a1b2c3d4-0001-0001-0001-000000000001",
    created_at: "2026-01-01T00:00:00.000Z",
    is_demo: true,
    name: "SaaS Demo Booking Campaign",
    currency_label: "USD",
    ad_budget: 5000,
    management_fee: 500,
    cpc: 1.2,
    ctr: 0.02,
    core_cta_action: "Demo Booked",
    conv_rate_click_to_lead: 0.3,
    conv_rate_lead_to_cta: 0.25,
    conv_rate_cta_to_next_step: 0.6,
    conv_rate_next_step_to_closed: 0.4,
    average_order_value: 2400,
    gross_margin_pct: 0.75,
  },
  {
    id: "a1b2c3d4-0002-0002-0002-000000000002",
    created_at: "2026-01-02T00:00:00.000Z",
    is_demo: true,
    name: "Local Clinic Consultation Campaign",
    currency_label: "SGD",
    ad_budget: 3000,
    management_fee: 300,
    cpc: 0.85,
    ctr: 0.025,
    core_cta_action: "Consultation Booked",
    conv_rate_click_to_lead: 0.4,
    conv_rate_lead_to_cta: 0.3,
    conv_rate_cta_to_next_step: 0.7,
    conv_rate_next_step_to_closed: 0.5,
    average_order_value: 800,
    gross_margin_pct: 0.6,
  },
  {
    id: "a1b2c3d4-0003-0003-0003-000000000003",
    created_at: "2026-01-03T00:00:00.000Z",
    is_demo: true,
    name: "E-commerce Flash Sale Funnel",
    currency_label: "RM",
    ad_budget: 8000,
    management_fee: 0,
    cpc: 0.55,
    ctr: 0.03,
    core_cta_action: "Checkout Started",
    conv_rate_click_to_lead: 0.5,
    conv_rate_lead_to_cta: 0.2,
    conv_rate_cta_to_next_step: 0.8,
    conv_rate_next_step_to_closed: 0.65,
    average_order_value: 350,
    gross_margin_pct: 0.45,
  },
];
