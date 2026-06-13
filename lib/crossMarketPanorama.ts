import type { HotEvent } from "./crossMarketApi";

// --- View-model adapters (v0 UI shape) ---

/** A row in the probability time-series chart (percent 0–100). */
export type TimeSeriesRow = {
  date: string;
  options: number;
  polymarket: number;
  social: number;
  institutional: number;
};

export type StrategyLegRow = {
  leg: string;
  market: string;
  marketColor: string;
  action: string;
  actionColor: string;
  instrument: string;
  position: string;
  maxPL: string;
  plColor: string;
  risk: string;
};

export type ProbabilityPanoramaSource = {
  label: string;
  labelEn: string;
  probability: number;
  color: string;
  bgColor: string;
  borderColor: string;
  subLabel: string;
  detail: string;
  tooltip: string;
  rank: number;
};

export interface EventPanoramaViewModel {
  eventId: string;
  header: {
    badgeLabel: string;
    titleText: string;
    metaTicker?: string;
    eventTimeDisplay: string;
    settlementNote: string;
    countdownPrimary: string;
    countdownSub: string;
    showArbitragePill: boolean;
  };
  panorama: {
    sources: ProbabilityPanoramaSource[];
    aiConsensusPercent: number;
    disagreementPp: number;
    arbitrationHeadline: string;
    arbitrationDetail: string;
    arbitrationStrengthLabel: string;
  };
  narrative: {
    optionsPct: number;
    polymarketPct: number;
    socialPct: number;
    institutionalPct: number;
    estimatedLow: number;
    estimatedHigh: number;
    polyGapLow: number;
    polyGapHigh: number;
    histRallyPct: number;
    histDropPct: number;
    histChopPct: number;
    judgmentHint: string;
    strategyBullets: { num: string; color: string; label: string; desc: string }[];
  };
  timeSeries: TimeSeriesRow[];
  strategyLegs: StrategyLegRow[];
  strategySummary: {
    tagline: string;
    maxProfit: string;
    maxRisk: string;
    evAnnual: string;
  };
}

function pct01(x: number): number {
  return Math.round(Math.max(0, Math.min(1, x)) * 100);
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 1000;
}

/** Deterministic synthetic 14-point series ending at current probabilities (percent). */
export function buildSyntheticTimeSeries(
  eventId: string,
  end: { options: number; polymarket: number; social: number; institutional: number },
): TimeSeriesRow[] {
  const seed = hashSeed(eventId);
  const n = 14;
  const days: string[] = [];
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  for (let i = 0; i < n; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(
      `${d.getMonth() + 1}月${d.getDate()}日`,
    );
  }

  const targets = {
    options: pct01(end.options),
    polymarket: pct01(end.polymarket),
    social: pct01(end.social),
    institutional: pct01(end.institutional),
  };

  const ease = (t: number) => t * t * (3 - 2 * t);
  const noise = (i: number, k: keyof typeof targets) => {
    const u = ((seed + i * 17 + k.length * 31) % 17) - 8;
    return u * 0.35;
  };

  return days.map((date, i) => {
    const t = ease(i / (n - 1));
    const mix = (endVal: number, startVal: number) =>
      Math.max(0, Math.min(100, Math.round(startVal + (endVal - startVal) * t + noise(i, "options"))));

    const startBias = {
      options: targets.options + ((seed % 11) - 5),
      polymarket: targets.polymarket + (((seed * 2) % 9) - 4),
      social: targets.social + (((seed * 3) % 13) - 6),
      institutional: targets.institutional + (((seed * 5) % 11) - 5),
    };

    return {
      date,
      options: mix(targets.options, startBias.options),
      polymarket: mix(targets.polymarket, startBias.polymarket),
      social: mix(targets.social, startBias.social),
      institutional: mix(targets.institutional, startBias.institutional),
    };
  }).map((row, i) =>
    i === n - 1
      ? {
          date: row.date,
          options: targets.options,
          polymarket: targets.polymarket,
          social: targets.social,
          institutional: targets.institutional,
        }
      : row,
  );
}

