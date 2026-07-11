import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ownership migration replaces open V1 policies with RLS owner policies", async () => {
  const migration = await readFile(
    new URL("../supabase/migrations/0002_auth_ownership_rls.sql", import.meta.url),
    "utf8",
  );

  assert.match(migration, /add column if not exists user_id uuid/);
  assert.match(migration, /references auth\.users\(id\)/);
  assert.match(migration, /drop policy if exists "scenarios_v1_read"/);
  assert.match(migration, /drop policy if exists "scenarios_v1_write"/);
  assert.match(migration, /using \(is_demo = true\)/);
  assert.match(migration, /using \(auth\.uid\(\) = user_id\)/);
  assert.match(
    migration,
    /with check \(auth\.uid\(\) = user_id and coalesce\(is_demo, false\) = false\)/,
  );
  assert.match(
    migration,
    /for delete\s+using \(auth\.uid\(\) = user_id and coalesce\(is_demo, false\) = false\)/,
  );
  assert.match(migration, /add column if not exists ctr numeric not null default 0\.02/);
});
