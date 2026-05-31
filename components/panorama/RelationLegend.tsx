"use client";

import { RELATION_META } from "./graph-utils";

const FILTERS = ["supplies_to", "manufactures_for", "invests_in", "competitor", "joint_development"];
const MOATS = ["exclusive", "dominant", "primary", "scarce", "normal"];

export function RelationLegend({
  relTypes,
  businessSegment,
  segmentOptions,
  moatTier,
  onToggleRelType,
  onBusinessSegment,
  onMoatTier,
}: {
  relTypes: string[];
  businessSegment: string;
  segmentOptions: Array<{ id: string; label: string }>;
  moatTier: string;
  onToggleRelType: (value: string) => void;
  onBusinessSegment: (value: string) => void;
  onMoatTier: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((rel) => {
        const meta = RELATION_META[rel];
        const active = relTypes.includes(rel);
        return (
          <button
            key={rel}
            type="button"
            onClick={() => onToggleRelType(rel)}
            className={`rounded-md border px-2 py-1 text-[11px] transition ${active ? meta.className : "border-white/10 bg-glass text-muted-foreground hover:text-foreground"}`}
          >
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: meta.color }} />
            {meta.label}
          </button>
        );
      })}
      <select
        value={businessSegment}
        onChange={(event) => onBusinessSegment(event.target.value)}
        className="h-7 rounded-md border border-white/10 bg-background px-2 text-[11px] text-muted-foreground outline-none focus:border-primary/50"
      >
        <option value="">全部业务分部</option>
        {segmentOptions.map((segment) => (
          <option key={segment.id} value={segment.id}>
            {segment.label}
          </option>
        ))}
      </select>
      <select
        value={moatTier}
        onChange={(event) => onMoatTier(event.target.value)}
        className="h-7 rounded-md border border-white/10 bg-background px-2 text-[11px] text-muted-foreground outline-none focus:border-primary/50"
      >
        <option value="">全部护城河</option>
        {MOATS.map((tier) => (
          <option key={tier} value={tier}>
            {tier}
          </option>
        ))}
      </select>
    </div>
  );
}
