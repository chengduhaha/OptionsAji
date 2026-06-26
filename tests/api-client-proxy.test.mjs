import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const apiClient = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
const apiBase = readFileSync(new URL("../lib/apiBase.ts", import.meta.url), "utf8");

test("direct backend remaps stock gex history to options path", () => {
  assert.match(apiBase, /remapDirectBackendPath/);
  assert.match(
    apiBase,
    /\/api\/options\/gex\/history\/\$\{symbol\}/,
  );
});

test("browser API client resolves URLs via apiBase helper", () => {
  assert.match(apiClient, /apiFetch/);
  assert.match(apiBase, /resolveApiUrl/);
  assert.match(apiBase, /NEXT_PUBLIC_API_BASE/);
});
