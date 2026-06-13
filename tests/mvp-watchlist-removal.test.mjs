import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../components/mvp/MvpInsightsPage.tsx", import.meta.url), "utf8");
const namespaces = readFileSync(new URL("../lib/i18n/namespaces.ts", import.meta.url), "utf8");

test("market insights does not render the daily watch list block", () => {
  assert.doesNotMatch(component, /Layer 5 · Watch list/);
  assert.doesNotMatch(component, /buildTradePlan/);
  assert.doesNotMatch(component, /watchPreview/);
  assert.doesNotMatch(component, /watchRemainder/);
});

test("daily watch list i18n labels are removed", () => {
  assert.doesNotMatch(namespaces, /watchListTitle/);
  assert.doesNotMatch(namespaces, /watchListHint/);
  assert.doesNotMatch(namespaces, /proWatchList/);
  assert.doesNotMatch(namespaces, /proWatchListUnlock/);
});
