import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("auth endpoints use Supabase email password flows and cookie sessions", async () => {
  const login = await text("app/api/auth/login/route.ts");
  const signup = await text("app/api/auth/signup/route.ts");
  const forgot = await text("app/api/auth/forgot-password/route.ts");
  const reset = await text("app/api/auth/reset-password/route.ts");
  const logout = await text("app/api/auth/logout/route.ts");
  const callback = await text("app/auth/callback/route.ts");
  const server = await text("lib/supabase/server.ts");
  const middleware = await text("middleware.ts");

  assert.match(login, /signInWithPassword/);
  assert.match(signup, /signUp/);
  assert.match(forgot, /resetPasswordForEmail/);
  assert.match(reset, /updateUser/);
  assert.match(logout, /signOut/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(server, /createServerClient/);
  assert.match(server, /cookies\(\)/);
  assert.match(middleware, /updateSession\(request\)/);
});

test("planner pages and scenario API require an authenticated user", async () => {
  const home = await text("app/page.tsx");
  const scenarioPage = await text("app/scenario/[id]/page.tsx");
  const scenariosPage = await text("app/scenarios/page.tsx");
  const scenariosApi = await text("app/api/scenarios/route.ts");
  const scenarioApi = await text("app/api/scenarios/[id]/route.ts");

  assert.match(home, /requireUser/);
  assert.match(scenarioPage, /requireUser/);
  assert.match(scenariosPage, /requireUser/);
  assert.match(scenariosApi, /getCurrentUser/);
  assert.match(scenarioApi, /getCurrentUser/);
  assert.match(scenariosApi, /saveScenario\(inputs, user\.id\)/);
  assert.doesNotMatch(scenariosApi, /user_id.*request|request.*user_id/s);
});

test("scenario store scopes reads and writes to the logged-in owner", async () => {
  const store = await text("lib/scenario-store.ts");
  const access = await text("lib/scenario-access.ts");

  assert.match(store, /listScenarios\(userId: string\)/);
  assert.match(store, /\.or\(ownedScenarioFilter\(userId\)\)/);
  assert.match(store, /saveScenario\(inputs: ScenarioInputs, userId: string\)/);
  assert.match(store, /user_id: userId/);
  assert.match(access, /is_demo\.eq\.true,user_id\.eq\.\$\{userId\}/);
});
