import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

test("near-atm-gamma is a standalone board sourced from high-gamma", () => {
  const page = readFileSync(new URL("../app/options/near-atm-gamma/page.tsx", import.meta.url), "utf8");
  const filter = readFileSync(new URL("../lib/leaderboard/nearAtmGamma.ts", import.meta.url), "utf8");
  const boardConfig = readFileSync(new URL("../lib/leaderboard/boardConfig.ts", import.meta.url), "utf8");
  const nav = readFileSync(new URL("../lib/v4/navConfig.ts", import.meta.url), "utf8");
  const gex = readFileSync(new URL("../components/v4/V4GexDashboard.tsx", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../lib/leaderboard/useLeaderboardData.ts", import.meta.url), "utf8");

  assert.match(page, /near-atm-gamma/);
  assert.match(page, /V4LeaderboardPage/);
  assert.match(filter, /isNearAtm/);
  assert.match(boardConfig, /"near-atm-gamma"/);
  assert.match(nav, /\/options\/near-atm-gamma/);
  assert.match(gex, /\/options\/near-atm-gamma/);
  assert.doesNotMatch(gex, /pickNearAtmHighGamma/);
  assert.match(hook, /near-atm-gamma/);
  assert.match(hook, /pickNearAtmHighGamma/);
});
