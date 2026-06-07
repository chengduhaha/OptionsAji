"use client";

import type { DiscordKolHubItemContract } from "@/lib/contracts";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function KolAvatar({
  entry,
  selected,
  onToggle,
  onOpenDetail,
}: {
  entry: DiscordKolHubItemContract;
  selected: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
}) {
  const label = entry.display_name || entry.author;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          onOpenDetail();
        }}
        className={cn(
          "relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all",
          selected
            ? "border-gold ring-2 ring-gold/40 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
            : "border-glass-border hover:border-gold/40",
        )}
        title={label}
      >
        {entry.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.avatar_url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-panel text-[11px] font-semibold text-gold">
            {initials(label)}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onOpenDetail}
        className="max-w-[72px] truncate text-[10px] text-muted-foreground hover:text-gold"
      >
        {label}
      </button>
    </div>
  );
}

export default function KolAvatarStrip({
  entries,
  selectedAuthors,
  singleSelectMode,
  onToggleAuthor,
  onSelectAll,
  onToggleMode,
  onOpenDetail,
}: {
  entries: DiscordKolHubItemContract[];
  selectedAuthors: Set<string>;
  singleSelectMode: boolean;
  onToggleAuthor: (author: string) => void;
  onSelectAll: () => void;
  onToggleMode: () => void;
  onOpenDetail: (entry: DiscordKolHubItemContract) => void;
}) {
  const allSelected = selectedAuthors.size === 0;

  return (
    <section className="glass rounded-xl border border-glass-border p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">按大牛筛选</p>
        <button
          type="button"
          onClick={onToggleMode}
          className="rounded-md border border-glass-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-gold"
        >
          {singleSelectMode ? "单选模式" : "多选模式"}
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onSelectAll}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border-2 text-[11px] font-medium transition-all",
              allSelected
                ? "border-gold bg-gold/15 text-gold ring-2 ring-gold/40"
                : "border-glass-border text-muted-foreground hover:border-gold/40",
            )}
          >
            全部
          </button>
          <span className="text-[10px] text-muted">全部</span>
        </div>
        {entries.map((entry) => (
          <KolAvatar
            key={entry.author}
            entry={entry}
            selected={selectedAuthors.has(entry.author)}
            onToggle={() => onToggleAuthor(entry.author)}
            onOpenDetail={() => onOpenDetail(entry)}
          />
        ))}
      </div>
    </section>
  );
}
