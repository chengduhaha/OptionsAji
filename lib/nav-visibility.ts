/** Sidebar menu ids and pathname → menu_id mapping for route guard. */

export const KNOWN_NAV_IDS = [
  "aji_insights",
  "ticker_insights",
  "twitter_kol",
  "dash",
  "scanner",
  "stock",
  "feed",
  "ai",
  "learn",
  "macro",
  "supply_graph",
  "settings",
  "profile",
  "divergence",
  "darkpool",
  "congress",
  "cross_market",
  "cross_scanner",
  "cross_feed",
  "ontology_copilot",
  "ontology_inspector",
] as const;

export type NavMenuId = (typeof KNOWN_NAV_IDS)[number];

export const NAV_GROUP_LABELS: Record<string, { label: string; childIds: NavMenuId[] }> = {
  alt_data: {
    label: "另类数据",
    childIds: ["divergence", "darkpool", "congress"],
  },
  cross_market_group: {
    label: "跨市场",
    childIds: [
      "cross_market",
      "cross_scanner",
      "cross_feed",
      "ontology_copilot",
      "ontology_inspector",
    ],
  },
};

export const NAV_ITEM_LABELS: Record<NavMenuId, string> = {
  aji_insights: "市场洞察",
  ticker_insights: "标的深析",
  twitter_kol: "Twitter美股大牛追踪",
  dash: "市场总览",
  scanner: "期权数据筛选器",
  stock: "个股深度",
  feed: "统一信息流",
  ai: "AI 分析师",
  learn: "期权学院",
  macro: "宏观经济",
  supply_graph: "产业星图",
  settings: "设置",
  profile: "个人中心",
  divergence: "散户背离扫描",
  darkpool: "暗池雷达",
  congress: "国会山追踪",
  cross_market: "跨市场总览",
  cross_scanner: "套利扫描",
  cross_feed: "跨市场信息流",
  ontology_copilot: "本体 Copilot",
  ontology_inspector: "本体调试台",
};

export function defaultNavVisibility(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const id of KNOWN_NAV_IDS) out[id] = true;
  return out;
}

const SAFE_REGULAR_INITIAL_VISIBLE = new Set<NavMenuId>([
  "aji_insights",
  "ticker_insights",
  "profile",
]);

export function initialNavVisibilityForRole(role?: string | null): Record<string, boolean> {
  if (role === "admin") return defaultNavVisibility();
  const out: Record<string, boolean> = {};
  for (const id of KNOWN_NAV_IDS) out[id] = SAFE_REGULAR_INITIAL_VISIBLE.has(id);
  return out;
}

/** Resolve pathname to a single menu id (first match). */
export function pathnameToMenuId(
  pathname: string,
): NavMenuId | "admin_users" | "admin_menu" | "admin_access_keys" | "admin_llm_usage" | "admin_discord" | null {
  const p = pathname.split("?")[0] ?? "/";
  if (p === "/" || p === "/mvp") return "aji_insights";
  if (p === "/ticker" || p.startsWith("/ticker/")) return "ticker_insights";
  if (p === "/twitter-kol" || p.startsWith("/twitter-kol/")) return "twitter_kol";
  if (p === "/market" || p.startsWith("/market/")) return "dash";
  if (p === "/scanner/divergence" || p.startsWith("/scanner/divergence/")) return "divergence";
  if (p === "/scanner") return "scanner";
  if (p.startsWith("/stock")) return "stock";
  if (p === "/feed" || p.startsWith("/feed/")) return "feed";
  if (p === "/ai" || p.startsWith("/ai/")) return "ai";
  if (p === "/learn" || p.startsWith("/learn/")) return "learn";
  if (p === "/macro" || p.startsWith("/macro/")) return "macro";
  if (p === "/panorama" || p.startsWith("/panorama/")) return "supply_graph";
  if (p === "/settings" || p.startsWith("/settings/")) return "settings";
  if (p === "/profile" || p.startsWith("/profile/")) return "profile";
  if (p === "/dark-pool" || p.startsWith("/dark-pool/")) return "darkpool";
  if (p === "/congress" || p.startsWith("/congress/")) return "congress";
  if (p === "/cross-market/scanner" || p.startsWith("/cross-market/scanner/")) return "cross_scanner";
  if (p === "/cross-market/feed" || p.startsWith("/cross-market/feed/")) return "cross_feed";
  if (p === "/cross-market" || (p.startsWith("/cross-market/") && !p.includes("/scanner") && !p.includes("/feed")))
    return "cross_market";
  if (p.startsWith("/copilot")) return "ontology_copilot";
  if (p.startsWith("/inspector")) return "ontology_inspector";
  if (p.startsWith("/admin/users")) return "admin_users";
  if (p.startsWith("/admin/menu")) return "admin_menu";
  if (p.startsWith("/admin/access-keys")) return "admin_access_keys";
  if (p.startsWith("/admin/llm-usage")) return "admin_llm_usage";
  if (p.startsWith("/admin/discord")) return "admin_discord";
  return null;
}

export function isPathAllowed(
  pathname: string,
  visibility: Record<string, boolean>,
  isAdmin: boolean,
): boolean {
  if (isAdmin) return true;
  const menuId = pathnameToMenuId(pathname);
  if (menuId === null) return true;
  if (
    menuId === "admin_users" ||
    menuId === "admin_menu" ||
    menuId === "admin_access_keys" ||
    menuId === "admin_llm_usage" ||
    menuId === "admin_discord"
  ) return false;
  return visibility[menuId] !== false;
}
