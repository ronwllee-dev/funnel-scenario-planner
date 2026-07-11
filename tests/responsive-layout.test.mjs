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
  assert.match(shell, /action="\/api\/auth\/logout"/);
});

test("dark responsive CSS prevents mobile overflow and keeps controls touch friendly", async () => {
  const css = await text("app/globals.css");

  assert.match(css, /background: #071014/);
  assert.match(css, /overflow-x: hidden/);
  assert.match(css, /font-size: 1rem/);
  assert.match(css, /min-height: 2\.75rem/);
  assert.match(css, /\.drawer\.is-open/);
  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /table\s*\{[\s\S]*min-width: 42rem/);
});
