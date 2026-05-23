import type { AccessKeyLifecycleStatus } from "@/lib/access-key-client";

const BLOCKED_LIFECYCLES = new Set<AccessKeyLifecycleStatus>([
  "invalid",
  "expired",
  "revoked",
  "device_mismatch",
]);

export function computeAccessKeyEntitled(input: {
  isAdmin: boolean;
  storageReady: boolean;
  accessKey: string;
  lifecycle: AccessKeyLifecycleStatus;
  statusLoading: boolean;
  statusValid: boolean | undefined;
}): boolean {
  const hasAccessKey = input.storageReady && input.accessKey.trim().length >= 8;
  return (
    input.isAdmin ||
    (hasAccessKey &&
      (input.statusLoading || !BLOCKED_LIFECYCLES.has(input.lifecycle)) &&
      input.statusValid !== false)
  );
}

export function computeAccessKeyModalOpen(input: {
  ready: boolean;
  hasUser: boolean;
  isAdmin: boolean;
  storageReady: boolean;
  accessKey: string;
  dismissed: boolean;
}): boolean {
  if (!input.storageReady) return false;
  const hasAccessKey = input.accessKey.trim().length >= 8;
  return (
    input.ready &&
    input.hasUser &&
    !input.isAdmin &&
    !hasAccessKey &&
    !input.dismissed
  );
}
