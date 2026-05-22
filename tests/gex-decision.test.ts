import assert from "node:assert/strict";
import test from "node:test";

import { buildGammaStructureRead } from "../lib/gex-decision";

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
  assert.equal(read.structureBias, "震荡吸附");
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
  assert.equal(read.structureBias, "波动放大");
  assert.match(read.summary, /Gamma Flip/);
  assert.ok(read.actions.some((line) => line.includes("Put") && line.includes("跌破")));
});
