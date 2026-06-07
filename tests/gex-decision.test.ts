import assert from "node:assert/strict";
import test from "node:test";

import { buildGammaStructureRead, selectGammaStructureSpot } from "../lib/gex-decision";

test("positive gamma above flip warns against chasing calls near call wall", () => {
  const read = buildGammaStructureRead({
    symbol: "SPY",
    spot: 748,
    netGex: 2.4,
    gammaFlip: 735,
    callWall: 750,
    putWall: 720,
    maxPain: 740,
    regime: "Positive Gamma",
  });

  assert.equal(read.regimeLabel, "正 Gamma");
  assert.equal(read.structureBiasCode, "mean_reversion");
  assert.match(read.summary, /Call Wall/);
  assert.ok(read.actions.some((line) => line.includes("Call") && line.includes("追")));
});

test("negative gamma below flip highlights volatility expansion and put validation", () => {
  const read = buildGammaStructureRead({
    symbol: "NVDA",
    spot: 918,
    netGex: -1.8,
    gammaFlip: 930,
    callWall: 960,
    putWall: 900,
    maxPain: 940,
    regime: "Negative Gamma",
  });

  assert.equal(read.regimeLabel, "负 Gamma");
  assert.equal(read.structureBiasCode, "volatility_expansion");
  assert.match(read.summary, /Gamma Flip/);
  assert.ok(read.actions.some((line) => line.includes("Put") && line.includes("跌破")));
});

test("selectGammaStructureSpot prefers overview spot when GEX spot is stale", () => {
  assert.equal(selectGammaStructureSpot({ overviewSpot: 120.93, gexSpot: 100 }), 120.93);
});

test("selectGammaStructureSpot keeps GEX spot when it is close to overview", () => {
  assert.equal(selectGammaStructureSpot({ overviewSpot: 120.93, gexSpot: 121 }), 121);
});
