"use client";

import { localizedBullets, localizedRiskNote, type DiscordTimelineItemContract } from "@/lib/contracts";
import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

function formatTime(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function KolTimelineCard({
  item,
  onAuthorClick,
}: {
  item: DiscordTimelineItemContract;
  onAuthorClick?: (author: string) => void;
}) {
  const { locale, t } = useI18n();
  const label = item.display_name || item.author || t("twitterKol.unknownSource");
  const bullets = localizedBullets(item, locale);
  const riskNote = localizedRiskNote(item, locale);

  return (
    <article className="flex gap-3 rounded-xl border border-glass-border bg-panel/80 p-4">
      <button
        type="button"
        onClick={() => item.author && onAuthorClick?.(item.author)}
        className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-glass-border"
      >
        {item.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.avatar_url} alt={label} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-panel2 text-[10px] font-semibold text-gold">
            {initials(label)}
          </span>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => item.author && onAuthorClick?.(item.author)}
            className="text-[12px] font-medium text-gold hover:underline"
          >
            {label}
          </button>
          <time className="font-mono text-[10px] text-muted">{formatTime(item.created_at_utc, locale)}</time>
        </div>
        {item.title && item.title !== label ? (
          <h2 className="mt-1.5 text-[14px] font-medium text-foreground">{item.title}</h2>
        ) : null}
        <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-muted-foreground">
          {item.body}
        </p>
        {bullets.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-4 text-[12px] text-muted-foreground">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
        {riskNote ? (
          <p className="mt-2 text-[11px] text-muted">{riskNote}</p>
        ) : null}
        {item.tickers.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tickers.slice(0, 8).map((sym) => (
              <span
                key={`${item.id}-${sym}`}
                className="rounded border border-glass-border px-2 py-0.5 font-mono text-[10px] text-muted"
              >
                {sym}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
