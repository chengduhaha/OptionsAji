"use client";

export function DepthSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex min-w-[180px] items-center gap-3 rounded-lg border border-white/10 bg-glass px-3 py-2">
      <span className="text-[12px] text-muted-foreground">跳数</span>
      <input
        type="range"
        min={1}
        max={4}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1 flex-1 accent-gold"
      />
      <span className="w-5 text-right font-mono text-[12px] text-primary">{value}</span>
    </label>
  );
}

