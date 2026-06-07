"use client";

import { X, ExternalLink } from "lucide-react";
import type { DiscordKolHubItemContract } from "@/lib/contracts";

function formatTime(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
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

export default function KolDetailDrawer({
  entry,
  onClose,
}: {
  entry: DiscordKolHubItemContract | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  const label = entry.display_name || entry.author;
  const handle = entry.twitter_handle?.replace(/^@/, "");
  const xUrl = handle ? `https://x.com/${handle}` : null;

  return (
    <>
      <button
        type="button"
        aria-label="关闭"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-glass-border bg-panel shadow-2xl md:bottom-auto">
        <div className="flex items-center justify-between border-b border-glass-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">博主详情</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-glass hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gold/40">
              {entry.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.avatar_url} alt={label} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-panel2 text-lg font-semibold text-gold">
                  {initials(label)}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{label}</h3>
            {handle ? (
              <p className="mt-1 font-mono text-[12px] text-muted-foreground">@{handle}</p>
            ) : null}
            {xUrl ? (
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[12px] text-gold hover:underline"
              >
                在 X 上查看
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>

          {entry.bio_zh ? (
            <p className="mt-5 text-[13px] leading-6 text-muted-foreground">{entry.bio_zh}</p>
          ) : (
            <p className="mt-5 text-[13px] text-muted">暂无简介</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-glass-border bg-glass px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted">消息数</p>
              <p className="mt-1 font-mono text-lg text-foreground">{entry.message_count}</p>
            </div>
            <div className="rounded-lg border border-glass-border bg-glass px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted">最近活跃</p>
              <p className="mt-1 font-mono text-[11px] text-foreground">
                {formatTime(entry.last_seen_utc)}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
