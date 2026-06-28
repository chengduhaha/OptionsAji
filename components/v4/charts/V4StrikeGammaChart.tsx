"use client";

import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { useV4ChartTheme } from "@/lib/v4/use-v4-chart-theme";

type StrikeData = {
  strike: number;
  callGex: number;
  putGex: number;
  net: number;
};

export default function V4StrikeGammaChart({
  ticker,
  strikes,
  price,
  gammaFlip,
}: {
  ticker: string;
  strikes: StrikeData[];
  price: number;
  gammaFlip?: number;
}) {
  const { t } = useI18n();
  const theme = useV4ChartTheme();

  if (!strikes.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">{t("v3.chart.noStrike")}</p>
    );
  }

  const W = 720;
  const H = 280;
  const PL = 52;
  const PR = 16;
  const PT = 12;
  const PB = 36;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const sorted = [...strikes].sort((a, b) => a.strike - b.strike);
  const maxGex = Math.max(...sorted.map((s) => Math.max(s.callGex, s.putGex)), 0.1);
  const barW = Math.max(chartW / sorted.length - 1.5, 2);
  const midY = PT + chartH / 2;

  const toY = (val: number) => {
    if (val >= 0) return chartH / 2 - (val / maxGex) * (chartH / 2 - 6);
    return chartH / 2 + (Math.abs(val) / maxGex) * (chartH / 2 - 6);
  };

  const toX = (i: number) => PL + i * (chartW / sorted.length) + barW / 2;

  const strikeToX = (strike: number) => {
    const idx = sorted.findIndex((s) => s.strike >= strike);
    if (idx <= 0) return PL;
    const prev = sorted[idx - 1]!;
    const next = sorted[idx]!;
    const frac = (strike - prev.strike) / (next.strike - prev.strike);
    return PL + ((idx - 1 + frac) / sorted.length) * chartW;
  };

  const refLines: Array<{ val: number; color: string; label: string }> = [
    { val: price, color: theme.foreground, label: `${ticker} $${price.toFixed(2)}` },
  ];
  if (
    typeof gammaFlip === "number" &&
    gammaFlip > 0 &&
    !Number.isNaN(gammaFlip) &&
    Math.abs(gammaFlip - price) > 1e-3
  ) {
    refLines.push({
      val: gammaFlip,
      color: theme.primary,
      label: formatMessage(t("v3.chart.gammaFlipRef"), { value: gammaFlip.toFixed(2) }),
    });
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: theme.up }} />
          {t("v3.chart.callGex")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: theme.down }} />
          {t("v3.chart.putGex")}
        </span>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-[520px]"
        role="img"
        aria-label={formatMessage(t("v3.chart.strikeAria"), { ticker })}
      >
        {[1, 0.5, 0, -0.5, -1].map((v) => {
          const y = PT + chartH / 2 - (v / 1) * (chartH / 2 - 6);
          return (
            <g key={v}>
              <line
                x1={PL}
                y1={y}
                x2={PL + chartW}
                y2={y}
                stroke={theme.border}
                strokeWidth="1"
                strokeOpacity={theme.gridOpacity}
              />
              <text
                x={PL - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill={theme.muted}
                fontFamily="var(--font-mono)"
              >
                {(v * maxGex).toFixed(1)}B
              </text>
            </g>
          );
        })}

        {sorted.map((s, i) => {
          const x = toX(i) - barW / 2;
          const callH = Math.abs(toY(s.callGex) - midY);
          const putH = Math.abs(toY(s.putGex) - midY);
          return (
            <g key={s.strike}>
              {s.callGex > 0.001 ? (
                <rect
                  x={x}
                  y={midY - callH}
                  width={barW}
                  height={callH}
                  fill={theme.up}
                  opacity={0.85}
                  rx={1}
                />
              ) : null}
              {s.putGex > 0.001 ? (
                <rect
                  x={x}
                  y={midY}
                  width={barW}
                  height={putH}
                  fill={theme.down}
                  opacity={0.85}
                  rx={1}
                />
              ) : null}
            </g>
          );
        })}

        {refLines.map((rl) => {
          const x = strikeToX(rl.val);
          return (
            <g key={rl.label}>
              <line
                x1={x}
                y1={PT}
                x2={x}
                y2={PT + chartH}
                stroke={rl.color}
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text
                x={x + 4}
                y={PT + 14}
                fontSize="10"
                fill={rl.color}
                fontFamily="var(--font-mono)"
                fontWeight="600"
              >
                {rl.label}
              </text>
            </g>
          );
        })}

        <line x1={PL} y1={midY} x2={PL + chartW} y2={midY} stroke={theme.border} strokeWidth="1.5" />

        {sorted
          .filter((_, i) => i % 5 === 0)
          .map((s) => {
            const x = toX(sorted.indexOf(s));
            return (
              <text
                key={s.strike}
                x={x}
                y={PT + chartH + 22}
                textAnchor="middle"
                fontSize="9"
                fill={theme.muted}
                fontFamily="var(--font-mono)"
              >
                {s.strike.toFixed(0)}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
