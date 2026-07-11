import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("app shell has accessible desktop and mobile navigation with logout", async () => {
  const shell = await text("app/components/app-shell.tsx");

  assert.match(shell, /className="sidebar"/);
  assert.match(shell, /aria-controls="mobile-navigation"/);
  assert.match(shell, /aria-expanded=\{open\}/);
  assert.match(shell, /aria-current=\{active \? "page"/);
  assert.match(shell, /Escape/);
  assert.match(shell, /document\.body\.style\.overflow = "hidden"/);
  assert.match(shell, /onNavigate=\{\(\) => setOpen\(false\)\}/);
  assert.match(shell, /action="\/api\/auth\/logout"/);
});

test("dark responsive CSS prevents mobile overflow and keeps controls touch friendly", async () => {
  const css = await text("app/globals.css");

  assert.match(css, /background: #071014/);
  assert.doesNotMatch(css, /body\s*\{[^}]*overflow-x:\s*hidden/s);
  assert.match(css, /\.planner-grid\s*\{[^}]*min-width:\s*0/s);
  assert.match(css, /\.results-panel\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.results-panel th:first-child,[\s\S]*position:\s*sticky/);
  assert.match(css, /\.results-panel td:first-child\s*\{[^}]*background:\s*#0f1d22/s);
  assert.match(css, /\.table-swipe-note\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*\.table-swipe-note\s*\{[^}]*display:\s*block/s);
  assert.match(css, /\.form-grid\s*\{[\s\S]*@media \(min-width: 768px\)/);
  assert.match(css, /font-size: 1rem/);
  assert.match(css, /min-height: 2\.75rem/);
  assert.match(css, /\.drawer\.is-open/);
  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /table\s*\{[\s\S]*min-width: 42rem/);
});

test("comparison tables explain mobile scrolling and keep KPI labels visible", async () => {
  const planner = await text("app/planner.tsx");

  assert.match(planner, /Swipe horizontally to compare all scenarios\./);
  assert.match(planner, /className="panel results-panel p-0"/);
});

test("planner separates sample, new, create, and update scenario states", async () => {
  const planner = await text("app/planner.tsx");
  const route = await text("app/api/scenarios/[id]/route.ts");

  assert.match(planner, /Sample Scenario/);
  assert.match(planner, /Example values are provided/);
  assert.match(planner, /Start a new scenario\? Your unsaved changes will be cleared\./);
  assert.match(planner, /scenarioId \? "PATCH" : "POST"/);
  assert.match(planner, /scenarioId \? "Save Changes" : "Save Scenario"/);
  assert.match(route, /updateScenario\(id, inputs\)/);
});

test("new scenarios start blank and currencies use controlled display prefixes", async () => {
  const planner = await text("app/planner.tsx");
  const currency = await text("lib/currency.ts");

  assert.match(planner, /currency_label: "SGD"/);
  assert.match(planner, /ad_budget: Number\.NaN/);
  assert.match(planner, /gross_margin_pct: Number\.NaN/);
  assert.match(planner, /placeholder="e\.g\. 5000"/);
  assert.match(planner, /placeholder="e\.g\. 75"/);
  assert.match(planner, /Legacy: \{inputs\.currency_label\}/);
  assert.match(currency, /\["USD", "SGD", "MYR"\]/);
  assert.match(currency, /USD: "\$"/);
  assert.match(currency, /SGD: "S\$"/);
  assert.match(currency, /MYR: "RM"/);
});
