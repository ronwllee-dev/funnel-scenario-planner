-- Idempotent production repair for deployments where application code reached
-- production before the scenario context columns were applied.
alter table public.scenarios
  add column if not exists campaign_channel text not null default 'Mixed channels',
  add column if not exists target_market text not null default '',
  add column if not exists assumption_basis text not null default 'Consultant assumption',
  add column if not exists assumption_date date,
  add column if not exists assumption_notes text not null default '';

-- Preserve JSONB storage and align the default used by future direct inserts.
alter table public.scenarios
  alter column scenario_multipliers
  set default '{"conservative":0.85,"expected":1.0,"optimistic":1.15}'::jsonb;
