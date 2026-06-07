import type { DictionaryTree, Locale } from "./types";

export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_STORAGE_KEY = "optionsaji_locale";
export const LOCALE_COOKIE_KEY = "optionsaji_locale";

export const dictionary: Record<Locale, DictionaryTree> = {
  zh: {
    language: {
      label: "语言",
      zh: "中文",
      en: "English",
      switchToZh: "切换到中文",
      switchToEn: "Switch to English",
    },
    shell: {
      marketOpen: "市场开放中",
      loadingSession: "加载会话…",
      redirectLogin: "重定向到登录…",
      featureUnavailable: "该功能暂未开放…",
      loggedIn: "已登录",
      role: "角色",
      logout: "退出登录",
      loggingOut: "退出中…",
      loggedOut: "未登录",
      login: "登录",
      register: "注册",
      proMember: "Pro 会员",
      fullAccess: "全功能访问",
      productIntro: "产品介绍",
      aiAnalysis: "AI 分析",
    },
    nav: {
      aji_insights: "市场洞察",
      ticker_insights: "标的深析",
      twitter_kol: "Twitter大牛",
      dash: "市场总览",
      scanner: "期权数据筛选器",
      stock: "个股深度",
      feed: "统一信息流",
      ai: "AI 分析师",
      learn: "期权学院",
      macro: "宏观经济",
      supply_graph: "产业星图",
      settings: "设置",
      altData: "另类数据",
      divergence: "散户背离扫描",
      darkpool: "暗池雷达",
      congress: "国会山追踪",
      crossMarket: "跨市场",
      cross_market: "跨市场总览",
      cross_scanner: "定价差异扫描",
      cross_feed: "跨市场信息流",
      ontology_copilot: "本体 Copilot",
      ontology_inspector: "本体调试台",
      profile: "个人中心",
      admin_menu: "菜单管理",
      admin_discord: "Discord 来源",
      admin_users: "用户管理",
      admin_access_keys: "Access Key",
      admin_llm_usage: "Token 监控",
    },
    theme: {
      label: "主题",
      light: "亮色主题",
      dark: "暗色主题",
      switchToLight: "切换到亮色主题",
      switchToDark: "切换到暗色主题",
    },
    chat: {
      ticker: "标的",
      newChat: "新对话",
      welcomeTitle: "OptionsAji AI 分析师",
      welcomeSubtitle: "基于平台缓存数据，综合回答你的期权与市场结构问题",
      placeholder: "问我任何期权问题，例如「{ticker} 现在的 GEX 环境如何？」",
      disclaimer: "仅供教育参考，不构成投资建议 · Enter 发送，Shift+Enter 换行",
      networkError: "网络错误，请重试。",
      send: "发送",
      suggestionGex: "{ticker} 现在的 GEX 环境怎么样？",
      suggestionIv: "分析 {ticker} 当前的 IV 水平，是否适合卖方策略？",
      suggestionSpread: "帮我评估 {ticker} Credit Put Spread 的风险收益比",
    },
    sse: {
      thinking: "思考",
      data: "数据",
      planning: "规划",
      subagentStart: "子代理启动",
      subagentDone: "子代理完成",
      error: "错误",
      event: "事件",
      decodeFailed: "SSE 解码失败（非 JSON）。",
      stale: "SSE 结束，但未收到模型回答片段。",
      backendNotReady: "Agent 后端未就绪：{detail}",
      backendError: "Agent 后端错误 ({status}): {detail}",
      unknownError: "未知错误",
      agentError: "Agent 报错",
      networkError: "网络错误",
      cannotConnect: "{message}，无法连接 Agent SSE。",
      elapsed: "耗时 {elapsed}",
    },
  },
  en: {
    language: {
      label: "Language",
      zh: "中文",
      en: "English",
      switchToZh: "Switch to Chinese",
      switchToEn: "Switch to English",
    },
    shell: {
      marketOpen: "Market open",
      loadingSession: "Loading session...",
      redirectLogin: "Redirecting to login...",
      featureUnavailable: "This feature is not available yet...",
      loggedIn: "Signed in",
      role: "Role",
      logout: "Log out",
      loggingOut: "Logging out...",
      loggedOut: "Not signed in",
      login: "Log in",
      register: "Register",
      proMember: "Pro member",
      fullAccess: "Full feature access",
      productIntro: "Product intro",
      aiAnalysis: "AI analysis",
    },
    nav: {
      aji_insights: "Market insights",
      ticker_insights: "Ticker deep dive",
      twitter_kol: "Twitter KOLs",
      dash: "Market overview",
      scanner: "Options scanner",
      stock: "Stock deep dive",
      feed: "Unified feed",
      ai: "AI analyst",
      learn: "Options academy",
      macro: "Macro economy",
      supply_graph: "Industry map",
      settings: "Settings",
      altData: "Alternative data",
      divergence: "Retail divergence",
      darkpool: "Dark pool radar",
      congress: "Capitol tracking",
      crossMarket: "Cross-market",
      cross_market: "Cross-market overview",
      cross_scanner: "Arbitrage scanner",
      cross_feed: "Cross-market feed",
      ontology_copilot: "Ontology Copilot",
      ontology_inspector: "Ontology inspector",
      profile: "Profile",
      admin_menu: "Menu management",
      admin_discord: "Discord sources",
      admin_users: "User management",
      admin_access_keys: "Access keys",
      admin_llm_usage: "Token monitor",
    },
    theme: {
      label: "Theme",
      light: "Light theme",
      dark: "Dark theme",
      switchToLight: "Switch to light theme",
      switchToDark: "Switch to dark theme",
    },
    chat: {
      ticker: "Ticker",
      newChat: "New chat",
      welcomeTitle: "OptionsAji AI analyst",
      welcomeSubtitle: "Answers options and market structure questions using cached platform data",
      placeholder: "Ask any options question, for example: How is {ticker}'s GEX environment now?",
      disclaimer: "For education only, not investment advice · Enter to send, Shift+Enter for a new line",
      networkError: "Network error. Please try again.",
      send: "Send",
      suggestionGex: "How is {ticker}'s GEX environment right now?",
      suggestionIv: "Analyze {ticker}'s current IV level. Is it suitable for premium-selling strategies?",
      suggestionSpread: "Help me evaluate the risk/reward of a {ticker} credit put spread",
    },
    sse: {
      thinking: "Thinking",
      data: "Data",
      planning: "Planning",
      subagentStart: "Subagent started",
      subagentDone: "Subagent finished",
      error: "Error",
      event: "Event",
      decodeFailed: "SSE decode failed (non-JSON).",
      stale: "SSE ended without a model answer.",
      backendNotReady: "Agent backend is not ready: {detail}",
      backendError: "Agent backend error ({status}): {detail}",
      unknownError: "unknown error",
      agentError: "Agent error",
      networkError: "Network error",
      cannotConnect: "{message}; cannot connect to Agent SSE.",
      elapsed: "elapsed {elapsed}",
    },
  },
};

