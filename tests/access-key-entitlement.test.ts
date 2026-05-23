import assert from "node:assert/strict";
import test from "node:test";

import {
  computeAccessKeyEntitled,
  computeAccessKeyModalOpen,
} from "../lib/access-key-entitlement";

test("stale invalid lifecycle while refresh loading stays entitled", () => {
  assert.equal(
    computeAccessKeyEntitled({
      isAdmin: false,
      storageReady: true,
      accessKey: "aji_trial_abcdefghijklmnop",
      lifecycle: "invalid",
      statusLoading: true,
      statusValid: undefined,
    }),
    true,
  );
});

test("unknown lifecycle with stored key stays entitled before status returns", () => {
  assert.equal(
    computeAccessKeyEntitled({
      isAdmin: false,
      storageReady: true,
      accessKey: "aji_trial_abcdefghijklmnop",
      lifecycle: "unknown",
      statusLoading: false,
      statusValid: undefined,
    }),
    true,
  );
});

test("modal does not open when local key exists after navigation", () => {
  assert.equal(
    computeAccessKeyModalOpen({
      ready: true,
      hasUser: true,
      isAdmin: false,
      storageReady: true,
      accessKey: "aji_trial_abcdefghijklmnop",
      dismissed: false,
    }),
    false,
  );
});

test("modal opens only without stored key on client", () => {
  assert.equal(
    computeAccessKeyModalOpen({
      ready: true,
      hasUser: true,
      isAdmin: false,
      storageReady: true,
      accessKey: "",
      dismissed: false,
    }),
    true,
  );
});

test("SSR storage not ready must not open modal", () => {
  assert.equal(
    computeAccessKeyModalOpen({
      ready: true,
      hasUser: true,
      isAdmin: false,
      storageReady: false,
      accessKey: "",
      dismissed: false,
    }),
    false,
  );
});
