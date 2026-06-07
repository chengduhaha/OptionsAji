import { resolveDictionaryValue, formatMessage } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";

export type GammaStructureBiasCode = "mean_reversion" | "volatility_expansion" | "pending";

export type GammaStructureInput = {
  symbol: string;
  spot: number | null;
  netGex?: number | null;
  gammaFlip?: number | null;
  callWall?: number | null;
  putWall?: number | null;
  maxPain?: number | null;
  regime?: string | null;
};

export type GammaStructureRead = {
  regimeLabel: string;
  structureBias: string;
  structureBiasCode: GammaStructureBiasCode;
  tone: "green" | "red" | "gold" | "muted";
  summary: string;
  actions: string[];
  risk: string;
  distances: {
    flipPct: number | null;
    callWallPct: number | null;
    putWallPct: number | null;
    maxPainPct: number | null;
  };
};

function finite(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function distancePct(spot: number | null, level: number | null | undefined): number | null {
  const s = finite(spot);
  const l = finite(level);
  if (s === null || l === null || s <= 0) return null;
  return ((l - s) / s) * 100;
}

function absClose(pct: number | null, threshold = 1.5): boolean {
  return pct !== null && Math.abs(pct) <= threshold;
}

function fmtPct(value: number | null): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function t(locale: Locale, key: string, fallback: string): string {
  return resolveDictionaryValue(locale, key) ?? fallback;
}

export function selectGammaStructureSpot(input: {
  overviewSpot: number | null | undefined;
  gexSpot: number | null | undefined;
}): number | null {
  const overviewSpot = finite(input.overviewSpot);
  const gexSpot = finite(input.gexSpot);
  if (overviewSpot === null) return gexSpot;
  if (gexSpot === null) return overviewSpot;
  const divergencePct = Math.abs((gexSpot - overviewSpot) / overviewSpot) * 100;
  return divergencePct > 5 ? overviewSpot : gexSpot;
}

export function buildGammaStructureRead(
  input: GammaStructureInput,
  locale: Locale = "zh",
): GammaStructureRead {
  const spot = finite(input.spot);
  const netGex = finite(input.netGex);
  const gammaFlip = finite(input.gammaFlip);
  const callWall = finite(input.callWall);
  const putWall = finite(input.putWall);
  const maxPain = finite(input.maxPain);
  const regime = (input.regime || "").toLowerCase();

  const isPositive =
    netGex !== null ? netGex >= 0 : regime.includes("positive") || regime.includes("正");
  const hasRegime =
    netGex !== null || regime.includes("gamma") || regime.includes("正") || regime.includes("负");

  const regimeLabel = hasRegime
    ? isPositive
      ? t(locale, "mvp.gamma.regime.positive", "正 Gamma")
      : t(locale, "mvp.gamma.regime.negative", "负 Gamma")
    : t(locale, "mvp.gamma.regime.unknown", "Gamma 未明");

  const flipPct = distancePct(spot, gammaFlip);
  const callWallPct = distancePct(spot, callWall);
  const putWallPct = distancePct(spot, putWall);
  const maxPainPct = distancePct(spot, maxPain);

  const belowFlip = spot !== null && gammaFlip !== null && spot < gammaFlip;
  let structureBiasCode: GammaStructureBiasCode;
  if (!hasRegime) {
    structureBiasCode = "pending";
  } else if (!isPositive || belowFlip) {
    structureBiasCode = "volatility_expansion";
  } else {
    structureBiasCode = "mean_reversion";
  }

  const structureBias = t(
    locale,
    `mvp.gamma.bias.${structureBiasCode}`,
    structureBiasCode === "mean_reversion"
      ? "震荡吸附"
      : structureBiasCode === "volatility_expansion"
        ? "波动放大"
        : "等待确认",
  );

  const tone =
    structureBiasCode === "mean_reversion"
      ? "green"
      : structureBiasCode === "volatility_expansion"
        ? "red"
        : "muted";

  const spotDistLabel = t(locale, "mvp.gamma.spotDistance", "距现价");
  const pieces: string[] = [];
  if (netGex !== null) {
    pieces.push(`Net GEX ${netGex >= 0 ? "+" : ""}${netGex.toFixed(2)}B`);
  }
  if (gammaFlip !== null) {
    pieces.push(
      `Gamma Flip ${gammaFlip.toFixed(2)}（${spotDistLabel} ${fmtPct(flipPct)}）`,
    );
  }
  if (callWall !== null) {
    pieces.push(`Call Wall ${callWall.toFixed(2)}（${spotDistLabel} ${fmtPct(callWallPct)}）`);
  }
  if (putWall !== null) {
    pieces.push(`Put Wall ${putWall.toFixed(2)}（${spotDistLabel} ${fmtPct(putWallPct)}）`);
  }

  let summary = formatMessage(
    t(locale, "mvp.gamma.summary", "{symbol} 当前处于{regime}，结构偏{bias}。"),
    { symbol: input.symbol, regime: regimeLabel, bias: structureBias },
  );
  if (pieces.length) summary += ` ${pieces.join(locale === "en" ? "; " : "；")}。`;
  if (absClose(callWallPct)) {
    summary += ` ${t(locale, "mvp.gamma.nearCallWall", "现价接近 Call Wall，追多 Call 的盈亏比会下降。")}`;
  }
  if (absClose(putWallPct)) {
    summary += ` ${t(locale, "mvp.gamma.nearPutWall", "现价接近 Put Wall，下方支撑/破位确认更关键。")}`;
  }
  if (belowFlip) {
    summary += ` ${t(locale, "mvp.gamma.belowFlip", "现价低于 Gamma Flip，波动放大风险高于均值回归环境。")}`;
  }

  const actions: string[] = [];
  if (structureBiasCode === "mean_reversion") {
    actions.push(t(locale, "mvp.gamma.action.meanStock", "正股：更适合等回踩或突破确认，不在墙位附近追价。"));
    actions.push(
      absClose(callWallPct)
        ? t(
            locale,
            "mvp.gamma.action.meanCallNearWall",
            "Call：靠近 Call Wall 时不追高，优先等待回踩后再比较权利金效率。",
          )
        : t(
            locale,
            "mvp.gamma.action.meanCall",
            "Call：优先找靠近支撑后的确认，避免把正 Gamma 震荡误判成单边趋势。",
          ),
    );
    actions.push(
      t(
        locale,
        "mvp.gamma.action.meanPut",
        "Put：只有跌破 Gamma Flip 或 Put Wall 失守后，才把看空场景升级。",
      ),
    );
  } else if (structureBiasCode === "volatility_expansion") {
    actions.push(t(locale, "mvp.gamma.action.volStock", "正股：先降低仓位，等待 15 分钟级别方向确认。"));
    actions.push(
      t(locale, "mvp.gamma.action.volCall", "Call：除非重新站回 Gamma Flip，否则不把反抽当成趋势恢复。"),
    );
    actions.push(
      t(
        locale,
        "mvp.gamma.action.volPut",
        "Put：跌破 Gamma Flip 后才考虑看空表达，同时控制 IV 抬升后的权利金成本。",
      ),
    );
  } else {
    actions.push(
      t(
        locale,
        "mvp.gamma.action.pendingStock",
        "正股：Gamma 数据不足时，只把价格、成交量和 IV 作为主要判断依据。",
      ),
    );
    actions.push(
      t(locale, "mvp.gamma.action.pendingOptions", "期权：不输出墙位结论，只筛流动性、DTE 和价差。"),
    );
  }

  const risk = maxPain !== null
    ? formatMessage(
        t(
          locale,
          "mvp.gamma.risk.maxPain",
          "Max Pain {maxPain} 距现价 {pct}，只作为到期吸附参考，不单独构成交易方向。",
        ),
        { maxPain: maxPain.toFixed(2), pct: fmtPct(maxPainPct) },
      )
    : t(locale, "mvp.gamma.risk.unavailable", "Max Pain 暂不可用；Gamma 结构只能作为辅助变量。");

  return {
    regimeLabel,
    structureBias,
    structureBiasCode,
    tone,
    summary,
    actions,
    risk,
    distances: {
      flipPct,
      callWallPct,
      putWallPct,
      maxPainPct,
    },
  };
}

export function isVolatilityExpansion(biasCode: GammaStructureBiasCode): boolean {
  return biasCode === "volatility_expansion";
}

export function isMeanReversion(biasCode: GammaStructureBiasCode): boolean {
  return biasCode === "mean_reversion";
}
