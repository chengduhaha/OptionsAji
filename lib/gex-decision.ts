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
  regimeLabel: "正 Gamma" | "负 Gamma" | "Gamma 未明";
  structureBias: "震荡吸附" | "波动放大" | "等待确认";
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

export function buildGammaStructureRead(input: GammaStructureInput): GammaStructureRead {
  const spot = finite(input.spot);
  const netGex = finite(input.netGex);
  const gammaFlip = finite(input.gammaFlip);
  const callWall = finite(input.callWall);
  const putWall = finite(input.putWall);
  const maxPain = finite(input.maxPain);
  const regime = (input.regime || "").toLowerCase();

  const isPositive =
    netGex !== null ? netGex >= 0 : regime.includes("positive") || regime.includes("正");
  const hasRegime = netGex !== null || regime.includes("gamma") || regime.includes("正") || regime.includes("负");
  const regimeLabel = hasRegime ? (isPositive ? "正 Gamma" : "负 Gamma") : "Gamma 未明";

  const flipPct = distancePct(spot, gammaFlip);
  const callWallPct = distancePct(spot, callWall);
  const putWallPct = distancePct(spot, putWall);
  const maxPainPct = distancePct(spot, maxPain);

  const belowFlip = spot !== null && gammaFlip !== null && spot < gammaFlip;
  const structureBias = !hasRegime
    ? "等待确认"
    : !isPositive || belowFlip
      ? "波动放大"
      : "震荡吸附";
  const tone =
    structureBias === "震荡吸附" ? "green" : structureBias === "波动放大" ? "red" : "muted";

  const pieces: string[] = [];
  if (netGex !== null) {
    pieces.push(`Net GEX ${netGex >= 0 ? "+" : ""}${netGex.toFixed(2)}B`);
  }
  if (gammaFlip !== null) {
    pieces.push(`Gamma Flip ${gammaFlip.toFixed(2)}（距现价 ${fmtPct(flipPct)}）`);
  }
  if (callWall !== null) {
    pieces.push(`Call Wall ${callWall.toFixed(2)}（距现价 ${fmtPct(callWallPct)}）`);
  }
  if (putWall !== null) {
    pieces.push(`Put Wall ${putWall.toFixed(2)}（距现价 ${fmtPct(putWallPct)}）`);
  }

  let summary = `${input.symbol} 当前处于${regimeLabel}，结构偏${structureBias}。`;
  if (pieces.length) summary += ` ${pieces.join("；")}。`;
  if (absClose(callWallPct)) summary += " 现价接近 Call Wall，追多 Call 的盈亏比会下降。";
  if (absClose(putWallPct)) summary += " 现价接近 Put Wall，下方支撑/破位确认更关键。";
  if (belowFlip) summary += " 现价低于 Gamma Flip，波动放大风险高于均值回归环境。";

  const actions: string[] = [];
  if (structureBias === "震荡吸附") {
    actions.push("正股：更适合等回踩或突破确认，不在墙位附近追价。");
    actions.push(
      absClose(callWallPct)
        ? "Call：靠近 Call Wall 时不追高，优先等待回踩后再比较权利金效率。"
        : "Call：优先找靠近支撑后的确认，避免把正 Gamma 震荡误判成单边趋势。",
    );
    actions.push("Put：只有跌破 Gamma Flip 或 Put Wall 失守后，才把看空场景升级。");
  } else if (structureBias === "波动放大") {
    actions.push("正股：先降低仓位，等待 15 分钟级别方向确认。");
    actions.push("Call：除非重新站回 Gamma Flip，否则不把反抽当成趋势恢复。");
    actions.push("Put：跌破 Gamma Flip 后才考虑看空表达，同时控制 IV 抬升后的权利金成本。");
  } else {
    actions.push("正股：Gamma 数据不足时，只把价格、成交量和 IV 作为主要判断依据。");
    actions.push("期权：不输出墙位结论，只筛流动性、DTE 和价差。");
  }

  const risk =
    maxPain !== null
      ? `Max Pain ${maxPain.toFixed(2)} 距现价 ${fmtPct(maxPainPct)}，只作为到期吸附参考，不单独构成交易方向。`
      : "Max Pain 暂不可用；Gamma 结构只能作为辅助变量。";

  return {
    regimeLabel,
    structureBias,
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
