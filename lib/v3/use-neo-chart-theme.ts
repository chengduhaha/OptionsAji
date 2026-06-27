"use client";

import { useEffect, useState } from "react";

export type NeoChartTheme = {
  ink: string;
  cream: string;
  peach: string;
  lavender: string;
  gridOpacity: number;
};

const LIGHT: NeoChartTheme = {
  ink: "#151617",
  cream: "#F5F2F0",
  peach: "#FFBE98",
  lavender: "#A799F0",
  gridOpacity: 0.12,
};

const DARK: NeoChartTheme = {
  ink: "#F5F2F0",
  cream: "#222326",
  peach: "#FFBE98",
  lavender: "#A799F0",
  gridOpacity: 0.18,
};

function readDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function useNeoChartTheme(): NeoChartTheme {
  const [isDark, setIsDark] = useState(readDark);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark ? DARK : LIGHT;
}
