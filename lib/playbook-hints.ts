import { buildMvpAccessHeaders } from "@/lib/access-key";
import type { Locale } from "@/lib/i18n/types";

export const PLAYBOOK_HINTS_FALLBACK: Record<string, string[]> = {
  expected_move: [
    "Expected Move = ATM Call mid + ATM Put mid（跨式）÷ 现价，得到隐含波动幅度。",
    "Iron Condor 等波动率中性策略常将 wings 开在 Expected Move 之外。",
    "财报前 IV 抬升时，跨式隐含波动往往偏宽，需结合 IV Rank 判断买方/卖方环境。",
  ],
  unusual_flow: [
    "异动五步法：市值>200亿、单笔权利金>50万、14<DTE<60 过滤噪音。",
    "当日 Volume >> 昨日 OI 且成交价在 Ask 侧，更似主力新开仓。",
    "普通用户不应照搬极虚值行权价，优先 ATM 或轻微 ITM / 看涨价差。",
  ],
  screener: [
    "合约筛选器按方向+流动性筛选，不是异动榜；结合 DTE、IV、量/OI 阅读。",
    "买方优选 DTE 30-60；IV Rank < 30% 偏买方，> 70% 偏卖方。",
    "解读需对照大盘 regime 与 Expected Move 风险尺。",
  ],
};

const PLAYBOOK_HINTS_FALLBACK_EN: Record<string, string[]> = {
  expected_move: [
    "Expected Move = ATM call mid + ATM put mid (straddle) ÷ spot.",
    "Iron condors often place wings outside the expected move.",
    "Pre-earnings IV lift can widen straddle-implied moves—pair with IV Rank.",
  ],
  unusual_flow: [
    "Five-step filter: cap >$20B, premium >$500k, 14<DTE<60 to cut noise.",
    "Volume >> prior OI with trades at ask suggests new opening interest.",
    "Avoid deep OTM strikes; prefer ATM or slight ITM / call spreads.",
  ],
  screener: [
    "Screener filters by inferred direction + liquidity—not unusual-activity list.",
    "Buyers often prefer DTE 30–60; IV Rank <30% buyer-friendly, >70% seller-friendly.",
    "Cross-check market regime and expected-move risk gauge.",
  ],
};

export function getPlaybookHintsFallback(topic: string, locale: Locale = "zh"): string[] {
  const key = topic.trim().toLowerCase().replace(/-/g, "_");
  const map = locale === "en" ? PLAYBOOK_HINTS_FALLBACK_EN : PLAYBOOK_HINTS_FALLBACK;
  return map[key] ?? map.screener;
}

export async function fetchPlaybookHints(topic: string, locale: Locale = "zh"): Promise<string[]> {
  const key = topic.trim().toLowerCase().replace(/-/g, "_");
  try {
    const res = await fetch(`/api/mvp/playbook-hints?topic=${encodeURIComponent(key)}`, {
      cache: "no-store",
      headers: buildMvpAccessHeaders(),
    });
    if (!res.ok) return getPlaybookHintsFallback(key, locale);
    const data = (await res.json()) as { bullets?: string[] };
    if (Array.isArray(data.bullets) && data.bullets.length > 0) return data.bullets;
  } catch {
    /* use fallback */
  }
  return getPlaybookHintsFallback(key, locale);
}
