import assert from "node:assert/strict";
import test from "node:test";

import {
  OPTIONS_AJI_ACCESS_KEY_LS,
  OPTIONS_AJI_DEVICE_ID_LS,
  buildMvpAccessHeaders,
  ensureMvpDeviceId,
} from "../lib/access-key";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

test("ensureMvpDeviceId keeps an existing browser device id", () => {
  const storage = memoryStorage({ [OPTIONS_AJI_DEVICE_ID_LS]: "device-existing" });

  assert.equal(ensureMvpDeviceId(storage, () => "device-new"), "device-existing");
});

test("ensureMvpDeviceId creates a browser device id when missing", () => {
  const storage = memoryStorage();

  assert.equal(ensureMvpDeviceId(storage, () => "device-new"), "device-new");
  assert.equal(storage.getItem(OPTIONS_AJI_DEVICE_ID_LS), "device-new");
});

test("buildMvpAccessHeaders includes access key and device id", () => {
  const storage = memoryStorage({
    [OPTIONS_AJI_ACCESS_KEY_LS]: "aji_trial_secret",
    [OPTIONS_AJI_DEVICE_ID_LS]: "browser-1",
  });

  assert.deepEqual(buildMvpAccessHeaders(storage), {
    "X-Access-Key": "aji_trial_secret",
    "X-Device-Id": "browser-1",
  });
});
