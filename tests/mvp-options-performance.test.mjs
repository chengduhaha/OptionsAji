import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mvp = readFileSync(new URL("../components/mvp/MvpInsightsPage.tsx", import.meta.url), "utf8");

test("stock report initial load does not force realtime option scans", () => {
  assert.doesNotMatch(mvp, /api\.options\.chain\([\s\S]*?realtime:\s*true/);
  assert.doesNotMatch(mvp, /api\.options\.gex\([\s\S]*?realtime:\s*true/);
});
