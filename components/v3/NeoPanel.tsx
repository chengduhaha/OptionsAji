import { clsx } from "clsx";
import type { ReactNode } from "react";

export function NeoPanel({
  title,
  subtitle,
  children,
  className,
  accent = "peach",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  accent?: "peach" | "lavender" | "none";
}) {
  return (
    <section
      className={clsx(
        "neo-panel bg-surface border-[3px] border-ink shadow-neo rounded-none",
        accent === "peach" && "neo-accent-peach",
        accent === "lavender" && "neo-accent-lavender",
        className,
      )}
    >
      <header className="border-b-[3px] border-ink px-4 py-3 flex flex-col gap-0.5">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-ink uppercase">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs text-ink/70 font-sans">{subtitle}</p>
        ) : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
