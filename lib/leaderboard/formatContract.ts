import type { LeaderboardRow } from "@/lib/leaderboard/types";

const OPTION_NAME_STRIKE_RE = /\s(\d+(?:\.\d+)?)[CP]$/i;
const OPTION_CODE_STRIKE_RE = /[CP](\d+)$/i;

function parseStrikeFromOptionName(optionName: string): { value: number; label: string } | null {
  const match = OPTION_NAME_STRIKE_RE.exec(optionName.trim());
  if (!match) return null;
  const label = match[1];
  const value = Number(label);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, label };
}

function parseStrikeFromOptionCode(code: string): number | null {
  const match = OPTION_CODE_STRIKE_RE.exec(code.trim().toUpperCase());
  if (!match) return null;
  const digits = match[1];
  if (!digits) return null;
  const value = Number(digits.padStart(8, "0")) / 1000;
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Display strike in contract cell — prefer option_name/code, never option price. */
export function formatContractStrike(row: LeaderboardRow): string {
  const fromName = parseStrikeFromOptionName(row.option_name ?? "");
  if (fromName) {
    return fromName.label.includes(".") ? fromName.label : fromName.value.toFixed(2);
  }

  const fromCode = parseStrikeFromOptionCode(row.code ?? "");
  if (fromCode != null) return fromCode.toFixed(2);

  if (row.strike != null && Number.isFinite(row.strike) && row.strike > 0) {
    return row.strike.toFixed(2);
  }

  return "—";
}
