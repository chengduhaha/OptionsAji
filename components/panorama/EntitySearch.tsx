"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import type { GraphNode } from "@/lib/supplyGraph";
import { searchSupplyGraph } from "@/lib/supplyGraph";

export function EntitySearch({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  const [input, setInput] = useState(value);
  const [results, setResults] = useState<GraphNode[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => setInput(value), [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (input.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        setResults(await searchSupplyGraph(input));
      } catch {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <div className="relative w-[260px]">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        value={input}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setInput(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSelect(input);
            setOpen(false);
          }
        }}
        placeholder="搜索公司 / ticker"
        className="h-9 w-full rounded-lg border border-foreground/10 bg-glass pl-9 pr-3 text-[13px] text-foreground outline-none focus:border-primary/50"
      />
      {open && results.length > 0 ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-foreground/10 bg-panel-elevated shadow-2xl">
          {results.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => {
                onSelect(node.ticker || node.nameEn || node.label);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] hover:bg-foreground/5"
            >
              <span className="truncate text-foreground">{node.label}</span>
              <span className="font-mono text-primary">{node.ticker || node.type}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

