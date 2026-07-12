alter table scenarios
  add column if not exists campaign_channel text not null default 'Mixed channels',
  add column if not exists target_market text not null default '',
  add column if not exists assumption_basis text not null default 'Consultant assumption',
  add column if not exists assumption_date date,
  add column if not exists assumption_notes text not null default '';

alter table scenarios
  alter column scenario_multipliers
  set default '{"conservative":0.85,"expected":1.0,"optimistic":1.15}'::jsonb;

update scenarios
set scenario_multipliers = '{"conservative":0.85,"expected":1.0,"optimistic":1.15}'::jsonb,
    assumption_date = coalesce(assumption_date, created_at::date)
where scenario_multipliers is distinct from '{"conservative":0.85,"expected":1.0,"optimistic":1.15}'::jsonb
   or assumption_date is null;

update scenarios
set campaign_channel = 'LinkedIn Ads',
    target_market = 'Singapore SMEs',
    assumption_basis = 'Consultant assumption',
    assumption_notes = 'Example planning assumptions for a SaaS demo campaign.'
where id = 'a1b2c3d4-0001-0001-0001-000000000001';
