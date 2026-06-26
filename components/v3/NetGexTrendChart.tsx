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

export type HistRow = {
  date: string;
  net?: number;
  flip?: number;
  close?: number;
};

const NEO_TOOLTIP = {
  backgroundColor: "#F5F2F0",
  border: "3px solid #151617",
  boxShadow: "4px 4px 0 #151617",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

export default function NetGexTrendChart({ data }: { data: HistRow[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-ink/60 py-10 text-center font-sans">
        暂无 Net GEX 趋势数据
      </p>
    );
  }

  const sparse = data.length <= 2;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="#151617" strokeOpacity={0.1} strokeDasharray="4 4" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#151617", fontFamily: "var(--font-mono)" }}
          minTickGap={28}
          axisLine={{ stroke: "#151617", strokeWidth: 2 }}
          tickLine={{ stroke: "#151617" }}
        />
        <YAxis
          yAxisId="gx"
          tick={{ fontSize: 10, fill: "#151617", fontFamily: "var(--font-mono)" }}
          width={48}
          domain={["auto", "auto"]}
          axisLine={{ stroke: "#151617", strokeWidth: 2 }}
          tickLine={{ stroke: "#151617" }}
        />
        <YAxis
          yAxisId="px"
          orientation="right"
          tick={{ fontSize: 10, fill: "#151617", fontFamily: "var(--font-mono)" }}
          width={48}
          domain={["auto", "auto"]}
          axisLine={{ stroke: "#151617", strokeWidth: 2 }}
          tickLine={{ stroke: "#151617" }}
        />
        <Tooltip contentStyle={NEO_TOOLTIP} />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
        <Line
          yAxisId="gx"
          type="monotone"
          dataKey="net"
          name="Net GEX (Bn)"
          stroke="#FFBE98"
          strokeWidth={3}
          dot={sparse ? { r: 3, stroke: "#151617", strokeWidth: 2, fill: "#FFBE98" } : false}
          connectNulls
        />
        <Line
          yAxisId="px"
          type="monotone"
          dataKey="close"
          name="Close Price"
          stroke="#151617"
          strokeWidth={2.5}
          dot={sparse ? { r: 3, stroke: "#151617", strokeWidth: 2, fill: "#F5F2F0" } : false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
