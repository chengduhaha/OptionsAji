export type BoardId =
  | "unusual"
  | "volume"
  | "open-interest"
  | "turnover"
  | "high-iv"
  | "high-gamma"
  | "near-atm-gamma"
  | "seller"
  | "liquidity";

export type MoneynessFilter = "all" | "ITM" | "OTM" | "ATM";
export type CpFilter = "all" | "C" | "P";
export type DteFilter = "all" | "0" | "7" | "30";

export type LeaderboardRow = {
  rank: number;
  code: string;
  option_name: string;
  underlying: string;
  option_type: string;
  strike: number | null;
  expiry: string | null;
  dte: number | null;
  volume: number;
  oi: number;
  vol_oi_ratio: number | null;
  turnover: number | null;
  oi_mcap: number | null;
  premium: number | null;
  price: number | null;
  iv: number | null;
  iv_rank: number | null;
  hv: number | null;
  iv_hv: number | null;
  delta: number | null;
  gamma: number | null;
  vega: number | null;
  theta: number | null;
  change_ratio: number | null;
  moneyness: string | null;
  in_the_money: boolean | null;
  sell_ann: number | null;
  sell_prob: number | null;
  itm_prob: number | null;
  spread: number | null;
  bid_vol: number | null;
  ask_vol: number | null;
  underlying_price?: number | null;
  symbol_masked?: boolean;
};

export type LeaderboardResponse = {
  board: BoardId;
  items: LeaderboardRow[];
  total: number;
  updated_at?: string;
  cache_ttl_seconds?: number;
  error?: string;
  locked?: boolean;
  access?: {
    tier: string;
    is_member: boolean;
    locked: boolean;
    row_limit: number | null;
    allowed_filters: string[];
    allowed_top_n: number[];
    max_pages: number | null;
    symbol_mask_ranks?: number;
  };
};

export type ColumnKey =
  | "vol_oi_ratio"
  | "volume"
  | "oi"
  | "turnover"
  | "oi_mcap"
  | "iv"
  | "iv_rank"
  | "hv"
  | "iv_hv"
  | "change_ratio"
  | "price"
  | "dte"
  | "delta"
  | "gamma"
  | "vega"
  | "theta"
  | "sell_ann"
  | "sell_prob"
  | "itm_prob"
  | "spread"
  | "bid_vol"
  | "ask_vol";

export type BoardUiConfig = {
  boardId: BoardId;
  titleKey: string;
  answerKey: string;
  heroColumn: ColumnKey;
  columns: ColumnKey[];
  accent: "peach" | "lavender";
  invertHeroBar?: boolean;
  showUnusualBadge?: boolean;
  paginated?: boolean;
};
