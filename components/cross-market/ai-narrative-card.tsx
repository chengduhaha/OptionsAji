"use client";

import { Brain, ChevronRight, AlertTriangle, TrendingDown, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventPanoramaViewModel } from "@/lib/crossMarket";

export type AiNarrativeCardProps = EventPanoramaViewModel["narrative"];

export function AiNarrativeCard({
  optionsPct,
  polymarketPct,
  socialPct,
  institutionalPct,
  estimatedLow,
  estimatedHigh,
  polyGapLow,
  polyGapHigh,
  histRallyPct,
  histDropPct,
  histChopPct,
  judgmentHint,
  strategyBullets,
}: AiNarrativeCardProps) {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 rounded-xl p-px bg-gradient-to-br from-[#D4AF37]/40 via-[#D4AF37]/05 to-[#4A8FD4]/20 pointer-events-none z-10" />

      <div className="relative rounded-xl bg-gradient-to-br from-card to-background p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-gold" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">AI 深度分析</div>
              <div className="font-terminal text-[10px] text-muted mt-0.5">
                多源概率融合 · 基于实时跨市场数据 · 刚刚更新
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="font-terminal text-xs border-[#D4AF37]/30 text-gold bg-gold/5 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 gap-1.5"
          >
            查看 AI 推理链
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-[#D44A4A]/30 bg-[#D44A4A]/8 px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-[#D44A4A] flex-shrink-0" />
          <span className="text-sm font-semibold text-[#D44A4A]">跨市场概率背离形态</span>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-foreground/80">
          <p>
            期权与机构数据分别为{" "}
            <span className="font-terminal text-[#4A8FD4] font-semibold">{optionsPct}%</span> 与{" "}
            <span className="font-terminal text-[#D44A4A] font-semibold">{institutionalPct}%</span>；
            预测市场与社交情绪为{" "}
            <span className="font-terminal text-gold font-semibold">{polymarketPct}%</span> 与{" "}
            <span className="font-terminal text-[#E8842A] font-semibold">{socialPct}%</span>。
          </p>

          <div className="rounded-lg border border-border bg-background/80 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">关键判断</span>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">{judgmentHint}</p>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg bg-[#3DBF7A]/8 border border-[#3DBF7A]/20 p-3 text-center">
                <div className="font-terminal text-xl font-bold text-[#3DBF7A]">~{histRallyPct}%</div>
                <div className="text-[10px] text-muted mt-1 leading-tight">偏强路径</div>
              </div>
              <div className="rounded-lg bg-[#D44A4A]/8 border border-[#D44A4A]/20 p-3 text-center">
                <div className="font-terminal text-xl font-bold text-[#D44A4A]">~{histDropPct}%</div>
                <div className="text-[10px] text-muted mt-1 leading-tight">偏弱路径</div>
              </div>
              <div className="rounded-lg bg-[#4A5A73]/30 border border-[#4A5A73]/30 p-3 text-center">
                <div className="font-terminal text-xl font-bold text-muted">~{histChopPct}%</div>
                <div className="text-[10px] text-muted mt-1 leading-tight">震荡 / 不明</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-gold/20 bg-gold/5 p-4">
            <TrendingDown className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-gold uppercase tracking-wider block mb-1.5">
                真实概率估计
              </span>
              <p className="text-foreground/80 text-sm">
                模型区间{" "}
                <span className="font-terminal font-bold text-gold">
                  {estimatedLow}–{estimatedHigh}%
                </span>
                ，Polymarket 报价{" "}
                <span className="font-terminal font-bold text-gold">{polymarketPct}%</span>。相对偏离约{" "}
                <span className="font-terminal font-bold text-[#E8842A]">
                  +{polyGapLow}–{polyGapHigh} 个百分点
                </span>
                。
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-[#3DBF7A]" />
              <span className="text-xs font-semibold text-[#3DBF7A] uppercase tracking-wider">教育性策略说明</span>
            </div>
            <div className="space-y-3">
              {strategyBullets.map((item) => (
                <div
                  key={item.num}
                  className="flex items-start gap-3 rounded-lg bg-background/60 border border-border p-3"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-terminal text-[11px] font-bold"
                    style={{
                      backgroundColor: `${item.color}25`,
                      color: item.color,
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    {item.num}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground text-sm">{item.label}: </span>
                    <span className="text-foreground/80 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
