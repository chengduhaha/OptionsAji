"use client";

import Link from "next/link";
import { Check, Lock } from "lucide-react";

import { blogCategoryLabel } from "@/lib/blog/categories";
import type { BlogDocumentAccess } from "@/lib/blog/types";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type BlogDocumentsAccessBannerProps = {
  access: BlogDocumentAccess;
  categoryFilter?: string;
};

export default function BlogDocumentsAccessBanner({
  access,
  categoryFilter,
}: BlogDocumentsAccessBannerProps) {
  const { t } = useI18n();

  const visible = access.visible_count;
  const total = access.member_total_count;
  const progressPct = total > 0 ? Math.min(100, Math.round((visible / total) * 100)) : 0;

  if (access.is_member) {
    return (
      <div className="mb-8 rounded-xl border-2 border-border bg-secondary/20 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-accent/40 bg-accent/10">
            <Check className="h-4 w-4 text-accent" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-bold sm:text-lg">
              {t("blog.documents.accessBanner.memberHeadline", { total: String(total) })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("blog.documents.accessBanner.memberSubline")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const breakdown = access.category_breakdown.filter(
    (row) => !categoryFilter && row.member_count > row.guest_visible_count,
  );

  return (
    <div className="mb-8 rounded-xl border-2 border-primary/40 bg-primary/5 px-5 py-5 shadow-[4px_4px_0_0_hsl(var(--primary)/0.15)] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary/50 bg-primary/10">
              <Lock className="h-4 w-4 text-primary" aria-hidden />
            </span>
            <div>
              <p className="font-heading text-base font-bold sm:text-lg">
                {t("blog.documents.accessBanner.guestHeadline", {
                  visible: String(visible),
                  total: String(total),
                })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("blog.documents.accessBanner.guestSubline")}
              </p>
            </div>
          </div>

          {total > 0 ? (
            <div className="mt-4 sm:pl-11">
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                <span>
                  {t("blog.documents.accessBanner.progressLabel", {
                    visible: String(visible),
                    total: String(total),
                  })}
                </span>
                <span className="font-mono">{progressPct}%</span>
              </div>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full border-2 border-border bg-background"
                role="progressbar"
                aria-valuenow={visible}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={t("blog.documents.accessBanner.progressLabel", {
                  visible: String(visible),
                  total: String(total),
                })}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <Link
          href="/pricing"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground",
            "hover:brightness-95 sm:self-center",
          )}
        >
          {t("blog.documents.accessBanner.guestCta")}
        </Link>
      </div>

      {breakdown.length > 0 ? (
        <div className="mt-5 border-t-2 border-primary/15 pt-4 sm:pl-11">
          <div className="flex flex-wrap gap-2">
            {breakdown.map((row) => {
              const locked = row.member_count - row.guest_visible_count;
              return (
                <span
                  key={row.category}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-medium"
                  title={t("blog.documents.accessBanner.categoryMore", { locked: String(locked) })}
                >
                  <span className="text-muted-foreground">{blogCategoryLabel(t, row.category)}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {t("blog.documents.accessBanner.categoryLine", {
                      visible: String(row.guest_visible_count),
                      total: String(row.member_count),
                    })}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
