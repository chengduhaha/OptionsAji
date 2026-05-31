"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { resolveMvpTier, type MvpTier } from "@/lib/mvp-tier";
import { useAccessKey } from "@/hooks/useAccessKey";

export function useMvpTier(): {
  tier: MvpTier;
  ready: boolean;
  token: string | null;
  isAdmin: boolean;
  isPro: boolean;
  hasAccessKey: boolean;
  saveKey: ReturnType<typeof useAccessKey>["saveKey"];
} {
  const { ready, user, token, isAdmin } = useAuth();
  const { isEntitled: isPro, hasAccessKey, saveKey } = useAccessKey(token, { isAdmin });

  const tier = useMemo(
    () => resolveMvpTier({ ready, user, isAdmin, isPro }),
    [ready, user, isAdmin, isPro],
  );

  return { tier, ready, token, isAdmin, isPro, hasAccessKey, saveKey };
}
