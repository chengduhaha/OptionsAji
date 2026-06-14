"use client";

import { Database, RefreshCw } from "lucide-react";

const SOURCES: { name: string; hint?: string }[] = [
  { name: "IBKR", hint: "需 Gateway" },
  { name: "Massive" },
  { name: "Polymarket Gamma" },
  { name: "Xpoz" },
  { name: "FMP" },
];

export function DataFooter() {
  return (
    <footer className="border-t border-border bg-card/80 px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Database className="w-3 h-3 text-muted" />
          <span className="font-terminal text-[10px] text-muted uppercase tracking-wider">
            数据源:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {SOURCES.map((source, i) => (
              <span key={source.name} className="flex items-center gap-2">
                <span className="font-terminal text-[10px] text-muted-foreground">
                  {source.name}
                  {source.hint ? (
                    <span className="text-muted font-normal not-italic ml-1">
                      ({source.hint})
                    </span>
                  ) : null}
                </span>
                {i < SOURCES.length - 1 && (
                  <span className="text-muted">·</span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 text-muted" />
          <span className="font-terminal text-[10px] text-muted">最后更新: 2 分钟前</span>
        </div>
      </div>
    </footer>
  );
}
