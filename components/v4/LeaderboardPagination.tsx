"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type LeaderboardPaginationProps = {
  page: number;
  totalPages: number;
  totalRows: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  className?: string;
};

export function LeaderboardPagination({
  page,
  totalPages,
  totalRows,
  loading = false,
  onPageChange,
  className,
}: LeaderboardPaginationProps) {
  const { t } = useI18n();

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 border-x border-border bg-card px-4 py-4",
        className,
      )}
    >
      <span className="mr-1 text-xs text-muted-foreground">
        {formatMessage(t("v3.leaderboard.totalRows"), { count: String(totalRows) })}
      </span>

      <button
        type="button"
        disabled={loading || page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label={t("v3.leaderboard.prevPage")}
        className="inline-flex items-center rounded-md border border-border px-2 py-1.5 text-xs transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          disabled={loading}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "min-w-[2.25rem] rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors",
            p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary disabled:opacity-50",
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={loading || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label={t("v3.leaderboard.nextPage")}
        className="inline-flex items-center rounded-md border border-border px-2 py-1.5 text-xs transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