export const englishPhraseTranslations: Record<string, string> = {
  "市场开放中": "Market open",
  "加载会话…": "Loading session...",
  "重定向到登录…": "Redirecting to login...",
  "该功能暂未开放…": "This feature is not available yet...",
  "已登录": "Signed in",
  "退出登录": "Log out",
  "退出中…": "Logging out...",
  "未登录": "Not signed in",
  "登录": "Log in",
  "注册": "Register",
  "Pro 会员": "Pro member",
  "全功能访问": "Full feature access",
  "产品介绍": "Product intro",
  "AI 分析": "AI analysis",
  "个人中心": "Profile",
  "菜单管理": "Menu management",
  "用户管理": "User management",
  "期权学院": "Options academy",
  "设置": "Settings",
  "新对话": "New chat",
  "标的": "Ticker",
  "网络错误，请重试。": "Network error. Please try again.",
  "仅供教育参考，不构成投资建议": "For education only, not investment advice",
  "切换到亮色主题": "Switch to light theme",
  "切换到暗色主题": "Switch to dark theme",
};

export function resolveDictionaryValue(locale: Locale, key: string): string | undefined {
  let current: unknown = dictionary[locale];
  for (const part of key.split(".")) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function formatMessage(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

export function translatePhraseToEnglish(input: string): string {
  const trimmed = input.trim();
  const exact = englishPhraseTranslations[trimmed];
  if (exact) {
    return input.replace(trimmed, exact);
  }

  return Object.entries(englishPhraseTranslations)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((text, [source, translated]) => text.split(source).join(translated), input);
}
