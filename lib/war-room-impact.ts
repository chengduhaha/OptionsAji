/** War-room event impact scope — aligned with backend MVP war-room LLM schema. */

import { resolveDictionaryValue } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";

export type WarRoomImpact = "利好" | "利空" | "中性" | "风险";

export type WarRoomImpactScope =
  | "equity_broad"
  | "oil_energy"
  | "rates_bonds"
  | "single_stock"
  | "macro_geo"
  | "mixed";

const IMPACT_VALUES = new Set<WarRoomImpact>(["利好", "利空", "中性", "风险"]);

const SCOPE_ALIASES: Record<string, WarRoomImpactScope> = {
  equity: "equity_broad",
  broad: "equity_broad",
  index: "equity_broad",
  oil: "oil_energy",
  energy: "oil_energy",
  crude: "oil_energy",
  rates: "rates_bonds",
  bond: "rates_bonds",
  bonds: "rates_bonds",
  treasury: "rates_bonds",
  stock: "single_stock",
  macro: "macro_geo",
  geopolitical: "macro_geo",
  geo: "macro_geo",
  divergent: "mixed",
  multi: "mixed",
};

const SCOPE_LABELS_ZH: Record<WarRoomImpactScope, string> = {
  equity_broad: "美股大盘",
  oil_energy: "原油/能源",
  rates_bonds: "利率/国债",
  single_stock: "个股",
  macro_geo: "宏观/地缘",
  mixed: "多资产分化",
};

const SCOPE_LABELS_EN: Record<WarRoomImpactScope, string> = {
  equity_broad: "US equities",
  oil_energy: "Oil / energy",
  rates_bonds: "Rates / bonds",
  single_stock: "Single stock",
  macro_geo: "Macro / geopolitics",
  mixed: "Multi-asset divergence",
};

const IMPACT_LABELS_EN: Record<WarRoomImpact, string> = {
  利好: "Bullish",
  利空: "Bearish",
  中性: "Neutral",
  风险: "Risk",
};

export function normalizeWarRoomImpact(raw: string): WarRoomImpact {
  const t = raw.trim();
  if (IMPACT_VALUES.has(t as WarRoomImpact)) return t as WarRoomImpact;
  const lower = t.toLowerCase();
  if (lower.includes("bull") || t.includes("利好")) return "利好";
  if (lower.includes("bear") || t.includes("利空")) return "利空";
  if (lower.includes("risk") || t.includes("风险")) return "风险";
  return "中性";
}

export function normalizeWarRoomImpactScope(raw: string): WarRoomImpactScope {
  const key = raw.trim().toLowerCase();
  const mapped = SCOPE_ALIASES[key] ?? (key as WarRoomImpactScope);
  if (mapped in SCOPE_LABELS_ZH) return mapped;
  return "equity_broad";
}

export function warRoomImpactScopeLabel(scope: WarRoomImpactScope, locale: Locale = "zh"): string {
  const labels = locale === "en" ? SCOPE_LABELS_EN : SCOPE_LABELS_ZH;
  return labels[scope];
}

export function warRoomImpactDisplayLabel(impact: WarRoomImpact, locale: Locale = "zh"): string {
  if (locale === "en") return IMPACT_LABELS_EN[impact];
  return impact;
}

/** Card pill: impact + scope, e.g. "利好 · 美股大盘" */
export function formatWarRoomImpactLabel(
  impact: WarRoomImpact,
  scope: WarRoomImpactScope,
  locale: Locale = "zh",
): string {
  const impactLabel = warRoomImpactDisplayLabel(impact, locale);
  const scopeLabel = warRoomImpactScopeLabel(scope, locale);
  if (scope === "equity_broad") return `${impactLabel} · ${scopeLabel}`;
  return `${impactLabel} · ${scopeLabel}`;
}

export function impactIsBullish(impact: WarRoomImpact): boolean {
  return impact === "利好";
}

export function impactIsBearishOrRisk(impact: WarRoomImpact): boolean {
  return impact === "利空" || impact === "风险";
}

export function mergeRelatedAssets(
  relatedAssets: unknown,
  tickers: unknown,
  max = 4,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const source of [relatedAssets, tickers]) {
    if (!Array.isArray(source)) continue;
    for (const item of source) {
      const sym = String(item).trim().toUpperCase();
      if (!sym || seen.has(sym)) continue;
      seen.add(sym);
      out.push(sym);
      if (out.length >= max) return out;
    }
  }
  return out;
}

export function localizedImpactScopeFallback(locale: Locale): string {
  return (
    resolveDictionaryValue(locale, "mvp.impact.scope.equityBroad") ??
    warRoomImpactScopeLabel("equity_broad", locale)
  );
}
