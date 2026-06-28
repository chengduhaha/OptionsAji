import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type V4PanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function V4Panel({ title, subtitle, children, className }: V4PanelProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      {title ? (
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <h2 className="font-heading text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      ) : null}
      <div className={title ? "px-4 py-4 sm:px-6 sm:py-5" : "p-4 sm:p-6"}>{children}</div>
    </section>
  );
}
