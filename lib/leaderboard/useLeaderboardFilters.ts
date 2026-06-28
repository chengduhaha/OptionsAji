"use client";

import { useMemo, useState } from "react";

import {
  LEADERBOARD_MAX_PAGES,
  LEADERBOARD_MAX_ROWS,
  LEADERBOARD_PAGE_SIZE,
} from "@/lib/leaderboard/constants";
import type {
  CpFilter,
  DteFilter,
  LeaderboardRow,
  MoneynessFilter,
} from "@/lib/leaderboard/types";

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
  options: {
    paginated?: boolean;
    defaultDte?: DteFilter;
    maxRows?: number;
    maxPages?: number;
  },
) {
  const maxRows = options.maxRows ?? LEADERBOARD_MAX_ROWS;
  const maxPages = options.maxPages ?? LEADERBOARD_MAX_PAGES;
  const pageSize = LEADERBOARD_PAGE_SIZE;

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

  const paginatedRowCap = Math.min(filteredCount, maxRows);

  const visibleRows = useMemo(() => {
    const filtered = items.filter((row) => {
      if (cp !== "all" && row.option_type !== cp) return false;
      if (!matchesDte(row.dte, dte)) return false;
      if (!matchesMoneyness(row, moneyness)) return false;
      return true;
    });

    const capped = options.paginated ? filtered.slice(0, maxRows) : filtered.slice(0, topN);

    if (options.paginated) {
      const start = (page - 1) * pageSize;
      return capped.slice(start, start + pageSize).map((row, idx) => ({
        ...row,
        rank: start + idx + 1,
      }));
    }

    return capped.map((row, idx) => ({ ...row, rank: idx + 1 }));
  }, [items, cp, dte, moneyness, topN, page, options.paginated, maxRows, pageSize]);

  const totalPages = options.paginated
    ? Math.min(maxPages, Math.max(1, Math.ceil(paginatedRowCap / pageSize)))
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
    paginatedRowCap,
    visibleRows,
    totalPages,
    pageSize,
    showTopFilter: !options.paginated,
  };
}
