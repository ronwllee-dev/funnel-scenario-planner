import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const metadata = await import("../lib/scenario-metadata.ts");

test("maps assumption bases to model statuses", () => {
  assert.equal(metadata.getModelStatus("Consultant assumption"), "Exploratory");
  assert.equal(metadata.getModelStatus("Industry benchmark"), "Indicative");
  assert.equal(metadata.getModelStatus("Media buyer estimate"), "Indicative");
  assert.equal(metadata.getModelStatus("Mixed sources"), "Indicative");
  assert.equal(metadata.getModelStatus("Client historical data"), "Evidence-based");
  assert.equal(metadata.getModelStatus("Current campaign data"), "Calibrated");
});

test("applies compatibility defaults to legacy scenarios", () => {
  assert.deepEqual(
    metadata.normaliseScenarioContext({ created_at: "2025-03-04T12:00:00Z" }),
    {
      campaign_channel: "Mixed channels",
      target_market: "",
      assumption_basis: "Consultant assumption",
      assumption_date: "2025-03-04",
      assumption_notes: "",
    },
  );
});

test("preserves saved contextual metadata", () => {
  const context = {
    campaign_channel: "LinkedIn Ads",
    target_market: "Singapore SMEs",
    assumption_basis: "Client historical data",
    assumption_date: "2026-07-12",
    assumption_notes: "CRM-derived close rate.",
  };
  assert.deepEqual(metadata.normaliseScenarioContext(context), context);
});

test("migration and store persist context without changing RLS", async () => {
  const migration = await readFile(new URL("../supabase/migrations/0003_scenario_context.sql", import.meta.url), "utf8");
  const store = await readFile(new URL("../lib/scenario-store.ts", import.meta.url), "utf8");
  assert.match(migration, /add column if not exists campaign_channel/);
  assert.match(migration, /add column if not exists target_market/);
  assert.match(migration, /add column if not exists assumption_basis/);
  assert.match(migration, /add column if not exists assumption_date/);
  assert.match(migration, /add column if not exists assumption_notes/);
  assert.match(store, /\.\.\.computed\.inputs/);
  assert.match(store, /user_id: userId/);
  assert.match(store, /normaliseScenarioContext\(record\)/);
  assert.doesNotMatch(migration, /create policy|drop policy/);
});
