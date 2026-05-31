"use client";

import { GitBranch, Orbit, Shuffle } from "lucide-react";

import { cn } from "@/lib/utils";

const LAYOUTS = [
  { id: "layered", label: "层级", icon: GitBranch },
  { id: "radial", label: "环形", icon: Orbit },
  { id: "force", label: "星图", icon: Shuffle },
] as const;

export function LayoutSwitcher({
  value,
  onChange,
}: {
  value: "layered" | "radial" | "force";
  onChange: (value: "layered" | "radial" | "force") => void;
}) {
  return (
    <div className="flex rounded-lg border border-white/10 bg-glass p-1">
      {LAYOUTS.map((layout) => {
        const Icon = layout.icon;
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] transition",
              value === layout.id ? "bg-cyan/15 text-cyan" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {layout.label}
          </button>
        );
      })}
    </div>
  );
}

