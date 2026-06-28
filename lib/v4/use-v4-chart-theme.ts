"use client";

import { useEffect, useState } from "react";

export type V4ChartTheme = {
  foreground: string;
  background: string;
  muted: string;
  border: string;
  primary: string;
  up: string;
  down: string;
  chart1: string;
  chart2: string;
  chart3: string;
  gridOpacity: number;
};

const FALLBACK_LIGHT: V4ChartTheme = {
  foreground: "oklch(0.18 0.01 60)",
  background: "oklch(0.98 0.006 90)",
  muted: "oklch(0.52 0.012 70)",
  border: "oklch(0.88 0.008 80)",
  primary: "oklch(0.48 0.16 270)",
  up: "oklch(0.58 0.15 150)",
  down: "oklch(0.58 0.21 25)",
  chart1: "oklch(0.48 0.16 270)",
  chart2: "oklch(0.58 0.15 150)",
  chart3: "oklch(0.58 0.21 25)",
  gridOpacity: 0.15,
};

const FALLBACK_DARK: V4ChartTheme = {
  foreground: "oklch(0.95 0.006 90)",
  background: "oklch(0.17 0.012 265)",
  muted: "oklch(0.68 0.012 265)",
  border: "oklch(1 0 0 / 12%)",
  primary: "oklch(0.66 0.16 270)",
  up: "oklch(0.7 0.16 150)",
  down: "oklch(0.68 0.2 25)",
  chart1: "oklch(0.66 0.16 270)",
  chart2: "oklch(0.7 0.16 150)",
  chart3: "oklch(0.68 0.2 25)",
  gridOpacity: 0.2,
};

function readCssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildTheme(isDark: boolean): V4ChartTheme {
  const fallback = isDark ? FALLBACK_DARK : FALLBACK_LIGHT;
  const pick = (name: string, fb: string) => readCssVar(name) || fb;

  return {
    foreground: pick("--foreground", fallback.foreground),
    background: pick("--background", fallback.background),
    muted: pick("--muted-foreground", fallback.muted),
    border: pick("--border", fallback.border),
    primary: pick("--primary", fallback.primary),
    up: pick("--up", fallback.up),
    down: pick("--down", fallback.down),
    chart1: pick("--chart-1", fallback.chart1),
    chart2: pick("--chart-2", fallback.chart2),
    chart3: pick("--chart-3", fallback.chart3),
    gridOpacity: isDark ? 0.2 : 0.15,
  };
}

function readDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function useV4ChartTheme(): V4ChartTheme {
  const [theme, setTheme] = useState<V4ChartTheme>(() => buildTheme(readDark()));

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(buildTheme(root.classList.contains("dark")));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return theme;
}
