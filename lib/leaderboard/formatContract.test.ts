import { describe, expect, it } from "vitest";

import { formatContractStrike } from "@/lib/leaderboard/formatContract";
import type { LeaderboardRow } from "@/lib/leaderboard/types";

function row(partial: Partial<LeaderboardRow>): LeaderboardRow {
  return {
    rank: 1,
    code: "",
    option_name: "",
    underlying: "QQQ",
    option_type: "C",
    strike: null,
    expiry: null,
    dte: null,
    volume: 0,
    oi: 0,
    vol_oi_ratio: null,
    turnover: null,
    oi_mcap: null,
    premium: null,
    price: null,
    iv: null,
    hv: null,
    iv_hv: null,
    delta: null,
    gamma: null,
    vega: null,
    theta: null,
    change_ratio: null,
    moneyness: null,
    in_the_money: null,
    sell_ann: null,
    sell_prob: null,
    itm_prob: null,
    spread: null,
    bid_vol: null,
    ask_vol: null,
    ...partial,
  };
}

describe("formatContractStrike", () => {
  it("uses strike from option_name not option price", () => {
    const formatted = formatContractStrike(
      row({
        code: "US.QQQ260717C711000",
        option_name: "QQQ 260717 711.00C",
        strike: 17.68,
        price: 17.68,
      }),
    );
    expect(formatted).toBe("711.00");
  });

  it("formats penny strikes from option_name", () => {
    const formatted = formatContractStrike(
      row({
        code: "US.HIVE260731C500",
        option_name: "HIVE 260731 0.50C",
        strike: 0.5,
        price: 3.6,
      }),
    );
    expect(formatted).toBe("0.50");
  });

  it("falls back to OCC code when option_name missing", () => {
    const formatted = formatContractStrike(
      row({
        code: "US.QQQ260717C711000",
        option_name: "",
        strike: null,
      }),
    );
    expect(formatted).toBe("711.00");
  });
});
