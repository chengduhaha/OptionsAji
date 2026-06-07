/** 客观市场状态分类（对标 Risk-On / Risk-Off / Range-Bound，非方向性交易建议） */

import { resolveDictionaryValue } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";

export type MvpMarketRegimeCode =
  | "risk_off"
  | "elevated_vol"
  | "risk_on"
  | "range_bound"
  | "transitional";

export const MVP_REGIME_CODES: MvpMarketRegimeCode[] = [
  "risk_off",
  "elevated_vol",
  "risk_on",
  "range_bound",
  "transitional",
];

export type MvpRegimeMeta = {
  label: string;
  english: string;
  tone: string;
  summaryFallback: string;
};

const REGIME_META_ZH: Record<MvpMarketRegimeCode, MvpRegimeMeta> = {
  risk_off: {
    label: "避险环境",
    english: "Risk-Off",
    tone: "text-red",
    summaryFallback:
      "跨资产数据显示避险偏好抬升（Risk-Off），指数承压或波动率快速上行；期权侧宜先评估敞口与对冲。",
  },
  elevated_vol: {
    label: "高波动环境",
    english: "High Vol",
    tone: "text-gold",
    summaryFallback:
      "波动率处于偏高区间，方向信号不一致；期权溢价、Gamma 与对冲成本对定价影响更大。",
  },
  risk_on: {
    label: "风险偏好",
    english: "Risk-On",
    tone: "text-green",
    summaryFallback:
      "风险偏好处于偏积极区间（Risk-On），指数相对稳健且波动率未明显失控；宜观察结构而非预设方向。",
  },
  range_bound: {
    label: "中性震荡",
    english: "Range-Bound",
    tone: "text-blue",
    summaryFallback:
      "指数与情绪指标波动有限，盘面呈区间震荡；突破方向需等待量价与波动率共同确认。",
  },
  transitional: {
    label: "过渡观察",
    english: "Transitional",
    tone: "text-gold",
    summaryFallback:
      "指数、波动率与情绪指标存在分歧，处于过渡阶段；宜降低假设、等待更多交叉验证。",
  },
};

const REGIME_META_EN: Record<MvpMarketRegimeCode, MvpRegimeMeta> = {
  risk_off: {
    label: "Risk-off",
    english: "Risk-Off",
    tone: "text-red",
    summaryFallback:
      "Cross-asset data shows rising risk aversion (Risk-Off); indices are pressured or volatility is rising quickly. Review exposure and hedges before directional bets.",
  },
  elevated_vol: {
    label: "High volatility",
    english: "High Vol",
    tone: "text-gold",
    summaryFallback:
      "Volatility is elevated and directional signals are mixed; option premium, gamma, and hedging costs matter more for pricing.",
  },
  risk_on: {
    label: "Risk-on",
    english: "Risk-On",
    tone: "text-green",
    summaryFallback:
      "Risk appetite is constructive (Risk-On); indices are relatively stable and volatility is not spiking. Focus on structure rather than assuming direction.",
  },
  range_bound: {
    label: "Range-bound",
    english: "Range-Bound",
    tone: "text-blue",
    summaryFallback:
      "Indices and sentiment are moving within a narrow band; wait for price/volume and volatility to confirm a breakout.",
  },
  transitional: {
    label: "Transitional",
    english: "Transitional",
    tone: "text-gold",
    summaryFallback:
      "Indices, volatility, and sentiment disagree—market is in transition. Lower conviction and wait for more cross-checks.",
  },
};

const LEGACY_LABEL_TO_CODE: Record<string, MvpMarketRegimeCode> = {
  风险优先: "risk_off",
  顺势进攻: "risk_on",
  等待确认: "transitional",
};

export function normalizeRegimeCode(
  code: string | undefined | null,
  label?: string | null,
): MvpMarketRegimeCode | null {
  const c = (code ?? "").trim();
  if (MVP_REGIME_CODES.includes(c as MvpMarketRegimeCode)) {
    return c as MvpMarketRegimeCode;
  }
  const legacy = LEGACY_LABEL_TO_CODE[(label ?? "").trim()];
  return legacy ?? null;
}

