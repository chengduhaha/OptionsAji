"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { Building2, ChevronDown, ChevronUp, Info, RefreshCw, Search } from "lucide-react";
import { clsx } from "clsx";

interface CongressTrade {
  id: number;
  member_name: string;
  chamber: string;
  symbol: string;
  trade_date: string;
  transaction_type: string;
  amount_range: string;
}

interface CongressMember {
  member: string;
  chamber: string;
}

interface MemberProfile {
  member: string;
  chamber: string;
  bio_zh?: string | null;
  party?: string | null;
  state?: string | null;
  committee?: string | null;
  notable_trades_summary?: string | null;
}

interface BacktestTrade {
  symbol: string;
  buy_date: string;
  buy_price: number;
  current_price: number;
  pnl: number;
  pnl_pct: number;
}

interface BacktestResult {
  initial_capital: number;
  final_value: number;
  total_return_pct: number;
  trade_count: number;
  winning_trades: number;
  trades: BacktestTrade[];
}

function memberKey(m: CongressMember): string {
  return `${m.chamber}::${m.member}`;
}

function parseMemberKey(key: string): { member: string; chamber: string } | null {
  const idx = key.indexOf("::");
  if (idx < 0) return null;
  return { chamber: key.slice(0, idx), member: key.slice(idx + 2) };
}

type Tab = "trades" | "backtest";

