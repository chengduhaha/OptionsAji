"use client";

import { useMemo, useState } from "react";

import type {
  CpFilter,
  DteFilter,
  LeaderboardRow,
  MoneynessFilter,
} from "@/lib/leaderboard/types";

const PAGE_SIZE = 10;
const MAX_PAGES = 10;

export type LeaderboardFilterState = {
  cp: CpFilter;
  dte: DteFilter;
  moneyness: MoneynessFilter;
  topN: 10 | 25;
  page: number;
};

function matchesDte(dte: number | null, filter: DteFilter): boolean {
  if (filter === "all") return true;
  const days = dte ?? 999;
  if (filter === "0") return days === 0;
  if (filter === "7") return days <= 7;
  if (filter === "30") return days <= 30;
  return true;
}

function matchesMoneyness(row: LeaderboardRow, filter: MoneynessFilter): boolean {
  if (filter === "all") return true;
  const tag = (row.moneyness ?? "").toUpperCase();
  return tag === filter;
}

export function useLeaderboardFilters(
  items: LeaderboardRow[],
  options: { paginated?: boolean; defaultDte?: DteFilter },
) {
  const [cp, setCp] = useState<CpFilter>("all");
  const [dte, setDte] = useState<DteFilter>(options.defaultDte ?? "all");
  const [moneyness, setMoneyness] = useState<MoneynessFilter>("all");
  const [topN, setTopN] = useState<10 | 25>(10);
  const [page, setPage] = useState(1);

  const filteredCount = useMemo(() => {
    return items.filter((row) => {
      if (cp !== "all" && row.option_type !== cp) return false;
      if (!matchesDte(row.dte, dte)) return false;
      if (!matchesMoneyness(row, moneyness)) return false;
      return true;
    }).length;
  }, [items, cp, dte, moneyness]);

  const visibleRows = useMemo(() => {
    const filtered = items.filter((row) => {
      if (cp !== "all" && row.option_type !== cp) return false;
      if (!matchesDte(row.dte, dte)) return false;
      if (!matchesMoneyness(row, moneyness)) return false;
      return true;
    });

    const capped = options.paginated
      ? filtered.slice(0, MAX_PAGES * PAGE_SIZE)
      : filtered.slice(0, topN);

    if (options.paginated) {
      const start = (page - 1) * PAGE_SIZE;
      return capped.slice(start, start + PAGE_SIZE).map((row, idx) => ({
        ...row,
        rank: start + idx + 1,
      }));
    }

    return capped.map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [items, cp, dte, moneyness, topN, page, options.paginated]);

  const totalPages = options.paginated
    ? Math.min(MAX_PAGES, Math.max(1, Math.ceil(Math.min(filteredCount, MAX_PAGES * PAGE_SIZE) / PAGE_SIZE)))
    : 1;

  const resetPage = () => setPage(1);

  return {
    cp,
    setCp: (value: CpFilter) => {
      setCp(value);
      resetPage();
    },
    dte,
    setDte: (value: DteFilter) => {
      setDte(value);
      resetPage();
    },
    moneyness,
    setMoneyness: (value: MoneynessFilter) => {
      setMoneyness(value);
      resetPage();
    },
    topN,
    setTopN: (value: 10 | 25) => {
      setTopN(value);
      resetPage();
    },
    page,
    setPage,
    filteredCount,
    visibleRows,
    totalPages,
    pageSize: PAGE_SIZE,
    showTopFilter: !options.paginated,
  };
}
