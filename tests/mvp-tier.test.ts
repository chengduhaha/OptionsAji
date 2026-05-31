import assert from "node:assert/strict";
import test from "node:test";

import { resolveMvpTier, tierMeetsRequired, unwrapMvpEnvelope } from "../lib/mvp-tier";

test("resolves guest trial pro", () => {
  assert.equal(resolveMvpTier({ ready: true, user: null, isAdmin: false, isPro: false }), "guest");
  assert.equal(
    resolveMvpTier({
      ready: true,
      user: {
        id: "1",
        email: "a@b.com",
        role: "user",
        email_verified: true,
        display_name: null,
        created_at: null,
      },
      isAdmin: false,
      isPro: false,
    }),
    "trial",
  );
  assert.equal(
    resolveMvpTier({ ready: true, user: null, isAdmin: false, isPro: true }),
    "pro",
  );
});

test("tierMeetsRequired ordering", () => {
  assert.equal(tierMeetsRequired("guest", "trial"), false);
  assert.equal(tierMeetsRequired("trial", "trial"), true);
  assert.equal(tierMeetsRequired("pro", "trial"), true);
});

test("unwrapMvpEnvelope strips tier field", () => {
  const { tier, data } = unwrapMvpEnvelope({
    tier: "guest",
    events: [],
    summary_zh: "hi",
  });
  assert.equal(tier, "guest");
  assert.deepEqual(data, { events: [], summary_zh: "hi" });
});
