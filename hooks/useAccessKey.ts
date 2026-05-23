"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type AccessKeyLifecycleStatus,
  type AccessKeyStatusData,
  fetchAccessKeyStatus,
  persistAccessKey,
  readStoredAccessKey,
  statusLabelZh,
} from "@/lib/access-key-client";

export function useAccessKey(token?: string | null) {
  const [accessKey, setAccessKey] = useState("");
  const [statusData, setStatusData] = useState<AccessKeyStatusData | null>(null);
  const [lifecycle, setLifecycle] = useState<AccessKeyLifecycleStatus>("unknown");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    setAccessKey(readStoredAccessKey());
  }, []);

  const hasAccessKey = accessKey.trim().length >= 8;
  const isEntitled =
    hasAccessKey &&
    (lifecycle === "active" || lifecycle === "pending") &&
    statusData?.valid !== false;

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
    if (!hasAccessKey) {
      setStatusData(null);
      setLifecycle("invalid");
      return;
    }
    void refreshStatus();
  }, [hasAccessKey, accessKey, token, refreshStatus]);

  const saveKey = useCallback(
    async (raw: string) => {
      const next = raw.trim();
      persistAccessKey(next);
      setAccessKey(next);
      if (next.length < 8) {
        setStatusData(null);
        setLifecycle("invalid");
        setStatusError("Access Key 至少需要 8 个字符");
        return { ok: false as const, error: "Access Key 至少需要 8 个字符" };
      }
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
    setAccessKey("");
    setStatusData(null);
    setLifecycle("invalid");
    setStatusError(null);
  }, []);

  return {
    accessKey,
    hasAccessKey,
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
