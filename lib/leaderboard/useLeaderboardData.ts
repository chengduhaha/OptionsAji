"use client";

import { useCallback, useEffect, useState } from "react";

import { authFetch } from "@/lib/apiBase";
import { pickNearAtmHighGamma } from "@/lib/leaderboard/nearAtmGamma";
import type { BoardId, DteFilter, LeaderboardResponse, LeaderboardRow } from "@/lib/leaderboard/types";
import { defaultBoardAccess, type BoardAccessMeta } from "@/lib/membership";

type UseLeaderboardDataOptions = {
  boardId: BoardId;
  isMember: boolean;
  authReady: boolean;
  loadErrorMessage: string;
};

function transformBoardItems(boardId: BoardId, items: LeaderboardRow[]): LeaderboardRow[] {
  if (boardId === "near-atm-gamma") {
    return pickNearAtmHighGamma(items);
  }
  return items;
}

function apiBoardId(boardId: BoardId): BoardId {
  return boardId === "near-atm-gamma" ? "high-gamma" : boardId;
}

export function useLeaderboardData({
  boardId,
  isMember,
  authReady,
  loadErrorMessage,
}: UseLeaderboardDataOptions) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [access, setAccess] = useState<BoardAccessMeta>(() => defaultBoardAccess(false, boardId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/options/leaderboard/${apiBoardId(boardId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as LeaderboardResponse;
      if (payload.error && (!payload.items || payload.items.length === 0)) {
        throw new Error(payload.error);
      }
      const items = transformBoardItems(boardId, payload.items ?? []);
      setData({
        ...payload,
        board: boardId,
        items,
        total: items.length,
      });
      setAccess(payload.access ?? defaultBoardAccess(isMember, boardId));
    } catch (err) {
      setData(null);
      setAccess(defaultBoardAccess(isMember, boardId));
      setError(err instanceof Error ? err.message : loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [boardId, isMember, loadErrorMessage]);

  useEffect(() => {
    if (!authReady) return;
    void load();
  }, [load, authReady]);

  return { data, access, loading, error, reload: load };
}

export type { DteFilter };
