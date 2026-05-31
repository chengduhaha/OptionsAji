import type { AuthUserContract } from "@/lib/contracts";

export type MvpTier = "guest" | "trial" | "pro";

export type UnlockReason = "login" | "access_key";

const TIER_RANK: Record<MvpTier, number> = {
  guest: 0,
  trial: 1,
  pro: 2,
};

export function tierMeetsRequired(current: MvpTier, required: MvpTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function unlockReasonForRequired(current: MvpTier, required: MvpTier): UnlockReason {
  if (required === "pro" && current === "trial") return "access_key";
  return "login";
}

export function resolveMvpTier(input: {
  ready: boolean;
  user: AuthUserContract | null;
  isAdmin: boolean;
  isPro: boolean;
}): MvpTier {
  if (!input.ready) return "guest";
  if (input.isAdmin || input.isPro) return "pro";
  if (input.user?.email_verified) return "trial";
  return "guest";
}

/** API envelope: { tier, ...fields } */
export function unwrapMvpEnvelope(
  raw: Record<string, unknown> | null | undefined,
): { tier: MvpTier | null; data: Record<string, unknown> } {
  if (!raw || typeof raw !== "object") {
    return { tier: null, data: {} };
  }
  const tierRaw = raw.tier;
  const tier =
    tierRaw === "guest" || tierRaw === "trial" || tierRaw === "pro" ? tierRaw : null;
  if (tier === null) {
    return { tier: null, data: raw };
  }
  const { tier: _t, ...rest } = raw;
  return { tier, data: rest };
}
