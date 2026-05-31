"use client";

import { CalendarClock } from "lucide-react";

export function TimelineReplay({
  dates,
  value,
  onChange,
}: {
  dates: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedIndex = value ? Math.max(0, dates.indexOf(value)) : Math.max(0, dates.length - 1);
  const disabled = dates.length === 0;
  return (
    <div className="flex min-w-[250px] items-center gap-2 rounded-lg border border-white/10 bg-glass px-3 py-2">
      <CalendarClock className="h-3.5 w-3.5 text-primary" />
      <span className="text-[12px] text-muted-foreground">回放</span>
      <input
        type="range"
        min={0}
        max={Math.max(0, dates.length - 1)}
        value={selectedIndex}
        disabled={disabled}
        onChange={(event) => onChange(dates[Number(event.target.value)] || "")}
        className="h-1 flex-1 accent-gold disabled:opacity-40"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("")}
        className="min-w-[86px] rounded border border-white/10 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        {value || dates[dates.length - 1] || "无日期"}
      </button>
    </div>
  );
}
