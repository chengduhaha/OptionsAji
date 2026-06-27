import { describe, expect, it } from "vitest";

import { formatContractStrike, resolveContractStrike } from "@/lib/leaderboard/formatContract";
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
        underlying_price: 706.52,
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
        underlying_price: 4.8,
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
        underlying_price: 706.52,
      }),
    );
    expect(formatted).toBe("711.00");
  });

  it("rejects implausible low strikes vs spot (MU)", () => {
    const mu = row({
      code: "US.MU260702C5000",
      option_name: "MU 260702 5.00C",
      strike: 5,
      price: 1209.98,
      premium: 1119,
      underlying_price: 1132.33,
    });
    expect(resolveContractStrike(mu)).toBeNull();
    expect(formatContractStrike(mu)).toBe("—");
  });

  it("rejects deep ITM legacy MU strikes far below spot", () => {
    const mu = row({
      code: "US.MU260702C115000",
      option_name: "MU 260702 115.00C",
      strike: 115,
      price: 1010.05,
      premium: 1010.05,
      underlying_price: 1132.33,
    });
    expect(resolveContractStrike(mu)).toBeNull();
  });
});