export function adaptHotEventToPanorama(event: HotEvent): EventPanoramaViewModel {
  const poly = pct01(event.polymarket_probability);
  const consensusPct = poly;

  const sources: ProbabilityPanoramaSource[] = [
    {
      label: "Polymarket",
      labelEn: "Polymarket",
      probability: poly,
      color: "#D4AF37",
      bgColor: "rgba(212,175,55,0.12)",
      borderColor: "rgba(212,175,55,0.35)",
      subLabel: `YES 隐含 ${event.polymarket_probability.toFixed(2)}`,
      detail: event.volume_24h ? `24h 成交 ${Math.round(event.volume_24h).toLocaleString()}` : "成交量未披露",
      tooltip: `${event.title_zh} — Polymarket 当前 Yes 概率 ${poly}%`,
      rank: 1,
    },
  ];

  const typeLabel =
    event.event_type === "earnings"
      ? "财报"
      : event.event_type === "macro_release"
        ? "宏观"
        : event.event_type === "geopolitical"
          ? "地缘"
          : "美股主题";

  const eventTimeDisplay = event.event_time
    ? new Date(event.event_time).toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" })
    : "待定";

  let countdownPrimary = "—";
  let countdownSub = "结算时间";
  if (event.event_time) {
    const end = new Date(event.event_time).getTime();
    const now = Date.now();
    const ms = Math.max(0, end - now);
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    countdownPrimary = `${d}天 ${h}小时`;
    countdownSub = "距离事件窗口";
  }

  return {
    eventId: event.event_id,
    header: {
      badgeLabel: typeLabel,
      titleText: event.title_zh,
      metaTicker: event.related_ticker ?? undefined,
      eventTimeDisplay,
      settlementNote: "Polymarket Gamma API · 延迟约 15 分钟",
      countdownPrimary,
      countdownSub,
      showArbitragePill: false,
    },
    panorama: {
      sources,
      aiConsensusPercent: consensusPct,
      disagreementPp: 0,
      arbitrationHeadline: "PM 单源",
      arbitrationDetail: "仅展示预测市场隐含概率，不做跨源背离推断",
      arbitrationStrengthLabel: "INFO",
    },
    narrative: {
      optionsPct: poly,
      polymarketPct: poly,
      socialPct: poly,
      institutionalPct: poly,
      estimatedLow: Math.max(0, poly - 5),
      estimatedHigh: Math.min(100, poly + 5),
      polyGapLow: 0,
      polyGapHigh: 0,
      histRallyPct: 33,
      histDropPct: 33,
      histChopPct: 34,
      judgmentHint: "本页仅展示 Polymarket 单源概率，请结合结算规则与流动性自行判断。",
      strategyBullets: [
        {
          num: "1",
          color: "#D4AF37",
          label: "预测市场",
          desc: `Polymarket Yes 隐含 ${poly}%${event.related_ticker ? `，关联标的 ${event.related_ticker}` : ""}`,
        },
      ],
    },
    timeSeries: buildSyntheticTimeSeries(event.event_id, {
      options: event.polymarket_probability,
      polymarket: event.polymarket_probability,
      social: event.polymarket_probability,
      institutional: event.polymarket_probability,
    }),
    strategyLegs: event.related_ticker
      ? [
          {
            leg: "参考",
            market: "美股",
            marketColor: "#4A8FD4",
            action: "研究",
            actionColor: "#3DBF7A",
            instrument: `${event.related_ticker} 个股深度`,
            position: "—",
            maxPL: "—",
            plColor: "#3DBF7A",
            risk: "非交易建议",
          },
        ]
      : [],
    strategySummary: {
      tagline: "Polymarket 热点 · 教育用途",
      maxProfit: "—",
      maxRisk: "事件与规则风险",
      evAnnual: "—",
    },
  };
}
