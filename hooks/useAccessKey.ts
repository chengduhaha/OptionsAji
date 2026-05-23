"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { computeAccessKeyEntitled } from "@/lib/access-key-entitlement";
import {
  type AccessKeyLifecycleStatus,
  type AccessKeyStatusData,
  fetchAccessKeyStatus,
  persistAccessKey,
  readStoredAccessKey,
  statusLabelZh,
  subscribeStoredAccessKey,
} from "@/lib/access-key-client";

function subscribeClientReady(onStoreChange: () => void): () => void {
  onStoreChange();
  return () => {};
}

function getClientReadySnapshot(): boolean {
  return true;
}

function getServerReadySnapshot(): boolean {
  return false;
}

export function useAccessKey(token?: string | null, options?: { isAdmin?: boolean }) {
  const isAdmin = options?.isAdmin ?? false;
  const storageReady = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getServerReadySnapshot,
  );
  const accessKey = useSyncExternalStore(
    subscribeStoredAccessKey,
    readStoredAccessKey,
    () => "",
  );
  const [statusData, setStatusData] = useState<AccessKeyStatusData | null>(null);
  const [lifecycle, setLifecycle] = useState<AccessKeyLifecycleStatus>("unknown");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const hasAccessKey = storageReady && accessKey.trim().length >= 8;
  const isEntitled = computeAccessKeyEntitled({
    isAdmin,
    storageReady,
    accessKey,
    lifecycle,
    statusLoading,
    statusValid: statusData?.valid,
  });

  const refreshStatus = useCallback(
    async (overrideKey?: string) => {
      const key = (overrideKey ?? accessKey).trim();
      if (key.length < 8) {
        setStatusData(null);
        setLifecycle("invalid");
        setStatusError("未设置 Access Key");
        return { ok: false as const, error: "未设置 Access Key" };
      }
      setStatusLoading(true);
      setStatusError(null);
      try {
        const result = await fetchAccessKeyStatus(key, token);
        setStatusData(result.data);
        setLifecycle(result.lifecycle);
        if (result.error) setStatusError(result.error);
        const ok =
          result.data !== null &&
          result.lifecycle !== "invalid" &&
          result.lifecycle !== "expired" &&
          result.lifecycle !== "revoked" &&
          result.lifecycle !== "device_mismatch";
        return { ok, error: result.error };
      } finally {
        setStatusLoading(false);
      }
    },
    [accessKey, token],
  );

  useEffect(() => {
    if (!storageReady) return;
    if (!hasAccessKey) {
      setStatusData(null);
      setLifecycle("invalid");
      return;
    }
    setLifecycle("unknown");
    void refreshStatus();
  }, [hasAccessKey, accessKey, token, refreshStatus, storageReady]);

  const saveKey = useCallback(
    async (raw: string) => {
      const next = raw.trim();
      persistAccessKey(next);
      if (next.length < 8) {
        setStatusData(null);
        setLifecycle("invalid");
        setStatusError("Access Key 至少需要 8 个字符");
        return { ok: false as const, error: "Access Key 至少需要 8 个字符" };
      }
      setLifecycle("unknown");
      const result = await refreshStatus(next);
      if (result.ok) {
        setStatusError(null);
        return { ok: true as const };
      }
      return { ok: false as const, error: result.error ?? "校验失败" };
    },
    [refreshStatus],
  );

  const clearKey = useCallback(() => {
    persistAccessKey("");
    setStatusData(null);
    setLifecycle("invalid");
    setStatusError(null);
  }, []);

  return {
    accessKey,
    hasAccessKey,
    storageReady,
    isAdmin,
    isEntitled,
    statusData,
    lifecycle,
    statusLabel: statusLabelZh(lifecycle),
    daysRemaining: statusData?.days_remaining ?? null,
    statusError,
    statusLoading,
    refreshStatus,
    saveKey,
    clearKey,
  };
}
