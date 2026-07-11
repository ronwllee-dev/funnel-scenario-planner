alter table scenarios add column if not exists user_id uuid;
alter table scenarios add column if not exists ctr numeric not null default 0.02;
alter table scenarios alter column user_id drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'scenarios_user_id_fkey'
      and conrelid = 'public.scenarios'::regclass
  ) then
    alter table scenarios
      add constraint scenarios_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end $$;

create index if not exists scenarios_user_id_idx on scenarios(user_id);
create index if not exists scenarios_demo_idx on scenarios(is_demo);

alter table scenarios enable row level security;

drop policy if exists "scenarios_v1_read" on scenarios;
drop policy if exists "scenarios_v1_write" on scenarios;
drop policy if exists "scenarios_demo_read" on scenarios;
drop policy if exists "scenarios_owner_read" on scenarios;
drop policy if exists "scenarios_owner_insert" on scenarios;
drop policy if exists "scenarios_owner_update" on scenarios;
drop policy if exists "scenarios_owner_delete" on scenarios;

create policy "scenarios_demo_read"
on scenarios
for select
using (is_demo = true);

create policy "scenarios_owner_read"
on scenarios
for select
using (auth.uid() = user_id);

create policy "scenarios_owner_insert"
on scenarios
for insert
with check (auth.uid() = user_id and coalesce(is_demo, false) = false);

create policy "scenarios_owner_update"
on scenarios
for update
using (auth.uid() = user_id and coalesce(is_demo, false) = false)
with check (auth.uid() = user_id and coalesce(is_demo, false) = false);

create policy "scenarios_owner_delete"
on scenarios
for delete
using (auth.uid() = user_id and coalesce(is_demo, false) = false);
