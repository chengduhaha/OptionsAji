"use client";

import { Building2, Factory, Network } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { id: "company", label: "公司视角", icon: Building2 },
  { id: "industry", label: "行业视角", icon: Factory },
  { id: "product", label: "产品视角", icon: Network },
];

export function PerspectiveTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex rounded-lg border border-foreground/10 bg-glass p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition",
              value === tab.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