export function regimeMeta(code: MvpMarketRegimeCode, locale: Locale = "zh"): MvpRegimeMeta {
  return locale === "en" ? REGIME_META_EN[code] : REGIME_META_ZH[code];
}

function regimeReasoning(
  code: MvpMarketRegimeCode,
  triggers: string[],
  locale: Locale,
): string {
  const prefix =
    resolveDictionaryValue(locale, `mvp.regime.reasoning.${code}`) ??
    resolveDictionaryValue("zh", `mvp.regime.reasoning.${code}`) ??
    "";
  if (!prefix) return triggers.join(locale === "en" ? ", " : "、");
  return triggers.length > 0 ? `${prefix}${triggers.join(locale === "en" ? ", " : "、")}。` : prefix;
}

export function classifyRegimeFromMetrics(
  args: {
    avgIndex: number;
    vix: number | null;
    vixChange: number | null;
    vixBand: string;
    signalScore: number;
  },
  locale: Locale = "zh",
): {
  code: MvpMarketRegimeCode;
  label: string;
  summary: string;
  reasoning: string;
} {
  const { avgIndex, vix, vixChange, vixBand, signalScore } = args;
  const highVolBand =
    locale === "en"
      ? vixBand.toLowerCase().includes("high") || vixBand.toLowerCase().includes("extreme")
      : vixBand.includes("高波动") || vixBand.includes("极端");

  let code: MvpMarketRegimeCode;
  let reasoning: string;

  if (avgIndex <= -0.35 || (vixChange !== null && vixChange > 3) || signalScore <= -5) {
    code = "risk_off";
    const triggers: string[] = [];
    if (avgIndex <= -0.35) {
      triggers.push(
        resolveDictionaryValue(locale, "mvp.regime.trigger.weakIndex") ?? "指数均值偏弱",
      );
    }
    if (vixChange !== null && vixChange > 3) {
      triggers.push(
        resolveDictionaryValue(locale, "mvp.regime.trigger.vixSpike") ?? "VIX 日涨幅偏大",
      );
    }
    if (signalScore <= -5) {
      triggers.push(
        resolveDictionaryValue(locale, "mvp.regime.trigger.bearishSignals") ?? "综合信号偏空",
      );
    }
    reasoning = regimeReasoning(code, triggers, locale);
  } else if (
    (vix !== null && vix >= 22) ||
    (vix !== null && vix >= 18 && vixChange !== null && vixChange > 1.5) ||
    highVolBand
  ) {
    code = "elevated_vol";
    reasoning =
      resolveDictionaryValue(locale, "mvp.regime.reasoning.elevated_vol") ??
      "归类为高波动环境：VIX 水平或日变化偏高，方向信号未一致。";
  } else if (avgIndex >= 0.35 && (vixChange === null || vixChange < 2) && signalScore >= 0) {
    code = "risk_on";
    reasoning =
      resolveDictionaryValue(locale, "mvp.regime.reasoning.risk_on") ??
      "归类为风险偏好（Risk-On）：指数偏强、VIX 未急升、信号非偏空。";
  } else if (
    Math.abs(avgIndex) < 0.2 &&
    Math.abs(signalScore) <= 2 &&
    (vixChange === null || Math.abs(vixChange) < 1.5)
  ) {
    code = "range_bound";
    reasoning =
      resolveDictionaryValue(locale, "mvp.regime.reasoning.range_bound") ??
      "归类为中性震荡：指数与信号波动有限、VIX 变化温和。";
  } else {
    code = "transitional";
    reasoning =
      resolveDictionaryValue(locale, "mvp.regime.reasoning.transitional") ??
      "归类为过渡观察：指标之间存在分歧，暂无单一主导环境。";
  }

  const meta = regimeMeta(code, locale);
  return {
    code,
    label: meta.label,
    summary: meta.summaryFallback,
    reasoning,
  };
}
