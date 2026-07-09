import { createClient } from "@supabase/supabase-js";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { calculateAll, type ScenarioInputs } from "@/lib/engine";
import { demoScenarios, type ScenarioRecord } from "@/lib/demo-scenarios";

const memoryStore = new Map<string, ScenarioRecord>();
const localStorePath = join(process.cwd(), ".local-scenarios.json");

export async function listScenarios() {
  const supabase = getSupabase();
  if (!supabase) {
    return [...(await readLocalScenarios()), ...demoScenarios].sort(sortNewest);
  }

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ScenarioRecord[];
}

export async function getScenario(id: string) {
  const memory = memoryStore.get(id);
  if (memory) return memory;

  const demo = demoScenarios.find((scenario) => scenario.id === id);
  if (demo) return demo;

  const supabase = getSupabase();
  if (!supabase) {
    const local = await readLocalScenarios();
    return local.find((scenario) => scenario.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as ScenarioRecord;
}

export async function saveScenario(inputs: ScenarioInputs) {
  const computed = calculateAll(inputs);
  const supabase = getSupabase();

  if (!supabase) {
    const record: ScenarioRecord = {
      ...computed.inputs,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      is_demo: false,
    };
    memoryStore.set(record.id, record);
    await writeLocalScenarios([record, ...(await readLocalScenarios())]);
    return record;
  }

  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      ...computed.inputs,
      scenario_multipliers: { conservative: 0.7, expected: 1, optimistic: 1.3 },
      computed_results: computed.results,
      bottleneck_stage: computed.bottleneck.stage,
      is_demo: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScenarioRecord;
}

export async function deleteScenario(id: string) {
  memoryStore.delete(id);

  const supabase = getSupabase();
  if (!supabase) {
    await writeLocalScenarios(
      (await readLocalScenarios()).filter((scenario) => scenario.id !== id),
    );
    return;
  }

  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", id)
    .eq("is_demo", false);

  if (error) throw error;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

function sortNewest(a: ScenarioRecord, b: ScenarioRecord) {
  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

async function readLocalScenarios() {
  try {
    const raw = await readFile(localStorePath, "utf8");
    return JSON.parse(raw) as ScenarioRecord[];
  } catch {
    return [];
  }
}

async function writeLocalScenarios(scenarios: ScenarioRecord[]) {
  await writeFile(localStorePath, JSON.stringify(scenarios, null, 2));
}
