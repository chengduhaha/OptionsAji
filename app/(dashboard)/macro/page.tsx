/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { MacroCalendarInsightsContract, MvpMarketInsightsContract } from "@/lib/contracts";
import { CalendarDays, ChevronLeft, ChevronRight, Globe, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const IMPACT_COLOR: Record<string, string> = {
  High: "text-red-400",
  Medium: "text-yellow-400",
  Low: "text-green-400",
};

const IMPACT_DOT: Record<string, string> = {
  High: "bg-red-400",
  Medium: "bg-yellow-400",
  Low: "bg-green-400",
};

const PROXY_HINT =
  "无法连接后端 API：若在 Vercel 部署，请设置 OPTIONS_AJI_BACKEND_URL 为公网可达的 FastAPI（不可填 localhost）。数据源需在后端配置 FMP_API_KEY。";

const MACRO_EVENT_ZH: Array<[string, string]> = [
  ["nonfarm", "非农就业"],
  ["payrolls", "非农就业"],
  ["initial jobless", "初请失业金"],
  ["jobless", "初请失业金"],
  ["unemployment", "失业率"],
  ["cpi", "CPI 通胀"],
  ["ppi", "PPI 生产者物价"],
  ["pce", "PCE 通胀"],
  ["fomc", "FOMC 利率决议"],
  ["fed", "美联储"],
  ["gdp", "GDP"],
  ["pmi", "PMI"],
  ["retail sales", "零售销售"],
  ["consumer confidence", "消费者信心"],
  ["philadelphia fed", "费城联储制造业"],
  ["philly fed", "费城联储制造业"],
  ["ism", "ISM 指数"],
  ["housing", "房地产数据"],
  ["building permits", "营建许可"],
  ["home sales", "房地产销售"],
  ["mortgage", "抵押贷款利率"],
  ["tips auction", "TIPS 国债拍卖"],
  ["bill auction", "短债拍卖"],
  ["natural gas", "天然气库存"],
  ["trade balance", "贸易帐"],
  ["jolts", "JOLTS 职位空缺"],
];

/** FMP `/treasury-rates` uses month1/year10; DB-backed API uses 1M/10Y. */
function treasuryRowToCurve(row: Record<string, unknown>): { term: string; rate: number | null }[] {
  const pick = (...keys: string[]): number | null => {
    for (const k of keys) {
      const v = row[k];
      if (v != null && v !== "") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
    }
    return null;
  };
  return [
    { term: "1M", rate: pick("1M", "month1") },
    { term: "3M", rate: pick("3M", "month3") },
    { term: "6M", rate: pick("6M", "month6") },
    { term: "1Y", rate: pick("1Y", "year1") },
    { term: "2Y", rate: pick("2Y", "year2") },
    { term: "5Y", rate: pick("5Y", "year5") },
    { term: "10Y", rate: pick("10Y", "year10") },
    { term: "30Y", rate: pick("30Y", "year30") },
  ];
}

function beijingDateString(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

function shiftDate(value: string, deltaDays: number): string {
  const d = new Date(`${value}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function macroEventTitleZh(eventName: string): string {
  const lower = eventName.toLowerCase();
  for (const [key, zh] of MACRO_EVENT_ZH) {
    if (lower.includes(key)) return zh;
  }
  if (/[\u4e00-\u9fff]/.test(eventName)) return eventName;
  return eventName ? `宏观：${eventName}` : "宏观事件";
}

function impactZh(impact?: string | null): string {
  if (impact === "High") return "高影响";
  if (impact === "Medium") return "中影响";
  if (impact === "Low") return "低影响";
  return impact || "未标注";
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMacroValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "未公布";
  return String(value);
}

function buildTreasuryFallback(row: Record<string, unknown> | undefined): string {
  if (!row) return "暂无可用国债收益率，暂时无法判断利率对美股估值和期权波动率的压力。";
  const twoYear = Number(row["2Y"] ?? row.year2);
  const tenYear = Number(row["10Y"] ?? row.year10);
  const thirtyYear = Number(row["30Y"] ?? row.year30);
  if (!Number.isFinite(twoYear) || !Number.isFinite(tenYear)) {
    return "缺少 2Y 或 10Y，先把曲线当作利率水平背景，不单独作为方向性结论。";
  }
  const spread10y2y = tenYear - twoYear;
  if (spread10y2y < 0) {
    return "2Y 高于 10Y，曲线倒挂说明市场仍在交易降息与增长放缓预期；成长股追高要先看 10Y 是否回落。";
  }
  if (Number.isFinite(thirtyYear) && thirtyYear - tenYear > 0.25) {
    return "30Y 明显高于 10Y，长端期限溢价偏高；若美元同涨，QQQ/NVDA 这类长久期资产更容易承压。";
  }
  return "2Y/10Y 未明显倒挂，利率曲线压力相对温和；盘中更应结合 VIX、美元和指数动量确认。";
}

function localCalendarRead(events: any[]): string {
  const highCount = events.filter((ev) => ev.impact === "High").length;
  const mediumCount = events.filter((ev) => ev.impact === "Medium").length;
  if (highCount > 0) {
    return `当天有 ${highCount} 个高影响宏观事件，数据公布前不宜重仓追方向，先等 10Y、美元和指数期货确认。`;
  }
  if (mediumCount > 0) {
    return `当天有 ${mediumCount} 个中影响事件，宏观风险不低，但通常需要结合盘中量价反应验证。`;
  }
  return "当天宏观日历冲击较低，交易重心更可能回到个股新闻、财报、资金流和期权结构。";
}

export default function MacroPage() {
  const [selectedDate, setSelectedDate] = useState(beijingDateString());
  const [calendar, setCalendar] = useState<any[]>([]);
  const [treasury, setTreasury] = useState<any[]>([]);
  const [marketInsights, setMarketInsights] = useState<MvpMarketInsightsContract | null>(null);
  const [calendarInsights, setCalendarInsights] = useState<MacroCalendarInsightsContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const rangeEnd = useMemo(() => shiftDate(selectedDate, 1), [selectedDate]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setLoading(true);
    Promise.allSettled([
      api.macro.calendar(selectedDate, rangeEnd, "US"),
      api.macro.treasury(30),
      api.market.mvpMarketInsights(),
      api.market.mvpMacroCalendarInsights(selectedDate, rangeEnd, "US"),
    ])
      .then(([calRes, treasRes, marketRes, calInsightRes]) => {
        if (cancelled) return;
        const errs: string[] = [];
        if (calRes.status === "fulfilled") {
          setCalendar(((calRes.value as any).events || []) as any[]);
        } else {
          setCalendar([]);
          const r = calRes.reason;
          errs.push(`经济日历：${r instanceof Error ? r.message : String(r)}`);
        }
        if (treasRes.status === "fulfilled") {
          setTreasury(((treasRes.value as any).rates || []) as any[]);
        } else {
          setTreasury([]);
          const r = treasRes.reason;
          errs.push(`国债收益率：${r instanceof Error ? r.message : String(r)}`);
        }
        if (marketRes.status === "fulfilled") {
          setMarketInsights(marketRes.value);
        } else {
          setMarketInsights(null);
          const r = marketRes.reason;
          errs.push(`国债 AI 解读：${r instanceof Error ? r.message : String(r)}`);
        }
        if (calInsightRes.status === "fulfilled") {
          setCalendarInsights(calInsightRes.value);
        } else {
          setCalendarInsights(null);
          const r = calInsightRes.reason;
          errs.push(`日历 AI 解读：${r instanceof Error ? r.message : String(r)}`);
        }
        setLoadError(errs.length ? errs.join(" ") : null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, rangeEnd]);

  const latestRate = treasury[0] as Record<string, unknown> | undefined;
  const yieldCurve = latestRate ? treasuryRowToCurve(latestRate) : [];
  const hasTreasuryPoints = yieldCurve.some((p) => p.rate != null);
  const treasuryRead = marketInsights?.treasury?.summary || buildTreasuryFallback(latestRate);
  const calendarRead = calendarInsights?.market_read_zh || localCalendarRead(calendar);
  const insightEvents = calendarInsights?.events ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-gold" />
          <div>
            <h1 className="text-xl font-bold text-text">宏观经济</h1>
            <p className="mt-1 text-xs text-muted">经济日历、国债曲线与阿吉中文解读</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border2 px-3 text-xs text-muted transition hover:border-gold/40 hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" />
            前一天
          </button>
          <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-border2 bg-panel2 px-3 text-xs text-muted">
            <CalendarDays className="h-4 w-4 text-gold" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value || beijingDateString())}
              className="bg-transparent font-mono text-text outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setSelectedDate(beijingDateString())}
            className="h-9 rounded-lg border border-border2 px-3 text-xs text-muted transition hover:border-gold/40 hover:text-gold"
          >
            今天
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border2 px-3 text-xs text-muted transition hover:border-gold/40 hover:text-gold"
          >
            后一天
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-panel2 border border-red-400/30 rounded-xl p-5 text-sm text-muted space-y-2">
          <p className="text-red-400 font-medium">部分数据加载失败</p>
          <p className="font-mono text-[11px] break-all">{loadError}</p>
          <p className="text-[12px]">{PROXY_HINT}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-panel2 border border-border2 rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-text">美国国债收益率曲线</h2>
              <p className="mt-1 text-xs text-muted">用来判断利率压力、成长股估值压力和期权波动率背景。</p>
            </div>
            {marketInsights?.treasury?.label ? (
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] text-gold">
                {marketInsights.treasury.label}
              </span>
            ) : null}
          </div>

          {hasTreasuryPoints ? (
            <>
              <div className="flex gap-4 mt-4 mb-3 flex-wrap">
                {yieldCurve.map((p) => (
                  <div key={p.term} className="text-center">
                    <div className="text-[10px] text-muted">{p.term}</div>
                    <div className="text-[13px] font-bold text-gold">
                      {p.rate != null ? `${Number(p.rate).toFixed(2)}%` : "—"}
                    </div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={yieldCurve.filter((p): p is { term: string; rate: number } => p.rate != null)}>
                  <CartesianGrid stroke="rgba(100,116,139,0.15)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="term" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={["auto", "auto"]} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, color: "var(--color-foreground)", boxShadow: "var(--shadow-card)", fontSize: 12 }}
                    formatter={(v: any) => [`${Number(v).toFixed(3)}%`, "收益率"]}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#c8881a" dot={{ r: 3 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : loading ? (
            <div className="py-12 text-center text-sm text-muted">加载国债曲线...</div>
          ) : (
            <div className="py-12 text-sm text-muted">
              暂无可用收益率点位：请在后端配置 <span className="font-mono text-gold">FMP_API_KEY</span>
              ，并确认 treasury 同步任务正常。
            </div>
          )}

          <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 px-3 py-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              阿吉深度解读
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{treasuryRead}</p>
          </div>
        </div>

        <div className="bg-panel2 border border-border2 rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-text">经济日历解读</h2>
              <p className="mt-1 text-xs text-muted">
                {selectedDate} 北京时间交易日前后事件 · 支持切换日期和查看历史
              </p>
            </div>
            <span className="rounded-full border border-border2 px-2.5 py-1 text-[11px] text-muted">
              {calendarInsights?.engine === "llm" ? "AI 解读" : "规则解读"}
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-3">
            <p className="text-sm leading-6 text-muted-foreground">{calendarRead}</p>
            {calendarInsights?.watch_plan?.length ? (
              <div className="mt-3 space-y-1.5">
                {calendarInsights.watch_plan.slice(0, 4).map((item) => (
                  <div key={item} className="text-xs leading-5 text-muted">
                    · {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-panel2 border border-border2 rounded-xl">
        <div className="px-5 py-3 border-b border-border2">
          <h2 className="text-sm font-semibold text-text">经济日历</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">加载中...</div>
        ) : calendar.length === 0 && insightEvents.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">当天暂无美国经济日历数据</div>
        ) : (
          <div className="divide-y divide-border2">
            {(insightEvents.length ? insightEvents : calendar).slice(0, 80).map((ev: any, i: number) => {
              const rawTitle = ev.event || "Macro event";
              const titleZh = ev.title_zh || macroEventTitleZh(rawTitle);
              const impact = ev.impact || "Medium";
              return (
                <div key={`${rawTitle}-${String(ev.date)}-${i}`} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${IMPACT_DOT[impact] || "bg-gray-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-text">{titleZh}</span>
                        <span className={`text-[10px] font-semibold ${IMPACT_COLOR[impact] || "text-muted"}`}>
                          {ev.impact_zh || impactZh(impact)}
                        </span>
                        <span className="text-[10px] text-muted">{ev.country || "US"}</span>
                        <span className="font-mono text-[10px] text-gold">{formatDateTime(ev.date)}</span>
                      </div>
                      {rawTitle && rawTitle !== titleZh ? (
                        <div className="mt-1 text-[11px] text-muted">原文：{rawTitle}</div>
                      ) : null}
                      <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-muted">
                        <span>预期: {formatMacroValue(ev.estimate)}</span>
                        <span>前值: {formatMacroValue(ev.previous)}</span>
                        <span className="text-gold font-semibold">实际: {formatMacroValue(ev.actual)}</span>
                      </div>
                      {(ev.why_it_matters_zh || ev.trading_impact_zh || ev.watch_zh) ? (
                        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
                          {ev.why_it_matters_zh ? (
                            <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                              <div className="text-[10px] text-muted">为何重要</div>
                              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{ev.why_it_matters_zh}</p>
                            </div>
                          ) : null}
                          {ev.trading_impact_zh ? (
                            <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                              <div className="text-[10px] text-muted">交易影响</div>
                              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{ev.trading_impact_zh}</p>
                            </div>
                          ) : null}
                          {ev.watch_zh ? (
                            <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
                              <div className="text-[10px] text-muted">盘中观察</div>
                              <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{ev.watch_zh}</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
