import { buildPageMetadata } from "./metadata";

/**
 * Search-engine-friendly title/description for each `/options/*` board.
 *
 * Copy targets both Chinese (primary audience) and key English terms that
 * Chinese US-options traders actually search for (e.g. "GEX", "Gamma
 * Exposure", "IV Rank", "unusual options flow"). Keep titles ≤ ~60 chars
 * and descriptions ≤ ~160 chars so Google snippets render cleanly.
 */
export type BoardSeo = {
  /** Board slug matching the route segment under `/options/`. */
  slug: string;
  title: string;
  description: string;
  /** Keywords blended into the page `<meta name="keywords">` and copy. */
  keywords: string[];
};

export const BOARD_SEO: Record<string, BoardSeo> = {
  unusual: {
    slug: "unusual",
    title: "美股期权异动合约榜 — 成交量异动监控 | OptionsAji",
    description:
      "实时监控美股期权异动合约：成交量/未平仓比、大单扫单、看涨看跌方向。捕捉当日大举建仓与知情交易信号，覆盖 SPY、QQQ 及热门个股。",
    keywords: ["期权异动", "unusual options", "异动合约", "扫单", "Vol/OI", "美股期权"],
  },
  volume: {
    slug: "volume",
    title: "美股期权成交量榜 — 当日最活跃合约 | OptionsAji",
    description:
      "美股期权当日成交最活跃的合约排行榜，按 call/put 成交量统计，覆盖 SPY、QQQ、AAPL、NVDA、TSLA 等热门标的，辅助把握市场焦点。",
    keywords: ["期权成交量", "options volume", "活跃合约", "美股期权", "当日成交"],
  },
  "open-interest": {
    slug: "open-interest",
    title: "美股期权持仓榜 — 未平仓合约排行 | OptionsAji",
    description:
      "美股期权未平仓合约（Open Interest）排行，定位主力仓位堆积的 strike 与到期日，识别支撑/阻力墙与做市商对冲区间。",
    keywords: ["期权持仓", "open interest", "未平仓", "OI", "主力仓位", "美股期权"],
  },
  turnover: {
    slug: "turnover",
    title: "美股期权权利金流动榜 — 真金白银流入合约 | OptionsAji",
    description:
      "按权利金成交额排序的期权榜单，揭示资金真实流入的合约与方向，比单纯成交量更能反映机构仓位布局。",
    keywords: ["权利金", "premium turnover", "期权资金流", "成交额", "美股期权"],
  },
  "high-iv": {
    slug: "high-iv",
    title: "高 IV Rank 期权榜 — 卖方策略候选 | OptionsAji",
    description:
      "IV Rank 最高的美股期权榜单，定位隐含波动率处于历史高位的标的，为卖方策略（卖出看跌、信用价差、Iron Condor）提供候选。",
    keywords: ["IV Rank", "隐含波动率", "波动率排名", "卖方策略", "期权", "美股"],
  },
  "high-gamma": {
    slug: "high-gamma",
    title: "高 Gamma 期权榜 — Delta 变化最敏感合约 | OptionsAji",
    description:
      "Gamma 最高的期权合约排行，定位 Delta 随标的价格变化最快的合约，临近行权价的高 Gamma 合约最易出现剧烈对冲与波动放大。",
    keywords: ["Gamma", "高 Gamma", "期权希腊值", "Delta", "美股期权"],
  },
  "near-atm-gamma": {
    slug: "near-atm-gamma",
    title: "近 ATM 高 Gamma 期权榜 — 做市商对冲热点 | OptionsAji",
    description:
      "贴近平值（ATM）且 Gamma 最高的期权合约，做市商对冲最活跃的 strike 区间，常是日内波动放大与 Gamma Flip 的关键价位。",
    keywords: ["ATM", "近 ATM", "Gamma", "做市商对冲", "期权", "美股"],
  },
  seller: {
    slug: "seller",
    title: "期权卖方收益榜 — 时间价值衰减机会 | OptionsAji",
    description:
      "按时间价值/Theta 收益排序的期权卖方机会榜，筛选 Theta 衰减最优、风险收益比合理的合约，辅助 Covered Call、Cash Secured Put 等策略。",
    keywords: ["期权卖方", "Theta", "时间价值", "Covered Call", "Cash Secured Put", "美股期权"],
  },
  liquidity: {
    slug: "liquidity",
    title: "期权流动性榜 — 买卖价差最小合约 | OptionsAji",
    description:
      "买卖价差（Bid-Ask Spread）最小、流动性最好的期权合约排行，进出成本最低，适合日内交易与中频策略。",
    keywords: ["期权流动性", "Bid-Ask", "价差", "流动性", "美股期权"],
  },
  sentiment: {
    slug: "sentiment",
    title: "美股期权情绪快览 — 全市场 Put/Call 比率 | OptionsAji",
    description:
      "全市场 Put/Call 成交量与持仓比率、多空情绪指数及热门合约看涨看跌对比，快速判断当日美股期权市场情绪方向。",
    keywords: ["Put/Call", "情绪指数", "期权情绪", "P/C Ratio", "美股期权", "多空"],
  },
  gex: {
    slug: "gex",
    title: "SPY QQQ Gamma Exposure GEX 分析 — 做市商对冲与 Gamma Flip | OptionsAji",
    description:
      "SPY、QQQ 等主要标的的 Gamma Exposure（GEX）分布、Net GEX、Call Wall / Put Wall 与 Gamma Flip 估算，揭示做市商对冲方向与关键支撑阻力。",
    keywords: ["GEX", "Gamma Exposure", "Gamma Flip", "Call Wall", "Put Wall", "做市商", "SPY", "QQQ"],
  },
};

/** Ordered list for sitemap/iteration use. */
export const BOARD_SEO_LIST: BoardSeo[] = [
  BOARD_SEO.unusual,
  BOARD_SEO.volume,
  BOARD_SEO["open-interest"],
  BOARD_SEO.turnover,
  BOARD_SEO["high-iv"],
  BOARD_SEO["high-gamma"],
  BOARD_SEO["near-atm-gamma"],
  BOARD_SEO.seller,
  BOARD_SEO.liquidity,
  BOARD_SEO.sentiment,
  BOARD_SEO.gex,
];

export function getBoardSeo(slug: string): BoardSeo | undefined {
  return BOARD_SEO[slug];
}

/**
 * Build a ready-to-export `Metadata` object for an `/options/<slug>` page.
 * Falls back to a generic options-page metadata if the slug is unknown so we
 * never silently render the stale root "Gamma Exposure" title.
 */
export function buildBoardMetadata(slug: string) {
  const seo = BOARD_SEO[slug];
  if (!seo) {
    return buildPageMetadata({
      title: "美股期权数据榜单 | OptionsAji",
      description:
        "OptionsAji 期权数据榜单：异动、成交量、持仓、GEX、波动率与情绪，覆盖 SPY、QQQ 及热门美股。",
      path: `/options/${slug}`,
    });
  }
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/options/${seo.slug}`,
    keywords: seo.keywords,
  });
}

