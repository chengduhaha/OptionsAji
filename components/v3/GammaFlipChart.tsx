"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HistRow } from "./NetGexTrendChart";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { useNeoChartTheme } from "@/lib/v3/use-neo-chart-theme";

export default function GammaFlipChart({ data }: { data: HistRow[] }) {
  const { t } = useI18n();
  const theme = useNeoChartTheme();

  const tooltipStyle = {
    backgroundColor: theme.cream,
    border: `3px solid ${theme.ink}`,
    boxShadow: `4px 4px 0 ${theme.ink}`,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: theme.ink,
  };

  if (!data.length) {
    return (
      <p className="text-sm text-ink/60 py-10 text-center font-sans">
        {t("v3.chart.noFlip")}
      </p>
    );
  }

  const sparse = data.length <= 2;
  const latestFlip = [...data].reverse().find((r) => typeof r.flip === "number")?.flip;

  return (
    <div className="space-y-3">
      {typeof latestFlip === "number" ? (
        <div className="inline-block border-[3px] border-ink bg-lavender px-3 py-1.5 shadow-neo-sm font-mono text-sm font-bold">
          {formatMessage(t("v3.chart.currentEstimate"), { value: latestFlip.toFixed(2) })}
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid
            stroke={theme.ink}
            strokeOpacity={theme.gridOpacity}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: theme.ink, fontFamily: "var(--font-mono)" }}
            minTickGap={28}
            axisLine={{ stroke: theme.ink, strokeWidth: 2 }}
            tickLine={{ stroke: theme.ink }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: theme.ink, fontFamily: "var(--font-mono)" }}
            width={48}
            domain={["auto", "auto"]}
            axisLine={{ stroke: theme.ink, strokeWidth: 2 }}
            tickLine={{ stroke: theme.ink }}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)", color: theme.ink }} />
          <Line
            type="monotone"
            dataKey="flip"
            name={t("v3.chart.gammaFlipLine")}
            stroke={theme.lavender}
            strokeWidth={3}
            dot={
              sparse
                ? { r: 3, stroke: theme.ink, strokeWidth: 2, fill: theme.lavender }
                : false
            }
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
