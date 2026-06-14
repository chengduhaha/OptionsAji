import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const apiClient = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");

test("browser API client always uses same-origin Next proxy routes", () => {
  assert.doesNotMatch(apiClient, /NEXT_PUBLIC_API_BASE/);
  assert.doesNotMatch(apiClient, /fetch\(`\$\{BASE\}\$\{path\}`/);
});
