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

import { useI18n } from "@/lib/i18n/context";
import { useNeoChartTheme } from "@/lib/v3/use-neo-chart-theme";

export type HistRow = {
  date: string;
  net?: number;
  flip?: number;
  close?: number;
};

export default function NetGexTrendChart({ data }: { data: HistRow[] }) {
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
        {t("v3.chart.noNetGex")}
      </p>
    );
  }

  const sparse = data.length <= 2;

  return (
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
          yAxisId="gx"
          tick={{ fontSize: 10, fill: theme.ink, fontFamily: "var(--font-mono)" }}
          width={48}
          domain={["auto", "auto"]}
          axisLine={{ stroke: theme.ink, strokeWidth: 2 }}
          tickLine={{ stroke: theme.ink }}
        />
        <YAxis
          yAxisId="px"
          orientation="right"
          tick={{ fontSize: 10, fill: theme.ink, fontFamily: "var(--font-mono)" }}
          width={48}
          domain={["auto", "auto"]}
          axisLine={{ stroke: theme.ink, strokeWidth: 2 }}
          tickLine={{ stroke: theme.ink }}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)", color: theme.ink }} />
        <Line
          yAxisId="gx"
          type="monotone"
          dataKey="net"
          name={t("v3.chart.netGexLine")}
          stroke={theme.peach}
          strokeWidth={3}
          dot={
            sparse
              ? { r: 3, stroke: theme.ink, strokeWidth: 2, fill: theme.peach }
              : false
          }
          connectNulls
        />
        <Line
          yAxisId="px"
          type="monotone"
          dataKey="close"
          name={t("v3.chart.closePrice")}
          stroke={theme.ink}
          strokeWidth={2.5}
          dot={
            sparse
              ? { r: 3, stroke: theme.ink, strokeWidth: 2, fill: theme.cream }
              : false
          }
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
