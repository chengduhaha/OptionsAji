import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const files = {
  dictionary: readFileSync(new URL("../lib/i18n/dictionary.ts", import.meta.url), "utf8"),
  api: readFileSync(new URL("../lib/crossMarketApi.ts", import.meta.url), "utf8"),
  panorama: readFileSync(new URL("../lib/crossMarketPanorama.ts", import.meta.url), "utf8"),
  mvp: readFileSync(new URL("../components/mvp/MvpInsightsPage.tsx", import.meta.url), "utf8"),
};

test("cross-market English nav labels do not define duplicate keys", () => {
  const enNav = files.dictionary.match(/en:[\s\S]*?nav:[\s\S]*?\n    },/)?.[0] ?? "";
  const matches = enNav.match(/\bcross_market:/g) ?? [];

  assert.equal(matches.length, 1);
});

test("removed cross-market scanner and feed clients are not kept as empty stubs", () => {
  assert.doesNotMatch(files.api, /scanArbitrage/);
  assert.doesNotMatch(files.api, /getCrossMarketFeed/);
  assert.doesNotMatch(files.api, /BackendArbitrageOpportunity/);
  assert.doesNotMatch(files.panorama, /adaptBackendScannerRows/);
  assert.equal(existsSync(new URL("../app/api/cross-market/feed/route.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("../app/api/cross-market/scanner/arbitrage/route.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("../app/api/cross-market/polymarket/hot/route.ts", import.meta.url)), true);
});

test("production frontend code does not contain local agent debug hooks", () => {
  assert.doesNotMatch(files.mvp, /localhost:7624/);
  assert.doesNotMatch(files.mvp, /agent log/);
  assert.doesNotMatch(files.mvp, /X-Debug-Session-Id/);
});
