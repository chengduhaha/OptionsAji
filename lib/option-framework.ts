/** MVP「期权合约筛选器」展示文案与 Expected Move 桶标签 */

import type { Locale } from "@/lib/i18n/types";

export const EXPECTED_MOVE_BUCKET_ZH: Record<string, string> = {
  this_week: "本周到期",
  next_week: "下周窗口",
  monthly: "近月到期",
};

export const EXPECTED_MOVE_BUCKET_EN: Record<string, string> = {
  this_week: "This week",
  next_week: "Next week",
  monthly: "Monthly",
};

export function expectedMoveBucketLabel(bucket: string, locale: Locale = "zh"): string {
  const map = locale === "en" ? EXPECTED_MOVE_BUCKET_EN : EXPECTED_MOVE_BUCKET_ZH;
  return map[bucket] ?? bucket;
}

export function expectedMoveBucketHint(bucket: string, locale: Locale = "zh"): string {
  if (locale === "en") {
    if (bucket === "this_week") {
      return "Nearest expiry within 0–6 days: ATM straddle-implied price range.";
    }
    if (bucket === "next_week") {
      return "Nearest expiry within 0–14 days: slightly longer expected-move window.";
    }
    if (bucket === "monthly") {
      return "Front-month (up to ~6 months): monthly implied vol reference.";
    }
    return "ATM call + put straddle price ÷ spot — options-implied expected move.";
  }
  if (bucket === "this_week") {
    return "0–6 日内最近到期：ATM 跨式价格隐含的价格波动区间";
  }
  if (bucket === "next_week") {
    return "0–14 日内最近到期：略长窗口的预期波动";
  }
  if (bucket === "monthly") {
    return "近月（最长约 6 个月窗口内）到期：月度级隐含波动参考";
  }
  return "ATM Call + Put 跨式价格 ÷ 现价，表示期权市场隐含的预期波动幅度";
}

const OPTION_FRAMEWORK_INTRO_ZH =
  "根据标的当日价格与情绪自动推断方向，从完整期权链中筛选近 60 日内、成交相对活跃的合约，便于对比行权价、流动性与 IV。右侧为不同到期窗口的隐含预期波动（Expected Move），不是异动榜单。";

const OPTION_FRAMEWORK_INTRO_EN =
  "Direction is inferred from price and sentiment; we screen liquid contracts within ~60 DTE from the full chain for strike, liquidity, and IV comparison. Right panel shows implied expected move by tenor—not an unusual-activity list.";

const OPTION_TABLE_LEGEND_ZH =
  "量/持仓 = 当日成交量 / 未平仓合约数（Open Interest），反映今日交易活跃度与存量持仓，非历史累计统计。";

const OPTION_TABLE_LEGEND_EN =
  "Vol/OI = today's volume / open interest — today's activity vs outstanding contracts, not cumulative history.";

const PLAYBOOK_SCREENER_FOOTNOTE_ZH =
  "阿吉解读参考内训教材：策略选择、Expected Move 风险尺、流动性与 IV Rank；不构成投资建议。";

const PLAYBOOK_SCREENER_FOOTNOTE_EN =
  "Aji commentary draws on internal playbooks: strategy fit, expected-move risk gauge, liquidity, and IV Rank—not investment advice.";

export function getOptionFrameworkIntro(locale: Locale = "zh"): string {
  return locale === "en" ? OPTION_FRAMEWORK_INTRO_EN : OPTION_FRAMEWORK_INTRO_ZH;
}

export function getOptionTableLegend(locale: Locale = "zh"): string {
  return locale === "en" ? OPTION_TABLE_LEGEND_EN : OPTION_TABLE_LEGEND_ZH;
}

export function getPlaybookScreenerFootnote(locale: Locale = "zh"): string {
  return locale === "en" ? PLAYBOOK_SCREENER_FOOTNOTE_EN : PLAYBOOK_SCREENER_FOOTNOTE_ZH;
}

/** @deprecated use getOptionFrameworkIntro(locale) */
export const OPTION_FRAMEWORK_INTRO = OPTION_FRAMEWORK_INTRO_ZH;
/** @deprecated use getOptionTableLegend(locale) */
export const OPTION_TABLE_LEGEND = OPTION_TABLE_LEGEND_ZH;
/** @deprecated use getPlaybookScreenerFootnote(locale) */
export const PLAYBOOK_SCREENER_FOOTNOTE = PLAYBOOK_SCREENER_FOOTNOTE_ZH;
