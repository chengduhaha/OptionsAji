"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchPlaybookHints } from "@/lib/playbook-hints";
import { expectedMoveBucketHint, expectedMoveBucketLabel } from "@/lib/option-framework";
import type { StockOverviewContract } from "@/lib/contracts";

export type ExpectedMoveRow = StockOverviewContract["expectedMoves"][number] & {
  bucketZh?: string;
  atmStrike?: number;
  callMid?: number;
  putMid?: number;
  spot?: number;
};

function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `$${n.toFixed(2)}`;
}

export default function ExpectedMoveDetailModal({
  move,
  interpretation,
  onClose,
}: {
  move: ExpectedMoveRow;
  interpretation?: string;
  onClose: () => void;
}) {
  const [playbookHints, setPlaybookHints] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchPlaybookHints("expected_move").then((bullets) => {
      if (!cancelled) setPlaybookHints(bullets);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const bucketZh =
    move.bucketZh ?? expectedMoveBucketLabel(move.bucket);
  const hint = expectedMoveBucketHint(move.bucket);
  const spot = move.spot;
  const lower =
    spot !== null && spot !== undefined
      ? spot * (1 - move.pct / 100)
      : null;
  const upper =
    spot !== null && spot !== undefined
      ? spot * (1 + move.pct / 100)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="glass relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-glass-border p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expected-move-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-[10px] uppercase tracking-wider text-muted">隐含预期波动 Expected Move</p>
        <h2 id="expected-move-title" className="mt-1 text-lg font-semibold text-foreground">
          {bucketZh}
        </h2>
        <p className="mt-1 text-xs text-muted">{hint}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <div className="text-[10px] text-muted">预期波动</div>
            <div className="font-mono text-lg text-gold">±{move.pct.toFixed(2)}%</div>
          </div>
          <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <div className="text-[10px] text-muted">Straddle 价格</div>
            <div className="font-mono text-lg text-foreground">{money(move.straddleUsd)}</div>
          </div>
          <div className="rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2 col-span-2">
            <div className="text-[10px] text-muted">到期日</div>
            <div className="font-mono text-sm text-foreground">{move.expiration}</div>
          </div>
        </div>

        {spot !== null && spot !== undefined ? (
          <section className="mt-4 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">价格区间（隐含）</h3>
            <p className="mt-1 font-mono text-sm text-foreground">
              {money(lower)} — {money(upper)}
              <span className="ml-2 text-muted text-xs">（现价 {money(spot)}）</span>
            </p>
          </section>
        ) : null}

        {move.atmStrike !== undefined ? (
          <section className="mt-3 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">计算拆解</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground font-mono">
              <li>ATM 行权价：{move.atmStrike}</li>
              <li>ATM Call mid：{money(move.callMid)}</li>
              <li>ATM Put mid：{money(move.putMid)}</li>
              <li>Straddle = Call + Put = {money(move.straddleUsd)}</li>
              <li>Expected Move % = Straddle ÷ Spot × 100</li>
            </ul>
          </section>
        ) : (
          <section className="mt-3 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">计算方法</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              取该到期窗口 ATM Call 与 ATM Put 的中间价之和（Straddle），除以标的现价得到隐含波动幅度。
              数据来自 Futu OpenD 期权链快照。
            </p>
          </section>
        )}

        {playbookHints.length > 0 ? (
          <section className="mt-3 rounded-lg border border-border2 bg-foreground/[0.02] px-3 py-2">
            <h3 className="text-[11px] uppercase tracking-wider text-muted">教材要点</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
              {playbookHints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {interpretation ? (
          <section className="mt-3 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
            <h3 className="text-[11px] font-medium text-gold">阿吉解读</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{interpretation}</p>
          </section>
        ) : null}

      </div>
    </div>
  );
}
