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

const NEO_TOOLTIP = {
  backgroundColor: "#F5F2F0",
  border: "3px solid #151617",
  boxShadow: "4px 4px 0 #151617",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

export default function GammaFlipChart({ data }: { data: HistRow[] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-ink/60 py-10 text-center font-sans">
        暂无 Gamma Flip 估算数据
      </p>
    );
  }

  const sparse = data.length <= 2;
  const latestFlip = [...data].reverse().find((r) => typeof r.flip === "number")?.flip;

  return (
    <div className="space-y-3">
      {typeof latestFlip === "number" ? (
        <div className="inline-block border-[3px] border-ink bg-lavender px-3 py-1.5 shadow-neo-sm font-mono text-sm font-bold">
          当前估算: ${latestFlip.toFixed(2)}
        </div>
      ) : null}
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
            tick={{ fontSize: 10, fill: "#151617", fontFamily: "var(--font-mono)" }}
            width={48}
            domain={["auto", "auto"]}
            axisLine={{ stroke: "#151617", strokeWidth: 2 }}
            tickLine={{ stroke: "#151617" }}
          />
          <Tooltip contentStyle={NEO_TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }} />
          <Line
            type="monotone"
            dataKey="flip"
            name="Gamma Flip ($)"
            stroke="#A799F0"
            strokeWidth={3}
            dot={sparse ? { r: 3, stroke: "#151617", strokeWidth: 2, fill: "#A799F0" } : false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
