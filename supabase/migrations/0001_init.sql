create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null default 'Untitled Scenario',
  currency_label text not null default 'USD',
  ad_budget numeric not null default 0,
  management_fee numeric not null default 0,
  cpc numeric not null default 0,
  ctr numeric not null default 0.02,
  core_cta_action text not null default 'Booked Call',
  conv_rate_click_to_lead numeric not null default 0,
  conv_rate_lead_to_cta numeric not null default 0,
  conv_rate_cta_to_next_step numeric not null default 0,
  conv_rate_next_step_to_closed numeric not null default 0,
  average_order_value numeric not null default 0,
  gross_margin_pct numeric not null default 0,
  scenario_multipliers jsonb not null default '{"conservative":0.7,"expected":1.0,"optimistic":1.3}',
  computed_results jsonb,
  bottleneck_stage text,
  is_demo boolean not null default false
);

alter table scenarios add column if not exists ctr numeric not null default 0.02;

alter table scenarios enable row level security;
drop policy if exists "scenarios_v1_read" on scenarios;
create policy "scenarios_v1_read" on scenarios for select using (true);
drop policy if exists "scenarios_v1_write" on scenarios;
create policy "scenarios_v1_write" on scenarios for all using (true) with check (true);

insert into scenarios (id, name, currency_label, ad_budget, management_fee, cpc, ctr, core_cta_action, conv_rate_click_to_lead, conv_rate_lead_to_cta, conv_rate_cta_to_next_step, conv_rate_next_step_to_closed, average_order_value, gross_margin_pct, is_demo, computed_results, bottleneck_stage)
values
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'SaaS Demo Booking Campaign',
    'USD',
    5000, 500, 1.20, 0.02,
    'Demo Booked',
    0.30, 0.25, 0.60, 0.40,
    2400, 0.75,
    true,
    '{"conservative":{"clicks":2916,"leads":875,"cta_actions":219,"next_step_offers":131,"closed_sales":52,"cpl":4.00,"cost_per_cta":15.99,"cost_per_next_step":26.65,"cpa":67.34,"roas":2.99,"gross_profit":93600,"net_profit":88100},"expected":{"clicks":4166,"leads":1250,"cta_actions":313,"next_step_offers":188,"closed_sales":75,"cpl":2.80,"cost_per_cta":11.19,"cost_per_next_step":18.66,"cpa":46.67,"roas":4.27,"gross_profit":135000,"net_profit":129500},"optimistic":{"clicks":5416,"leads":1625,"cta_actions":406,"next_step_offers":244,"closed_sales":98,"cpl":2.15,"cost_per_cta":8.60,"cost_per_next_step":14.34,"cpa":35.87,"roas":5.56,"gross_profit":176400,"net_profit":170900}}',
    'Lead → Demo Booked'
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Local Clinic Consultation Campaign',
    'SGD',
    3000, 300, 0.85, 0.025,
    'Consultation Booked',
    0.40, 0.30, 0.70, 0.50,
    800, 0.60,
    true,
    '{"conservative":{"clicks":2470,"leads":988,"cta_actions":296,"next_step_offers":207,"closed_sales":104,"cpl":2.12,"cost_per_cta":7.09,"cost_per_next_step":10.14,"cpa":20.29,"roas":1.66,"gross_profit":49920,"net_profit":46620},"expected":{"clicks":3529,"leads":1412,"cta_actions":424,"next_step_offers":297,"closed_sales":148,"cpl":1.49,"cost_per_cta":4.95,"cost_per_next_step":7.07,"cpa":14.19,"roas":2.37,"gross_profit":71040,"net_pilot":67740},"optimistic":{"clicks":4588,"leads":1835,"cta_actions":551,"next_step_offers":386,"closed_sales":193,"cpl":1.14,"cost_per_cta":3.81,"cost_per_next_step":5.44,"cpa":10.93,"roas":3.08,"gross_profit":92640,"net_profit":89340}}',
    'Consultation Booked → Package Sold'
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    'E-commerce Flash Sale Funnel',
    'RM',
    8000, 0, 0.55, 0.03,
    'Checkout Started',
    0.50, 0.20, 0.80, 0.65,
    350, 0.45,
    true,
    '{"conservative":{"clicks":10181,"leads":5091,"cta_actions":1018,"next_step_offers":814,"closed_sales":529,"cpl":1.10,"cost_per_cta":5.50,"cost_per_next_step":6.87,"cpa":10.57,"roas":1.04,"gross_profit":83227,"net_profit":75227},"expected":{"clicks":14545,"leads":7273,"cta_actions":1455,"next_step_offers":1164,"closed_sales":756,"cpl":0.77,"cost_per_cta":3.85,"cost_per_next_step":4.81,"cpa":7.41,"roas":1.49,"gross_profit":118980,"net_profit":110980},"optimistic":{"clicks":18909,"leads":9455,"cta_actions":1891,"next_step_offers":1513,"closed_sales":983,"cpl":0.59,"cost_per_cta":2.96,"cost_per_next_step":3.70,"cpa":5.70,"roas":1.93,"gross_profit":154822,"net_profit":146822}}',
    'Checkout Started → Closed Sale'
  );
