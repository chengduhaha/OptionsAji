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

import type { V4HistRow } from "@/components/v4/charts/V4NetGexTrendChart";
import { formatMessage } from "@/lib/i18n/dictionary";
import { useI18n } from "@/lib/i18n/context";
import { useV4ChartTheme } from "@/lib/v4/use-v4-chart-theme";

export default function V4GammaFlipChart({ data }: { data: V4HistRow[] }) {
  const { t } = useI18n();
  const theme = useV4ChartTheme();

  const tooltipStyle = {
    backgroundColor: theme.background,
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: theme.foreground,
  };

  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">{t("v3.chart.noFlip")}</p>
    );
  }

  const sparse = data.length <= 2;
  const latestFlip = [...data].reverse().find((r) => typeof r.flip === "number")?.flip;

  return (
    <div className="space-y-3">
      {typeof latestFlip === "number" ? (
        <div className="inline-flex rounded-md bg-primary/10 px-3 py-1.5 font-mono text-sm font-semibold text-primary">
          {formatMessage(t("v3.chart.currentEstimate"), { value: latestFlip.toFixed(2) })}
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid
            stroke={theme.border}
            strokeOpacity={theme.gridOpacity}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: theme.muted, fontFamily: "var(--font-mono)" }}
            minTickGap={28}
            axisLine={{ stroke: theme.border }}
            tickLine={{ stroke: theme.border }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: theme.muted, fontFamily: "var(--font-mono)" }}
            width={48}
            domain={["auto", "auto"]}
            axisLine={{ stroke: theme.border }}
            tickLine={{ stroke: theme.border }}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)", color: theme.foreground }}
          />
          <Line
            type="monotone"
            dataKey="flip"
            name={t("v3.chart.gammaFlipLine")}
            stroke={theme.chart1}
            strokeWidth={2.5}
            dot={
              sparse
                ? { r: 3, stroke: theme.chart1, strokeWidth: 2, fill: theme.background }
                : false
            }
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