export default function CongressPage() {
  const [tab, setTab] = useState<Tab>("trades");
  const [trades, setTrades] = useState<CongressTrade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [tradesError, setTradesError] = useState<string | null>(null);
  const [chamber, setChamber] = useState("all");
  const [symbolQ, setSymbolQ] = useState("");
  const [members, setMembers] = useState<CongressMember[]>([]);
  const [profiles, setProfiles] = useState<Record<string, MemberProfile>>({});
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [btMemberKey, setBtMemberKey] = useState("");
  const [btCapital, setBtCapital] = useState("100000");
  const [btLoading, setBtLoading] = useState(false);
  const [btResult, setBtResult] = useState<BacktestResult | null>(null);
  const [btError, setBtError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/congress/members");
      if (!res.ok) return;
      const data = (await res.json()) as { members?: CongressMember[] };
      const rows = Array.isArray(data.members) ? data.members : [];
      setMembers(rows);
      if (rows.length > 0 && !btMemberKey) {
        setBtMemberKey(memberKey(rows[0]));
      }
    } catch {
      setMembers([]);
    }
  }, [btMemberKey]);

  const fetchTrades = useCallback(async () => {
    setTradesLoading(true);
    setTradesError(null);
    try {
      const p = new URLSearchParams();
      if (chamber !== "all") p.set("chamber", chamber);
      if (symbolQ) p.set("symbol", symbolQ);
      const res = await fetch(`/api/congress/trades?${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items?: Array<{
        id: number;
        member?: string;
        chamber: string;
        symbol: string;
        date?: string | null;
        type?: string;
        amount_range?: string;
      }> };
      const rows = Array.isArray(data.items) ? data.items : [];
      setTrades(
        rows.map((row) => ({
          id: row.id,
          member_name: row.member ?? "—",
          chamber: row.chamber,
          symbol: row.symbol,
          trade_date: row.date ?? "—",
          transaction_type: row.type ?? "—",
          amount_range: row.amount_range ?? "—",
        })),
      );
    } catch (e) {
      setTradesError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setTradesLoading(false);
    }
  }, [chamber, symbolQ]);

  useEffect(() => {
    fetchTrades();
    fetchMembers();
  }, [fetchTrades, fetchMembers]);

  const filteredMembers = useMemo(() => {
    if (chamber === "all") return members;
    return members.filter((m) => m.chamber === chamber);
  }, [members, chamber]);

  async function loadProfile(member: string, ch: string) {
    const key = `${ch}::${member}`;
    if (profiles[key]) return;
    try {
      const p = new URLSearchParams({ member, chamber: ch });
      const res = await fetch(`/api/congress/profile?${p}`);
      if (!res.ok) return;
      const data = (await res.json()) as MemberProfile;
      setProfiles((prev) => ({ ...prev, [key]: data }));
    } catch {
      /* ignore */
    }
  }

  async function toggleProfile(member: string, ch: string) {
    const key = `${ch}::${member}`;
    if (expandedMember === key) {
      setExpandedMember(null);
      return;
    }
    setExpandedMember(key);
    await loadProfile(member, ch);
  }

  async function runBacktest() {
    const parsed = parseMemberKey(btMemberKey);
    if (!parsed) {
      setBtError("请选择议员");
      return;
    }
    setBtLoading(true);
    setBtError(null);
    setBtResult(null);
    try {
      const res = await fetch("/api/congress/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member: parsed.member,
          chamber: parsed.chamber,
          initial_capital: parseFloat(btCapital) || 100_000,
        }),
      });
      const data = (await res.json()) as {
        initial_capital: number;
        final_value: number;
        total_return_pct: number;
        trade_count: number;
        trade_log?: Array<{
          symbol: string;
          buy_date: string;
          buy_price: number;
          current_price: number;
          shares?: number;
          return_pct?: number;
        }>;
        error?: string;
        message?: string;
        detail?: string;
      };
      if (!res.ok) throw new Error(data.message ?? data.detail ?? `HTTP ${res.status}`);
      if (data.error) throw new Error(data.message ?? "未找到符合条件的交易记录");
      const tradeRows = (data.trade_log ?? []).map((row) => {
        const shares = row.shares ?? 0;
        const pnl = shares > 0 ? shares * (row.current_price - row.buy_price) : 0;
        return {
          symbol: row.symbol,
          buy_date: row.buy_date,
          buy_price: row.buy_price,
          current_price: row.current_price,
          pnl,
          pnl_pct: row.return_pct ?? 0,
        };
      });
      setBtResult({
        initial_capital: data.initial_capital,
        final_value: data.final_value,
        total_return_pct: data.total_return_pct,
        trade_count: data.trade_count,
        winning_trades: tradeRows.filter((t) => t.pnl_pct > 0).length,
        trades: tradeRows,
      });
    } catch (e) {
      setBtError(e instanceof Error ? e.message : "回测失败");
    } finally {
      setBtLoading(false);
    }
  }

  function TxBadge({ type }: { type: string }) {
    const t = type?.toLowerCase();
    if (t?.includes("purchase") || t?.includes("buy")) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">买入</span>;
    }
    if (t?.includes("sale") || t?.includes("sell")) {
      return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">卖出</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-glass text-muted-foreground border border-glass-border">{type}</span>;
  }

  function ChamberBadge({ c }: { c: string }) {
    return (
      <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold", c === "senate" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")}>
        {c === "senate" ? "参" : "众"}
      </span>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">国会山追踪</h1>
          <p className="text-sm text-muted-foreground">参众两院议员交易申报与情景回测</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-glass border border-glass-border w-fit">
        {([
          ["trades", "交易记录"],
          ["backtest", "回测工具"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "trades" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 p-1 rounded-lg bg-glass border border-glass-border">
              {([
                ["all", "全部"],
                ["senate", "参议院"],
                ["house", "众议院"],
              ] as [string, string][]).map(([c, label]) => (
                <button key={c} type="button" onClick={() => setChamber(c)} className={clsx("px-3 py-1.5 rounded text-[12px] font-medium transition-all", chamber === c ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glass border border-glass-border">
              <Search className="w-3.5 h-3.5 text-muted" />
              <input type="text" placeholder="股票代码筛选" value={symbolQ} onChange={(e) => setSymbolQ(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && fetchTrades()} className="bg-transparent text-sm text-foreground placeholder:text-muted outline-none w-28" />
            </div>
            <button type="button" onClick={fetchTrades} disabled={tradesLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-50">
              <RefreshCw className={clsx("w-3.5 h-3.5", tradesLoading && "animate-spin")} />
              搜索
            </button>
          </div>
          <div className="rounded-xl border border-glass-border bg-glass/40 overflow-hidden">
            {tradesError && <div className="p-4 text-center text-red-400 text-sm">{tradesError}</div>}
            {tradesLoading && <div className="p-8 text-center text-muted-foreground text-sm">加载中…</div>}
            {!tradesLoading && !tradesError && trades.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">暂无交易记录</div>}
            {!tradesLoading && !tradesError && trades.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border bg-glass/60">
                    {[["议员", "text-left"], ["院", "text-left"], ["股票", "text-left"], ["类型", "text-left"], ["金额范围", "text-left"], ["日期", "text-left"]].map(([l, a]) => (
                      <th key={l} className={clsx("px-4 py-3 text-[11px] font-semibold text-muted uppercase tracking-wide", a)}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const pKey = `${trade.chamber}::${trade.member_name}`;
                    const profile = profiles[pKey];
                    const isOpen = expandedMember === pKey;
                    return (
                      <Fragment key={trade.id}>
                        <tr key={trade.id} className="border-b border-glass-border/50 hover:bg-glass/60 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium text-[12px]">
                            <button type="button" onClick={() => toggleProfile(trade.member_name, trade.chamber)} className="inline-flex items-center gap-1 hover:text-primary">
                              <Info className="w-3 h-3" />
                              {trade.member_name}
                              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="px-4 py-3"><ChamberBadge c={trade.chamber} /></td>
                          <td className="px-4 py-3 font-bold text-foreground font-mono">{trade.symbol}</td>
                          <td className="px-4 py-3"><TxBadge type={trade.transaction_type} /></td>
                          <td className="px-4 py-3 text-muted-foreground text-[12px]">{trade.amount_range}</td>
                          <td className="px-4 py-3 text-muted-foreground text-[12px]">{trade.trade_date}</td>
                        </tr>
                        {isOpen ? (
                          <tr key={`${trade.id}-profile`} className="border-b border-glass-border/50 bg-glass/30">
                            <td colSpan={6} className="px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                              {profile?.bio_zh ? (
                                <div className="space-y-1">
                                  <p className="text-foreground/90">{profile.bio_zh}</p>
                                  {profile.notable_trades_summary ? <p className="text-[11px]">交易特点：{profile.notable_trades_summary}</p> : null}
                                  {(profile.party || profile.state) ? (
                                    <p className="text-[11px]">{[profile.party, profile.state, profile.committee].filter(Boolean).join(" · ")}</p>
                                  ) : null}
                                </div>
                              ) : (
                                <p>暂无议员简介，系统将于每日定时更新。</p>
                              )}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "backtest" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-glass-border bg-glass/40 p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">回测参数</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] text-muted uppercase tracking-wide mb-1.5">议员</label>
                <select
                  value={btMemberKey}
                  onChange={(e) => setBtMemberKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-foreground outline-none focus:border-primary/50"
                >
                  <option value="">请选择议员</option>
                  {filteredMembers.map((m) => (
                    <option key={memberKey(m)} value={memberKey(m)}>
                      {m.member} ({m.chamber === "senate" ? "参议院" : "众议院"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted uppercase tracking-wide mb-1.5">初始资金 (USD)</label>
                <input type="number" placeholder="100000" value={btCapital} onChange={(e) => setBtCapital(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/50" />
              </div>
            </div>
            {btError && <p className="text-red-400 text-sm mb-3">{btError}</p>}
            <button type="button" onClick={runBacktest} disabled={btLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary font-medium text-sm hover:bg-primary/30 transition-all disabled:opacity-50">
              {btLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {btLoading ? "回测中…" : "运行回测"}
            </button>
          </div>
          {btResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "初始资金", value: `$${btResult.initial_capital.toLocaleString()}`, color: "text-foreground" },
                  { label: "最终价值", value: `$${btResult.final_value.toLocaleString()}`, color: "text-foreground" },
                  { label: "总收益率", value: `${btResult.total_return_pct >= 0 ? "+" : ""}${btResult.total_return_pct?.toFixed(2)}%`, color: btResult.total_return_pct >= 0 ? "text-green-400" : "text-red-400" },
                  { label: "历史命中率", value: btResult.trade_count > 0 ? `${((btResult.winning_trades / btResult.trade_count) * 100).toFixed(0)}%` : "N/A", color: "text-foreground" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-glass-border bg-glass/40 p-4">
                    <div className="text-[10px] text-muted uppercase tracking-wide mb-1">{label}</div>
                    <div className={clsx("text-lg font-bold", color)}>{value}</div>
                  </div>
                ))}
              </div>
              {btResult.trades.length > 0 && (
                <div className="rounded-xl border border-glass-border bg-glass/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-glass-border bg-glass/60"><h3 className="text-sm font-semibold text-foreground">持仓明细</h3></div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-glass-border">
                        {[["股票", "text-left"], ["买入日", "text-left"], ["买入价", "text-right"], ["当前价", "text-right"], ["盈亏", "text-right"], ["收益率", "text-right"]].map(([l, a]) => (
                          <th key={l} className={clsx("px-4 py-2 text-[10px] font-semibold text-muted uppercase", a)}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {btResult.trades.map((t, i) => (
                        <tr key={i} className="border-b border-glass-border/50 hover:bg-glass/60">
                          <td className="px-4 py-2 font-mono font-bold text-foreground">{t.symbol}</td>
                          <td className="px-4 py-2 text-muted-foreground text-[12px]">{t.buy_date}</td>
                          <td className="px-4 py-2 text-right text-muted-foreground">${t.buy_price?.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-muted-foreground">${t.current_price?.toFixed(2)}</td>
                          <td className={clsx("px-4 py-2 text-right font-medium", t.pnl >= 0 ? "text-green-400" : "text-red-400")}>{t.pnl >= 0 ? "+" : ""}${t.pnl?.toFixed(0)}</td>
                          <td className={clsx("px-4 py-2 text-right font-bold", t.pnl_pct >= 0 ? "text-green-400" : "text-red-400")}>{t.pnl_pct >= 0 ? "+" : ""}{t.pnl_pct?.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
