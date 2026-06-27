import type { LeaderboardRow } from "@/lib/leaderboard/types";

const OPTION_NAME_STRIKE_RE = /\s(\d+(?:\.\d+)?)[CP]$/i;
// Futu US OCC: US.{SYMBOL}{YYMMDD}{C|P}{STRIKE_MILLIS} — millis = round(strike*1000), zeros stripped
const OPTION_CODE_STRIKE_RE = /[CP](\d+)$/i;

type ContractType = "call" | "put" | null;

function strikeMillisCandidatesFromCode(code: string): number[] {
  const match = OPTION_CODE_STRIKE_RE.exec(code.trim().toUpperCase());
  if (!match?.[1]) return [];
  const digits = match[1];
  const seen = new Set<number>();

  seen.add(Number(digits.padStart(8, "0")) / 1000);
  const maxTrailing = Math.max(0, 8 - digits.length);
  for (let extra = 1; extra <= maxTrailing; extra += 1) {
    const extended = `${digits}${"0".repeat(extra)}`;
    if (extended.length <= 8) {
      seen.add(Number(extended.padStart(8, "0")) / 1000);
    } else {
      seen.add(Number(extended) / 1000);
    }
  }

  return [...seen].filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
}

function parseStrikeFromOptionName(optionName: string): number | null {
  const match = OPTION_NAME_STRIKE_RE.exec(optionName.trim());
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function contractTypeFromRow(row: LeaderboardRow): ContractType {
  if (row.option_type === "C") return "call";
  if (row.option_type === "P") return "put";
  const name = (row.option_name || row.code || "").toUpperCase();
  if (name.endsWith("C")) return "call";
  if (name.endsWith("P")) return "put";
  return null;
}

function strikeMatchesOptionQuote(strike: number, row: LeaderboardRow): boolean {
  const quotes = [row.price, row.premium].filter(
    (v): v is number => v != null && Number.isFinite(v) && v > 0,
  );
  return quotes.some((q) => Math.abs(strike - q) / q < 0.02);
}

function isStrikeSane(strike: number, spot: number | null, contractType: ContractType): boolean {
  if (strike <= 0) return false;
  if (spot == null || spot <= 0) return true;
  if (spot > 50 && Math.abs(strike - spot) / spot > 0.5) return false;
  if (spot > 50) {
    if (contractType === "call" && strike < spot * 0.05) return false;
    if (contractType === "put" && strike > spot * 20) return false;
  }
  return true;
}

function pickBestStrike(candidates: number[], row: LeaderboardRow): number | null {
  const spot = row.underlying_price ?? null;
  const contractType = contractTypeFromRow(row);
  const fromName = parseStrikeFromOptionName(row.option_name ?? "");
  const unique = [...new Set(candidates.filter((c) => c > 0))].sort((a, b) => a - b);
  const sane = unique.filter(
    (s) => !strikeMatchesOptionQuote(s, row) && isStrikeSane(s, spot, contractType),
  );
  if (!sane.length) return null;
  if (
    fromName != null &&
    sane.includes(fromName) &&
    !strikeMatchesOptionQuote(fromName, row) &&
    isStrikeSane(fromName, spot, contractType)
  ) {
    return fromName;
  }
  if (spot != null && spot > 0) {
    return sane.reduce((best, s) => (Math.abs(s - spot) < Math.abs(best - spot) ? s : best));
  }
  return sane[0];
}

/** Resolve display strike — OCC recovery + spot sanity; prefer backend strike when sane. */
export function resolveContractStrike(row: LeaderboardRow): number | null {
  const spot = row.underlying_price ?? null;
  const contractType = contractTypeFromRow(row);

  if (
    row.strike != null &&
    Number.isFinite(row.strike) &&
    row.strike > 0 &&
    !strikeMatchesOptionQuote(row.strike, row) &&
    isStrikeSane(row.strike, spot, contractType)
  ) {
    return row.strike;
  }

  const candidates: number[] = [];
  candidates.push(...strikeMillisCandidatesFromCode(row.code ?? ""));
  const fromName = parseStrikeFromOptionName(row.option_name ?? "");
  if (fromName != null) candidates.push(fromName);
  if (row.strike != null && row.strike > 0) candidates.push(row.strike);

  return pickBestStrike(candidates, row);
}

/** Display strike in contract cell — never show option last price as strike. */
export function formatContractStrike(row: LeaderboardRow): string {
  const strike = resolveContractStrike(row);
  if (strike == null) return "—";

  const fromName = parseStrikeFromOptionName(row.option_name ?? "");
  if (fromName != null && Math.abs(fromName - strike) < 0.001) {
    const label = (row.option_name.match(OPTION_NAME_STRIKE_RE)?.[1] ?? "").trim();
    if (label) return label.includes(".") ? label : strike.toFixed(2);
  }

  return strike.toFixed(2);
}
