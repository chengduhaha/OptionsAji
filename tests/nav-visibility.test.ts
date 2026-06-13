import assert from "node:assert/strict";
import test from "node:test";

import {
  initialNavVisibilityForRole,
  defaultNavVisibility,
} from "../lib/nav-visibility";

test("regular users do not start with every sidebar menu visible while permissions load", () => {
  const initial = initialNavVisibilityForRole("user");

  assert.equal(initial.cross_market, false);
  assert.equal(initial.aji_insights, true);
  assert.equal(initial.twitter_kol, false);
  assert.notDeepEqual(initial, defaultNavVisibility());
});

test("admins keep the full default sidebar visibility", () => {
  assert.deepEqual(initialNavVisibilityForRole("admin"), defaultNavVisibility());
});
