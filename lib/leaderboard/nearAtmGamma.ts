import { LEADERBOARD_MAX_ROWS } from "@/lib/leaderboard/constants";
import type { LeaderboardRow } from "@/lib/leaderboard/types";

export function isNearAtm(row: LeaderboardRow): boolean {
  const moneyness = (row.moneyness ?? "").toUpperCase();
  if (moneyness === "ATM") return true;
  const delta = row.delta;
  if (delta == null || !Number.isFinite(delta)) return false;
  return Math.abs(delta) >= 0.35 && Math.abs(delta) <= 0.65;
}

export function pickNearAtmHighGamma(items: LeaderboardRow[]): LeaderboardRow[] {
  return items
    .filter((row) => isNearAtm(row) && row.gamma != null && Number.isFinite(row.gamma))
    .sort((a, b) => (b.gamma ?? 0) - (a.gamma ?? 0))
    .slice(0, LEADERBOARD_MAX_ROWS)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
