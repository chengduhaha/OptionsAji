// Shared recharts styling so every chart reads as one polished system.
// Tooltips/axes adapt to the active theme via CSS variables resolved at render.

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Light, elevated tooltip — never a dark popover on a light page. */
export function tooltipStyle(): React.CSSProperties {
  return {
    background: cssVar("--color-card", "#ffffff"),
    border: `1px solid ${cssVar("--color-border", "rgba(15,23,42,0.1)")}`,
    borderRadius: 10,
    boxShadow: cssVar("--shadow-card", "0 1px 3px rgba(15,23,42,0.08)"),
    fontSize: 12,
    color: cssVar("--color-foreground", "#0f172a"),
    padding: "8px 10px",
  };
}

export const CHART = {
  // Brand + semantic line colors (work on light and dark)
  primary: "#c8881a",
  blue: "#2563eb",
  green: "#059669",
  red: "#dc2626",
  axisTick: { fill: "#94a3b8", fontSize: 10 } as const,
  // recharts grids are off by default in our system; expose a faint one if needed
  gridStroke: "rgba(100,116,139,0.15)",
  strokeWidth: 2,
};
