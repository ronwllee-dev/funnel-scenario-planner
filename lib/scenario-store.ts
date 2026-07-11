import { calculateAll, type ScenarioInputs } from "@/lib/engine";
import { demoScenarios, type ScenarioRecord } from "@/lib/demo-scenarios";
import { createClient } from "@/lib/supabase/server";
import { ownedScenarioFilter } from "@/lib/scenario-access";

export async function listScenarios(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .or(ownedScenarioFilter(userId))
    .order("created_at", { ascending: false });

  if (error) throw error;
  return normaliseScenarioRecords(data as ScenarioRecord[]);
}

export async function getScenario(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return normaliseScenarioRecord(data as ScenarioRecord);
}

export async function saveScenario(inputs: ScenarioInputs, userId: string) {
  const computed = calculateAll(inputs);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      ...computed.inputs,
      user_id: userId,
      scenario_multipliers: { conservative: 0.7, expected: 1, optimistic: 1.3 },
      computed_results: computed.results,
      bottleneck_stage: computed.bottleneck.stage,
      is_demo: false,
    })
    .select()
    .single();

  if (error) throw error;
  return normaliseScenarioRecord(data as ScenarioRecord);
}

export async function updateScenario(id: string, inputs: ScenarioInputs) {
  const computed = calculateAll(inputs);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .update({
      ...computed.inputs,
      scenario_multipliers: { conservative: 0.7, expected: 1, optimistic: 1.3 },
      computed_results: computed.results,
      bottleneck_stage: computed.bottleneck.stage,
    })
    .eq("id", id)
    .eq("is_demo", false)
    .select()
    .single();

  if (error) throw error;
  return normaliseScenarioRecord(data as ScenarioRecord);
}

export async function updateScenarioName(id: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenarios")
    .update({ name })
    .eq("id", id)
    .eq("is_demo", false)
    .select()
    .single();

  if (error) throw error;
  return normaliseScenarioRecord(data as ScenarioRecord);
}

export async function deleteScenario(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", id)
    .eq("is_demo", false);

  if (error) throw error;
}

function normaliseScenarioRecords(records: ScenarioRecord[]) {
  return records.map(normaliseScenarioRecord);
}

function normaliseScenarioRecord(record: ScenarioRecord) {
  return {
    ...record,
    ctr: record.ctr ?? 0.02,
  };
}
