import type { MembershipContract } from "@/lib/contracts";

export const FREE_ROW_LIMIT = 10;
export const FREE_SYMBOL_MASK_RANKS = 3;

export function isMember(membership: MembershipContract | undefined): boolean {
  return membership?.is_member === true || membership?.tier === "admin";
}

export function membershipLabel(membership: MembershipContract | undefined, locale: "zh" | "en"): string {
  if (!membership || membership.tier === "guest") {
    return locale === "zh" ? "访客" : "Guest";
  }
  if (membership.tier === "admin") return locale === "zh" ? "管理员" : "Admin";
  if (membership.is_member) {
    return locale === "zh" ? "会员" : "Member";
  }
  return locale === "zh" ? "免费用户" : "Free";
}

export type BoardAccessMeta = {
  tier: string;
  is_member: boolean;
  locked: boolean;
  row_limit: number | null;
  allowed_filters: string[];
  allowed_top_n: number[];
  max_pages: number | null;
  symbol_mask_ranks?: number;
};

export function defaultBoardAccess(isMemberUser: boolean, boardId: string): BoardAccessMeta {
  if (isMemberUser) {
    return {
      tier: "member",
      is_member: true,
      locked: false,
      row_limit: boardId === "unusual" ? 100 : null,
      allowed_filters: ["cp", "dte", "moneyness", "topN", "page"],
      allowed_top_n: [10, 25],
      max_pages: boardId === "unusual" ? 10 : null,
      symbol_mask_ranks: 0,
    };
  }
  return {
    tier: "guest",
    is_member: false,
    locked: false,
    row_limit: FREE_ROW_LIMIT,
    allowed_filters: boardId === "unusual" ? ["cp", "topN"] : [],
    allowed_top_n: boardId === "unusual" ? [10] : [],
    max_pages: 1,
    symbol_mask_ranks: FREE_SYMBOL_MASK_RANKS,
  };
}
